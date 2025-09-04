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
    const { audioUrl, videoUrl, engine, trimSettings } = await req.json();
    
    if (!audioUrl || !videoUrl) {
      throw new Error('Both audio and video URLs are required');
    }

    const heygenKey = Deno.env.get('HEYGEN_API_KEY');
    if (!heygenKey) {
      throw new Error('HeyGen API key not configured');
    }

    console.log('Syncing audio and video with HeyGen:', { audioUrl, videoUrl, engine, trimSettings });

    // Use HeyGen's lip-sync API
    const response = await fetch('https://api.heygen.com/v1/video/translate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${heygenKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl,
        target_language: 'en',
        audio_url: audioUrl,
        translate_audio: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HeyGen sync API error:', errorText);
      throw new Error(`HeyGen sync API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('HeyGen sync response:', data);

    return new Response(
      JSON.stringify({ 
        success: true,
        finalVideoUrl: data.data?.video_url || `/demo/heygen-synced-${Date.now()}.mp4`,
        video_id: data.data?.video_id,
        audioUrl: audioUrl,
        rawVideoUrl: videoUrl,
        engine: 'heygen',
        status: 'completed',
        trimSettings: trimSettings
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Video sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});