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
  is_paid?: boolean;
  price_cents?: number;
}

// High-engagement sample posts with mix of free and paid content
const samplePosts: SamplePost[] = [
  // Jahi Bentley posts (Creator - mix of free and paid)
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'Just dropped a new motion design tutorial! Check out these cinematic transitions 🎬✨ #AI #AIGenerated',
    content_type: 'video',
    media_urls: ['https://videos.pexels.com/video-files/3129671/3129671-uhd_2560_1440_30fps.mp4'],
    view_count: 12500,
    like_count: 450,
    comment_count: 78,
    share_count: 120,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'Behind the scenes of my latest 3D animation project. Spent 80 hours on this! 🔥 This is my complete workflow breakdown.',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200'],
    view_count: 8900,
    like_count: 320,
    comment_count: 52,
    share_count: 85,
    is_paid: true,
    price_cents: 499,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'New AI-powered design tool workflow - this changed everything for me 🚀 #AI',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200'],
    view_count: 15200,
    like_count: 520,
    comment_count: 95,
    share_count: 180,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'EXCLUSIVE: My complete After Effects preset pack - 50+ transitions included! Download now 🎁',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200'],
    view_count: 22000,
    like_count: 890,
    comment_count: 234,
    share_count: 456,
    is_paid: true,
    price_cents: 1499,
  },
  
  // Erosynth Labs posts (Brand - mix of announcements and premium content)
  {
    user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
    caption: 'Announcing our new product line! Revolutionary AI-powered creative tools coming soon 💫',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200'],
    view_count: 18500,
    like_count: 680,
    comment_count: 142,
    share_count: 290,
    is_paid: false,
    price_cents: 0,
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
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
    caption: 'Building the future of creative technology. Join us on this journey! 🚀 #AI #AIGenerated',
    content_type: 'video',
    media_urls: ['https://videos.pexels.com/video-files/5377684/5377684-uhd_2560_1440_25fps.mp4'],
    view_count: 14800,
    like_count: 590,
    comment_count: 88,
    share_count: 215,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
    caption: 'EARLY ACCESS: Get exclusive beta access to our new AI video generator. Limited spots available! 🔒',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200'],
    view_count: 31000,
    like_count: 1200,
    comment_count: 345,
    share_count: 567,
    is_paid: true,
    price_cents: 2999,
  },
  
  // Golden Gleich posts (Creator - lifestyle and travel content)
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Sunset vibes from my latest travel adventure 🌅 Who else loves golden hour?',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1200'],
    view_count: 11200,
    like_count: 420,
    comment_count: 71,
    share_count: 105,
    is_paid: false,
    price_cents: 0,
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
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Adventure awaits! Exploring new creative horizons every day 🗺️✨',
    content_type: 'video',
    media_urls: ['https://videos.pexels.com/video-files/1739010/1739010-uhd_2560_1440_24fps.mp4'],
    view_count: 13400,
    like_count: 485,
    comment_count: 82,
    share_count: 145,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'My complete travel photography guide - 100+ Lightroom presets included! 📷 Perfect for beginners and pros alike.',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200'],
    view_count: 19500,
    like_count: 720,
    comment_count: 156,
    share_count: 234,
    is_paid: true,
    price_cents: 999,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Created this entirely with AI tools! The future of content creation is here 🤖✨ #AI #AIGenerated',
    content_type: 'image',
    media_urls: ['https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200'],
    view_count: 25000,
    like_count: 950,
    comment_count: 203,
    share_count: 389,
    is_paid: false,
    price_cents: 0,
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
