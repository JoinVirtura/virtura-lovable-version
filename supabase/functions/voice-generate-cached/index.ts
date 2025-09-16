import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { createHash } from "https://deno.land/std@0.190.0/crypto/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const { 
      script, 
      voiceId, 
      model = 'eleven_multilingual_v2',
      voiceSettings = {},
      projectId,
      useCache = true
    } = await req.json();

    if (!script) {
      throw new Error('Script is required');
    }

    // Check usage limits
    const { data: canGenerate } = await supabaseClient.rpc('check_usage_limit', {
      user_uuid: user.id,
      resource_type_param: 'audio_generation',
      daily_limit: 50 // Will be adjusted based on subscription
    });

    if (!canGenerate) {
      throw new Error('Daily audio generation limit reached. Please upgrade your plan.');
    }

    // Create cache key
    const cacheKey = await createHash("sha256")
      .update(JSON.stringify({ script, voiceId, model, voiceSettings }))
      .digest("hex");

    // Check cache if enabled
    if (useCache) {
      const { data: cachedAudio } = await supabaseClient
        .from('voice_cache')
        .select('*')
        .eq('script_hash', cacheKey)
        .eq('voice_id', voiceId)
        .eq('user_id', user.id)
        .single();

      if (cachedAudio) {
        console.log('Returning cached audio');
        return new Response(JSON.stringify({
          success: true,
          audioUrl: cachedAudio.audio_url,
          duration: cachedAudio.duration,
          cached: true,
          provider: cachedAudio.provider
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Generate new audio
    let audioData = null;
    let provider = 'elevenlabs';
    let duration = 0;

    // Try ElevenLabs first
    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (ELEVENLABS_API_KEY) {
      try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: script,
            model_id: model,
            voice_settings: {
              stability: voiceSettings.stability || 0.5,
              similarity_boost: voiceSettings.similarity_boost || 0.5,
              style: voiceSettings.style || 0,
              use_speaker_boost: voiceSettings.use_speaker_boost || true
            }
          })
        });

        if (response.ok) {
          const audioBuffer = await response.arrayBuffer();
          const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
          audioData = base64Audio;
          
          // Estimate duration (rough calculation)
          duration = Math.ceil(script.length / 12); // ~12 chars per second average
        }
      } catch (error) {
        console.error('ElevenLabs generation failed:', error);
      }
    }

    // Fallback to OpenAI if ElevenLabs failed
    if (!audioData) {
      const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
      if (OPENAI_API_KEY) {
        try {
          const response = await fetch('https://api.openai.com/v1/audio/speech', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENAI_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'tts-1',
              input: script,
              voice: 'alloy'
            })
          });

          if (response.ok) {
            const audioBuffer = await response.arrayBuffer();
            const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
            audioData = base64Audio;
            provider = 'openai';
            duration = Math.ceil(script.length / 12);
          }
        } catch (error) {
          console.error('OpenAI generation failed:', error);
        }
      }
    }

    if (!audioData) {
      throw new Error('Audio generation failed with all providers');
    }

    // Upload to storage
    const fileName = `${user.id}/${Date.now()}-${cacheKey.substring(0, 8)}.mp3`;
    const audioBytes = Uint8Array.from(atob(audioData), c => c.charCodeAt(0));
    
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('virtura-media')
      .upload(`audio/${fileName}`, audioBytes, {
        contentType: 'audio/mpeg'
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabaseClient.storage
      .from('virtura-media')
      .getPublicUrl(`audio/${fileName}`);

    // Cache the result
    if (useCache) {
      await supabaseClient
        .from('voice_cache')
        .insert({
          user_id: user.id,
          script_hash: cacheKey,
          voice_id: voiceId,
          voice_settings: voiceSettings,
          audio_url: publicUrl,
          duration,
          provider
        })
        .onConflict('script_hash,voice_id')
        .merge();
    }

    // Track usage
    await supabaseClient
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        resource_type: 'audio_generation',
        amount: 1,
        metadata: { 
          provider, 
          script_length: script.length,
          voice_id: voiceId,
          project_id: projectId 
        }
      });

    return new Response(JSON.stringify({
      success: true,
      audioUrl: publicUrl,
      audioData: audioData, // Base64 for immediate playback
      duration,
      cached: false,
      provider
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Voice generation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});