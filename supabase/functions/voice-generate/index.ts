import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

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

    const normalizedScript = String(script).trim().slice(0, 1000);

    // Accept any provided ElevenLabs voiceId, fall back to Aria if missing
    const selectedVoiceId = (typeof voiceId === 'string' && voiceId.trim().length > 0)
      ? voiceId.trim()
      : '9BWtsMINqrJLrRacOk9x';

    // Sanitize/normalize voice settings to avoid API 4xx due to wrong types
    const sanitizeVoiceSettings = (vs: any) => {
      const toNum = (v: any, d: number) => {
        const n = typeof v === 'string' ? parseFloat(v) : (typeof v === 'number' ? v : d);
        if (Number.isFinite(n)) return Math.max(0, Math.min(1, n));
        return d;
      };
      return {
        stability: toNum(vs?.stability, 0.5),
        similarity_boost: toNum(vs?.similarity_boost, 0.5),
        style: toNum(vs?.style, 0.0),
        use_speaker_boost: typeof vs?.use_speaker_boost === 'boolean' ? vs.use_speaker_boost : true,
      };
    };

    const elevenlabsKey = Deno.env.get('ELEVENLABS_API_KEY');
    if (!elevenlabsKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    console.log('Generating voice with ElevenLabs:', { len: normalizedScript.length, voiceId: selectedVoiceId, model });

    // Primary request
    const primaryResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': elevenlabsKey,
      },
      body: JSON.stringify({
        text: normalizedScript,
        model_id: model || 'eleven_multilingual_v2',
        voice_settings: sanitizeVoiceSettings(voiceSettings),
      }),
    });

    let finalResponse = primaryResponse;

    if (!primaryResponse.ok) {
      const primaryText = await primaryResponse.text();
      console.warn('ElevenLabs primary model failed:', primaryText);

      // Fallback to Turbo
      const fallbackResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': elevenlabsKey,
        },
        body: JSON.stringify({
          text: normalizedScript,
          model_id: 'eleven_turbo_v2_5',
          voice_settings: sanitizeVoiceSettings(voiceSettings),
        }),
      });

      finalResponse = fallbackResponse;

      if (!fallbackResponse.ok) {
        const fallbackText = await fallbackResponse.text();
        console.error('ElevenLabs fallback model failed:', fallbackText);
        throw new Error(`ElevenLabs API error: ${fallbackResponse.status} ${fallbackResponse.statusText}: ${fallbackText}`);
      }
    }

    const audioBuffer = await finalResponse.arrayBuffer();
    // Convert to Uint8Array once
    const bytes = new Uint8Array(audioBuffer);

    // Also prepare a base64 data URL for immediate playback (small scripts only)
    const chunkSize = 0x8000; // 32KB chunks
    let binary = '';
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode(...chunk);
    }
    const base64Audio = btoa(binary);

    // Upload MP3 to Supabase Storage for a stable URL consumers can use downstream
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    let publicUrl: string | null = null;

    if (SUPABASE_URL && SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
        const fileName = `audio/${Date.now()}-${(crypto as any).randomUUID?.() || Math.random().toString(36).slice(2)}.mp3`;
        const blob = new Blob([bytes], { type: 'audio/mpeg' });
        const { error: uploadError } = await supabase.storage.from('virtura-media').upload(fileName, blob, {
          contentType: 'audio/mpeg',
          upsert: false,
        });
        if (uploadError) {
          console.warn('Audio upload failed, fallback to base64 only:', uploadError.message);
        } else {
          const { data: pub } = supabase.storage.from('virtura-media').getPublicUrl(fileName);
          publicUrl = pub?.publicUrl || null;
          console.log('Uploaded audio to storage at:', publicUrl);
        }
      } catch (e) {
        console.warn('Error uploading audio to storage:', e);
      }
    } else {
      console.warn('Missing SUPABASE_URL or SERVICE_ROLE_KEY; skipping storage upload');
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        audioData: `data:audio/mpeg;base64,${base64Audio}`,
        audioUrl: publicUrl,
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