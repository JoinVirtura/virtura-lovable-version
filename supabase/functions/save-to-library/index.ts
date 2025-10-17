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

    console.log('📥 Save to library request received:', {
      videoUrl: videoUrl?.substring(0, 60) + '...',
      thumbnailUrl: thumbnailUrl?.substring(0, 60) + '...' || 'null',
      audioUrl: audioUrl?.substring(0, 60) + '...' || 'null',
      title,
      hasMetadata: !!metadata
    });

    // Input validation
    if (!videoUrl) {
      console.error('❌ Validation failed: videoUrl is required');
      throw new Error('Video URL is required');
    }

    if (thumbnailUrl && typeof thumbnailUrl !== 'string') {
      console.error('❌ Validation failed: thumbnailUrl must be string, got:', typeof thumbnailUrl);
      throw new Error('Thumbnail URL must be a string, not a File object');
    }

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('💾 Saving video to library for user:', user.id);

    // Check if video is from external source (Replicate) and needs to be downloaded
    const isExternalUrl = !videoUrl.includes('supabase.co/storage');
    let finalVideoUrl = videoUrl;
    let finalThumbnailUrl = thumbnailUrl;

    if (isExternalUrl) {
      console.log('🌐 External video URL detected (Replicate), downloading and uploading to storage...');
      
      try {
        // Download video from Replicate
        console.log('⬇️ Downloading video from:', videoUrl.substring(0, 60) + '...');
        const videoResponse = await fetch(videoUrl);
        
        if (!videoResponse.ok) {
          throw new Error(`Failed to download video: ${videoResponse.status}`);
        }

        const videoBlob = await videoResponse.blob();
        const videoSize = videoBlob.size;
        console.log(`✅ Video downloaded: ${(videoSize / 1024 / 1024).toFixed(2)}MB`);

        // Upload to Supabase Storage
        const fileName = `recovered-video-${Date.now()}.mp4`;
        const filePath = `videos/${fileName}`;
        
        console.log(`📤 Uploading to virtura-media/${filePath}...`);
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('virtura-media')
          .upload(filePath, videoBlob, {
            contentType: 'video/mp4',
            upsert: true
          });

        if (uploadError) {
          console.error('❌ Storage upload failed:', uploadError);
          throw new Error(`Failed to upload video: ${uploadError.message}`);
        }

        const { data: urlData } = supabase.storage
          .from('virtura-media')
          .getPublicUrl(filePath);

        finalVideoUrl = urlData.publicUrl;
        console.log(`✅ Video uploaded to Supabase Storage: ${finalVideoUrl}`);

      } catch (error: any) {
        console.error('❌ Failed to download/upload external video:', error.message);
        console.warn('⚠️ Proceeding with original URL, but video may expire');
        // Continue with original URL as fallback
      }
    }

    // Save to avatar_library
    console.log('💾 Inserting into avatar_library table...');
    const { data: libraryData, error: libraryError } = await supabase
      .from('avatar_library')
      .insert({
        user_id: user.id,
        image_url: finalThumbnailUrl || finalVideoUrl,
        video_url: finalVideoUrl,
        thumbnail_url: finalThumbnailUrl,
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
      console.error('❌ Library insert error:', libraryError);
      throw libraryError;
    }

    console.log('✅ Video saved to library successfully! ID:', libraryData.id);

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
