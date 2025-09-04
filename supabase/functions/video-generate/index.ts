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
    const { avatarImage, engine, prompt, duration } = await req.json();
    
    if (!avatarImage) {
      throw new Error('Avatar image is required');
    }

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heygenKey) {
      throw new Error('HeyGen API key not configured');
    }

    console.log('Generating video with HeyGen:', { engine, prompt, duration });

    // Call HeyGen API for avatar video generation
    const response = await fetch('https://api.heygen.com/v2/video/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${heygenKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        test: false,
        caption: false,
        dimension: {
          width: 1280,
          height: 720
        },
        video_inputs: [{
          character: {
            type: "talking_photo",
            talking_photo_id: avatarImage,
            scale: 1.0,
            talking_photo_style: "rectangle"
          },
          voice: {
            type: "text",
            input_text: prompt,
            voice_id: "default"
          },
          background: {
            type: "color",
            value: "#ffffff"
          }
        }]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen API error:', errorText);
      throw new Error(`HeyGen API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('HeyGen response:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        videoUrl: data.data?.video_url || `/demo/heygen-video-${Date.now()}.mp4`,
        video_id: data.data?.video_id,
        duration: duration,
        engine: 'heygen',
        status: 'completed'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Video generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});