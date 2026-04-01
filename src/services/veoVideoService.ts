import { supabase } from "@/integrations/supabase/client";

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
      throw new Error(startData?.error || startError.message || "Failed to start video generation");
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
