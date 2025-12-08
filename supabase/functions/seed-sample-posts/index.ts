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

// High-engagement sample posts with AI library content
const samplePosts: SamplePost[] = [
  // Jahi Bentley posts (Creator - mix of free and paid)
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'Exploring the neon-lit future 🌃 This AI-generated cyberpunk cityscape took my breath away #AI #AIGenerated',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-cyberpunk-city.jpg'],
    view_count: 12500,
    like_count: 450,
    comment_count: 78,
    share_count: 120,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'Playing with geometry and color in this abstract piece ✨ AI art is evolving fast! This is my complete workflow breakdown.',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-abstract-digital.jpg'],
    view_count: 8900,
    like_count: 320,
    comment_count: 52,
    share_count: 85,
    is_paid: true,
    price_cents: 499,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'Surreal dreamscapes brought to life with AI 🌙✨ The creative possibilities are endless #AI #DigitalArt',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-surreal-dream.jpg'],
    view_count: 15200,
    like_count: 520,
    comment_count: 95,
    share_count: 180,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
    caption: 'EXCLUSIVE: Fantasy landscape collection - 50+ AI-generated artworks included! Download now 🎁',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-fantasy-landscape.jpg'],
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
    caption: 'The beauty of Victorian-era mechanical design 🔧⚙️ Steampunk vibes powered by our AI tools #AI #Steampunk',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-steampunk-mech.jpg'],
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
    media_urls: ['/lovable-uploads/avatar-business-executive.jpg'],
    view_count: 9200,
    like_count: 380,
    comment_count: 64,
    share_count: 95,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
    caption: 'Motion design powered by AI 🎬 Check out this cinematic piece we generated! #AI #AIGenerated',
    content_type: 'video',
    media_urls: ['https://ujaoziqnxhjqlmnvlxav.supabase.co/storage/v1/object/public/virtura-media/videos/kling-motion-1763402090034.mp4'],
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
    media_urls: ['/lovable-uploads/trending-neon-portrait.jpg'],
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
    caption: 'Peaceful vibes from this AI landscape 🌅 The colors are so soothing #AIGenerated #DigitalArt',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-watercolor-landscape.jpg'],
    view_count: 11200,
    like_count: 420,
    comment_count: 71,
    share_count: 105,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Epic mountain vistas - AI brought my imagination to life 🏔️✨ #Fantasy #AIArt',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-fantasy-landscape.jpg'],
    view_count: 7800,
    like_count: 290,
    comment_count: 48,
    share_count: 72,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Dreams made digital ✨ This surreal piece was entirely AI-generated! The future of art is here.',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-surreal-dream.jpg'],
    view_count: 13400,
    like_count: 485,
    comment_count: 82,
    share_count: 145,
    is_paid: false,
    price_cents: 0,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'My complete AI art guide - 100+ prompts and techniques included! 📷 Perfect for beginners and pros alike.',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-abstract-digital.jpg'],
    view_count: 19500,
    like_count: 720,
    comment_count: 156,
    share_count: 234,
    is_paid: true,
    price_cents: 999,
  },
  {
    user_id: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
    caption: 'Neon dreams and cyberpunk aesthetics 🤖✨ Created entirely with AI tools! #AI #AIGenerated #Cyberpunk',
    content_type: 'image',
    media_urls: ['/lovable-uploads/trending-cyberpunk-city.jpg'],
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
