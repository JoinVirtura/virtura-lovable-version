import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');

    if (!endpointSecret || !stripeKey) {
      console.error('Missing Stripe webhook secret or API key');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    if (!signature) {
      console.error('Missing stripe-signature header');
      return new Response('Missing signature', { status: 400 });
    }

    const body = await req.text();
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    // Use Stripe SDK to validate signature (handles secret rotation, multiple v1 sigs, tolerance)
    let event: Stripe.Event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }

    console.log('Stripe webhook event:', event.type, '| id:', event.id);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(supabase, event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabase, event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(supabase, event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
        break;
        
      case 'payment_intent.succeeded':
        await handlePostUnlockPayment(supabase, event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function handleCheckoutCompleted(supabase: any, session: any) {
  try {
    console.log('Checkout completed:', session.id);
    const metadata = session.metadata || {};
    
    // Handle verification subscription
    if (metadata.type === 'verification_subscription') {
      console.log('Processing verification subscription:', session.id);
      const { error } = await supabase
        .from('user_verification')
        .update({
          subscription_status: 'active',
          verification_subscription_id: session.subscription,
          subscription_started_at: new Date().toISOString(),
        })
        .eq('user_id', metadata.user_id);
      
      if (error) {
        console.error('Error updating verification subscription:', error);
        throw error;
      }
      console.log('Verification subscription activated for user:', metadata.user_id);
      return;
    }
    
    // Handle creator subscription with trial
    if (metadata.creator_id && metadata.subscriber_id) {
      console.log('Processing creator subscription:', session.id);
      const subscription = session.subscription;
      
      const subscriptionData: any = {
        creator_id: metadata.creator_id,
        subscriber_id: metadata.subscriber_id,
        tier: metadata.tier,
        amount_cents: parseInt(metadata.amount_cents || '0'),
        stripe_subscription_id: subscription,
        status: session.status === 'complete' ? 'active' : 'pending',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      // Add trial info if present
      if (metadata.trial_days) {
        subscriptionData.trial_start = new Date().toISOString();
        subscriptionData.trial_end = new Date(Date.now() + parseInt(metadata.trial_days) * 24 * 60 * 60 * 1000).toISOString();
        subscriptionData.status = 'trialing';
      }
      
      const { error } = await supabase
        .from('creator_subscriptions')
        .insert(subscriptionData);
      
      if (error) {
        console.error('Error creating creator subscription:', error);
        throw error;
      }
      console.log('Creator subscription created:', metadata.creator_id);
      return;
    }
    
    // Token conversion rates (internal accounting):
    //   1 image generation = 1 token
    //   1 video generation = 5 tokens
    const VIDEO_TOKEN_COST = 5;

    // Handle platform subscription checkout - credit tokens based on plan
    if (metadata.plan && metadata.user_id) {
      console.log('Processing platform subscription:', session.id, 'Plan:', metadata.plan);

      // Plan allocations: { generations, videos } per month
      // Synced with pricing UI: Starter $29, Pro $129, Scale $179
      const planAllocations: Record<string, { generations: number; videos: number }> = {
        starter: { generations: 120, videos: 5 },
        pro:     { generations: 600, videos: 25 },
        scale:   { generations: 900, videos: 35 },
      };

      const alloc = planAllocations[metadata.plan.toLowerCase()] || planAllocations.starter;
      const tokensToCredit = alloc.generations + (alloc.videos * VIDEO_TOKEN_COST);

      const { error: tokenError } = await supabase.rpc('add_tokens', {
        p_user_id: metadata.user_id,
        p_amount: tokensToCredit,
        p_transaction_type: 'subscription',
        p_metadata: {
          plan: metadata.plan,
          generations: alloc.generations,
          videos: alloc.videos,
          stripe_session_id: session.id,
          amount_paid: session.amount_total / 100,
          period: 'monthly',
        },
      });

      if (tokenError) {
        console.error('Failed to credit subscription tokens:', tokenError);
      } else {
        console.log(`Credited ${tokensToCredit} tokens (${alloc.generations} gens + ${alloc.videos} videos) for ${metadata.plan} subscription to user ${metadata.user_id}`);
      }
      return;
    }

    // Handle boost pack purchase (one-time payment)
    const userId = session.client_reference_id || metadata.user_id;
    const packId = metadata.pack_id;
    const generations = parseInt(metadata.generations || '0');
    const videos = parseInt(metadata.videos || '0');

    if (!userId || !packId || (generations === 0 && videos === 0)) {
      console.log('No boost pack to credit, skipping. metadata:', metadata);
      return;
    }

    const tokensToCredit = generations + (videos * VIDEO_TOKEN_COST);

    const { error } = await supabase.rpc('add_tokens', {
      p_user_id: userId,
      p_amount: tokensToCredit,
      p_transaction_type: 'purchase',
      p_metadata: {
        pack_id: packId,
        generations,
        videos,
        stripe_session_id: session.id,
        amount_paid: session.amount_total / 100,
        currency: session.currency,
      },
    });

    if (error) {
      console.error('Failed to credit boost pack tokens:', error);
      throw error;
    }

    console.log(`Credited ${tokensToCredit} tokens (${generations} gens + ${videos} videos) for boost pack "${packId}" to user ${userId}`);
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(supabase: any, subscription: any) {
  try {
    console.log('Updating subscription:', subscription.id);
    
    // Find user by customer ID
    const { data: existingUser, error: findError } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_customer_id', subscription.customer)
      .single();

    if (findError && findError.code !== 'PGRST116') {
      throw findError;
    }

    const subscriptionData = {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      status: subscription.status,
      plan_name: subscription.items.data[0]?.price?.nickname || 'pro',
      price_id: subscription.items.data[0]?.price?.id,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    };

    if (existingUser) {
      // Update existing subscription
      const { error } = await supabase
        .from('subscriptions')
        .update(subscriptionData)
        .eq('user_id', existingUser.user_id);

      if (error) throw error;
    } else {
      // This shouldn't normally happen, but log it
      console.warn('Subscription update without existing user record:', subscription.customer);
    }

    console.log('Subscription updated successfully');
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(supabase: any, subscription: any) {
  try {
    console.log('Deleting subscription:', subscription.id);
    
    // Check if it's a verification subscription
    const { data: verification } = await supabase
      .from('user_verification')
      .select('id, user_id, grace_period_days')
      .eq('verification_subscription_id', subscription.id)
      .single();
    
    if (verification) {
      // Apply 3-day grace period before removing badge
      const gracePeriodDays = verification.grace_period_days || 3;
      const badgeExpiresAt = new Date();
      badgeExpiresAt.setDate(badgeExpiresAt.getDate() + gracePeriodDays);
      
      const { error } = await supabase
        .from('user_verification')
        .update({
          subscription_status: 'grace_period',
          badge_expires_at: badgeExpiresAt.toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('verification_subscription_id', subscription.id);
      
      if (error) throw error;
      
      // Notify user about grace period
      await supabase.from('notifications').insert({
        user_id: verification.user_id,
        title: 'Verification Subscription Canceled',
        message: `Your verification badge will remain active for ${gracePeriodDays} more days. Resubscribe to keep your verified status.`,
        category: 'account',
        priority: 'high',
        metadata: { 
          verification_id: verification.id,
          badge_expires_at: badgeExpiresAt.toISOString(),
          grace_period_days: gracePeriodDays
        },
      });
      
      console.log(`Verification subscription entered grace period (${gracePeriodDays} days)`);
      return;
    }
    
    // Check if it's a creator subscription
    const { data: creatorSub } = await supabase
      .from('creator_subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscription.id)
      .single();
    
    if (creatorSub) {
      const { error } = await supabase
        .from('creator_subscriptions')
        .update({
          status: 'canceled',
          cancel_at_period_end: true,
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id);
      
      if (error) throw error;
      console.log('Creator subscription canceled');
      return;
    }
    
    // Default: platform subscription
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);

    if (error) throw error;
    console.log('Subscription canceled successfully');
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
}

async function handleTrialWillEnd(supabase: any, subscription: any) {
  try {
    console.log('Trial ending soon for subscription:', subscription.id);
    
    // Update creator subscription trial_used flag
    const { error } = await supabase
      .from('creator_subscriptions')
      .update({
        trial_used: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id);
    
    if (error) {
      console.error('Error updating trial status:', error);
    }
    
    // Could add notification logic here
    console.log('Trial will end notification processed');
  } catch (error) {
    console.error('Error handling trial will end:', error);
    throw error;
  }
}

async function handlePaymentSucceeded(supabase: any, invoice: any) {
  try {
    console.log('Payment succeeded for invoice:', invoice.id);
    
    // Update subscription status to active
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', invoice.customer);

    if (error) throw error;
    console.log('Subscription activated after payment');
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

async function handlePaymentFailed(supabase: any, invoice: any) {
  try {
    console.log('Payment failed for invoice:', invoice.id);
    
    // Update subscription status
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_customer_id', invoice.customer);

    if (error) throw error;
    console.log('Subscription marked as past due');
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

async function handlePostUnlockPayment(supabase: any, paymentIntent: any) {
  try {
    const metadata = paymentIntent.metadata;
    
    // Only process if this is a post unlock payment
    if (!metadata?.post_id) {
      return;
    }

    console.log('Processing post unlock payment:', paymentIntent.id);
    
    // Update post_unlocks status to 'completed'
    const { error: unlockError } = await supabase
      .from('content_unlocks')
      .update({ 
        unlocked_at: new Date().toISOString()
      })
      .eq('stripe_payment_intent_id', paymentIntent.id);

    if (unlockError) {
      console.error('Error updating post unlock:', unlockError);
      throw unlockError;
    }
    
    // Calculate amounts (10% platform fee)
    const totalAmount = paymentIntent.amount;
    const platformFee = Math.round(totalAmount * 0.1);
    const creatorAmount = totalAmount - platformFee;
    
    // Record creator earnings
    const { error: earningsError } = await supabase
      .from('creator_earnings')
      .insert({
        creator_id: metadata.creator_id,
        amount_cents: totalAmount,
        creator_amount_cents: creatorAmount,
        platform_fee_cents: platformFee,
        source_type: 'content_unlock',
        source_id: metadata.post_id,
        status: 'completed',
        revenue_type: 'content',
        metadata: {
          content_type: metadata.content_type || 'post',
          payment_intent_id: paymentIntent.id
        }
      });

    if (earningsError) {
      console.error('Error recording creator earnings:', earningsError);
      throw earningsError;
    }

    // Update creator account totals
    const { error: updateError } = await supabase
      .from('creator_accounts')
      .update({
        total_earnings_cents: supabase.raw(`total_earnings_cents + ${creatorAmount}`),
        pending_earnings_cents: supabase.raw(`pending_earnings_cents + ${creatorAmount}`)
      })
      .eq('id', metadata.creator_id);

    if (updateError) {
      console.error('Error updating creator account:', updateError);
      throw updateError;
    }

    console.log('Post unlock payment processed successfully');
  } catch (error) {
    console.error('Error handling post unlock payment:', error);
    throw error;
  }
}