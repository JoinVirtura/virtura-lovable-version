import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deductTokensAndTrackCost } from '../_shared/token-manager.ts';
import { calculateTokenCost } from '../_shared/token-costs.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Map of supported fal.ai image models
 */
const FAL_IMAGE_MODELS: Record<string, { id: string; label: string; costUsd: number }> = {
  "flux-schnell": {
    id: "fal-ai/flux/schnell",
    label: "FLUX Schnell",
    costUsd: 0.003,
  },
  "flux-dev": {
    id: "fal-ai/flux/dev",
    label: "FLUX Dev",
    costUsd: 0.025,
  },
  "flux-kontext": {
    id: "fal-ai/flux-pro/kontext",
    label: "FLUX Kontext (Edit)",
    costUsd: 0.04,
  },
  "recraft-v4": {
    id: "fal-ai/recraft/v4/pro/text-to-image",
    label: "Recraft V4 Pro",
    costUsd: 0.04,
  },
  "nano-banana-2": {
    id: "fal-ai/nano-banana-2",
    label: "Nano Banana 2 (Imagen)",
    costUsd: 0.04,
  },
  "qwen-image": {
    id: "fal-ai/qwen-image",
    label: "Qwen Image",
    costUsd: 0.02,
  },
  "seedream-v4": {
    id: "fal-ai/seedream-v4",
    label: "Seedream V4",
    costUsd: 0.03,
  },
};

/**
 * Map aspect ratio strings to fal.ai image_size values
 */
function mapAspectRatio(aspectRatio: string): string {
  const map: Record<string, string> = {
    "1:1": "square_hd",
    "16:9": "landscape_16_9",
    "9:16": "portrait_16_9",
    "4:3": "landscape_4_3",
    "3:4": "portrait_4_3",
  };
  return map[aspectRatio] || "square_hd";
}

/**
 * Convert URL to base64 data URL
 */
async function urlToBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  const chunkSize = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  return `data:${contentType};base64,${base64}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const FAL_KEY = Deno.env.get("FAL_KEY");
    if (!FAL_KEY) throw new Error("FAL_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      throw new Error("Supabase configuration missing");
    }

    // Verify user
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const {
      prompt,
      model: modelKey = "flux-schnell",
      aspectRatio = "1:1",
      referenceImage,
      numImages = 1,
    } = body;

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Valid prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const modelConfig = FAL_IMAGE_MODELS[modelKey] || FAL_IMAGE_MODELS["flux-schnell"];
    console.log(`🎨 fal.ai image generation: model=${modelConfig.id}, aspect=${aspectRatio}`);

    // Token deduction
    const tokenCostKey = `fal-${modelKey}`;
    const requiredTokens = calculateTokenCost("image_generation", tokenCostKey);
    const tokenResult = await deductTokensAndTrackCost({
      userId: user.id,
      resourceType: "image_generation",
      apiProvider: "fal",
      modelUsed: modelConfig.id,
      tokensToDeduct: requiredTokens,
      costUsd: modelConfig.costUsd,
      metadata: { model: modelKey, aspectRatio, prompt: prompt.substring(0, 100) },
    });

    if (!tokenResult.success) {
      return new Response(
        JSON.stringify({
          error: tokenResult.error || "Insufficient tokens",
          requiredTokens,
          currentBalance: tokenResult.remainingBalance,
        }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`✅ Tokens deducted: ${requiredTokens}. Remaining: ${tokenResult.remainingBalance}`);

    const startTime = Date.now();

    // Build fal.ai request input
    const falInput: Record<string, unknown> = {
      prompt,
      image_size: mapAspectRatio(aspectRatio),
      num_images: Math.min(numImages, 4),
    };

    // FLUX Schnell uses num_inference_steps
    if (modelKey === "flux-schnell") {
      falInput.num_inference_steps = 4;
    } else if (modelKey === "flux-dev") {
      falInput.num_inference_steps = 28;
    }

    // For Kontext (image editing), attach reference image
    if (modelKey === "flux-kontext" && referenceImage) {
      let imageUrl = referenceImage;
      if (referenceImage.startsWith("data:")) {
        // fal.ai accepts URLs, so we need to upload or pass the URL
        // For data URLs, pass as image_url (fal handles base64 data URLs)
        imageUrl = referenceImage;
      }
      falInput.image_url = imageUrl;
    }

    // Call fal.ai using synchronous endpoint first, fall back to queue
    // Sync endpoint: https://fal.run/<model_id>
    const syncUrl = `https://fal.run/${modelConfig.id}`;
    console.log(`🚀 Calling fal.ai (sync): ${syncUrl}`);
    console.log(`📦 Input:`, JSON.stringify(falInput).substring(0, 200));

    const syncResp = await fetch(syncUrl, {
      method: "POST",
      headers: {
        "Authorization": `Key ${FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(falInput),
    });

    if (!syncResp.ok) {
      const errText = await syncResp.text();
      console.error(`❌ fal.ai sync failed (${syncResp.status}): ${errText.substring(0, 500)}`);
      throw new Error(`fal.ai failed (${syncResp.status}): ${errText.substring(0, 300)}`);
    }

    const resultData = await syncResp.json();
    console.log(`✅ fal.ai response keys: ${Object.keys(resultData).join(', ')}`);
    const images = resultData.images;

    if (!images || images.length === 0) {
      throw new Error("fal.ai returned no images");
    }

    const processingTime = `${Math.round((Date.now() - startTime) / 1000)}s`;
    console.log(`⏱️ Processing time: ${processingTime}`);

    // Return image URL(s) - fal.ai returns CDN URLs
    const imageUrl = images[0].url;
    console.log(`✅ Image ready: ${imageUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        image: imageUrl,
        images: images.map((img: any) => img.url),
        prompt,
        tokensCharged: requiredTokens,
        remainingBalance: tokenResult.remainingBalance,
        metadata: {
          model: modelConfig.label,
          modelId: modelConfig.id,
          processingTime,
          aspectRatio,
          costUsd: modelConfig.costUsd,
          provider: "fal",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error("❌ fal.ai image generation error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
