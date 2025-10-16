import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { avatarImageUrl, audioUrl, prompt, settings = {} } = await req.json();
    
    console.log('🎬 Video Engine Pro: Starting REAL generation...');
    console.log('Avatar URL:', avatarImageUrl);
    console.log('Audio URL:', audioUrl);
    console.log('Settings:', settings);
    
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

    console.log('🎯 Processing with settings:', videoSettings);

    // Generate REAL video (no more mock outputs)
    const videoResult = await generateRealVideo(
      avatarImageUrl, 
      audioUrl, 
      prompt, 
      videoSettings
    );

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: videoResult.videoUrl,
        provider: videoResult.provider || 'virtura-pro',
        video_id: videoResult.video_id,
        duration: videoResult.duration,
        quality: videoResult.quality,
        status: 'completed',
        metadata: videoResult.metadata
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

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

// Import Supabase for video storage
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

// REAL video generation function with HeyGen integration
async function generateRealVideo(avatarImageUrl: string, audioUrl: string, prompt: string, settings: any) {
  console.log('🚀 Starting REAL Video Generation with HeyGen...');
  console.log('Avatar Image URL:', avatarImageUrl);
  console.log('Audio URL:', audioUrl);
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
  
  try {
    if (!avatarImageUrl || !audioUrl) {
      throw new Error('Avatar image and audio URL are required for video generation');
    }
    
    const heyGenApiKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heyGenApiKey) {
      throw new Error('HEYGEN_API_KEY is not configured. Please add it in Supabase secrets.');
    }

    console.log('📤 Step 1: Uploading avatar to HeyGen...');
    
    // Step 1: Upload avatar image to HeyGen
    const imageResponse = await fetch(avatarImageUrl);
    const imageBlob = await imageResponse.blob();
    
    const uploadFormData = new FormData();
    uploadFormData.append('file', imageBlob, 'avatar.jpg');
    
    const uploadResponse = await fetch('https://api.heygen.com/v2/avatars/talking_photo', {
      method: 'POST',
      headers: {
        'X-API-Key': heyGenApiKey
      },
      body: uploadFormData
    });
    
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('HeyGen upload failed:', errorText);
      throw new Error(`HeyGen avatar upload failed: ${uploadResponse.status} ${errorText}`);
    }
    
    const uploadData = await uploadResponse.json();
    const avatarId = uploadData.data?.avatar_id;
    
    if (!avatarId) {
      throw new Error('No avatar ID received from HeyGen');
    }
    
    console.log('✅ Avatar uploaded to HeyGen:', avatarId);
    console.log('🎬 Step 2: Creating talking photo video...');

    // Step 2: Create video with talking photo
    const videoPayload = {
      video_inputs: [{
        character: {
          type: 'talking_photo',
          talking_photo_id: avatarId,
          talking_style: settings.talkingStyle || 'stable'
        },
        voice: {
          type: 'audio',
          audio_url: audioUrl
        },
        background: {
          type: settings.background === 'transparent' ? 'transparent' : 'color',
          value: settings.backgroundValue || '#000000'
        }
      }],
      dimension: {
        width: settings.ratio === '9:16' ? 1080 : settings.ratio === '1:1' ? 1080 : 1920,
        height: settings.ratio === '9:16' ? 1920 : settings.ratio === '1:1' ? 1080 : 1080
      },
      aspect_ratio: settings.ratio || '16:9',
      test: false
    };

    const videoResponse = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'X-API-Key': heyGenApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(videoPayload)
    });

    if (!videoResponse.ok) {
      const errorText = await videoResponse.text();
      console.error('HeyGen video generation failed:', errorText);
      throw new Error(`HeyGen video generation failed: ${videoResponse.status} ${errorText}`);
    }

    const videoData = await videoResponse.json();
    const videoId = videoData.data?.video_id;
    
    if (!videoId) {
      throw new Error('No video ID received from HeyGen');
    }

    console.log('🎥 Video generation started:', videoId);
    console.log('⏳ Step 3: Polling for video completion...');

    // Step 3: Poll for video completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    let videoUrl = null;

    while (attempts < maxAttempts) {
      await delay(5000); // Wait 5 seconds between polls
      
      const statusResponse = await fetch(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
        headers: {
          'X-API-Key': heyGenApiKey
        }
      });

      if (!statusResponse.ok) {
        console.error('Status check failed:', await statusResponse.text());
        attempts++;
        continue;
      }

      const statusData = await statusResponse.json();
      const status = statusData.data?.status;
      
      console.log(`📊 Video status (attempt ${attempts + 1}/${maxAttempts}):`, status);

      if (status === 'completed') {
        videoUrl = statusData.data?.video_url;
        console.log('✅ Video generation completed!');
        break;
      } else if (status === 'failed') {
        throw new Error('HeyGen video generation failed');
      }

      attempts++;
    }

    if (!videoUrl) {
      throw new Error('Video generation timed out after 5 minutes');
    }

    console.log('💾 Step 4: Downloading and storing video...');

    // Step 4: Download video and validate
    const videoDownloadResponse = await fetch(videoUrl);
    
    if (!videoDownloadResponse.ok) {
      throw new Error(`Failed to download video: ${videoDownloadResponse.status}`);
    }

    const videoBlob = await videoDownloadResponse.blob();
    const videoSize = videoBlob.size;
    const contentType = videoDownloadResponse.headers.get('content-type') || 'video/mp4';
    
    // Validate video
    console.log('📊 Video validation:');
    console.log('  - Size:', Math.round(videoSize / 1024 / 1024), 'MB');
    console.log('  - Content-Type:', contentType);
    
    if (videoSize === 0) {
      throw new Error('Downloaded video is empty (0 bytes)');
    }
    
    if (videoSize < 1000) {
      throw new Error('Downloaded video is too small (likely corrupt)');
    }
    
    if (!contentType.includes('video')) {
      console.warn('⚠️ Unexpected content type:', contentType);
    }
    
    const videoArrayBuffer = await videoBlob.arrayBuffer();
    const videoBuffer = new Uint8Array(videoArrayBuffer);

    const fileName = `${Date.now()}-${videoId}.mp4`;
    const storagePath = `videos/${fileName}`;

    console.log('📤 Uploading to Supabase Storage:', storagePath);

    // Attempt upload with retry logic
    let uploadAttempt = 0;
    let uploadSuccess = false;
    let uploadData2;
    let uploadError;

    while (uploadAttempt < 3 && !uploadSuccess) {
      uploadAttempt++;
      console.log(`  Upload attempt ${uploadAttempt}/3...`);
      
      const result = await supabase.storage
        .from('virtura-media')
        .upload(storagePath, videoBuffer, {
          contentType: 'video/mp4',
          cacheControl: '3600',
          upsert: false
        });
      
      uploadData2 = result.data;
      uploadError = result.error;
      
      if (!uploadError) {
        uploadSuccess = true;
        break;
      }
      
      console.error(`  Attempt ${uploadAttempt} failed:`, uploadError);
      
      if (uploadAttempt < 3) {
        await delay(2000); // Wait 2s before retry
      }
    }

    if (uploadError || !uploadSuccess) {
      console.error('❌ Storage upload failed after 3 attempts:', uploadError);
      console.log('⚠️ Falling back to HeyGen URL directly');
      return {
        videoUrl: videoUrl,
        video_id: videoId,
        duration: settings.duration || 30,
        quality: settings.quality || '4K',
        provider: 'heygen-direct',
        metadata: {
          engine: 'heygen',
          avatarIntegrated: true,
          audioIntegrated: true,
          resolution: settings.quality || '4K',
          ratio: settings.ratio || '16:9',
          storageError: uploadError?.message || 'Upload failed',
          videoSize: Math.round(videoSize / 1024 / 1024) + ' MB',
          fallbackUrl: videoUrl
        }
      };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('virtura-media')
      .getPublicUrl(storagePath);

    console.log('✅ Video stored successfully:', publicUrl);
    console.log('📊 Final video metadata:');
    console.log('  - Public URL:', publicUrl);
    console.log('  - Storage Path:', storagePath);
    console.log('  - Size:', Math.round(videoSize / 1024 / 1024), 'MB');

    return {
      videoUrl: publicUrl,
      video_id: videoId,
      duration: settings.duration || 30,
      quality: settings.quality || '4K',
      provider: 'virtura-supabase',
      metadata: {
        engine: 'heygen',
        avatarIntegrated: true,
        audioIntegrated: true,
        resolution: settings.quality || '4K',
        ratio: settings.ratio || '16:9',
        storagePath: storagePath,
        videoSize: Math.round(videoSize / 1024 / 1024) + ' MB',
        contentType: contentType,
        heygenUrl: videoUrl
      }
    };
    
  } catch (error: any) {
    console.error('❌ Video generation failed:', error.message);
    throw new Error(`Video generation failed: ${error.message}`);
  }
}


function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}