import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_CONNECT_SECRET');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      event = JSON.parse(body);
    }

    console.log('Received event:', event.type);

    switch (event.type) {
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        
        await supabase
          .from('creator_accounts')
          .update({
            onboarding_complete: account.details_submitted || false,
            payouts_enabled: account.payouts_enabled || false,
            charges_enabled: account.charges_enabled || false,
            details_submitted: account.details_submitted || false,
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_account_id', account.id);

        console.log('Updated creator account:', account.id);
        break;
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const metadata = paymentIntent.metadata;

        // Handle content unlock
        if (metadata.content_id && metadata.creator_id) {
          const { error: unlockError } = await supabase
            .from('content_unlocks')
            .insert({
              user_id: metadata.user_id,
              content_id: metadata.content_id,
              content_type: metadata.content_type,
              creator_id: metadata.creator_id,
              amount_cents: paymentIntent.amount,
              stripe_payment_intent_id: paymentIntent.id,
            });

          if (unlockError) {
            console.error('Failed to record content unlock:', unlockError);
          }

          // Record earnings
          const platformFeeCents = paymentIntent.application_fee_amount || 0;
          const creatorAmountCents = paymentIntent.amount - platformFeeCents;

          await supabase
            .from('creator_earnings')
            .insert({
              creator_id: metadata.creator_id,
              amount_cents: paymentIntent.amount,
              platform_fee_cents: platformFeeCents,
              creator_amount_cents: creatorAmountCents,
              source_type: 'unlock',
              source_id: metadata.content_id,
              status: 'pending',
            });

          console.log('Recorded content unlock earnings');
        }

        // Handle tip
        if (metadata.type === 'tip') {
          const { error: tipError } = await supabase
            .from('creator_tips')
            .insert({
              creator_id: metadata.creator_id,
              tipper_id: metadata.tipper_id,
              amount_cents: paymentIntent.amount,
              message: metadata.message,
              stripe_payment_intent_id: paymentIntent.id,
            });

          if (tipError) {
            console.error('Failed to record tip:', tipError);
          }

          // Record earnings
          const platformFeeCents = paymentIntent.application_fee_amount || 0;
          const creatorAmountCents = paymentIntent.amount - platformFeeCents;

          await supabase
            .from('creator_earnings')
            .insert({
              creator_id: metadata.creator_id,
              amount_cents: paymentIntent.amount,
              platform_fee_cents: platformFeeCents,
              creator_amount_cents: creatorAmountCents,
              source_type: 'tip',
              status: 'pending',
            });

          console.log('Recorded tip earnings');
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const metadata = session.metadata;

        if (metadata?.tier && metadata?.creator_id && metadata?.subscriber_id) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

          await supabase
            .from('creator_subscriptions')
            .insert({
              creator_id: metadata.creator_id,
              subscriber_id: metadata.subscriber_id,
              tier: metadata.tier,
              amount_cents: session.amount_total || 0,
              stripe_subscription_id: subscription.id,
              status: 'active',
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            });

          console.log('Created creator subscription');
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;

        await supabase
          .from('creator_subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id);

        console.log('Canceled subscription:', subscription.id);
        break;
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;

        await supabase
          .from('creator_earnings')
          .update({
            status: 'paid',
            payout_date: new Date().toISOString(),
            stripe_payout_id: payout.id,
          })
          .eq('stripe_payout_id', payout.id);

        console.log('Marked payout as paid:', payout.id);
        break;
      }

      default:
        console.log('Unhandled event type:', event.type);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
