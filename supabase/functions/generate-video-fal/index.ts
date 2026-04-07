import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { deductTokensAndTrackCost } from '../_shared/token-manager.ts';
import { calculateTokenCost } from '../_shared/token-costs.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Supported fal.ai video models
 */
const FAL_VIDEO_MODELS: Record<string, { id: string; label: string; costPerSec: number }> = {
  "kling-v3-pro": {
    id: "fal-ai/kling-video/v3/pro/image-to-video",
    label: "Kling V3 Pro",
    costPerSec: 0.112,
  },
  "kling-v2.5-turbo": {
    id: "fal-ai/kling-video/v2.5-turbo/pro/image-to-video",
    label: "Kling V2.5 Turbo",
    costPerSec: 0.07,
  },
  "wan-2.7": {
    id: "fal-ai/wan/v2.7/image-to-video",
    label: "WAN 2.7",
    costPerSec: 0.05,
  },
  "kling-v3-pro-t2v": {
    id: "fal-ai/kling-video/v3/pro/text-to-video",
    label: "Kling V3 Pro (Text)",
    costPerSec: 0.112,
  },
  "seedance-2": {
    id: "bytedance/seedance-2.0/image-to-video",
    label: "Seedance 2.0",
    costPerSec: 0.10,
  },
  "pixverse-v6": {
    id: "fal-ai/pixverse/v6/image-to-video",
    label: "PixVerse V6",
    costPerSec: 0.07,
  },
  "wan-2.7-t2v": {
    id: "fal-ai/wan/v2.7/text-to-video",
    label: "WAN 2.7 (Text)",
    costPerSec: 0.05,
  },
};

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
    const { action } = body;

    // ── Action: generate ────────────────────────────────────────
    if (action === "generate") {
      const {
        model: modelKey = "kling-v3-pro",
        prompt,
        imageUrl,
        durationSeconds = 5,
        aspectRatio = "16:9",
      } = body;

      if (!prompt) {
        return new Response(
          JSON.stringify({ error: "Prompt is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const modelConfig = FAL_VIDEO_MODELS[modelKey] || FAL_VIDEO_MODELS["kling-v3-pro"];
      const duration = Math.max(2, Math.min(10, durationSeconds));
      const estimatedCost = modelConfig.costPerSec * duration;

      console.log(`🎬 fal.ai video: model=${modelConfig.id}, duration=${duration}s, cost=$${estimatedCost.toFixed(3)}`);

      // Token deduction
      const tokenCostKey = `fal-${modelKey}`;
      const requiredTokens = calculateTokenCost("video_generation", tokenCostKey);
      const tokenResult = await deductTokensAndTrackCost({
        userId: user.id,
        resourceType: "video_generation",
        apiProvider: "fal",
        modelUsed: modelConfig.id,
        tokensToDeduct: requiredTokens,
        costUsd: estimatedCost,
        metadata: { model: modelKey, duration, aspectRatio, prompt: prompt.substring(0, 100) },
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

      // Build fal.ai input
      const falInput: Record<string, unknown> = {
        prompt,
        duration: String(duration),
        aspect_ratio: aspectRatio,
      };

      // Image-to-video: attach image
      if (imageUrl) {
        falInput.image_url = imageUrl;
      }

      // Submit to fal.ai queue
      const submitUrl = `https://queue.fal.run/${modelConfig.id}`;
      console.log(`🚀 Submitting video to fal.ai: ${submitUrl}`);

      const submitResp = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Authorization": `Key ${FAL_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: falInput }),
      });

      if (!submitResp.ok) {
        const errText = await submitResp.text();
        throw new Error(`fal.ai submit failed (${submitResp.status}): ${errText.substring(0, 300)}`);
      }

      const submitData = await submitResp.json();
      console.log(`📋 fal.ai video request_id: ${submitData.request_id}`);

      return new Response(
        JSON.stringify({
          success: true,
          requestId: submitData.request_id,
          modelId: modelConfig.id,
          // fal.ai's status URL uses only the namespace prefix (e.g. fal-ai/kling-video),
          // not the full app id — return the URLs from the submit response directly.
          statusUrl: submitData.status_url,
          responseUrl: submitData.response_url,
          tokensCharged: requiredTokens,
          remainingBalance: tokenResult.remainingBalance,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // ── Action: poll ────────────────────────────────────────────
    if (action === "poll") {
      const { requestId, modelId, statusUrl: clientStatusUrl, responseUrl: clientResponseUrl } = body;
      if (!requestId || !modelId) {
        return new Response(
          JSON.stringify({ error: "requestId and modelId are required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // fal.ai queue status URL uses only the namespace prefix (e.g. "fal-ai/kling-video"),
      // not the full app id ("fal-ai/kling-video/v3/pro/image-to-video"). Prefer the URLs
      // returned by the submit response; fall back to constructing from the first two segments.
      const namespace = modelId.split("/").slice(0, 2).join("/");
      const statusUrl = clientStatusUrl || `https://queue.fal.run/${namespace}/requests/${requestId}/status`;
      const responseUrl = clientResponseUrl || `https://queue.fal.run/${namespace}/requests/${requestId}`;

      const statusResp = await fetch(statusUrl, {
        headers: { "Authorization": `Key ${FAL_KEY}` },
      });

      if (!statusResp.ok) {
        const errText = await statusResp.text();
        console.error(`❌ fal.ai status poll failed (${statusResp.status}): ${errText.substring(0, 300)}`);
        throw new Error(`fal.ai status failed (${statusResp.status}): ${errText.substring(0, 200)}`);
      }

      const statusData = await statusResp.json();

      if (statusData.status === "COMPLETED") {
        // Fetch full result
        const resultResp = await fetch(responseUrl, {
          headers: { "Authorization": `Key ${FAL_KEY}` },
        });
        const resultData = await resultResp.json();

        const videoUrl = resultData.video?.url;
        if (!videoUrl) {
          return new Response(
            JSON.stringify({ success: true, done: true, status: "failed", error: "No video in result" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            done: true,
            status: "completed",
            videoUrl,
            videoSize: resultData.video?.file_size ? `${(resultData.video.file_size / (1024 * 1024)).toFixed(1)}MB` : undefined,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (statusData.status === "FAILED") {
        return new Response(
          JSON.stringify({
            success: true,
            done: true,
            status: "failed",
            error: statusData.error || "Video generation failed",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Still processing
      return new Response(
        JSON.stringify({
          success: true,
          done: false,
          status: statusData.status || "IN_PROGRESS",
          queuePosition: statusData.queue_position,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use "generate" or "poll"' }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ fal.ai video error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
