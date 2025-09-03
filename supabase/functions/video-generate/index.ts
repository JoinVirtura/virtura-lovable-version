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
    const { avatarImage, engine, duration, prompt } = await req.json();
    
    if (!avatarImage) {
      throw new Error('Avatar image is required');
    }

    console.log('Generating video:', { engine, duration, prompt });

    // Simulate video generation based on engine
    let simulatedVideoUrl;
    
    if (engine === 'kling') {
      // Simulate Kling video generation
      simulatedVideoUrl = `/demo/kling-video-${Date.now()}.mp4`;
    } else if (engine === 'veo3') {
      // Simulate Veo3 video generation
      simulatedVideoUrl = `/demo/veo3-video-${Date.now()}.mp4`;
    } else {
      throw new Error('Invalid video engine specified');
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return new Response(
      JSON.stringify({ 
        success: true,
        videoUrl: simulatedVideoUrl,
        duration: duration,
        engine: engine,
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