import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deductTokensAndTrackCost } from '../_shared/token-manager.ts';
import { calculateTokenCost } from '../_shared/token-costs.ts';
import { detectModificationIntent, buildIdentityPreservingPrompt } from '../_shared/identity-preservation.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-3.1-flash-image-preview',
  'gemini-3-pro-image-preview',
];
const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Get MIME type from data URL or default to image/jpeg
 */
function getMimeType(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    const match = dataUrl.match(/data:([^;]+);/);
    return match ? match[1] : 'image/jpeg';
  }
  return 'image/jpeg';
}

/**
 * Convert a URL to base64 data URL (server-side fetch)
 */
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  // Process in chunks to avoid call stack overflow on large images
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
}

/**
 * Call the Gemini API with retry logic (Gemini can return text instead of image)
 */
/**
 * Decode width/height from a base64-encoded PNG header.
 * PNG layout: 8-byte signature + IHDR chunk where width is at bytes 16-19, height at 20-23.
 * Returns null if the data isn't a recognizable PNG.
 */
function pngDimensions(base64: string): { width: number; height: number } | null {
  try {
    const binary = atob(base64.substring(0, 64));
    if (binary.charCodeAt(0) !== 0x89 || binary.charCodeAt(1) !== 0x50) return null;
    const read32 = (offset: number) =>
      (binary.charCodeAt(offset) << 24) |
      (binary.charCodeAt(offset + 1) << 16) |
      (binary.charCodeAt(offset + 2) << 8) |
      binary.charCodeAt(offset + 3);
    return { width: read32(16), height: read32(20) };
  } catch { return null; }
}

