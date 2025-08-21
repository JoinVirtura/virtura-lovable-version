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
      
      const { data, error } = await supabase.functions.invoke('generate-avatar-hf', {
        body: params
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      console.log('Avatar generated successfully');
      return data;
    } catch (error) {
      console.error('Avatar generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}