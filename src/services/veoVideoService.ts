import { supabase } from "@/integrations/supabase/client";

/**
 * Extract a human-readable error message from a Supabase edge function error.
 * The default `error.message` is just "Edge Function returned a non-2xx status code".
 * The real message is in the response body accessible via error.context.
 */
async function extractEdgeError(error: any, fallback: string): Promise<string> {
  if (error?.context) {
    try {
      const body = await error.context.json();
      return body?.message || body?.error || error.message || fallback;
    } catch {
      return error.message || fallback;
    }
  }
  return error?.message || fallback;
}

export interface VeoGenerationParams {
  model: string;
  prompt: string;
  imageBase64?: string;  // data URL or raw base64
  imageUrl?: string;     // URL to fetch server-side
  durationSeconds: number;
  aspectRatio: string;
}

export interface VeoGenerationResult {
  success: boolean;
  videoUrl?: string;
  videoSize?: string;
  error?: string;
  provider?: 'veo' | 'fal';
}

type ProgressCallback = (stage: string, percent: number) => void;

const POLL_INTERVAL = 5000; // 5 seconds
const MAX_POLL_TIME = 10 * 60 * 1000; // 10 minutes

/**
 * Start a Veo video generation and poll until complete.
 * Returns the public Supabase Storage URL of the final MP4.
 */
