import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    
    if (!endpointSecret) {
      console.error('Missing Stripe webhook secret');
      return new Response('Webhook secret not configured', { status: 500 });
    }

    const body = await req.text();
    
    // Verify webhook signature
    const crypto = await import('node:crypto');
    const elements = signature?.split(',') || [];
    const signatureElements: Record<string, string> = {};
    
    for (const element of elements) {
      const [key, value] = element.split('=');
      signatureElements[key] = value;
    }

    const timestamp = signatureElements.t;
    const expectedSignature = crypto.createHmac('sha256', endpointSecret)
      .update(timestamp + '.' + body)
      .digest('hex');

    if (expectedSignature !== signatureElements.v1) {
      console.error('Invalid webhook signature');
      return new Response('Invalid signature', { status: 400 });
    }

    const event = JSON.parse(body);
    console.log('Stripe webhook event:', event.type);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabase, event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(supabase, event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabase, event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabase, event.data.object);
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