import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VEO_API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * Convert an image URL to base64 (server-side)
 */
async function urlToBase64(url: string): Promise<{ data: string; mime: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image: ${res.status}`);
  const buffer = await res.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  const chunkSize = 8192;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  const base64 = btoa(binary);
  const mime = res.headers.get("content-type") || "image/jpeg";
  return { data: base64, mime };
}

/**
 * Extract base64 data from a data URL
 */
function parseDataUrl(dataUrl: string): { data: string; mime: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid data URL format");
  return { mime: match[1], data: match[2] };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const body = await req.json();
    const { action } = body;

    // ── ACTION: Generate video ──────────────────────────────────
    if (action === "generate") {
      const {
        model = "veo-2.0-generate-001",
        prompt = "Animate with natural motion",
        imageBase64,
        imageUrl,
        durationSeconds: rawDuration = 5,
        aspectRatio = "16:9",
      } = body;

      // Clamp duration to API-allowed range (4-8 inclusive)
      const durationSeconds = Math.max(4, Math.min(8, rawDuration));

      console.log("🎬 Starting Veo video generation:", {
        model,
        promptPreview: prompt.substring(0, 80),
        hasImage: !!(imageBase64 || imageUrl),
        durationSeconds,
        aspectRatio,
      });

      // Build the instance payload
      const instance: Record<string, any> = { prompt };

      // Add image if provided (image-to-video)
      if (imageBase64) {
        // Already base64 — could be a data URL or raw base64
        if (imageBase64.startsWith("data:")) {
          const parsed = parseDataUrl(imageBase64);
          instance.image = {
            bytesBase64Encoded: parsed.data,
            mimeType: parsed.mime,
          };
        } else {
          instance.image = {
            bytesBase64Encoded: imageBase64,
            mimeType: "image/jpeg",
          };
        }
      } else if (imageUrl) {
        // Fetch and convert URL to base64
        console.log("📥 Fetching image from URL...");
        const { data, mime } = await urlToBase64(imageUrl);
        instance.image = {
          bytesBase64Encoded: data,
          mimeType: mime,
        };
        console.log("✅ Image fetched and converted to base64");
      }

      const payload = {
        instances: [instance],
        parameters: {
          sampleCount: 1,
          durationSeconds,
          aspectRatio,
        },
      };

      // Try requested model first, fall back to veo-2.0 if it fails
      const modelsToTry = [model];
      if (model !== "veo-2.0-generate-001") {
        modelsToTry.push("veo-2.0-generate-001");
      }

      let lastError = "";
      for (const tryModel of modelsToTry) {
        const url = `${VEO_API_BASE}/${tryModel}:predictLongRunning?key=${GEMINI_API_KEY}`;
        console.log("📡 Calling Veo API with model:", tryModel);

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ Veo API error with ${tryModel}:`, response.status, errorText);
          lastError = `${tryModel} failed (${response.status}): ${errorText}`;
          if (modelsToTry.indexOf(tryModel) < modelsToTry.length - 1) {
            console.log(`⚠️ Falling back to next model...`);
            continue;
          }
          throw new Error(lastError);
        }

        const result = await response.json();
        console.log(`✅ Veo operation started with ${tryModel}:`, result.name);

        return new Response(
          JSON.stringify({
            success: true,
            operationName: result.name,
            model: tryModel,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(lastError || "All models failed");
    }

    // ── ACTION: Poll operation status ───────────────────────────
    if (action === "poll") {
      const { operationName } = body;
      if (!operationName) throw new Error("operationName is required");

      const url = `${VEO_API_BASE.replace("/models", "")}/${operationName}?key=${GEMINI_API_KEY}`;
      console.log("🔄 Polling:", operationName);

      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ Poll error:", response.status, errorText);
        throw new Error(`Poll error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (!result.done) {
        return new Response(
          JSON.stringify({ success: true, done: false, status: "processing" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Check for safety filter
      const videoResponse = result.response?.generateVideoResponse;
      if (videoResponse?.raiMediaFilteredCount) {
        console.error("🚫 Content filtered:", videoResponse.raiMediaFilteredReasons);
        return new Response(
          JSON.stringify({
            success: false,
            done: true,
            status: "filtered",
            error: `Content filtered: ${videoResponse.raiMediaFilteredReasons?.join(", ") || "Violated usage guidelines"}`,
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Extract video URI
      const samples = videoResponse?.generatedSamples;
      if (!samples || samples.length === 0) {
        throw new Error("No video samples generated");
      }

      const videoUri = samples[0].video?.uri;
      if (!videoUri) throw new Error("No video URI in response");

      // The URI needs the API key appended
      const downloadUrl = `${videoUri}&key=${GEMINI_API_KEY}`;

      console.log("✅ Video ready, downloading and uploading to storage...");

      // Download the video
      const videoRes = await fetch(downloadUrl);
      if (!videoRes.ok) {
        throw new Error(`Failed to download video: ${videoRes.status}`);
      }

      const videoBlob = await videoRes.blob();
      const videoSize = videoBlob.size;
      console.log(`📦 Video downloaded: ${(videoSize / 1024 / 1024).toFixed(2)}MB`);

      // Upload to Supabase Storage
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      const fileName = `veo-video-${Date.now()}.mp4`;
      const filePath = `videos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("virtura-media")
        .upload(filePath, videoBlob, {
          contentType: "video/mp4",
          upsert: true,
        });

      if (uploadError) {
        console.error("❌ Storage upload failed:", uploadError);
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from("virtura-media")
        .getPublicUrl(filePath);

      const publicVideoUrl = urlData.publicUrl;
      console.log("✅ Video uploaded to storage:", publicVideoUrl);

      return new Response(
        JSON.stringify({
          success: true,
          done: true,
          status: "completed",
          videoUrl: publicVideoUrl,
          videoSize: `${(videoSize / 1024 / 1024).toFixed(2)}MB`,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error: any) {
    console.error("❌ generate-video-veo error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
