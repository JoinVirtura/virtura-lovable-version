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
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

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

    const { creatorId, tier } = await req.json();

    // Get creator account
    const { data: creatorAccount, error: accountError } = await supabase
      .from('creator_accounts')
      .select('*')
      .eq('id', creatorId)
      .single();

    if (accountError || !creatorAccount) {
      return new Response(
        JSON.stringify({ error: 'Creator account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Define tier pricing
    const tierPricing: Record<string, number> = {
      basic: 500,    // $5.00
      premium: 1500, // $15.00
      vip: 5000,     // $50.00
    };

    const amountCents = tierPricing[tier];
    if (!amountCents) {
      return new Response(
        JSON.stringify({ error: 'Invalid tier' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate platform fee (20%)
    const platformFeeCents = Math.floor(amountCents * 0.20);

    // Create or get Stripe customer
    const { data: existingSubscriptions } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .limit(1);

    let customerId = existingSubscriptions?.[0]?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
    }

    // Create checkout session with application fee
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tier.charAt(0).toUpperCase() + tier.slice(1)} Subscription`,
              description: `Monthly subscription to creator content`,
            },
            unit_amount: amountCents,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${Deno.env.get('SUPABASE_URL')}/creator-profile/${creatorId}?subscription=success`,
      cancel_url: `${Deno.env.get('SUPABASE_URL')}/creator-profile/${creatorId}?subscription=canceled`,
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: creatorAccount.stripe_account_id,
        },
      },
      metadata: {
        creator_id: creatorId,
        subscriber_id: user.id,
        tier,
      },
    });

    return new Response(
      JSON.stringify({
        sessionId: session.id,
        url: session.url,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