export async function generateVeoVideo(
  params: VeoGenerationParams,
  onProgress?: ProgressCallback
): Promise<VeoGenerationResult> {
  try {
    onProgress?.("Starting video generation...", 5);

    // If we have a base64 image, upload to storage first to avoid body size limits
    let imageUrl = params.imageUrl;
    if (params.imageBase64) {
      onProgress?.("Uploading image...", 8);
      const response = await fetch(params.imageBase64);
      const blob = await response.blob();
      const fileName = `veo-source-${Date.now()}.${blob.type.includes("png") ? "png" : "jpg"}`;
      const { error: uploadError } = await supabase.storage
        .from("virtura-media")
        .upload(`veo-sources/${fileName}`, blob, {
          contentType: blob.type || "image/jpeg",
          upsert: true,
        });
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      const { data: urlData } = supabase.storage
        .from("virtura-media")
        .getPublicUrl(`veo-sources/${fileName}`);
      imageUrl = urlData.publicUrl;
      console.log("✅ Image uploaded for Veo:", imageUrl);
    }

    // Step 1: Start generation (always pass imageUrl, never raw base64)
    const { data: startData, error: startError } = await supabase.functions.invoke(
      "generate-video-veo",
      {
        body: {
          action: "generate",
          model: params.model,
          prompt: params.prompt,
          imageUrl,
          durationSeconds: params.durationSeconds,
          aspectRatio: params.aspectRatio,
        },
      }
    );

    if (startError) {
      console.error("❌ Edge function error:", startError);
      const msg = await extractEdgeError(startError, "Failed to start video generation");
      throw new Error(msg);
    }
    if (!startData?.success) throw new Error(startData?.error || "Failed to start generation");

    const operationName = startData.operationName;
    console.log("🎬 Veo operation started:", operationName);
    onProgress?.("Generation started, processing...", 15);

    // Step 2: Poll until done
    const startTime = Date.now();
    let pollCount = 0;

    while (Date.now() - startTime < MAX_POLL_TIME) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      pollCount++;

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const progressPercent = Math.min(85, 15 + (elapsed / 180) * 70);

      let stage = "Processing video frames...";
      if (elapsed > 30) stage = "Rendering video...";
      if (elapsed > 60) stage = "Applying effects...";
      if (elapsed > 90) stage = "Finalizing...";
      if (elapsed > 120) stage = "Almost done...";

      onProgress?.(stage, Math.round(progressPercent));

      const { data: pollData, error: pollError } = await supabase.functions.invoke(
        "generate-video-veo",
        {
          body: {
            action: "poll",
            operationName,
          },
        }
      );

      if (pollError) throw new Error(pollError.message);
      if (!pollData?.success) throw new Error(pollData?.error || "Poll failed");

      if (pollData.done) {
        if (pollData.status === "filtered") {
          throw new Error(pollData.error || "Content was filtered by safety system");
        }

        if (pollData.status === "completed" && pollData.videoUrl) {
          onProgress?.("Video ready!", 100);
          return {
            success: true,
            videoUrl: pollData.videoUrl,
            videoSize: pollData.videoSize,
          };
        }
      }

      console.log(`🔄 Poll #${pollCount} - ${elapsed}s elapsed`);
    }

    throw new Error("Video generation timed out after 10 minutes");
  } catch (error: any) {
    console.error("❌ Veo video generation failed:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

/**
 * Save a Veo-generated video to the user's library
 */
export async function saveVeoVideoToLibrary(params: {
  videoUrl: string;
  thumbnailUrl?: string;
  title: string;
  prompt: string;
  duration: number;
  model: string;
  aspectRatio: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // If thumbnailUrl is a data URL, upload it to storage first
    let thumbnailUrl = params.thumbnailUrl;
    if (thumbnailUrl && thumbnailUrl.startsWith("data:")) {
      const response = await fetch(thumbnailUrl);
      const blob = await response.blob();
      const ext = blob.type.includes("png") ? "png" : "jpg";
      const fileName = `veo-thumb-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("virtura-media")
        .upload(`thumbnails/${fileName}`, blob, {
          contentType: blob.type || "image/jpeg",
          upsert: true,
        });
      if (uploadError) {
        console.warn("⚠️ Thumbnail upload failed, using video URL as fallback:", uploadError.message);
        thumbnailUrl = undefined;
      } else {
        const { data: urlData } = supabase.storage
          .from("virtura-media")
          .getPublicUrl(`thumbnails/${fileName}`);
        thumbnailUrl = urlData.publicUrl;
      }
    }

    const { error } = await supabase.from("avatar_library").insert({
      user_id: user.id,
      title: params.title,
      prompt: params.prompt,
      video_url: params.videoUrl,
      thumbnail_url: thumbnailUrl || params.videoUrl,
      image_url: thumbnailUrl || params.videoUrl,
      is_video: true,
      duration: params.duration,
      tags: ["veo", params.model, params.aspectRatio],
    });

    if (error) throw new Error(error.message);

    window.dispatchEvent(new CustomEvent("library-updated"));
    return { success: true };
  } catch (error: any) {
    console.error("❌ Save to library failed:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate a video via fal.ai. Used as fallback when Veo fails.
 * Picks an image-to-video model when an image is provided, otherwise text-to-video.
 */
async function generateFalVideo(
  params: VeoGenerationParams,
  onProgress?: ProgressCallback
): Promise<VeoGenerationResult> {
  try {
    onProgress?.("Trying backup video provider (fal.ai)...", 10);

    // Upload base64 image if needed
    let imageUrl = params.imageUrl;
    if (params.imageBase64 && !imageUrl) {
      const response = await fetch(params.imageBase64);
      const blob = await response.blob();
      const fileName = `fal-source-${Date.now()}.${blob.type.includes("png") ? "png" : "jpg"}`;
      const { error: uploadError } = await supabase.storage
        .from("virtura-media")
        .upload(`fal-sources/${fileName}`, blob, {
          contentType: blob.type || "image/jpeg",
          upsert: true,
        });
      if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);
      const { data: urlData } = supabase.storage
        .from("virtura-media")
        .getPublicUrl(`fal-sources/${fileName}`);
      imageUrl = urlData.publicUrl;
    }

    // Pick image-to-video or text-to-video
    const falModel = imageUrl ? "kling-v3-pro" : "kling-v3-pro-t2v";

    const { data: startData, error: startError } = await supabase.functions.invoke(
      "generate-video-fal",
      {
        body: {
          action: "generate",
          model: falModel,
          prompt: params.prompt,
          imageUrl,
          durationSeconds: params.durationSeconds,
          aspectRatio: params.aspectRatio,
        },
      }
    );

    if (startError) {
      const msg = await extractEdgeError(startError, "Failed to start fal video");
      throw new Error(msg);
    }
    if (!startData?.success) throw new Error(startData?.error || "Failed to start fal video");

    const { requestId, modelId, statusUrl, responseUrl } = startData;
    console.log("🎬 fal video started:", requestId);
    onProgress?.("Backup provider processing...", 20);

    const startTime = Date.now();
    let pollCount = 0;

    while (Date.now() - startTime < MAX_POLL_TIME) {
      await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
      pollCount++;
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const progressPercent = Math.min(85, 20 + (elapsed / 180) * 65);
      onProgress?.("Backup provider rendering...", Math.round(progressPercent));

      const { data: pollData, error: pollError } = await supabase.functions.invoke(
        "generate-video-fal",
        {
          body: {
            action: "poll",
            requestId,
            modelId,
            statusUrl,
            responseUrl,
          },
        }
      );

      if (pollError) throw new Error(pollError.message);
      if (!pollData?.success) throw new Error(pollData?.error || "Poll failed");

      if (pollData.done) {
        if (pollData.status === "failed") {
          throw new Error(pollData.error || "Video generation failed");
        }
        if (pollData.status === "completed" && pollData.videoUrl) {
          onProgress?.("Video ready!", 100);
          return {
            success: true,
            videoUrl: pollData.videoUrl,
            videoSize: pollData.videoSize,
            provider: "fal",
          };
        }
      }

      console.log(`🔄 fal poll #${pollCount} - ${elapsed}s elapsed`);
    }

    throw new Error("fal video generation timed out");
  } catch (error: any) {
    console.error("❌ fal video generation failed:", error);
    return {
      success: false,
      error: error.message || "Unknown error",
      provider: "fal",
    };
  }
}

/**
 * Generate video with automatic fallback chain: Veo → fal.ai.
 * Use this instead of generateVeoVideo() to get automatic provider failover.
 */
export async function generateVideoWithFallback(
  params: VeoGenerationParams,
  onProgress?: ProgressCallback
): Promise<VeoGenerationResult> {
  console.log("🎬 Trying provider: Veo (Gemini)");
  const veoResult = await generateVeoVideo(params, onProgress);
  if (veoResult.success) {
    return { ...veoResult, provider: "veo" };
  }

  console.warn("⚠️ Veo failed, falling back to fal.ai:", veoResult.error);
  const falResult = await generateFalVideo(params, onProgress);
  if (falResult.success) return falResult;

  // Both failed — return the most informative error
  return {
    success: false,
    error: `All video providers failed. Veo: ${veoResult.error}. Fal: ${falResult.error}`,
  };
}
