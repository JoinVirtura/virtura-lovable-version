import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

    console.log('[publish-scheduled-posts] Starting scheduled post publishing check...');

    // Get all pending scheduled posts that are due
    const { data: scheduledPosts, error: fetchError } = await supabaseClient
      .from('scheduled_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (fetchError) {
      console.error('[publish-scheduled-posts] Error fetching scheduled posts:', fetchError);
      throw fetchError;
    }

    console.log(`[publish-scheduled-posts] Found ${scheduledPosts?.length || 0} posts to publish`);

    let successCount = 0;
    let failCount = 0;

    for (const post of scheduledPosts || []) {
      try {
        console.log(`[publish-scheduled-posts] Publishing post ${post.id}...`);

        // Update status to publishing
        await supabaseClient
          .from('scheduled_posts')
          .update({ status: 'publishing' })
          .eq('id', post.id);

        // Create social post
        const { data: newPost, error: createError } = await supabaseClient
          .from('social_posts')
          .insert({
            user_id: post.user_id,
            content_type: post.content_type,
            caption: post.caption,
            media_urls: post.media_urls,
            is_paid: post.is_paid || false,
            price_cents: post.price_cents || 0,
            hashtags: post.hashtags || [],
          })
          .select()
          .single();

        if (createError) throw createError;

        // Update scheduled post with published status
        await supabaseClient
          .from('scheduled_posts')
          .update({
            status: 'published',
            post_id: newPost.id,
            published_to: { feed: true },
          })
          .eq('id', post.id);

        // Create notification for user
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: post.user_id,
            title: 'Post Published',
            message: 'Your scheduled post has been published successfully!',
            category: 'system',
            priority: 'low',
            metadata: { post_id: newPost.id, scheduled_post_id: post.id },
          });

        console.log(`[publish-scheduled-posts] Successfully published post ${post.id}`);
        successCount++;
      } catch (error) {
        console.error(`[publish-scheduled-posts] Error publishing post ${post.id}:`, error);
        
        // Update status to failed with error message
        await supabaseClient
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: error.message || 'Unknown error occurred',
          })
          .eq('id', post.id);

        // Create notification for user about failure
        await supabaseClient
          .from('notifications')
          .insert({
            user_id: post.user_id,
            title: 'Post Publishing Failed',
            message: `Failed to publish your scheduled post: ${error.message}`,
            category: 'system',
            priority: 'medium',
            metadata: { scheduled_post_id: post.id, error: error.message },
          });

        failCount++;
      }
    }

    console.log(`[publish-scheduled-posts] Complete. Success: ${successCount}, Failed: ${failCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: scheduledPosts?.length || 0,
        published: successCount,
        failed: failCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[publish-scheduled-posts] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
