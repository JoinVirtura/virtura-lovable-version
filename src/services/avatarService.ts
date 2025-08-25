import { supabase } from "@/integrations/supabase/client";

export interface AvatarGenerationParams {
  prompt: string;
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
      console.log('Calling generate-avatar-hf function with params:', params);

      // Primary: Hugging Face (FLUX)
      const hfResp = await supabase.functions.invoke('generate-avatar-hf', {
        body: params,
      });

      if (!hfResp.error && hfResp.data?.success) {
        console.log('Avatar generated via HF successfully');
        return hfResp.data as GeneratedAvatar;
      }

      // If HF failed, log and try OpenAI (DALL·E / gpt-image-1) function
      if (hfResp.error) {
        console.warn('HF function error, falling back to OpenAI function:', hfResp.error?.message || hfResp.error);
      } else if (!hfResp.data?.success) {
        console.warn('HF function returned unsuccessful response, falling back:', hfResp.data?.error);
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