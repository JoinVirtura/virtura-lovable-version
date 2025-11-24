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

    // Update profiles with rich mockup data
    const updates = [
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

    let updatedCount = 0;
    for (const profile of updates) {
      const { error } = await supabaseClient
        .from('profiles')
        .update({
          display_name: profile.display_name,
          bio: profile.bio,
          avatar_url: profile.avatar_url,
          account_type: profile.account_type,
          website_url: profile.website_url
        })
        .eq('id', profile.id);
      
      if (error) {
        console.error(`Error updating profile ${profile.id}:`, error);
      } else {
        updatedCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Successfully updated ${updatedCount} profiles`,
        updatedCount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error updating profiles:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
