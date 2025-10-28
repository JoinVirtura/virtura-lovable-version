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
    console.log('🎨 [StyleTransfer] Starting with config:', config);
    console.log('🔍 [StyleTransfer] Image URL:', config.imageUrl);
    console.log('🎭 [StyleTransfer] Style preset:', config.stylePreset);
    
    // Check authentication
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('🔐 [StyleTransfer] Session check:', session ? 'Authenticated' : 'Not authenticated');
    
    if (sessionError) {
      console.error('❌ [StyleTransfer] Session error:', sessionError);
      return {
        success: false,
        error: 'Authentication error: ' + sessionError.message
      };
    }
    
    if (!session) {
      console.error('❌ [StyleTransfer] No active session');
      return {
        success: false,
        error: 'Please sign in to use style transfer'
      };
    }

    console.log('📞 [StyleTransfer] Invoking style-transfer-replicate function...');
    const { data, error } = await supabase.functions.invoke('style-transfer-replicate', {
      body: {
        sourceImage: config.imageUrl,
        stylePreset: config.stylePreset,
        strength: config.strength / 100, // Convert 0-100 to 0-1
        quality: 'HD'
      }
    });

    console.log('📥 [StyleTransfer] Response received:', { data, error });

    if (error) {
      console.error('❌ [StyleTransfer] Edge function error:', error);
      return {
        success: false,
        error: `Edge function error: ${error.message || 'Unknown error'}`
      };
    }

    if (!data) {
      console.error('❌ [StyleTransfer] No data received from edge function');
      return {
        success: false,
        error: 'No response from style transfer service'
      };
    }

    const imageUrl = data.imageUrl || data.image_url || data.url;
    console.log('🖼️ [StyleTransfer] Extracted image URL:', imageUrl);
    
    if (!imageUrl) {
      console.error('❌ [StyleTransfer] No image URL in response:', data);
      return {
        success: false,
        error: 'No styled image URL received from service'
      };
    }

    console.log('✅ [StyleTransfer] Success!');
    return {
      success: true,
      imageUrl,
      metadata: data.metadata || {
        processingTime: '3.2s',
        style: config.stylePreset,
        quality: 'HD'
      }
    };

  } catch (error: any) {
    console.error('💥 [StyleTransfer] Exception caught:', error);
    console.error('💥 [StyleTransfer] Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return {
      success: false,
      error: `Exception: ${error.message || 'Style transfer failed'}`
    };
  }
};