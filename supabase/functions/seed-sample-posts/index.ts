import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SamplePost {
  user_id: string;
  caption: string;
  content_type: 'image' | 'video';
  media_urls: string[];
  view_count: number;
  like_count: number;
  comment_count: number;
  share_count: number;
}

// High-engagement sample posts
const samplePosts: SamplePost[] = [
  // Jahi Bentley posts
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'Just dropped a new motion design tutorial! Check out these cinematic transitions 🎬✨',
    content_type: 'video',
    media_urls: ['https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200'],
    view_count: 12500,
    like_count: 450,
    comment_count: 78,
    share_count: 120,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'Behind the scenes of my latest 3D animation project. Spent 80 hours on this! 🔥',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'],
    view_count: 8900,
    like_count: 320,
    comment_count: 52,
    share_count: 85,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'New AI-powered design tool workflow - this changed everything for me 🚀',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200'],
    view_count: 15200,
    like_count: 520,
    comment_count: 95,
    share_count: 180,
  },
  
  // Erosynth Labs posts
  {
    user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
    caption: 'Announcing our new product line! Revolutionary AI-powered creative tools coming soon 💫',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200'],
    view_count: 18500,
    like_count: 680,
    comment_count: 142,
    share_count: 290,
  },
  {
    user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
    caption: 'Meet the team behind Erosynth Labs! Innovation starts with people 🌟',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200'],
    view_count: 9200,
    like_count: 380,
    comment_count: 64,
    share_count: 95,
  },
  {
    user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
    caption: 'Building the future of creative technology. Join us on this journey! 🚀',
    content_type: 'video',
    media_urls: ['https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200'],
    view_count: 14800,
    like_count: 590,
    comment_count: 88,
    share_count: 215,
  },
  
  // Golden Gleich posts
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Sunset vibes from my latest travel adventure 🌅 Who else loves golden hour?',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200'],
    view_count: 11200,
    like_count: 420,
    comment_count: 71,
    share_count: 105,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Creating content that matters. Here\'s my setup for today\'s shoot 📸',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1200'],
    view_count: 7800,
    like_count: 290,
    comment_count: 48,
    share_count: 72,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Adventure awaits! Exploring new creative horizons every day 🗺️✨',
    content_type: 'video',
    media_urls: ['https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=1200'],
    view_count: 13400,
    like_count: 485,
    comment_count: 82,
    share_count: 145,
  },
];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log('Starting to seed sample posts...');

    // Insert all sample posts
    const { data, error } = await supabaseClient
      .from('social_posts')
      .insert(samplePosts)
      .select();

    if (error) {
      console.error('Error inserting posts:', error);
      throw error;
    }

    console.log(`Successfully seeded ${data.length} posts`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully seeded ${data.length} high-engagement posts`,
        posts: data,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in seed-sample-posts function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
