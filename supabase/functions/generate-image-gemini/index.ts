import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deductTokensAndTrackCost } from '../_shared/token-manager.ts';
import { calculateTokenCost } from '../_shared/token-costs.ts';
import { detectModificationIntent, buildIdentityPreservingPrompt } from '../_shared/identity-preservation.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GEMINI_MODEL = 'gemini-3.1-flash-image-preview';
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
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  const base64 = btoa(binary);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  return `data:${contentType};base64,${base64}`;
}

/**
 * Call the Gemini API with retry logic (Gemini can return text instead of image)
 */
async function callGemini(apiKey: string, parts: object[]): Promise<string> {
  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  const MAX_RETRIES = 1;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    console.log(`🚀 Gemini attempt ${attempt}/${MAX_RETRIES}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Gemini API error (attempt ${attempt}):`, errorText);
      if (attempt === MAX_RETRIES) throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      await new Promise(r => setTimeout(r, 2000));
      continue;
    }

    const data = await response.json();
    const candidates = data.candidates?.[0];

    // Log finish reason if not STOP
    const finishReason = candidates?.finishReason;
    if (finishReason && finishReason !== 'STOP') {
      console.warn(`⚠️ Gemini finish reason: ${finishReason}`);
    }

    // Log text part if returned (model refused or explained)
    const textPart = candidates?.content?.parts?.find((p: any) => p.text);
    if (textPart?.text) {
      console.warn(`⚠️ Gemini returned text: "${textPart.text.substring(0, 200)}"`);
    }

    // Extract image
    const imagePart = candidates?.content?.parts?.find((p: any) => p.inlineData);
    if (imagePart?.inlineData?.data) {
      console.log(`✅ Gemini image received on attempt ${attempt}`);
      return imagePart.inlineData.data; // base64 string
    }

    console.warn(`⚠️ No image in response (attempt ${attempt}/${MAX_RETRIES})`);
    if (attempt === MAX_RETRIES) {
      console.error('📄 Full Gemini response:', JSON.stringify(data, null, 2));
      throw new Error('Gemini returned no image after all retries');
    }
    await new Promise(r => setTimeout(r, 2000));
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

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const body = await req.json();
    const {
      prompt,
      contentType = 'auto',
      quality = 'HD',
      aspectRatio = '1:1',
      style,
      referenceImage,
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
      modelUsed: GEMINI_MODEL,
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
    const base64Image = await callGemini(GEMINI_API_KEY, parts);
    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`;
    console.log(`⏱️ Processing time: ${processingTime}`);

    // Upload to Supabase Storage
    const imageBytes = Uint8Array.from(atob(base64Image), c => c.charCodeAt(0));
    const fileName = `gemini-${contentType}-${Date.now()}.png`;
    console.log('📤 Uploading to Supabase Storage:', fileName);

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, imageBytes, { contentType: 'image/png', upsert: false });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log('✅ Image uploaded successfully:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        image: publicUrl,
        prompt: finalPrompt,
        tokensCharged: requiredTokens,
        remainingBalance: tokenResult.remainingBalance,
        metadata: {
          contentType,
          style: style || 'photorealistic',
          resolution: 'auto',
          processingTime,
          model: GEMINI_MODEL,
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
