import { useState } from "react";
import { ImageGenerationService, type ImageGenerationParams, type GeneratedImage } from "@/services/imageGenerationService";
import { toast } from "sonner";

interface ExtendedImageGenerationParams extends Partial<ImageGenerationParams> {
  referenceImage?: string;
}

interface UseLandingImageGenerationReturn {
  images: GeneratedImage[];
  isGenerating: boolean;
  progress: number;
  generateImages: (prompt: string, params?: ExtendedImageGenerationParams) => Promise<void>;
  clearImages: () => void;
  sessionId: string;
}

export function useLandingImageGeneration(): UseLandingImageGenerationReturn {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

  const generateImages = async (prompt: string, params?: ExtendedImageGenerationParams) => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setImages([]);

    try {
      console.log('[Landing] Generation started:', prompt, params?.referenceImage ? 'with reference image' : '');

      // Generate 1 preview image — anonymous trial gives one free try
      const variants: GeneratedImage[] = [];

      try {
        setProgress(50);
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase.functions.invoke('generate-landing-gemini', {
          body: {
            prompt,
            referenceImage: params?.referenceImage
          }
        });

        if (error) {
          console.error('[Landing] Generation error:', error);
          if (error.message?.includes('Rate limit')) {
            toast.error("Rate limit reached. Sign up for unlimited generations!");
          } else {
            throw error;
          }
        } else if (data?.success && data?.image) {
          variants.push({
            success: true,
            image: data.image,
            prompt: data.prompt || prompt,
            metadata: {
              contentType: 'landing',
              style: 'photorealistic',
              resolution: '1024x1024',
              processingTime: 'fast'
            }
          });
        }
      } catch (variantError: any) {
        console.error('[Landing] Generation failed:', variantError);
        if (variantError?.message?.includes('Rate limit') || variantError?.status === 429) {
          toast.error("Free tier limit reached. Sign up for unlimited access!");
        }
      }

      setImages(variants.filter(v => v.success));
      setProgress(100);

      if (variants.length > 0) {
        // Track analytics
        try {
          await fetch('https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/track-landing-analytics', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event_type: 'images_generated',
              prompt,
              session_id: sessionId,
              metadata: { 
                count: variants.length,
                hasReferenceImage: !!params?.referenceImage 
              }
            })
          });
        } catch (error) {
          console.error('Error tracking analytics:', error);
        }

        toast.success("Images generated! Sign up to download watermark-free.");
      } else {
        toast.error("Failed to generate images. Please try again.");
      }

      console.log('[Landing] Generation completed:', variants.length);
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
    sessionId,
  };
}
