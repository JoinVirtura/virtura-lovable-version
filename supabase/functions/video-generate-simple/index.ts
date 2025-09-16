import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    console.log('=== VIDEO GENERATION FUNCTION START ===');
    
    const { avatarId, prompt, audioUrl } = await req.json();
    console.log('Request params:', { avatarId, prompt: !!prompt, audioUrl: !!audioUrl });
    
    if (!avatarId || !prompt) {
      throw new Error('Avatar ID and prompt are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    console.log('HeyGen API Key available:', !!heygenKey);
    
    // If we don't have HeyGen API, return a fallback response instead of erroring
    if (!heygenKey) {
      console.log('No HeyGen API key, returning fallback response');
      
      return new Response(
        JSON.stringify({
          success: true,
          provider: 'fallback',
          videoUrl: `data:text/plain;base64,${btoa('Demo video - configure HeyGen API for full functionality')}`,
          note: 'Demo mode: Configure HeyGen API key in project settings for full video generation',
          fallback: true
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Get avatar data
    const { data: avatarData, error: avatarError } = await supabase
      .from('talking_avatars')
      .select('*')
      .eq('id', avatarId)
      .eq('user_id', user.id)
      .single();

    if (avatarError || !avatarData) {
      console.error('Avatar not found:', avatarError);
      throw new Error('Avatar not found or access denied');
    }

    console.log('Avatar data:', {
      id: avatarData.id,
      heygen_talking_photo_id: avatarData.heygen_talking_photo_id,
      status: avatarData.status
    });

    if (!avatarData.heygen_talking_photo_id) {
      throw new Error('HeyGen talking photo not ready. Please re-upload your avatar image.');
    }

    console.log('Generating video with HeyGen...');
    
    const payload = {
      test: false,
      caption: false,
      dimension: { width: 1920, height: 1080 },
      video_inputs: [{
        character: {
          type: "talking_photo",
          talking_photo_id: avatarData.heygen_talking_photo_id,
          scale: 1.0,
          talking_photo_style: "closeup_body"
        },
        voice: audioUrl ? {
          type: "audio",
          audio_url: audioUrl
        } : {
          type: "text",
          input_text: prompt,
          voice_id: "1bd001e7e50f421d891986aad5158bc8"
        },
        background: {
          type: "color",
          value: "#000000"
        }
      }]
    };

    console.log('Sending video generation request to HeyGen...');
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${heygenKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('HeyGen video response status:', response.status);
    console.log('HeyGen video response:', responseText);

    if (!response.ok) {
      throw new Error(`HeyGen video generation failed: ${response.status} ${responseText}`);
    }

    const data = JSON.parse(responseText);
    const videoId = data.data?.video_id;
    
    if (!videoId) {
      throw new Error('No video ID returned from HeyGen');
    }

    console.log('Video generation started, ID:', videoId);
    console.log('Polling for video completion...');

    // Poll for completion
    let finalUrl = null;
    const maxWaitTime = 180000; // 3 minutes
    const pollInterval = 5000; // 5 seconds
    const startTime = Date.now();

    while (!finalUrl && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
      try {
        const statusResponse = await fetch(`https://api.heygen.com/v1/video/status?video_id=${videoId}`, {
          headers: { 'Authorization': `Bearer ${heygenKey}` }
        });

        const statusText = await statusResponse.text();
        console.log('Status check:', statusResponse.status, statusText);

        if (statusResponse.ok) {
          const statusData = JSON.parse(statusText);
          console.log('Video status:', statusData.data?.status);
          
          if (statusData.data?.status === 'success' && statusData.data?.video_url) {
            finalUrl = statusData.data.video_url;
            console.log('✅ Video generation completed! URL:', finalUrl);
          } else if (statusData.data?.status === 'failed') {
            throw new Error(statusData.data?.error || 'Video generation failed');
          }
        }
      } catch (statusError) {
        console.log('Status check error:', statusError);
      }
    }

    if (!finalUrl) {
      throw new Error('Video generation timed out. Please try again.');
    }

    console.log('=== VIDEO GENERATION FUNCTION SUCCESS ===');

    return new Response(
      JSON.stringify({
        success: true,
        videoUrl: finalUrl,
        provider: 'heygen',
        video_id: videoId,
        duration: 30,
        status: 'completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('=== VIDEO GENERATION FUNCTION ERROR ===');
    console.error('Error details:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        code: 'VIDEO_GENERATION_ERROR'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});