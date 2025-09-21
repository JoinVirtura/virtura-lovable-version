import { supabase } from "@/integrations/supabase/client";

export interface AvatarGenerationParams {
  prompt: string;
  negativePrompt?: string;
  adherence?: number;
  steps?: number;
  enhance?: boolean;
  selectedPreset?: string | null;
  style?: string;
  gender?: string;
  age?: string;
  hairColor?: string;
  eyeColor?: string;
  setting?: string;
  pose?: string;
  clothing?: string;
  accessories?: string;
  creativity?: number;
  resolution?: string;
  photoMode?: boolean;
  referenceImage?: string; // Base64 encoded image
}


export interface GeneratedAvatar {
  success: boolean;
  image?: string;
  prompt?: string;
  error?: string;
}

export class AvatarService {
  static async generateAvatar(params: AvatarGenerationParams): Promise<GeneratedAvatar> {
    try {
      console.log('Calling generate-avatar-real function with params:', params);

      // Primary: Real Avatar Generation (FLUX)
      const realResp = await supabase.functions.invoke('generate-avatar-real', {
        body: {
          prompt: params.prompt,
          style: params.style || 'realistic',
          quality: params.resolution === '1024x1024' ? '4K' : '8K',
          faceConsistency: 85,
          negativePrompt: params.negativePrompt,
          adherence: params.adherence,
          steps: params.steps,
          enhance: params.enhance,
          selectedPreset: params.selectedPreset,
          resolution: params.resolution,
          photoMode: params.photoMode,
          referenceImage: params.referenceImage
        },
      });

      if (!realResp.error && realResp.data?.success) {
        console.log('Avatar generated via Real function successfully');
        return {
          success: true,
          image: realResp.data.imageUrl,
          prompt: params.prompt
        };
      }

      // If Real failed, log and try OpenAI (DALL·E / gpt-image-1) function
      if (realResp.error) {
        console.warn('Real function error, falling back to OpenAI function:', realResp.error?.message || realResp.error);
      } else if (!realResp.data?.success) {
        console.warn('Real function returned unsuccessful response, falling back:', realResp.data?.error);
      }

      console.log('Calling generate-avatar (OpenAI) fallback with params:', params);
      const oaResp = await supabase.functions.invoke('generate-avatar', {
        body: params,
      });

      if (oaResp.error) {
        console.error('OpenAI fallback function error:', oaResp.error);
        throw new Error(oaResp.error.message);
      }

      if (!oaResp.data?.success) {
        throw new Error(oaResp.data?.error || 'Generation failed (OpenAI fallback)');
      }

      console.log('Avatar generated via OpenAI fallback successfully');
      return oaResp.data as GeneratedAvatar;
    } catch (error) {
      console.error('Avatar generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}