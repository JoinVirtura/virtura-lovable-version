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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const {
      content_type,
      caption,
      media_urls,
      is_paid,
      price_cents,
      is_ai_generated,
      scheduled_for
    } = await req.json();

    // Validate required fields
    if (!content_type || !caption) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate paid post has price
    if (is_paid && (!price_cents || price_cents < 50)) {
      return new Response(
        JSON.stringify({ error: 'Paid posts must have a price of at least $0.50' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .insert({
        user_id: user.id,
        content_type,
        caption,
        media_urls: media_urls || [],
        is_paid: is_paid || false,
        price_cents: price_cents || 0,
        is_ai_generated: is_ai_generated || false,
        status: scheduled_for ? 'scheduled' : 'published',
        published_at: scheduled_for || new Date().toISOString(),
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      throw postError;
    }

    console.log('Post created successfully:', post.id);

    return new Response(
      JSON.stringify({ post }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-post:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
