import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Replicate from "https://esm.sh/replicate@0.25.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Health check endpoint
  if (req.method === 'GET') {
    const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
    return new Response(JSON.stringify({
      status: 'ok',
      timestamp: new Date().toISOString(),
      hasReplicateKey: !!REPLICATE_API_KEY,
      message: REPLICATE_API_KEY 
        ? 'Video engine ready' 
        : 'REPLICATE_API_KEY not configured - add it in Supabase secrets'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { avatarImageUrl, audioUrl, prompt, settings = {} } = await req.json();
    
    console.log('🎬 Video Engine Pro: Starting Replicate generation with SSE...');
    console.log('Avatar URL:', avatarImageUrl);
    console.log('Audio URL:', audioUrl);
    console.log('Settings:', JSON.stringify(settings, null, 2));
    
    // Enhanced settings for ultra-quality output
    const videoSettings = {
      quality: settings.quality || '4K',
      ratio: settings.ratio || '16:9',
      style: settings.style || 'cinematic',
      fps: settings.fps || 30,
      duration: settings.duration || 30,
      background: settings.background || 'studio',
      ...settings
    };

    console.log('🎯 Processing with enhanced settings:', videoSettings);

    // Return SSE stream for real-time progress
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        };

        try {
          send({ stage: 'initializing', progress: 5, message: 'Initializing Replicate video synthesis...' });

          const videoResult = await generateRealVideo(
            avatarImageUrl, 
            audioUrl, 
            prompt, 
            videoSettings,
            send
          );

          send({ 
            stage: 'complete', 
            progress: 100, 
            videoUrl: videoResult.videoUrl,
            provider: videoResult.provider,
            video_id: videoResult.video_id,
            duration: videoResult.duration,
            quality: videoResult.quality,
            metadata: videoResult.metadata
          });
        } catch (error: any) {
          console.error('Video generation error:', error);
          send({ 
            stage: 'error', 
            progress: 0, 
            error: error.message,
            code: 'VIDEO_ENGINE_ERROR'
          });
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error: any) {
    console.error('Video Engine Pro error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        code: 'VIDEO_ENGINE_ERROR'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Main video generation function with Replicate cascade
async function generateRealVideo(
  avatarImageUrl: string,
  audioUrl: string,
  prompt: string,
  settings: any,
  sendProgress: (data: any) => void
) {
  console.log('🚀 Starting Replicate Video Generation with Cascade...');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Priority cascade: LivePortrait (Best) -> Wav2Lip (Good) -> Video Retalking (Fast)
  const engines = [
    { name: 'LivePortrait', fn: generateWithSyncLabs, quality: '⭐⭐⭐⭐⭐ Premium' },
    { name: 'Wav2Lip (High Quality)', fn: generateWithSadTalker, quality: '⭐⭐⭐⭐ High Quality' },
    { name: 'Video Retalking (Fast)', fn: generateWithWav2Lip, quality: '⭐⭐⭐ Budget' }
  ];

  const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
  if (!REPLICATE_API_KEY) {
    throw new Error('REPLICATE_API_KEY not configured. Please add it in Supabase secrets.');
  }

  let lastError: Error | null = null;

  for (const engine of engines) {
    try {
      console.log(`🎯 Attempting video generation with ${engine.name} ${engine.quality}...`);
      sendProgress({ 
        stage: 'engine_selection', 
        progress: 10, 
        message: `Using ${engine.name} for video generation...` 
      });

      const result = await engine.fn(
        avatarImageUrl, 
        audioUrl, 
        settings, 
        sendProgress, 
        supabase,
        REPLICATE_API_KEY
      );
      
      console.log(`✅ ${engine.name} succeeded!`);
      return result;
      
    } catch (error: any) {
      console.error(`❌ ${engine.name} failed:`, error.message);
      lastError = error;
      
      sendProgress({ 
        stage: 'engine_fallback', 
        progress: 10, 
        message: `${engine.name} failed, trying next engine...` 
      });
      
      continue;
    }
  }

  // All engines failed
  throw new Error(`All Replicate engines failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Primary Engine: Sync Labs Lipsync 2 Pro
async function generateWithSyncLabs(
  avatarImageUrl: string,
  audioUrl: string,
  settings: any,
  sendProgress: (data: any) => void,
  supabase: any,
  replicateApiKey: string
) {
  const replicate = new Replicate({ auth: replicateApiKey });

  sendProgress({ 
    stage: 'preparing', 
    progress: 15, 
    message: '📤 Preparing avatar and audio for LivePortrait...' 
  });

  sendProgress({ 
    stage: 'generating', 
    progress: 30, 
    message: '🎬 Generating premium quality talking avatar with LivePortrait...' 
  });

  console.log('🎯 Running LivePortrait model with inputs:', { 
    imageUrl: avatarImageUrl.substring(0, 60) + '...',
    audioUrl: audioUrl.substring(0, 60) + '...',
    modelVersion: 'fofr/live-portrait'
  });

  try {
    const output: any = await replicate.run(
      "fofr/live-portrait",
      {
        input: {
          driving_audio: audioUrl,
          source_image: avatarImageUrl,
          flag_relative: true,
          flag_pasteback: true,
          flag_do_crop: false,
          flag_stitching: true
        }
      }
    );

    sendProgress({ 
      stage: 'processing', 
      progress: 60, 
      message: '🎭 Processing lip-sync and facial animations...' 
    });

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ LivePortrait success:', {
      videoUrl: videoUrl.substring(0, 60) + '...',
      status: 'completed'
    });

    return await downloadAndUploadVideo(
      videoUrl,
      'live-portrait',
      settings,
      sendProgress,
      supabase
    );

  } catch (error: any) {
    console.error('LivePortrait generation error:', error);
    
    // Enhanced error handling for Replicate errors
    let errorMessage = error.message;
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorMessage = 'Replicate rate limit reached. Please wait 60 seconds and try again.';
    } else if (errorMessage.includes('402') || errorMessage.includes('payment')) {
      errorMessage = 'Replicate payment required. Please add a payment method at replicate.com/account/billing';
    }
    
    throw new Error(`LivePortrait failed: ${errorMessage}`);
  }
}

// Fallback #1: SadTalker (3D Motion)
async function generateWithSadTalker(
  avatarImageUrl: string,
  audioUrl: string,
  settings: any,
  sendProgress: (data: any) => void,
  supabase: any,
  replicateApiKey: string
) {
  const replicate = new Replicate({ auth: replicateApiKey });

  sendProgress({ 
    stage: 'generating', 
    progress: 30, 
    message: '🎬 Generating with Wav2Lip (High Quality)...' 
  });

  console.log('🎯 Running Wav2Lip model (zsxkib/wav2lip)');

  try {
    const output: any = await replicate.run(
      "zsxkib/wav2lip",
      {
        input: {
          face: avatarImageUrl,
          audio: audioUrl,
          pads: "0 10 0 0",
          resize_factor: 1,
          smooth: true,
          nosmooth: false
        }
      }
    );

    sendProgress({ 
      stage: 'processing', 
      progress: 65, 
      message: '🎭 Applying 3D motion and enhancements...' 
    });

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ Wav2Lip generated video:', videoUrl);

    return await downloadAndUploadVideo(
      videoUrl,
      'wav2lip',
      settings,
      sendProgress,
      supabase
    );

  } catch (error: any) {
    console.error('Wav2Lip generation error:', error);
    
    // Enhanced error handling for Replicate errors
    let errorMessage = error.message;
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorMessage = 'Replicate rate limit reached. Please wait 60 seconds and try again.';
    } else if (errorMessage.includes('402') || errorMessage.includes('payment')) {
      errorMessage = 'Replicate payment required. Please add a payment method at replicate.com/account/billing';
    }
    
    throw new Error(`Wav2Lip failed: ${errorMessage}`);
  }
}

// Fallback #2: Wav2Lip (Fast & Budget)
async function generateWithWav2Lip(
  avatarImageUrl: string,
  audioUrl: string,
  settings: any,
  sendProgress: (data: any) => void,
  supabase: any,
  replicateApiKey: string
) {
  const replicate = new Replicate({ auth: replicateApiKey });

  sendProgress({ 
    stage: 'generating', 
    progress: 35, 
    message: '⚡ Fast generation with Video Retalking...' 
  });

  console.log('🎯 Running Video Retalking model (camenduru/video-retalking)');

  try {
    const output: any = await replicate.run(
      "camenduru/video-retalking",
      {
        input: {
          face: avatarImageUrl,
          audio: audioUrl
        }
      }
    );

    sendProgress({ 
      stage: 'processing', 
      progress: 70, 
      message: '🎭 Finalizing lip-sync...' 
    });

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ Wav2Lip generated video:', videoUrl);

    return await downloadAndUploadVideo(
      videoUrl,
      'wav2lip',
      settings,
      sendProgress,
      supabase
    );

  } catch (error: any) {
    console.error('Video Retalking generation error:', error);
    
    // Enhanced error handling for Replicate errors
    let errorMessage = error.message;
    if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
      errorMessage = 'Replicate rate limit reached. Please wait 60 seconds and try again.';
    } else if (errorMessage.includes('402') || errorMessage.includes('payment')) {
      errorMessage = 'Replicate payment required. Please add a payment method at replicate.com/account/billing';
    }
    
    throw new Error(`Video Retalking failed: ${errorMessage}`);
  }
}

// Helper function to download video from Replicate and upload to Supabase
async function downloadAndUploadVideo(
  replicateVideoUrl: string,
  provider: string,
  settings: any,
  sendProgress: (data: any) => void,
  supabase: any
) {
  sendProgress({ 
    stage: 'downloading', 
    progress: 75, 
    message: '⬇️ Downloading generated video...' 
  });

  const videoResponse = await fetch(replicateVideoUrl);
  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.status}`);
  }

  const videoBlob = await videoResponse.arrayBuffer();
  const videoSize = videoBlob.byteLength;
  const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
  
  console.log(`📦 Video downloaded, size: ${videoSize} bytes, type: ${contentType}`);

  // Validate video
  if (videoSize === 0) {
    throw new Error('Downloaded video is empty (0 bytes)');
  }

  if (videoSize < 1000) {
    console.warn('⚠️ Video file is suspiciously small, but proceeding...');
  }

  sendProgress({ 
    stage: 'uploading', 
    progress: 85, 
    message: '☁️ Uploading to secure storage...' 
  });

  // Upload to Supabase with retry logic
  const fileName = `${provider}-${Date.now()}.mp4`;
  const filePath = `videos/${fileName}`;

  let uploadAttempt = 0;
  let uploadSuccess = false;
  let publicUrl = replicateVideoUrl; // Fallback to Replicate URL
  let storageError = null;

  while (uploadAttempt < 3 && !uploadSuccess) {
    try {
      uploadAttempt++;
      console.log(`📤 Storage upload attempt ${uploadAttempt}/3...`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('virtura-media')
        .upload(filePath, videoBlob, {
          contentType: contentType,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('virtura-media')
        .getPublicUrl(filePath);

      publicUrl = urlData.publicUrl;
      uploadSuccess = true;
      console.log('✅ Video uploaded to Supabase Storage:', publicUrl);
      
    } catch (error: any) {
      console.warn(`⚠️ Upload attempt ${uploadAttempt} failed:`, error.message);
      storageError = error.message;
      
      if (uploadAttempt < 3) {
        await delay(1000); // Wait 1s before retry
      } else {
        console.error('❌ Storage upload failed after 3 attempts, using Replicate URL as fallback');
      }
    }
  }

  const videoResult = {
    videoUrl: publicUrl,
    provider: `replicate-${provider}`,
    video_id: fileName,
    duration: settings.duration || 0,
    quality: settings.quality || '4K',
    metadata: {
      replicateUrl: replicateVideoUrl,
      model: provider,
      videoSize,
      contentType,
      storageSuccess: uploadSuccess,
      storagePath: uploadSuccess ? filePath : null,
      storageError: storageError,
      fallbackUrl: !uploadSuccess ? replicateVideoUrl : null,
      settings: {
        ratio: settings.ratio,
        fps: settings.fps,
        style: settings.style,
        background: settings.background,
        quality: settings.quality
      }
    }
  };

  return videoResult;
}

// Utility function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
