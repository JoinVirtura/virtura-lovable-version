import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Update existing profiles with rich mockup data
    const profileUpdates = [
      {
        id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
        display_name: 'Sarah Chen',
        bio: 'Fashion & lifestyle content creator sharing daily inspiration. Partnered with 50+ brands. Based in NYC 🗽',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        account_type: 'creator',
        website_url: 'https://sarahchen.com'
      },
      {
        id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
        display_name: 'Alex Rodriguez',
        bio: 'Tech reviewer & gadget enthusiast. Unboxing the future, one device at a time 🔌 Partnership inquiries: alex@techreviews.io',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        account_type: 'creator',
        website_url: 'https://alextech.io'
      },
      {
        id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
        display_name: 'Nike Brand',
        bio: 'Just Do It. ✔️ Official Nike account featuring the latest in sportswear, innovation, and athlete stories.',
        avatar_url: 'https://logo.clearbit.com/nike.com',
        account_type: 'brand',
        website_url: 'https://nike.com'
      }
    ];

    // Update each profile
    for (const profile of profileUpdates) {
      const { error } = await supabaseClient
        .from('profiles')
        .update(profile)
        .eq('id', profile.id);
      
      if (error) {
        console.error(`Error updating profile ${profile.id}:`, error);
      }
    }

    // Insert sample posts
    const samplePosts = [
      // Sarah Chen posts
      {
        user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
        caption: 'New collaboration with @fashionbrand dropping next week! 🔥 Can\'t wait to show you what we\'ve been working on. #fashion #ootd',
        media_urls: ['https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 1247,
        comment_count: 89
      },
      {
        user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
        caption: 'Behind the scenes of yesterday\'s photoshoot 📸 Swipe to see the final results!',
        media_urls: ['https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 2134,
        comment_count: 156
      },
      // Alex Rodriguez posts
      {
        user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
        caption: 'Unboxing the latest flagship phone! Full review coming tomorrow. What do you want to know about it? 📱',
        media_urls: ['https://images.unsplash.com/photo-1592286927505-c0d5e9d1e6b9?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 8923,
        comment_count: 234
      },
      // Nike Brand posts
      {
        user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
        caption: 'Innovation meets performance. Introducing the new Air Max 2024. Available now. #JustDoIt',
        media_urls: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 45230,
        comment_count: 892
      }
    ];

    const { error: postsError } = await supabaseClient
      .from('social_posts')
      .insert(samplePosts);

    if (postsError) {
      console.error('Error inserting posts:', postsError);
      throw postsError;
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Mockup profiles and posts seeded successfully',
        profiles: profileUpdates.length,
        posts: samplePosts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error seeding data:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
