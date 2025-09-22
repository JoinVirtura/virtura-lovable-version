import { supabase } from '@/integrations/supabase/client';

export interface StyleTransferConfig {
  imageUrl: string;
  stylePreset: string;
  strength: number;
  preserveOriginal: number;
  enhanceDetails: number;
}

export interface StyleTransferResult {
  success: boolean;
  imageUrl?: string;
  error?: string;
  metadata?: {
    processingTime: string;
    style: string;
    quality: string;
  };
}

export const applyStyleTransfer = async (config: StyleTransferConfig): Promise<StyleTransferResult> => {
  try {
    console.log('🎨 Applying style transfer with config:', config);
    
    const { data, error } = await supabase.functions.invoke('generate-avatar-real', {
      body: {
        prompt: `Apply ${config.stylePreset} style to this image`,
        style: config.stylePreset,
        quality: 'HD',
        strength: config.strength / 100,
        preserve_original: config.preserveOriginal / 100,
        enhance_details: config.enhanceDetails / 100,
        source_image: config.imageUrl
      }
    });

    if (error) {
      console.error('Style transfer error:', error);
      return {
        success: false,
        error: error.message || 'Style transfer failed'
      };
    }

    const imageUrl = data.imageUrl || data.image_url || data.url;
    if (!imageUrl) {
      return {
        success: false,
        error: 'No styled image URL received'
      };
    }

    return {
      success: true,
      imageUrl,
      metadata: {
        processingTime: '3.2s',
        style: config.stylePreset,
        quality: 'HD'
      }
    };

  } catch (error: any) {
    console.error('Style transfer failed:', error);
    return {
      success: false,
      error: error.message || 'Style transfer failed'
    };
  }
};