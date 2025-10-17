import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { videoUrl, thumbnailUrl, audioUrl, title, prompt, duration, metadata } = await req.json();

    if (!videoUrl) {
      throw new Error('Video URL is required');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Saving video to library for user:', user.id);

    // Save to avatar_library
    const { data: libraryData, error: libraryError } = await supabase
      .from('avatar_library')
      .insert({
        user_id: user.id,
        image_url: thumbnailUrl || videoUrl,
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        audio_url: audioUrl,
        is_video: true,
        prompt: prompt || 'Talking Avatar Video',
        title: title || `Video ${new Date().toLocaleDateString()}`,
        tags: ['talking-video', 'generated'],
        duration: duration || 0,
      })
      .select()
      .single();

    if (libraryError) {
      console.error('Library insert error:', libraryError);
      throw libraryError;
    }

    console.log('Video saved to library:', libraryData.id);

    // Also save to renders table for tracking
    const { error: renderError } = await supabase
      .from('renders')
      .insert({
        user_id: user.id,
        title: title || `Video ${new Date().toLocaleDateString()}`,
        description: prompt || 'AI Generated Talking Avatar',
        video_url: videoUrl,
        thumbnail_url: thumbnailUrl,
        duration: duration || 0,
        format: 'mp4',
        metadata: metadata || {},
      });

    if (renderError) {
      console.error('Render save error (non-critical):', renderError);
    }

    return new Response(
      JSON.stringify({ success: true, data: libraryData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Save to library error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
