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

    // Real user sample posts
    const samplePosts = [
      // Jahi Bentley posts (Admin/Creator)
      {
        user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
        caption: 'Building the future of AI-powered content creation! 🚀 Check out our latest features.',
        media_urls: ['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 342,
        comment_count: 28
      },
      {
        user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
        caption: 'Excited to announce our new platform features! Innovation never stops. ✨',
        media_urls: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 567,
        comment_count: 45
      },
      
      // Erosynth Labs posts (Brand)
      {
        user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
        caption: 'Pushing the boundaries of AI and creativity. Our latest synthetic media technology is here. 🔥',
        media_urls: ['https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 1834,
        comment_count: 156
      },
      {
        user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
        caption: 'Innovation meets imagination. Discover what\'s possible with AI-powered creation tools.',
        media_urls: ['https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 2456,
        comment_count: 203
      },
      {
        user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
        caption: 'The future of content is here. Join us in revolutionizing digital media. 🚀',
        media_urls: ['https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 3124,
        comment_count: 287
      },
      
      // Golden Gleich posts (Creator)
      {
        user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
        caption: 'Exploring new dimensions in digital art with AI. This is just the beginning! 🎨✨',
        media_urls: ['https://images.unsplash.com/photo-1549887534-1541e9326642?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 892,
        comment_count: 67
      },
      {
        user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
        caption: 'My creative journey continues. Here\'s a peek at what I\'ve been working on. 💫',
        media_urls: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 1234,
        comment_count: 98
      },
      {
        user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
        caption: 'When AI meets artistry - the results are magical. Swipe to see more! ✨',
        media_urls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop'],
        content_type: 'image',
        status: 'published',
        published_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        like_count: 1567,
        comment_count: 142
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
        message: 'Sample posts seeded successfully',
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
