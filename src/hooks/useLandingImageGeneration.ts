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
      console.log('[Landing] Generation started:', prompt);

      // Generate 3 variants by calling the public edge function
      const variants: GeneratedImage[] = [];
      
      for (let i = 0; i < 3; i++) {
        setProgress((i / 3) * 100);
        
        try {
          const { supabase } = await import("@/integrations/supabase/client");
          const { data, error } = await supabase.functions.invoke('generate-landing-image', {
            body: { prompt }
          });

          if (error) throw error;

          if (data?.success && data?.image) {
            variants.push({
              success: true,
              image: data.image,
              prompt: data.prompt,
              metadata: {
                contentType: 'landing',
                style: 'photorealistic',
                resolution: '1024x1024',
                processingTime: 'instant'
              }
            });
          }
        } catch (variantError) {
          console.error(`[Landing] Variant ${i + 1} failed:`, variantError);
          // Continue with other variants even if one fails
        }

        // Small delay between requests to avoid overwhelming the service
        if (i < 2) await new Promise(resolve => setTimeout(resolve, 500));
      }

      setImages(variants.filter(v => v.success));
      setProgress(100);

      if (variants.length > 0) {
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
  };
}