async function callGemini(apiKey: string, parts: object[], aspectRatio = '1:1', resolution = '1k'): Promise<{ base64: string; model: string }> {
  // Gemini imageConfig supports imageSize: "1K" | "2K" | "4K" (Gemini 3 only)
  const imageSizeMap: Record<string, string> = { '1k': '1K', '2k': '2K', '4k': '4K' };
  const imageSize = imageSizeMap[resolution] || '1K';

  // Correct REST API shape per ai.google.dev/gemini-api/docs/image-generation:
  //   generationConfig.imageConfig.aspectRatio  (NOT at top level of generationConfig)
  // For Gemini 2.5 Flash Image, imageSize is not supported — sending it alongside
  // aspectRatio can cause the whole imageConfig to be ignored, which is why earlier
  // attempts that bundled both fields appeared to "break" non-1:1 output.
  // Build per-model payloads: only Gemini 3 gets imageSize.
  console.log(`📐 Gemini imageConfig: aspectRatio=${aspectRatio} (imageSize=${imageSize} for Gemini 3 only)`);

  for (const model of GEMINI_MODELS) {
    const isGemini3 = model.startsWith('gemini-3');
    const imageConfig: Record<string, string> = { aspectRatio };
    if (isGemini3) imageConfig.imageSize = imageSize;

    // responseModalities: ["TEXT", "IMAGE"] per Google's own production docs example.
    // Reports suggest ["IMAGE"]-only can cause imageConfig to be silently dropped.
    const payload = {
      contents: [{ role: "user", parts }],
      generationConfig: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig,
      },
    };

    const url = `${GEMINI_API_BASE}/${model}:generateContent?key=${apiKey}`;
    console.log(`🚀 Trying model: ${model} (imageConfig: ${JSON.stringify(imageConfig)})`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ Model ${model} failed (${response.status}): ${errorText.substring(0, 200)}`);
      // Short delay before trying next model
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }

    const data = await response.json();
    const candidates = data.candidates?.[0];

    const finishReason = candidates?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      console.warn(`⚠️ ${model} finish reason: ${finishReason}`);
    }

    const textPart = candidates?.content?.parts?.find((p: any) => p.text);
    if (textPart?.text) {
      console.warn(`⚠️ ${model} returned text: "${textPart.text.substring(0, 200)}"`);
    }

    const imagePart = candidates?.content?.parts?.find((p: any) => p.inlineData);
    if (imagePart?.inlineData?.data) {
      const dims = pngDimensions(imagePart.inlineData.data);
      const dimsStr = dims ? `${dims.width}x${dims.height}` : 'unknown';
      const ratioMatch = dims
        ? (dims.width === dims.height ? '1:1'
          : dims.width > dims.height ? `~${(dims.width / dims.height).toFixed(2)}:1 (landscape)`
          : `~1:${(dims.height / dims.width).toFixed(2)} (portrait)`)
        : '';
      console.log(`✅ Image received from ${model}: ${dimsStr} ${ratioMatch} (requested ${aspectRatio})`);
      return { base64: imagePart.inlineData.data, model };
    }

    console.warn(`⚠️ No image in response from ${model}, trying next...`);
    await new Promise(r => setTimeout(r, 1000));
  }

  throw new Error('Gemini: unexpected exit from retry loop');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error('Supabase configuration missing');
    }

    // Verify user
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const {
      prompt,
      contentType = 'auto',
      quality = 'HD',
      aspectRatio = '1:1',
      style,
      referenceImage,
      resolution = '1k',
    } = body;

    console.log('📥 Gemini Image Generation Request:', {
      contentType,
      quality,
      aspectRatio,
      hasReferenceImage: !!referenceImage,
      prompt: prompt?.substring(0, 80) + '...',
    });

    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid prompt is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long (max 1000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Token cost: 2 tokens for reference image (editing), 1 for text-to-image
    const modelKey = referenceImage ? 'gemini-image-edit' : 'gemini-image-gen';
    const requiredTokens = calculateTokenCost('image_generation', modelKey);
    const estimatedCost = referenceImage ? 0.005 : 0.003;

    console.log(`💰 Token cost: ${requiredTokens} tokens (estimated $${estimatedCost})`);

    const tokenResult = await deductTokensAndTrackCost({
      userId: user.id,
      resourceType: 'image_generation',
      apiProvider: 'gemini',
      modelUsed: GEMINI_MODELS[0],
      tokensToDeduct: requiredTokens,
      costUsd: estimatedCost,
      metadata: { contentType, quality, aspectRatio, prompt: prompt.substring(0, 100) },
    });

    if (!tokenResult.success) {
      return new Response(
        JSON.stringify({
          error: tokenResult.error || 'Insufficient tokens',
          requiredTokens,
          currentBalance: tokenResult.remainingBalance,
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Tokens deducted. Remaining balance: ${tokenResult.remainingBalance}`);

    // Build Gemini prompt
    let finalPrompt: string;
    if (referenceImage && detectModificationIntent(prompt)) {
      finalPrompt = buildIdentityPreservingPrompt(prompt);
      console.log('✏️ MODIFICATION MODE: identity preservation prompt');
    } else {
      finalPrompt = prompt;
    }

    // Reinforce aspect ratio in the prompt text — Gemini often ignores
    // imageConfig.aspectRatio, so we restate it as a compositional directive.
    const aspectHints: Record<string, string> = {
      '9:16': 'vertical 9:16 portrait composition, tall frame (taller than wide), full-height framing',
      '16:9': 'horizontal 16:9 landscape composition, wide frame (wider than tall), cinematic framing',
      '3:4': 'vertical 3:4 portrait composition, taller than wide',
      '4:3': 'horizontal 4:3 landscape composition, wider than tall',
      '2:3': 'vertical 2:3 portrait composition, taller than wide',
      '3:2': 'horizontal 3:2 landscape composition, wider than tall',
      '4:5': 'vertical 4:5 portrait composition, slightly taller than wide',
      '5:4': 'horizontal 5:4 landscape composition, slightly wider than tall',
      '21:9': 'ultra-wide 21:9 cinematic composition',
      '2.35:1': 'ultra-wide cinematic composition, anamorphic framing',
    };
    const aspectHint = aspectHints[aspectRatio];
    if (aspectHint) {
      finalPrompt = `${finalPrompt}, ${aspectHint}`;
    }

    console.log(`📐 Aspect ratio: ${aspectRatio}${aspectHint ? ' (reinforced in prompt)' : ''}`);

    const startTime = Date.now();

    // Build parts for Gemini API
    const parts: object[] = [{ text: finalPrompt }];

    if (referenceImage) {
      // Convert URL to base64 if needed
      let imageData = referenceImage;
      if (referenceImage.startsWith('http://') || referenceImage.startsWith('https://')) {
        console.log('🔄 Converting reference image URL to base64...');
        imageData = await urlToBase64(referenceImage);
      }

      const base64Data = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const mimeType = getMimeType(imageData);

      parts.push({
        inlineData: { data: base64Data, mimeType },
      });

      console.log(`🖼️ Reference image attached (${mimeType})`);
    }

    // Call Gemini
    const { base64: base64Image, model: usedModel } = await callGemini(GEMINI_API_KEY, parts, aspectRatio, resolution);
    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`;
    console.log(`⏱️ Processing time: ${processingTime}`);

    // Return base64 data URL directly — avoids memory spike from decode+upload
    const imageDataUrl = `data:image/png;base64,${base64Image}`;
    console.log('✅ Image ready, returning as data URL');

    return new Response(
      JSON.stringify({
        success: true,
        image: imageDataUrl,
        prompt: finalPrompt,
        tokensCharged: requiredTokens,
        remainingBalance: tokenResult.remainingBalance,
        metadata: {
          contentType,
          style: style || 'photorealistic',
          resolution,
          processingTime,
          model: usedModel,
          quality,
          usedReferenceImage: !!referenceImage,
          costUsd: estimatedCost,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('❌ Gemini generation error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
