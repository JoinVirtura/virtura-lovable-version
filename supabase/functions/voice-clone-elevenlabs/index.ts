import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const { voiceName, audioFiles, description } = await req.json();
    
    if (!voiceName || !audioFiles || audioFiles.length === 0) {
      throw new Error('Voice name and at least one audio file required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) throw new Error('Invalid user token');

    // Download audio files from Supabase storage
    const formData = new FormData();
    formData.append('name', voiceName);
    if (description) {
      formData.append('description', description);
    }

    for (let i = 0; i < audioFiles.length; i++) {
      const audioUrl = audioFiles[i];
      const { data: fileData, error: downloadError } = await supabase.storage
        .from('virtura-media')
        .download(audioUrl.replace(/.*\/virtura-media\//, ''));

      if (downloadError) throw new Error(`Failed to download audio file: ${downloadError.message}`);
      
      formData.append('files', new Blob([fileData]), `sample_${i}.mp3`);
    }

    // Call ElevenLabs Voice Cloning API
    const cloneResponse = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!cloneResponse.ok) {
      const errorData = await cloneResponse.text();
      console.error('ElevenLabs API error:', errorData);
      throw new Error(`Voice cloning failed: ${cloneResponse.statusText}`);
    }

    const cloneData = await cloneResponse.json();

    // Store cloned voice in database
    const { data: voiceClone, error: dbError } = await supabase
      .from('voice_clones')
      .insert({
        user_id: user.id,
        voice_id: cloneData.voice_id,
        voice_name: voiceName,
        provider: 'elevenlabs',
        audio_samples: audioFiles,
        metadata: {
          description,
          created_via: 'voice-clone',
          elevenlabs_data: cloneData,
        },
      })
      .select()
      .single();

    if (dbError) throw new Error(`Database error: ${dbError.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        voiceId: cloneData.voice_id,
        voiceName,
        cloneData: voiceClone,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Voice clone error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
