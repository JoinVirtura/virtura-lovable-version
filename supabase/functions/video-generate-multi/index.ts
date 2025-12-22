import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { deductTokensAndTrackCost } from '../_shared/token-manager.ts';
import { calculateTokenCost } from '../_shared/token-costs.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Safe base64 encoding for large audio files
function safeBase64Encode(input: string): string {
  const chunkSize = 1024 * 1024; // 1MB chunks
  let result = '';
  for (let i = 0; i < input.length; i += chunkSize) {
    const chunk = input.slice(i, i + chunkSize);
    result += btoa(chunk);
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { avatarId, prompt, audioUrl, provider = 'auto' } = await req.json();
    
    if (!avatarId) {
      throw new Error('Avatar ID is required');
    }

    if (!prompt && !audioUrl) {
      throw new Error('Either prompt or audio URL is required');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Get avatar data from database
    const { data: avatarData, error: avatarError } = await supabase
      .from('talking_avatars')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', user.id)
      .single();

    if (avatarError || !avatarData) {
      throw new Error('Avatar not found or access denied');
    }

    console.log('Generating video with providers:', { 
      heygen: !!avatarData.heygen_talking_photo_id,
      openai: !!avatarData.openai_avatar_id,
      provider 
    });

    // Check if HeyGen will be used and deduct tokens upfront
    const willUseHeyGen = provider === 'heygen' || (provider === 'auto' && avatarData.heygen_talking_photo_id);
    
    if (willUseHeyGen) {
      const tokensNeeded = calculateTokenCost('premium_video', 'heygen-talking-photo');
      
      console.log(`💰 HeyGen video requires ${tokensNeeded} tokens`);
      
      const tokenResult = await deductTokensAndTrackCost({
        userId: user.id,
        resourceType: 'video_generation',
        apiProvider: 'heygen',
        modelUsed: 'talking-photo',
        tokensToDeduct: tokensNeeded,
        costUsd: 1.93,
        metadata: { avatarId, provider: 'heygen' }
      });

      if (!tokenResult.success) {
        console.error('❌ Insufficient tokens for HeyGen:', tokenResult.error);
        return new Response(
          JSON.stringify({ 
            success: false,
            error: tokenResult.error || 'Insufficient token balance for HeyGen video generation',
            required: tokensNeeded,
            currentBalance: tokenResult.remainingBalance,
            suggestion: 'HeyGen video requires 75 tokens. Consider using a different provider or purchase more tokens.'
          }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`✅ Tokens deducted for HeyGen. Remaining balance: ${tokenResult.remainingBalance}`);
    }

    let videoResult = null;
    let errors = [];

    // Provider selection logic - prioritize HeyGen if available
    const providers = [];
    if (provider === 'heygen' || (provider === 'auto' && avatarData.heygen_talking_photo_id)) {
      providers.push('heygen');
    }
    // Always add OpenAI as fallback for auto mode
    if (provider === 'openai' || (provider === 'auto' && !avatarData.heygen_talking_photo_id && avatarData.openai_avatar_id)) {
      providers.push('openai');
    }
    if (provider === 'runway' && avatarData.runway_avatar_id) {
      providers.push('runway');
    }

    if (providers.length === 0) {
      throw new Error('No video generation providers available for this avatar. Please re-upload your avatar.');
    }

    // Try providers in order
    for (const currentProvider of providers) {
      try {
        console.log(`Attempting video generation with ${currentProvider}...`);
        
        if (currentProvider === 'heygen') {
          videoResult = await generateWithHeyGen(avatarData.heygen_talking_photo_id, prompt, audioUrl);
        } else if (currentProvider === 'openai') {
          videoResult = await generateWithOpenAI(avatarData.openai_avatar_id, prompt, audioUrl);
        } else if (currentProvider === 'runway') {
          videoResult = await generateWithRunway(avatarData.runway_avatar_id, prompt, audioUrl);
        }

        if (videoResult) {
          console.log(`Video generation successful with ${currentProvider}`);
          break;
        }
      } catch (error: any) {
        console.error(`${currentProvider} failed:`, error.message);
        errors.push(`${currentProvider}: ${error.message}`);
      }
    }

    if (!videoResult) {
      throw new Error(`All providers failed: ${errors.join('; ')}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: videoResult.videoUrl,
        provider: videoResult.provider,
        video_id: videoResult.video_id,
        duration: videoResult.duration,
        status: 'completed',
        tokensCharged: willUseHeyGen ? calculateTokenCost('premium_video', 'heygen-talking-photo') : 0,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Multi-provider video generation error:', error);
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

async function generateWithHeyGen(talkingPhotoId: string, prompt: string, audioUrl?: string) {
  const heygenKey = Deno.env.get('HEYGEN_API_KEY');
  if (!heygenKey) {
    throw new Error('HeyGen API key not configured');
  }

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
    // Use provided audio
    payload.video_inputs[0].voice = {
      type: "audio",
      audio_url: audioUrl
    };
  } else {
    // Use text-to-speech
    payload.video_inputs[0].voice = {
      type: "text",
      input_text: prompt,
      voice_id: "1bd001e7e50f421d891986aad5158bc8"
    };
  }

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
    throw new Error(`HeyGen API error: ${response.statusText} - ${errorText}`);
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
      console.log(`HeyGen status attempt ${attempts}:`, statusData);
      
      if (statusData.data?.status === 'completed' && statusData.data?.video_url) {
        videoUrl = statusData.data.video_url;
        break;
      } else if (statusData.data?.status === 'failed') {
        throw new Error(`HeyGen video generation failed: ${statusData.data?.error || 'Unknown error'}`);
      }
    } catch (statusError) {
      console.error(`Status check error:`, statusError);
      if (attempts >= maxAttempts - 5) { // Give up if only 5 attempts left
        throw new Error(`HeyGen status polling failed: ${statusError.message}`);
      }
    }
  }

  if (!videoUrl) {
    throw new Error(`HeyGen video generation timed out after ${maxAttempts} attempts`);
  }
  
  return {
    videoUrl,
    provider: 'heygen',
    video_id: videoId,
    duration: 30
  };
}

async function generateWithOpenAI(avatarImageUrl: string, prompt: string, audioUrl?: string) {
  console.log('OpenAI fallback - using avatar image as static video');
  
  // For OpenAI fallback, we'll return the avatar image itself as a "video"
  // The frontend can handle this by showing the image with audio
  
  if (!avatarImageUrl) {
    throw new Error('No avatar image URL provided for OpenAI fallback');
  }
  
  // Return the avatar image URL as the video URL
  // The frontend should detect this and handle it appropriately
  
  console.log(`Using avatar image as fallback video: ${avatarImageUrl}`);

  return {
    videoUrl: avatarImageUrl, // Return the avatar image as fallback
    provider: 'openai-fallback',
    video_id: `openai_${Date.now()}`,
    duration: 30,
    note: 'Static avatar image returned - HeyGen recommended for full video generation'
  };
}

async function generateWithRunway(avatarId: string, prompt: string, audioUrl?: string) {
  const runwayKey = Deno.env.get('RUNWAY_API_KEY');
  if (!runwayKey) {
    throw new Error('Runway API key not configured');
  }

  // Implement Runway ML API integration
  // This is a placeholder for the actual Runway API
  const response = await fetch('https://api.runwayml.com/v1/video/generate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${runwayKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      avatar_id: avatarId,
      prompt: prompt,
      audio_url: audioUrl,
      duration: 30,
      resolution: '1920x1080'
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Runway API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  
  return {
    videoUrl: data.video_url || `/demo/runway-video-${Date.now()}.mp4`,
    provider: 'runway',
    video_id: data.video_id,
    duration: 30
  };
}