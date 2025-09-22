import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { script, voiceId, language = 'en', voiceSettings = {} } = await req.json();
    
    console.log('🎤 ElevenLabs Voice Generation: Starting...');
    console.log('Script length:', script?.length);
    console.log('Voice ID:', voiceId);
    console.log('Language:', language);

    if (!script || !voiceId) {
      throw new Error('Script and voiceId are required');
    }

    const elevenLabsApiKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenLabsApiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Generate speech using ElevenLabs API
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'xi-api-key': elevenLabsApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: script,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: voiceSettings.stability || 0.75,
          similarity_boost: voiceSettings.similarity_boost || 0.75,
          style: voiceSettings.style || 0.0,
          use_speaker_boost: voiceSettings.use_speaker_boost || true
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${errorText}`);
    }

    // Convert audio to buffer
    const audioBuffer = await response.arrayBuffer();
    const audioData = new Uint8Array(audioBuffer);

    // Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const fileName = `voice-${Date.now()}-${voiceId}.mp3`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('virtura-media')
      .upload(fileName, audioData, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload audio: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('virtura-media')
      .getPublicUrl(fileName);

    console.log('✅ Voice generation completed!');
    console.log('Audio URL:', publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        duration: Math.ceil(script.length / 150), // Estimate duration
        voiceId,
        provider: 'elevenlabs',
        metadata: {
          model: 'eleven_multilingual_v2',
          language,
          voiceSettings
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('ElevenLabs voice generation error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});