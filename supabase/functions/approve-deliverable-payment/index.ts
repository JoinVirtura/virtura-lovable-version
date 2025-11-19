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

    const { deliverable_id } = await req.json();

    console.log('Approving deliverable and releasing payment:', { deliverable_id, user_id: user.id });

    if (!deliverable_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: deliverable_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get deliverable with campaign and creator details
    const { data: deliverable, error: deliverableError } = await supabase
      .from('marketplace_deliverables')
      .select(`
        *,
        campaign:marketplace_campaigns!inner(
          id,
          brand_id,
          title,
          brands!inner(user_id)
        ),
        creator:creator_accounts!inner(
          id,
          stripe_account_id,
          user_id,
          platform_fee_percentage
        )
      `)
      .eq('id', deliverable_id)
      .single();

    if (deliverableError || !deliverable) {
      console.error('Deliverable not found:', deliverableError);
      return new Response(
        JSON.stringify({ error: 'Deliverable not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify brand ownership
    if (deliverable.campaign.brands.user_id !== user.id) {
      return new Response(
        JSON.stringify({ error: 'Not authorized to approve this deliverable' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (deliverable.status !== 'submitted') {
      return new Response(
        JSON.stringify({ error: 'Deliverable has already been processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get escrowed payment
    const { data: payment, error: paymentError } = await supabase
      .from('marketplace_payments')
      .select('*')
      .eq('campaign_id', deliverable.campaign.id)
      .eq('status', 'escrowed')
      .maybeSingle();

    if (paymentError || !payment) {
      console.error('Payment not found:', paymentError);
      return new Response(
        JSON.stringify({ error: 'Payment not found or already released' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Capture the PaymentIntent (release funds from escrow)
    const capturedPayment = await stripe.paymentIntents.capture(payment.stripe_payment_intent_id);
    console.log('PaymentIntent captured:', capturedPayment.id);

    // Calculate amounts
    const platform_fee_percentage = deliverable.creator.platform_fee_percentage || 10;
    const platform_fee_cents = Math.floor(payment.total_amount_cents * (platform_fee_percentage / 100));
    const creator_amount_cents = payment.total_amount_cents - platform_fee_cents;

    // Transfer to creator's Stripe Connect account
    const transfer = await stripe.transfers.create({
      amount: creator_amount_cents,
      currency: 'usd',
      destination: deliverable.creator.stripe_account_id,
      metadata: {
        campaign_id: deliverable.campaign.id,
        deliverable_id: deliverable.id,
        creator_id: deliverable.creator_id,
      },
    });

    console.log('Transfer created:', transfer.id);

    // Update deliverable status
    await supabase
      .from('marketplace_deliverables')
      .update({ 
        status: 'approved', 
        approved_at: new Date().toISOString() 
      })
      .eq('id', deliverable_id);

    // Update payment record
    await supabase
      .from('marketplace_payments')
      .update({ 
        status: 'released',
        stripe_transfer_id: transfer.id,
        paid_at: new Date().toISOString(),
      })
      .eq('id', payment.id);

    // Create creator earnings record
    await supabase
      .from('creator_earnings')
      .insert({
        creator_id: deliverable.creator_id,
        source_type: 'marketplace_campaign',
        source_id: deliverable.campaign.id,
        amount_cents: payment.total_amount_cents,
        creator_amount_cents,
        platform_fee_cents,
        status: 'paid',
        payout_date: new Date().toISOString(),
        metadata: {
          campaign_id: deliverable.campaign.id,
          deliverable_id: deliverable.id,
          transfer_id: transfer.id,
        },
      });

    // Check if all deliverables are approved
    const { data: allDeliverables } = await supabase
      .from('marketplace_deliverables')
      .select('status')
      .eq('campaign_id', deliverable.campaign.id);

    const allApproved = allDeliverables?.every(d => d.status === 'approved');

    // Update campaign status if all deliverables approved
    if (allApproved) {
      await supabase
        .from('marketplace_campaigns')
        .update({ status: 'completed' })
        .eq('id', deliverable.campaign.id);
    }

    // Send notification to creator
    await supabase.from('notifications').insert({
      user_id: deliverable.creator.user_id,
      title: 'Payment Released!',
      message: `Your deliverable for "${deliverable.campaign.title}" has been approved and payment has been released`,
      category: 'system',
      metadata: { 
        campaign_id: deliverable.campaign.id, 
        deliverable_id,
        amount_cents: creator_amount_cents,
      },
    });

    console.log('Deliverable approved and payment released successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        transfer_id: transfer.id,
        creator_amount_cents,
        platform_fee_cents,
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
