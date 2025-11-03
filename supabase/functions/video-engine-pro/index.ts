// Updated: 2025-10-26 - Fixed sendProgress issue, forcing fresh deployment
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

  // Health check endpoint (no auth required)
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
    
    // Input validation
    if (!avatarImageUrl || typeof avatarImageUrl !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Valid avatarImageUrl is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (prompt && typeof prompt === 'string' && prompt.length > 5000) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long (max 5000 characters)' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URLs are HTTPS
    try {
      const avatarUrl = new URL(avatarImageUrl);
      if (avatarUrl.protocol !== 'https:') {
        throw new Error('Avatar URL must use HTTPS');
      }
      if (audioUrl) {
        const audioUrlObj = new URL(audioUrl);
        if (audioUrlObj.protocol !== 'https:') {
          throw new Error('Audio URL must use HTTPS');
        }
      }
    } catch (urlError) {
      return new Response(
        JSON.stringify({ error: `Invalid URL: ${urlError.message}` }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log('🎬 Video Engine Pro: Starting Replicate generation...');
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

    // Generate video synchronously and return JSON
    const videoResult = await generateRealVideo(
      avatarImageUrl, 
      audioUrl, 
      prompt, 
      videoSettings
    );

    return new Response(JSON.stringify({
      success: true,
      videoUrl: videoResult.videoUrl,
      provider: videoResult.provider,
      video_id: videoResult.video_id,
      duration: videoResult.duration,
      quality: videoResult.quality,
      metadata: videoResult.metadata
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json'
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
  audioUrl: string | null,
  prompt: string,
  settings: any
) {
  console.log('🚀 Starting Replicate Video Generation with Cascade...');
  console.log(`🎵 Audio URL: ${audioUrl ? 'Present (Lip-sync mode)' : 'Skipped (Motion mode)'}`);
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Select engine cascade based on whether audio exists
  const engines = audioUrl 
    ? [
        // Lip-sync models (require audio)
        { name: 'ByteDance Omni-Human', fn: generateWithOmniHuman, quality: '⭐⭐⭐⭐⭐ Premium Lip-sync' },
        { name: 'Synthesys Wav2Lip', fn: generateWithSynthesysWav2Lip, quality: '⭐⭐⭐⭐ High Quality Lip-sync' }
      ]
    : [
        // Motion models (no audio needed)
        { name: 'Kling AI Motion', fn: generateWithKlingMotion, quality: '⭐⭐⭐⭐⭐ Premium Motion' },
        { name: 'Stable Video Diffusion', fn: generateWithStableVideo, quality: '⭐⭐⭐ Basic Motion' }
      ];

  console.log(`🎯 Selected ${engines.length} engines for ${audioUrl ? 'LIP-SYNC' : 'MOTION'} mode`);

  const REPLICATE_API_KEY = Deno.env.get('REPLICATE_API_KEY');
  if (!REPLICATE_API_KEY) {
    throw new Error('REPLICATE_API_KEY not configured. Please add it in Supabase secrets.');
  }

  let lastError: Error | null = null;

  for (const engine of engines) {
    try {
      const engineIndex = engines.indexOf(engine);
      const isLastEngine = engineIndex === engines.length - 1;
      
      console.log(`🎯 Attempt ${engineIndex + 1}/${engines.length}: ${engine.name} ${engine.quality}...`);

      const result = await engine.fn(
        avatarImageUrl, 
        audioUrl, 
        prompt,
        settings, 
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
      
      if (isLastEngine) {
        throw new Error(`All Replicate engines failed. Last error: ${lastError?.message || 'Unknown error'}`);
      }
      
      console.log(`⚠️ ${engine.name} failed, trying next model...`);
      continue;
    }
  }

  // All engines failed
  throw new Error(`All Replicate engines failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Primary Engine: ByteDance Omni-Human (Premium Quality)
async function generateWithOmniHuman(
  avatarImageUrl: string,
  audioUrl: string | null,
  prompt: string,
  settings: any,
  supabase: any,
  replicateApiKey: string
) {
  const replicate = new Replicate({ auth: replicateApiKey });

  console.log('🎯 Running ByteDance Omni-Human model');

  try {
    const output: any = await replicate.run(
      "bytedance/omni-human",
      {
        input: {
          image: avatarImageUrl,
          audio: audioUrl
        }
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ ByteDance Omni-Human success:', videoUrl.substring(0, 60) + '...');

    return await downloadAndUploadVideo(
      videoUrl,
      'bytedance-omni-human',
      settings,
      supabase
    );

  } catch (error: any) {
    console.error('ByteDance Omni-Human generation error:', error);
    throw new Error(`ByteDance Omni-Human failed: ${error.message}`);
  }
}

// Fallback: Synthesys Wav2Lip (High Quality)
async function generateWithSynthesysWav2Lip(
  avatarImageUrl: string,
  audioUrl: string | null,
  prompt: string,
  settings: any,
  supabase: any,
  replicateApiKey: string
) {
  const replicate = new Replicate({ auth: replicateApiKey });

  console.log('🎯 Running Synthesys Wav2Lip model');

  try {
    const output: any = await replicate.run(
      "synthesys-ai/synthesys-wav2lip",
      {
        input: {
          face: avatarImageUrl,
          audio: audioUrl,
          smooth: true
        }
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ Synthesys Wav2Lip generated video:', videoUrl);

    return await downloadAndUploadVideo(
      videoUrl,
      'synthesys-wav2lip',
      settings,
      supabase
    );

  } catch (error: any) {
    console.error('Synthesys Wav2Lip generation error:', error);
    throw new Error(`Synthesys Wav2Lip failed: ${error.message}`);
  }
}

// Motion Engine 1: Kling AI (Premium text-prompted motion)
async function generateWithKlingMotion(
  avatarImageUrl: string,
  audioUrl: string | null,
  prompt: string,
  settings: any,
  supabase: any,
  replicateApiKey: string
) {
  const replicate = new Replicate({ auth: replicateApiKey });

  console.log('🎯 Running Kling AI Motion model');
  console.log('📝 Motion prompt:', prompt);

  try {
    const output: any = await replicate.run(
      "minimax/video-01",
      {
        input: {
          image: avatarImageUrl,
          prompt: prompt || "person with natural subtle movements, professional demeanor",
          duration: Math.min(settings.duration || 5, 10)
        }
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ Kling AI Motion generated video:', videoUrl);

    return await downloadAndUploadVideo(
      videoUrl,
      'kling-motion',
      settings,
      supabase
    );

  } catch (error: any) {
    console.error('Kling AI Motion error:', error);
    throw new Error(`Kling AI Motion failed: ${error.message}`);
  }
}

// Motion Engine 2: Stable Video Diffusion (Fallback for basic motion)
async function generateWithStableVideo(
  avatarImageUrl: string,
  audioUrl: string | null,
  prompt: string,
  settings: any,
  supabase: any,
  replicateApiKey: string
) {
  const replicate = new Replicate({ auth: replicateApiKey });

  console.log('🎯 Running Stable Video Diffusion model');

  try {
    const output: any = await replicate.run(
      "stability-ai/stable-video-diffusion",
      {
        input: {
          image: avatarImageUrl,
          motion_bucket_id: 127,
          frames_per_second: settings.fps || 24,
          num_frames: Math.min((settings.duration || 3) * (settings.fps || 24), 72)
        }
      }
    );

    const videoUrl = Array.isArray(output) ? output[0] : output;
    console.log('✅ Stable Video Diffusion generated video:', videoUrl);

    return await downloadAndUploadVideo(
      videoUrl,
      'stable-video',
      settings,
      supabase
    );

  } catch (error: any) {
    console.error('Stable Video Diffusion error:', error);
    throw new Error(`Stable Video Diffusion failed: ${error.message}`);
  }
}

// Helper function to download video from Replicate and upload to Supabase
async function downloadAndUploadVideo(
  replicateVideoUrl: string,
  provider: string,
  settings: any,
  supabase: any
) {
  console.log(`⬇️ Starting download from Replicate: ${replicateVideoUrl}`);

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

  // Pre-flight check: Verify storage bucket access
  try {
    console.log(`🔍 Verifying virtura-media bucket access...`);
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error(`❌ Storage authentication failed:`, bucketError);
      throw new Error(`Storage authentication failed: ${bucketError.message}`);
    }
    
    const bucket = buckets?.find(b => b.name === 'virtura-media');
    if (!bucket) {
      console.error(`❌ virtura-media bucket not found`);
      throw new Error('Storage bucket not found. Please check Supabase configuration.');
    }
    
    console.log(`✅ Storage bucket verified: ${bucket.name} (public: ${bucket.public})`);
  } catch (error: any) {
    console.error(`❌ Storage pre-flight check failed:`, error);
    throw new Error(`Storage access denied: ${error.message}`);
  }

  // Upload to Supabase with retry logic and extended timeout
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
      console.log(`📤 Content type: ${contentType}`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('virtura-media')
        .upload(filePath, videoBlob, {
          contentType: contentType,
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error(`❌ Upload error details:`, {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          error: uploadError.error,
          filePath,
          fileSize: videoSize
        });
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
      console.log(`✅ Storage path: ${filePath}`);
      
    } catch (error: any) {
      console.warn(`⚠️ Upload attempt ${uploadAttempt} failed:`, error.message);
      console.warn(`⚠️ Full error:`, JSON.stringify(error, null, 2));
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
