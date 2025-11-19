import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { application_id } = await req.json();

    console.log('Accepting application:', { application_id, user_id: user.id });

    if (!application_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: application_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get application with campaign and creator details
    const { data: application, error: appError } = await supabase
      .from('marketplace_applications')
      .select(`
        *,
        campaign:marketplace_campaigns!inner(
          id,
          brand_id,
          budget_cents,
          title,
          brands!inner(user_id)
        ),
        creator:creator_accounts!inner(
          id,
          stripe_account_id,
          user_id
        )
      `)
      .eq('id', application_id)
      .single();

    if (appError || !application) {
      console.error('Application not found:', appError);
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify brand ownership
    if (application.campaign.brands.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to accept this application' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (application.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Application has already been processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify creator has Stripe account
    if (!application.creator.stripe_account_id) {
      return new Response(
        JSON.stringify({ error: 'Creator has not set up payment account' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const amount_cents = application.proposed_rate_cents;

    // Create PaymentIntent with manual capture (escrow)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: 'usd',
      capture_method: 'manual',
      metadata: {
        campaign_id: application.campaign.id,
        application_id: application.id,
        creator_id: application.creator_id,
        brand_id: application.campaign.brand_id,
      },
    });

    console.log('PaymentIntent created (escrowed):', paymentIntent.id);

    // Start transaction: Accept application and update campaign
    const { error: updateError } = await supabase.rpc('accept_marketplace_application', {
      p_application_id: application_id,
      p_campaign_id: application.campaign.id,
      p_creator_id: application.creator_id,
    }).then(() => {
      // Update application status
      return supabase
        .from('marketplace_applications')
        .update({ status: 'accepted', reviewed_at: new Date().toISOString() })
        .eq('id', application_id);
    }).then(() => {
      // Update campaign
      return supabase
        .from('marketplace_campaigns')
        .update({ 
          status: 'in_progress', 
          creator_id: application.creator_id,
          creator_rate_cents: amount_cents,
        })
        .eq('id', application.campaign.id);
    }).then(() => {
      // Reject other pending applications
      return supabase
        .from('marketplace_applications')
        .update({ status: 'rejected', reviewed_at: new Date().toISOString() })
        .eq('campaign_id', application.campaign.id)
        .neq('id', application_id)
        .eq('status', 'pending');
    });

    if (updateError) {
      console.error('Update error:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update application status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create payment record
    const { error: paymentError } = await supabase
      .from('marketplace_payments')
      .insert({
        campaign_id: application.campaign.id,
        creator_id: application.creator_id,
        brand_id: application.campaign.brand_id,
        total_amount_cents: amount_cents,
        creator_amount_cents: amount_cents * 0.9, // 90% to creator
        platform_fee_cents: amount_cents * 0.1, // 10% platform fee
        status: 'escrowed',
        stripe_payment_intent_id: paymentIntent.id,
      });

    if (paymentError) {
      console.error('Payment record error:', paymentError);
    }

    // Send notification to creator
    await supabase.from('notifications').insert({
      user_id: application.creator.user_id,
      title: 'Application Accepted!',
      message: `Your application for "${application.campaign.title}" has been accepted`,
      category: 'system',
      metadata: { campaign_id: application.campaign.id, application_id },
    });

    console.log('Application accepted successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        payment_intent_id: paymentIntent.id,
        client_secret: paymentIntent.client_secret,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
