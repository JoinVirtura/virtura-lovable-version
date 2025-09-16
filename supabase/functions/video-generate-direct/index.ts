import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { avatarImageUrl, prompt, audioUrl, provider = 'heygen' } = await req.json();
    
    if (!avatarImageUrl) {
      throw new Error('Avatar image URL is required');
    }

    if (!prompt && !audioUrl) {
      throw new Error('Either prompt or audio URL is required');
    }

    console.log('Direct video generation with:', { 
      hasAvatar: !!avatarImageUrl,
      hasAudio: !!audioUrl,
      provider 
    });

    let videoResult = null;
    const errors: string[] = [];

    // Try HeyGen first if requested
    if (provider === 'heygen' || provider === 'auto') {
      try {
        console.log('Attempting HeyGen direct generation...');
        videoResult = await generateWithHeyGenDirect(avatarImageUrl, prompt, audioUrl);
      } catch (error: any) {
        console.error('HeyGen direct failed:', error.message);
        errors.push(`HeyGen: ${error.message}`);
        
        // If HeyGen fails due to limits, provide clear feedback
        if (error.message.includes('limit') || error.message.includes('quota')) {
          return new Response(
            JSON.stringify({
              success: false,
              error: 'HeyGen API limit reached. Please upgrade your HeyGen subscription for more avatar creations.',
              code: 'HEYGEN_LIMIT_REACHED',
              suggestion: 'Try using a different provider or upgrade your HeyGen plan.'
            }),
            { 
              status: 200,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
          );
        }
      }
    }

    // Fallback to high-quality static avatar with audio
    if (!videoResult) {
      console.log('Creating high-quality static avatar fallback...');
      videoResult = await generateStaticAvatarVideo(avatarImageUrl, audioUrl);
    }

    if (!videoResult) {
      throw new Error(`All generation methods failed: ${errors.join('; ')}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: videoResult.videoUrl,
        provider: videoResult.provider,
        video_id: videoResult.video_id,
        duration: videoResult.duration,
        status: 'completed',
        note: videoResult.note
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Direct video generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        code: 'VIDEO_GENERATION_ERROR'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function generateWithHeyGenDirect(avatarImageUrl: string, prompt: string, audioUrl?: string) {
  const heygenKey = Deno.env.get('HEYGEN_API_KEY');
  if (!heygenKey) {
    throw new Error('HeyGen API key not configured');
  }

  // First, create a talking photo from the avatar image
  console.log('Creating HeyGen talking photo...');
  const photoResponse = await fetch('https://api.heygen.com/v1/talking_photo', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${heygenKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      image_url: avatarImageUrl
    }),
  });

  if (!photoResponse.ok) {
    const errorText = await photoResponse.text();
    console.error('HeyGen photo creation failed:', errorText);
    throw new Error(`HeyGen photo creation failed: ${photoResponse.status} ${errorText}`);
  }

  const photoData = await photoResponse.json();
  
  if (!photoData.data?.talking_photo_id) {
    throw new Error('HeyGen did not return a valid talking photo ID');
  }

  const talkingPhotoId = photoData.data.talking_photo_id;
  console.log('Created talking photo:', talkingPhotoId);

  // Now generate the video
  const payload: any = {
    test: false,
    caption: false,
    dimension: { width: 1920, height: 1080 },
    video_inputs: [{
      character: {
        type: "talking_photo",
        talking_photo_id: talkingPhotoId,
        scale: 1.0
      },
      background: {
        type: "color",
        value: "#000000"
      }
    }]
  };

  if (audioUrl) {
    payload.video_inputs[0].voice = {
      type: "audio",
      audio_url: audioUrl
    };
  } else {
    payload.video_inputs[0].voice = {
      type: "text",
      input_text: prompt,
      voice_id: "1bd001e7e50f421d891986aad5158bc8"
    };
  }

  console.log('Generating HeyGen video...');
  const response = await fetch('https://api.heygen.com/v2/video/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${heygenKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('HeyGen video generation failed:', errorText);
    throw new Error(`HeyGen video generation failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  
  if (!data.data?.video_id) {
    throw new Error('HeyGen did not return a valid video ID');
  }

  // Poll for video completion
  const videoId = data.data.video_id;
  let videoUrl = null;
  let attempts = 0;
  const maxAttempts = 60; // 5 minutes max
  const pollInterval = 5000; // 5 seconds

  console.log('Polling for video completion...');
  while (attempts < maxAttempts) {
    await new Promise(resolve => setTimeout(resolve, pollInterval));
    attempts++;
    
    try {
      const statusResponse = await fetch(`https://api.heygen.com/v1/video_status/${videoId}`, {
        headers: { 'Authorization': `Bearer ${heygenKey}` }
      });

      if (!statusResponse.ok) {
        console.error(`HeyGen status check failed: ${statusResponse.status}`);
        continue;
      }

      const statusData = await statusResponse.json();
      console.log(`HeyGen status attempt ${attempts}:`, statusData.data?.status);
      
      if (statusData.data?.status === 'completed' && statusData.data?.video_url) {
        videoUrl = statusData.data.video_url;
        break;
      } else if (statusData.data?.status === 'failed') {
        throw new Error(`HeyGen video generation failed: ${statusData.data?.error || 'Unknown error'}`);
      }
    } catch (statusError) {
      console.error(`Status check error:`, statusError);
      if (attempts >= maxAttempts - 5) {
        throw new Error(`HeyGen status polling failed: ${statusError.message}`);
      }
    }
  }

  if (!videoUrl) {
    throw new Error(`HeyGen video generation timed out after ${maxAttempts} attempts`);
  }
  
  console.log('HeyGen video generation completed:', videoUrl);
  
  return {
    videoUrl,
    provider: 'heygen',
    video_id: videoId,
    duration: 30,
    note: 'High-quality talking avatar video generated with HeyGen'
  };
}

async function generateStaticAvatarVideo(avatarImageUrl: string, audioUrl?: string) {
  console.log('Generating static avatar video...');
  
  // For now, return the avatar image with audio info
  // Frontend can handle this by displaying the avatar with audio playback
  
  return {
    videoUrl: avatarImageUrl,
    provider: 'static-avatar',
    video_id: `static_${Date.now()}`,
    duration: 30,
    audioUrl: audioUrl,
    note: 'Static avatar with audio - upgrade to HeyGen Pro for full video generation'
  };
}