import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

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
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' });

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

    const { post_id } = await req.json();

    if (!post_id) {
      return new Response(
        JSON.stringify({ error: 'Missing post_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get post details
    const { data: post, error: postError } = await supabase
      .from('social_posts')
      .select('*')
      .eq('id', post_id)
      .single();

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: 'Post not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if post is paid
    if (!post.is_paid) {
      return new Response(
        JSON.stringify({ error: 'Post is not a paid post' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already unlocked
    const { data: existingUnlock } = await supabase
      .from('post_unlocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', post_id)
      .maybeSingle();

    if (existingUnlock) {
      return new Response(
        JSON.stringify({ 
          error: 'Post already unlocked',
          unlocked: true 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get creator's connected account
    const { data: creatorAccount, error: accountError } = await supabase
      .from('creator_accounts')
      .select('*')
      .eq('user_id', post.user_id)
      .single();

    if (accountError || !creatorAccount?.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Creator account not configured for payments' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate platform fee (10%)
    const platformFeeCents = Math.floor(post.price_cents * 0.10);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: post.price_cents,
      currency: 'usd',
      application_fee_amount: platformFeeCents,
      transfer_data: {
        destination: creatorAccount.stripe_account_id,
      },
      metadata: {
        user_id: user.id,
        post_id: post.id,
        creator_id: creatorAccount.id,
      },
    });

    // Create post unlock record (pending payment)
    const { error: unlockError } = await supabase
      .from('post_unlocks')
      .insert({
        user_id: user.id,
        post_id: post.id,
        amount_cents: post.price_cents,
        stripe_payment_intent_id: paymentIntent.id,
      });

    if (unlockError) throw unlockError;

    console.log('Payment intent created for post unlock:', post.id);

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in unlock-post:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
