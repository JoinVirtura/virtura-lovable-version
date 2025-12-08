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

    const { creatorId, tier, trialDays } = await req.json();

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

    // Check if subscriber already had a trial with this creator
    const { data: existingSub } = await supabase
      .from('creator_subscriptions')
      .select('trial_used')
      .eq('creator_id', creatorId)
      .eq('subscriber_id', user.id)
      .single();

    const canUseTrial = trialDays && trialDays > 0 && !existingSub?.trial_used;

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

    // Calculate platform fee (10%)
    const platformFeeCents = Math.floor(amountCents * 0.10);

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

    // Create checkout session with application fee and optional trial
    const sessionConfig: any = {
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
      success_url: `${req.headers.get('origin')}/profile/${creatorAccount.user_id}?subscription=success`,
      cancel_url: `${req.headers.get('origin')}/profile/${creatorAccount.user_id}?subscription=canceled`,
      metadata: {
        creator_id: creatorId,
        subscriber_id: user.id,
        tier,
        amount_cents: amountCents.toString(),
        trial_days: canUseTrial ? trialDays.toString() : '0',
      },
    };

    // Add trial period if eligible
    if (canUseTrial) {
      sessionConfig.subscription_data = {
        trial_period_days: trialDays,
        application_fee_percent: 10,
        transfer_data: {
          destination: creatorAccount.stripe_account_id,
        },
      };
      console.log(`Adding ${trialDays} day trial for subscription`);
    } else {
      sessionConfig.subscription_data = {
        application_fee_percent: 10,
        transfer_data: {
          destination: creatorAccount.stripe_account_id,
        },
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

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
