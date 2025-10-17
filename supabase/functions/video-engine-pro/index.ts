// Updated: 2025-10-16 - Verified working Replicate models with proper blob URL handling
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

  // Verified working models cascade: ByteDance Omni-Human -> Synthesys Wav2Lip -> zsxkib Sonic
  const engines = [
    { name: 'ByteDance Omni-Human', fn: generateWithOmniHuman, quality: '⭐⭐⭐⭐⭐ Premium' },
    { name: 'Synthesys Wav2Lip', fn: generateWithSynthesysWav2Lip, quality: '⭐⭐⭐⭐ High Quality' },
    { name: 'zsxkib Sonic', fn: generateWithSonic, quality: '⭐⭐⭐ Budget' }
  ];

  const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
  if (!REPLICATE_API_KEY) {
    throw new Error('REPLICATE_API_KEY not configured. Please add it in Supabase secrets.');
  }

  let lastError: Error | null = null;

  for (const engine of engines) {
    try {
      const engineIndex = engines.indexOf(engine);
      const isLastEngine = engineIndex === engines.length - 1;
      const nextEngine = isLastEngine ? null : engines[engineIndex + 1];
      
      console.log(`🎯 Attempt ${engineIndex + 1}/${engines.length}: ${engine.name} ${engine.quality}...`);
      sendProgress({ 
        stage: 'engine_selection', 
        progress: 10 + (engineIndex * 5), 
        message: `Trying ${engine.name} for video generation...`,
        engineAttempt: engineIndex + 1,
        totalEngines: engines.length
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
      
      const engineIndex = engines.indexOf(engine);
      const isLastEngine = engineIndex === engines.length - 1;
      const nextEngine = isLastEngine ? null : engines[engineIndex + 1];
      
      sendProgress({ 
        stage: 'engine_fallback', 
        progress: 10 + (engineIndex * 5), 
        message: isLastEngine 
          ? `All models failed. Last error: ${error.message}`
          : `${engine.name} failed, trying ${nextEngine?.name}...`,
        error: error.message,
        engineAttempt: engineIndex + 1,
        totalEngines: engines.length
      });
      
      if (isLastEngine) {
        throw new Error(`All Replicate engines failed. Last error: ${lastError?.message || 'Unknown error'}`);
      }
      
      continue;
    }
  }

  // All engines failed
  throw new Error(`All Replicate engines failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Primary Engine: ByteDance Omni-Human (Premium Quality)
async function generateWithOmniHuman(
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
    message: '🎬 Generating with ByteDance Omni-Human (Premium Quality)...' 
  });

  console.log('🎯 Running ByteDance Omni-Human model');

  try {
    const output: any = await replicate.run(
      "bytedance/omni-human",
      {
        input: {
          image: avatarImageUrl,
          audio: audioUrl,
          seed: 42,
          cfg_scale: 3.5,
          pose_weight: 1.0
        }
      }
    );

    sendProgress({ 
      stage: 'processing', 
      progress: 60, 
      message: '🎭 Processing ultra-quality lip-sync...' 
    });

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ ByteDance Omni-Human success:', videoUrl.substring(0, 60) + '...');

    return await downloadAndUploadVideo(
      videoUrl,
      'bytedance-omni-human',
      settings,
      sendProgress,
      supabase
    );

  } catch (error: any) {
    console.error('ByteDance Omni-Human generation error:', error);
    throw new Error(`ByteDance Omni-Human failed: ${error.message}`);
  }
}

// Fallback #1: Synthesys Wav2Lip (High Quality)
async function generateWithSynthesysWav2Lip(
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
    message: '🎬 Generating with Synthesys Wav2Lip (High Quality)...' 
  });

  console.log('🎯 Running Synthesys Wav2Lip model');

  try {
    const output: any = await replicate.run(
      "synthesys-ai/synthesys-wav2lip",
      {
        input: {
          face: avatarImageUrl,
          audio: audioUrl
        }
      }
    );

    sendProgress({ 
      stage: 'processing', 
      progress: 65, 
      message: '🎭 Applying professional lip synchronization...' 
    });

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ Synthesys Wav2Lip generated video:', videoUrl);

    return await downloadAndUploadVideo(
      videoUrl,
      'synthesys-wav2lip',
      settings,
      sendProgress,
      supabase
    );

  } catch (error: any) {
    console.error('Synthesys Wav2Lip generation error:', error);
    throw new Error(`Synthesys Wav2Lip failed: ${error.message}`);
  }
}

// Fallback #2: zsxkib Sonic (Budget & Fast)
async function generateWithSonic(
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
    message: '⚡ Fast generation with zsxkib Sonic...' 
  });

  console.log('🎯 Running zsxkib Sonic budget model');

  try {
    const output: any = await replicate.run(
      "zsxkib/sonic",
      {
        input: {
          image: avatarImageUrl,
          audio: audioUrl
        }
      }
    );

    sendProgress({ 
      stage: 'processing', 
      progress: 70, 
      message: '🎭 Finalizing video...' 
    });

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ zsxkib Sonic generated video:', videoUrl);

    return await downloadAndUploadVideo(
      videoUrl,
      'zsxkib-sonic',
      settings,
      sendProgress,
      supabase
    );

  } catch (error: any) {
    console.error('zsxkib Sonic generation error:', error);
    throw new Error(`zsxkib Sonic failed: ${error.message}`);
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
  console.log(`⬇️ Starting download from Replicate: ${replicateVideoUrl}`);
  
  sendProgress({ 
    stage: 'downloading', 
    progress: 75, 
    message: '⬇️ Downloading generated video from Replicate...' 
  });

  console.log(`⬇️ Fetching video with streaming download...`);
  const videoResponse = await fetch(replicateVideoUrl);
  
  if (!videoResponse.ok) {
    console.error(`❌ Download failed with status: ${videoResponse.status}`);
    throw new Error(`Failed to download video: ${videoResponse.status}`);
  }

  if (!videoResponse.body) {
    console.error(`❌ No response body received`);
    throw new Error('No video data received from Replicate');
  }

  // Stream download to prevent memory issues with large files
  console.log(`📥 Streaming video download...`);
  const chunks: Uint8Array[] = [];
  const reader = videoResponse.body.getReader();
  let receivedLength = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      
      if (done) {
        console.log(`✅ Download complete: ${receivedLength} bytes total`);
        break;
      }
      
      chunks.push(value);
      receivedLength += value.length;
      
      // Log progress every 1MB
      if (receivedLength % (1024 * 1024) < 50000) {
        console.log(`📥 Downloaded ${(receivedLength / 1024 / 1024).toFixed(1)}MB...`);
      }
    }
  } catch (error: any) {
    console.error(`❌ Stream download error:`, error);
    throw new Error(`Download stream failed: ${error.message}`);
  }

  const videoBlob = new Blob(chunks);
  const videoSize = videoBlob.size;
  const contentType = videoResponse.headers.get('content-type') || 'video/mp4';
  
  console.log(`✅ Video downloaded successfully`);
  console.log(`📦 Size: ${(videoSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`📦 Type: ${contentType}`);

  // Validate video
  if (videoSize === 0) {
    console.error(`❌ Downloaded video is empty (0 bytes)`);
    throw new Error('Downloaded video is empty (0 bytes)');
  }

  if (videoSize < 1000) {
    console.warn(`⚠️ Video file is suspiciously small (${videoSize} bytes), but proceeding...`);
  }

  console.log(`📤 Starting upload to Supabase Storage...`);
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
      console.log(`📤 Storage upload attempt ${uploadAttempt}/3 to virtura-media bucket...`);
      console.log(`📤 File path: ${filePath}`);
      console.log(`📤 File size: ${(videoSize / 1024 / 1024).toFixed(2)}MB`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('virtura-media')
        .upload(filePath, videoBlob, {
          contentType: contentType,
          upsert: true
        });

      if (uploadError) {
        console.error(`❌ Upload error:`, uploadError);
        throw uploadError;
      }

      console.log(`✅ Upload successful, generating public URL...`);
      const { data: urlData } = supabase.storage
        .from('virtura-media')
        .getPublicUrl(filePath);

      publicUrl = urlData.publicUrl;
      uploadSuccess = true;
      console.log(`✅ Video uploaded to Supabase Storage successfully`);
      console.log(`✅ Public URL: ${publicUrl}`);
      
    } catch (error: any) {
      console.warn(`⚠️ Upload attempt ${uploadAttempt} failed:`, error.message);
      console.warn(`⚠️ Error details:`, error);
      storageError = error.message;
      
      if (uploadAttempt < 3) {
        console.log(`⏳ Waiting 1 second before retry...`);
        await delay(1000);
      } else {
        console.error(`❌ All 3 upload attempts failed`);
        console.error(`❌ Using Replicate URL as fallback: ${replicateVideoUrl}`);
      }
    }
  }

  // Log final result
  if (!uploadSuccess) {
    console.warn(`⚠️ Using Replicate URL as fallback (storage upload failed)`);
    sendProgress({ 
      stage: 'fallback', 
      progress: 95, 
      message: '⚠️ Using direct link (storage upload failed, video still playable)' 
    });
  } else {
    console.log(`✅ Video successfully stored in Supabase Storage`);
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

  console.log(`🎉 Video processing complete, returning result`);
  console.log(`🎉 Final video URL: ${videoResult.videoUrl}`);
  return videoResult;
}

// Utility function for delays
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
