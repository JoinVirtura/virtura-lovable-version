import { supabase } from "@/integrations/supabase/client";

// ── Image Models ────────────────────────────────────────────────
export const FAL_IMAGE_MODELS = [
  { id: "flux-schnell", label: "FLUX Schnell", description: "Fast, good quality", speed: "~3s", cost: 1 },
  { id: "flux-dev", label: "FLUX Dev", description: "Higher quality", speed: "~10s", cost: 3 },
  { id: "flux-kontext", label: "FLUX Kontext", description: "Image editing", speed: "~8s", cost: 4 },
  { id: "recraft-v4", label: "Recraft V4 Pro", description: "Design quality", speed: "~10s", cost: 4 },
  { id: "nano-banana-2", label: "Nano Banana 2", description: "Google Imagen, fast", speed: "~5s", cost: 4 },
  { id: "qwen-image", label: "Qwen Image", description: "Great text rendering", speed: "~8s", cost: 2 },
  { id: "seedream-v4", label: "Seedream V4", description: "ByteDance, good value", speed: "~8s", cost: 3 },
] as const;

// ── Video Models ────────────────────────────────────────────────
export const FAL_VIDEO_MODELS = [
  { id: "kling-v3-pro", label: "Kling V3 Pro", description: "Best quality, cinematic", speed: "~2min", cost: 8, hasAudio: false, minDuration: 2, maxDuration: 10 },
  { id: "kling-v2.5-turbo", label: "Kling V2.5 Turbo", description: "Fast, fluid motion", speed: "~45s", cost: 5, hasAudio: false, minDuration: 2, maxDuration: 10 },
  { id: "wan-2.7", label: "WAN 2.7", description: "Best value", speed: "~1min", cost: 3, hasAudio: false, minDuration: 2, maxDuration: 5 },
  { id: "seedance-2", label: "Seedance 2.0", description: "ByteDance, physics + audio", speed: "~2min", cost: 8, hasAudio: true, minDuration: 2, maxDuration: 10 },
  { id: "pixverse-v6", label: "PixVerse V6", description: "Lifelike physics", speed: "~1.5min", cost: 5, hasAudio: false, minDuration: 2, maxDuration: 8 },
  { id: "kling-v3-pro-t2v", label: "Kling V3 Pro (Text)", description: "Text-to-video", speed: "~2min", cost: 8, hasAudio: false, minDuration: 2, maxDuration: 10 },
  { id: "wan-2.7-t2v", label: "WAN 2.7 (Text)", description: "Text-to-video, value", speed: "~1min", cost: 3, hasAudio: false, minDuration: 2, maxDuration: 5 },
] as const;

export type FalImageModelId = typeof FAL_IMAGE_MODELS[number]["id"];
export type FalVideoModelId = typeof FAL_VIDEO_MODELS[number]["id"];

// ── Image Generation ────────────────────────────────────────────
export interface FalImageParams {
  prompt: string;
  model?: FalImageModelId;
  aspectRatio?: string;
  referenceImage?: string;
  numImages?: number;
}

export interface FalImageResult {
  success: boolean;
  image?: string;
  images?: string[];
  prompt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

export async function generateFalImage(params: FalImageParams): Promise<FalImageResult> {
  try {
    const { data, error } = await supabase.functions.invoke("generate-image-fal", {
      body: {
        prompt: params.prompt,
        model: params.model || "flux-schnell",
        aspectRatio: params.aspectRatio || "1:1",
        referenceImage: params.referenceImage,
        numImages: params.numImages || 1,
      },
    });

    if (error) throw new Error(error.message);
    if (!data?.success) throw new Error(data?.error || "Generation failed");

    return data as FalImageResult;
  } catch (error: any) {
    console.error("❌ fal.ai image generation failed:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

// ── Video Generation ────────────────────────────────────────────
export interface FalVideoParams {
  prompt: string;
  model?: FalVideoModelId;
  imageUrl?: string;
  imageBase64?: string;
  durationSeconds?: number;
  aspectRatio?: string;
}

export interface FalVideoResult {
  success: boolean;
  videoUrl?: string;
  videoSize?: string;
  error?: string;
}

type ProgressCallback = (stage: string, percent: number) => void;

const POLL_INTERVAL = 5000;
const MAX_POLL_TIME = 10 * 60 * 1000; // 10 minutes

export async function generateFalVideo(
  params: FalVideoParams,
  onProgress?: ProgressCallback
): Promise<FalVideoResult> {
  try {
    onProgress?.("Starting video generation...", 5);

    // Upload base64 image to storage if needed
    let imageUrl = params.imageUrl;
    if (params.imageBase64) {
      onProgress?.("Uploading image...", 8);
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

    // Step 1: Submit generation
    const { data: startData, error: startError } = await supabase.functions.invoke(
      "generate-video-fal",
      {
        body: {
          action: "generate",
          model: params.model || "kling-v3-pro",
          prompt: params.prompt,
          imageUrl,
          durationSeconds: params.durationSeconds || 5,
          aspectRatio: params.aspectRatio || "16:9",
        },
      }
    );

    if (startError) throw new Error(startData?.error || startError.message);
    if (!startData?.success) throw new Error(startData?.error || "Failed to start generation");

    const { requestId, modelId } = startData;
    console.log(`🎬 fal.ai video started: requestId=${requestId}`);
    onProgress?.("Generation started, processing...", 15);

    // Step 2: Poll until done
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_POLL_TIME) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const progressPercent = Math.min(85, 15 + (elapsed / 180) * 70);

      let stage = "Processing video...";
      if (elapsed > 30) stage = "Rendering frames...";
      if (elapsed > 60) stage = "Compositing...";
      if (elapsed > 90) stage = "Finalizing...";
      if (elapsed > 120) stage = "Almost done...";
      onProgress?.(stage, Math.round(progressPercent));

      const { data: pollData, error: pollError } = await supabase.functions.invoke(
        "generate-video-fal",
        {
          body: { action: "poll", requestId, modelId },
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
          };
        }
      }
    }

    throw new Error("Video generation timed out after 10 minutes");
  } catch (error: any) {
    console.error("❌ fal.ai video generation failed:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
