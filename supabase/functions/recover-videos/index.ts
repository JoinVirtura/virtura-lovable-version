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

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Starting video recovery scan for user:', user.id);

    const buckets = ['virtura-media', 'avatars', 'reference-images'];
    const foundVideos: any[] = [];
    const updates: any[] = [];

    // Scan all buckets for video files
    for (const bucketName of buckets) {
      try {
        const { data: files, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1000 });

        if (error) {
          console.error(`Error listing ${bucketName}:`, error);
          continue;
        }

        const videoFiles = files?.filter(file => 
          file.name.endsWith('.mp4') || 
          file.name.endsWith('.webm') || 
          file.name.endsWith('.mov')
        ) || [];

        console.log(`Found ${videoFiles.length} videos in ${bucketName}`);

        for (const file of videoFiles) {
          const { data: urlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(file.name);

          foundVideos.push({
            bucket: bucketName,
            name: file.name,
            url: urlData.publicUrl,
            created_at: file.created_at,
            metadata: file.metadata,
          });
        }
      } catch (err) {
        console.error(`Failed to scan bucket ${bucketName}:`, err);
      }
    }

    console.log(`Total videos found: ${foundVideos.length}`);

    // Get all avatar_library records that might be missing video URLs
    const { data: libraryItems, error: libraryError } = await supabase
      .from('avatar_library')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_video', false)
      .order('created_at', { ascending: false });

    if (libraryError) {
      console.error('Library query error:', libraryError);
      throw libraryError;
    }

    console.log(`Found ${libraryItems?.length || 0} library items to check`);

    // Try to match videos to library items by date proximity
    for (const item of libraryItems || []) {
      const itemDate = new Date(item.created_at);
      
      // Find videos created within 1 hour of this library item
      const matchedVideo = foundVideos.find(video => {
        const videoDate = new Date(video.created_at);
        const timeDiff = Math.abs(videoDate.getTime() - itemDate.getTime());
        const oneHour = 60 * 60 * 1000;
        return timeDiff < oneHour;
      });

      if (matchedVideo) {
        updates.push({
          id: item.id,
          video_url: matchedVideo.url,
          thumbnail_url: item.image_url, // Keep existing image as thumbnail
          matched_file: matchedVideo.name,
        });
      }
    }

    console.log(`Matched ${updates.length} videos to library items`);

    // Update the library items
    const updateResults = [];
    for (const update of updates) {
      const { data, error } = await supabase
        .from('avatar_library')
        .update({
          video_url: update.video_url,
          thumbnail_url: update.thumbnail_url,
          is_video: true,
        })
        .eq('id', update.id)
        .select()
        .single();

      if (error) {
        console.error('Update error:', error);
        updateResults.push({ ...update, error: error.message });
      } else {
        console.log('Updated library item:', update.id);
        updateResults.push({ ...update, success: true });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        foundVideos: foundVideos.length,
        matchedItems: updates.length,
        updates: updateResults,
        allVideos: foundVideos,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Recovery error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
