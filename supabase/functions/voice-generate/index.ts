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
    const { script, voiceId, model, voiceSettings } = await req.json();
    
    if (!script) {
      throw new Error('Script is required');
    }

    const elevenlabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('Generating voice with ElevenLabs:', { script, voiceId, model });

    // Call ElevenLabs TTS API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || '9BWtsMINqrJLrRacOk9x'}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsKey,
      },
      body: JSON.stringify({
        text: script,
        model_id: model || 'eleven_multilingual_v2',
        voice_settings: voiceSettings || {
          stability: 0.5,
          similarity_boost: 0.5,
          style: 0.0,
          use_speaker_boost: true
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error: ${response.statusText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({ 
        success: true,
        audioData: `data:audio/mpeg;base64,${base64Audio}`,
        audioUrl: `/audio/${Date.now()}.mp3`,
        duration: 'estimated_duration'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Voice generation error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});