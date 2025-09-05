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
    const { avatarId, prompt, audioUrl } = await req.json();
    
    if (!avatarId || !prompt) {
      throw new Error('Avatar ID and prompt are required');
    }

    console.log('Simple video generation request:', { avatarId, prompt, hasAudio: !!audioUrl });

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
      .maybeSingle();

    if (avatarError || !avatarData) {
      throw new Error('Avatar not found or access denied');
    }

    console.log('Avatar data found:', {
      id: avatarData.id,
      hasHeyGen: !!avatarData.heygen_talking_photo_id,
      status: avatarData.status
    });

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');

    let videoResult: any = null;

    // Try HeyGen first if available
    if (avatarData.heygen_talking_photo_id && heygenKey) {
      try {
        console.log('Generating video with HeyGen...');
        
        const payload: any = {
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

        console.log('HeyGen payload prepared:', JSON.stringify(payload, null, 2));

        const response = await fetch('https://api.heygen.com/v2/video/generate', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${heygenKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();
        console.log('HeyGen response status:', response.status);
        console.log('HeyGen response:', responseText);

        if (response.ok) {
          const data = JSON.parse(responseText);

          // Poll status until success or timeout
          const videoId = data.data?.video_id;
          let finalUrl = data.data?.video_url || null;
          if (videoId && !finalUrl) {
            const statusEndpoint = `https://api.heygen.com/v1/video/status?video_id=${videoId}`;
            const start = Date.now();
            while (!finalUrl && Date.now() - start < 120000) { // up to 120s
              await new Promise(r => setTimeout(r, 3000));
              const statusResp = await fetch(statusEndpoint, {
                headers: { 'Authorization': `Bearer ${heygenKey}` }
              });
              const statusText = await statusResp.text();
              console.log('HeyGen status:', statusResp.status, statusText);
              if (statusResp.ok) {
                const statusData = JSON.parse(statusText);
                if (statusData.data?.status === 'success' && statusData.data?.video_url) {
                  finalUrl = statusData.data.video_url;
                } else if (statusData.data?.status === 'failed') {
                  throw new Error(statusData.data?.error || 'HeyGen video failed');
                }
              }
            }
          }

          videoResult = {
            videoUrl: finalUrl || data.data?.video_url,
            provider: 'heygen',
            video_id: videoId,
            duration: 30,
            status: 'completed'
          };
          if (!videoResult.videoUrl) {
            throw new Error('HeyGen did not return a video URL in time');
          }
        } else {
          const errorMsg = `HeyGen API error: ${response.status} ${responseText}`;
          console.error(errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('HeyGen generation failed:', (error as any).message);
        throw error;
      }
    } else {
      console.log('HeyGen not available - cannot generate talking video');
      throw new Error('HeyGen avatar not ready. Please re-upload image to create a talking photo.');
    }

    return new Response(
      JSON.stringify({ success: true, ...videoResult }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Video generation error:', error);
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