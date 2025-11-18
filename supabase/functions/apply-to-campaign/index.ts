import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

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
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const { campaign_id, pitch, proposed_rate_cents, portfolio_links = [] } = await req.json();

    console.log('Applying to campaign:', { campaign_id, user_id: user.id });

    // Validate required fields
    if (!campaign_id || !pitch || !proposed_rate_cents) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: campaign_id, pitch, proposed_rate_cents' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get creator account
    const { data: creatorAccount, error: creatorError } = await supabase
      .from('creator_accounts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (creatorError || !creatorAccount) {
      console.error('Creator account not found:', creatorError);
      return new Response(
        JSON.stringify({ error: 'Creator account not found. Please set up Stripe Connect first.' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify campaign exists and is open
    const { data: campaign, error: campaignError } = await supabase
      .from('marketplace_campaigns')
      .select('id, status, budget_cents, brand_id')
      .eq('id', campaign_id)
      .maybeSingle();

    if (campaignError || !campaign) {
      console.error('Campaign not found:', campaignError);
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (campaign.status !== 'open') {
      return new Response(
        JSON.stringify({ error: 'Campaign is not accepting applications' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate proposed rate
    if (proposed_rate_cents < campaign.budget_cents * 0.5 || proposed_rate_cents > campaign.budget_cents) {
      return new Response(
        JSON.stringify({ error: 'Proposed rate must be between 50% and 100% of campaign budget' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing application
    const { data: existingApp } = await supabase
      .from('marketplace_applications')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('creator_id', creatorAccount.id)
      .maybeSingle();

    if (existingApp) {
      return new Response(
        JSON.stringify({ error: 'You have already applied to this campaign' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create application
    const { data: application, error: appError } = await supabase
      .from('marketplace_applications')
      .insert({
        campaign_id,
        creator_id: creatorAccount.id,
        pitch,
        proposed_rate_cents,
        portfolio_links,
        status: 'pending',
      })
      .select()
      .single();

    if (appError) {
      console.error('Application creation error:', appError);
      return new Response(
        JSON.stringify({ error: 'Failed to create application', details: appError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get brand user_id for notification
    const { data: brand } = await supabase
      .from('brands')
      .select('user_id')
      .eq('id', campaign.brand_id)
      .single();

    // Send notification to brand
    if (brand) {
      await supabase.from('notifications').insert({
        user_id: brand.user_id,
        title: 'New Campaign Application',
        message: `You have received a new application for your campaign`,
        category: 'system',
        metadata: { campaign_id, application_id: application.id },
      });
    }

    console.log('Application created successfully:', application.id);

    return new Response(
      JSON.stringify({ application_id: application.id, application }),
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
