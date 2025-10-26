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
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      throw new Error('No audio file provided');
    }

    // Validate file size (max 50MB)
    if (audioFile.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit');
    }

    // Validate audio format
    const validFormats = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/flac'];
    if (!validFormats.includes(audioFile.type)) {
      throw new Error('Invalid audio format. Supported: MP3, WAV, OGG, FLAC');
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

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${user.id}/voice-uploads/${timestamp}-${audioFile.name}`;

    // Upload to Supabase storage
    const arrayBuffer = await audioFile.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('virtura-media')
      .upload(fileName, arrayBuffer, {
        contentType: audioFile.type,
        upsert: false,
      });

    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('virtura-media')
      .getPublicUrl(fileName);

    // Extract audio metadata (duration estimation based on file size)
    const estimatedDuration = Math.round(audioFile.size / 16000); // Rough estimate: 16KB per second for MP3

    return new Response(
      JSON.stringify({
        success: true,
        audioUrl: publicUrl,
        fileName: audioFile.name,
        fileSize: audioFile.size,
        duration: estimatedDuration,
        contentType: audioFile.type,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Audio upload error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
