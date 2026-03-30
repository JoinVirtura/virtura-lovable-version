import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  detectModificationIntent,
  buildIdentityPreservingPrompt,
} from '../_shared/identity-preservation.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

// IP-based rate limiting: 3 free requests per IP per hour
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 3600000 });
    return true;
  }
  if (limit.count >= 3) return false;
  limit.count++;
  return true;
}

function getMimeType(dataUrl: string): string {
  if (dataUrl.startsWith('data:')) {
    const match = dataUrl.match(/data:([^;]+);/);
    return match ? match[1] : 'image/jpeg';
  }
  return 'image/jpeg';
}

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
 * Try Imagen 3 first (dedicated image generation model)
 */
async function generateWithImagen(apiKey: string, prompt: string): Promise<{ image: string | null; error: string }> {
  const url = `${API_BASE}/imagen-3.0-generate-001:predict?key=${apiKey}`;
  const payload = {
    instances: [{ prompt }],
    parameters: { sampleCount: 1, aspectRatio: "1:1" },
  };

  console.log('[Landing] Trying Imagen 3...');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const msg = `Imagen3 ${response.status}: ${errorText.substring(0, 150)}`;
    console.warn('[Landing] Imagen 3 failed:', msg);
    return { image: null, error: msg };
  }

  const data = await response.json();
  const base64Image = data.predictions?.[0]?.bytesBase64Encoded;
  if (base64Image) {
    console.log('[Landing] Imagen 3 succeeded!');
    return { image: base64Image, error: '' };
  }
  return { image: null, error: 'Imagen3: no image in response' };
}

/**
 * Fallback: try Gemini with responseModalities IMAGE
 */
/**
 * Free fallback: Pollinations.ai (FLUX model, no API key needed)
 */
/**
 * Free fallback: Pollinations.ai (FLUX model, no API key needed)
 */
/**
 * Converts ArrayBuffer to base64 without btoa (avoids binary string issues in Deno)
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

/**
 * Free fallback: Pollinations.ai (FLUX) — no API key needed
 * Use short prompt to avoid 500 errors
 */
async function generateWithPollinations(prompt: string): Promise<{ image: string | null; error: string }> {
  try {
    // Trim prompt to avoid URL length issues
    const shortPrompt = prompt.split(',').slice(0, 3).join(',').trim().substring(0, 200);
    const encoded = encodeURIComponent(shortPrompt);
    const seed = Math.floor(Math.random() * 9999);
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&seed=${seed}&nologo=true`;
    console.log('[Landing] Calling Pollinations.ai, prompt length:', shortPrompt.length);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const msg = `Pollinations ${response.status}: ${response.statusText}`;
      console.warn('[Landing] Pollinations failed:', msg);
      return { image: null, error: msg };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('image')) {
      const text = await response.text();
      return { image: null, error: `Pollinations wrong content-type: ${contentType} body: ${text.substring(0, 100)}` };
    }

    const buffer = await response.arrayBuffer();
    console.log('[Landing] Pollinations succeeded! bytes:', buffer.byteLength);
    return { image: arrayBufferToBase64(buffer), error: '' };
  } catch (e: any) {
    const msg = e.name === 'AbortError' ? 'Pollinations timeout (50s)' : `Pollinations: ${e.message}`;
    console.warn('[Landing]', msg);
    return { image: null, error: msg };
  }
}

async function generateWithGemini(apiKey: string, model: string, parts: object[]): Promise<{ image: string | null; error: string }> {
  const url = `${API_BASE}/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts }],
    generationConfig: { responseModalities: ["IMAGE"] },
  };

  console.log(`[Landing] Trying Gemini model: ${model}...`);
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const msg = `${model} ${response.status}: ${errorText.substring(0, 150)}`;
    console.warn(`[Landing] Gemini ${model} failed:`, msg);
    return { image: null, error: msg };
  }

  const data = await response.json();
  const imagePart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
  if (imagePart?.inlineData?.data) {
    console.log(`[Landing] Gemini ${model} succeeded!`);
    return { image: imagePart.inlineData.data, error: '' };
  }

  const textPart = data.candidates?.[0]?.content?.parts?.find((p: any) => p.text);
  return { image: null, error: `${model}: returned text only: "${textPart?.text?.substring(0, 100) || 'no content'}"` };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. You can generate 3 free images per hour. Sign up for unlimited generations!' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not configured');

    const { prompt, referenceImage } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.length > 500) {
      return new Response(
        JSON.stringify({ error: 'Valid prompt required (max 500 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Landing] Generating:', prompt);

    // Build prompt
    let finalPrompt = `${prompt}, professional quality, 8K resolution, masterpiece, highly detailed`;
    if (referenceImage && detectModificationIntent(prompt)) {
      finalPrompt = buildIdentityPreservingPrompt(prompt);
    }

    let base64Image: string | null = null;
    const errors: string[] = [];

    if (!referenceImage) {
      // 1. Try Google Imagen 3
      const imagenResult = await generateWithImagen(GEMINI_API_KEY, finalPrompt);
      if (imagenResult.image) {
        base64Image = imagenResult.image;
      } else {
        errors.push(imagenResult.error);

        // 2. Try Gemini image models
        const parts = [{ text: finalPrompt }];
        const models = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'];
        for (const model of models) {
          const result = await generateWithGemini(GEMINI_API_KEY, model, parts);
          if (result.image) { base64Image = result.image; break; }
          errors.push(result.error);
        }
      }

      // 3. Free fallback: Pollinations.ai (FLUX) — no API key needed
      if (!base64Image) {
        const polResult = await generateWithPollinations(finalPrompt);
        if (polResult.image) { base64Image = polResult.image; }
        else { errors.push(polResult.error); }
      }
    } else {
      // Image editing with reference: try Gemini multimodal
      let imageData = referenceImage;
      if (referenceImage.startsWith('http://') || referenceImage.startsWith('https://')) {
        imageData = await urlToBase64(referenceImage);
      }
      const rawBase64 = imageData.includes(',') ? imageData.split(',')[1] : imageData;
      const mimeType = getMimeType(imageData);
      const parts = [
        { text: finalPrompt },
        { inlineData: { data: rawBase64, mimeType } },
      ];
      for (const model of ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview']) {
        const result = await generateWithGemini(GEMINI_API_KEY, model, parts);
        if (result.image) { base64Image = result.image; break; }
        errors.push(result.error);
      }
      // Fallback without reference (just prompt)
      if (!base64Image) {
        const polResult = await generateWithPollinations(finalPrompt);
        if (polResult.image) { base64Image = polResult.image; }
        else { errors.push(polResult.error); }
      }
    }

    if (!base64Image) {
      throw new Error(`Image generation failed: ${errors.join(' | ')}`);
    }

    const imageDataUrl = `data:image/png;base64,${base64Image}`;
    console.log('[Landing] Image generated successfully');

    return new Response(
      JSON.stringify({ success: true, image: imageDataUrl, prompt }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[Landing] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to generate image. Please try again!' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
