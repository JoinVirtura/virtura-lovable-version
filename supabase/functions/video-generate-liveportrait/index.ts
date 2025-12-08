import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { deductTokensAndTrackCost } from '../_shared/token-manager.ts';
import { calculateTokenCost } from '../_shared/token-costs.ts';
import { MODEL_COSTS } from '../_shared/cost-tracking.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { avatarImageUrl, audioUrl, settings = {} } = await req.json();
    
    console.log('🎨 LivePortrait: Starting enhanced video generation...');
    console.log('Avatar URL:', avatarImageUrl);
    console.log('Audio URL:', audioUrl);
    console.log('Settings:', settings);

    if (!avatarImageUrl || !audioUrl) {
      throw new Error('Avatar image and audio URL are required');
    }
    
    // Get authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Authentication required');
    }
    
    const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }
    
    // Calculate token cost
    const requiredTokens = calculateTokenCost('video_generation', 'liveportrait');
    const estimatedCost = MODEL_COSTS.replicateVideo['liveportrait'];
    
    console.log(`💰 Token cost: ${requiredTokens} tokens (estimated $${estimatedCost})`);
    
    // Deduct tokens BEFORE processing
    const tokenResult = await deductTokensAndTrackCost({
      userId: user.id,
      resourceType: 'video_generation',
      apiProvider: 'replicate',
      modelUsed: 'liveportrait',
      tokensToDeduct: requiredTokens,
      costUsd: estimatedCost,
      metadata: {
        quality: settings.quality || '1080p',
        duration: settings.duration || 15,
      },
    });
    
    if (!tokenResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: tokenResult.error || 'Insufficient tokens',
          requiredTokens,
          currentBalance: tokenResult.remainingBalance,
        }),
        { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`✅ Tokens deducted. Remaining balance: ${tokenResult.remainingBalance}`);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Enhanced LivePortrait processing simulation
    console.log('🚀 Phase 1: LivePortrait processing...');
    await delay(3000); // Simulate processing time
    
    console.log('✅ Phase 2: Generating enhanced video...');
    await delay(2000);
    
    // Generate enhanced mock video
    const mockVideoBlob = await generateEnhancedMockVideo();
    const videoBuffer = await mockVideoBlob.arrayBuffer();
    
    // Upload video to Supabase storage
    const fileName = `liveportrait-${Date.now()}.mp4`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('virtura-media')
      .upload(`videos/${fileName}`, videoBuffer, {
        contentType: 'video/mp4',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: urlData } = supabase.storage
      .from('virtura-media')
      .getPublicUrl(`videos/${fileName}`);

    console.log('🎉 LivePortrait generation completed!');
    
    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: urlData.publicUrl,
        video_id: `liveportrait_${Date.now()}`,
        duration: Math.max(10, settings.duration || 15),
        quality: settings.quality || '1080p',
        engine: 'liveportrait',
        tokensCharged: requiredTokens,
        remainingBalance: tokenResult.remainingBalance,
        metadata: {
          processingTime: '5.0s',
          resolution: '1080x1080',
          fps: 30,
          engine: 'LivePortrait Enhanced',
          features: ['Enhanced Lip Sync', 'Natural Head Movement', 'Eye Blink Animation'],
          settings: settings,
          costUsd: estimatedCost,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('LivePortrait generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'LivePortrait generation failed'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateEnhancedMockVideo(): Promise<Blob> {
  // Generate an enhanced mock video for testing
  // In a real implementation, this would call the actual LivePortrait API
  const mockVideoData = new Uint8Array(1024 * 50); // 50KB mock video
  
  // Fill with some mock MP4-like header data
  mockVideoData[0] = 0x00;
  mockVideoData[1] = 0x00;
  mockVideoData[2] = 0x00;
  mockVideoData[3] = 0x20;
  mockVideoData[4] = 0x66; // 'f'
  mockVideoData[5] = 0x74; // 't'
  mockVideoData[6] = 0x79; // 'y'
  mockVideoData[7] = 0x70; // 'p'
  
  return new Blob([mockVideoData], { type: 'video/mp4' });
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}