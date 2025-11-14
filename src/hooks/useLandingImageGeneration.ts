import { useState } from "react";
import { ImageGenerationService, type ImageGenerationParams, type GeneratedImage } from "@/services/imageGenerationService";
import { toast } from "sonner";

interface UseLandingImageGenerationReturn {
  images: GeneratedImage[];
  isGenerating: boolean;
  progress: number;
  generateImages: (prompt: string, params?: Partial<ImageGenerationParams>) => Promise<void>;
  clearImages: () => void;
}

export function useLandingImageGeneration(): UseLandingImageGenerationReturn {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const generateImages = async (prompt: string, params?: Partial<ImageGenerationParams>) => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setImages([]);

    try {
      // Track analytics event
      if (typeof window !== 'undefined') {
        console.log('[Landing] Generation started:', prompt);
      }

      // Generate 3 variants
      const defaultParams: ImageGenerationParams = {
        prompt,
        style: "photorealistic",
        contentType: "auto",
        aspectRatio: "1:1",
        resolution: "1024x1024",
        quality: "hd",
        provider: "replicate",
      };

      const mergedParams = { ...defaultParams, ...params, prompt };
      
      const variants = await ImageGenerationService.generateVariants(
        prompt,
        mergedParams,
        3
      );

      setImages(variants.filter(v => v.success));
      setProgress(100);

      if (variants.some(v => v.success)) {
        toast.success("Images generated! Sign up to download watermark-free.");
      }

      // Track completion
      if (typeof window !== 'undefined') {
        console.log('[Landing] Generation completed:', variants.length);
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Failed to generate images. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImages = () => {
    setImages([]);
    setProgress(0);
  };

  return {
    images,
    isGenerating,
    progress,
    generateImages,
    clearImages,
  };
}
