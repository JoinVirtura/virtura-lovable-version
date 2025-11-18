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

    const { campaign_id, asset_id, deliverable_type } = await req.json();

    console.log('Submitting deliverable:', { campaign_id, asset_id, deliverable_type });

    // Validate required fields
    if (!campaign_id || !asset_id || !deliverable_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: campaign_id, asset_id, deliverable_type' }),
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
        JSON.stringify({ error: 'Creator account not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify campaign assignment
    const { data: campaign, error: campaignError } = await supabase
      .from('marketplace_campaigns')
      .select(`
        id,
        status,
        creator_id,
        title,
        brands!inner(user_id)
      `)
      .eq('id', campaign_id)
      .eq('creator_id', creatorAccount.id)
      .maybeSingle();

    if (campaignError || !campaign) {
      console.error('Campaign verification error:', campaignError);
      return new Response(
        JSON.stringify({ error: 'Campaign not found or you are not assigned to it' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (campaign.status !== 'in_progress') {
      return new Response(
        JSON.stringify({ error: 'Campaign is not in progress' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify asset exists and belongs to creator
    const { data: asset, error: assetError } = await supabase
      .from('brand_assets')
      .select('id, title')
      .eq('id', asset_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (assetError || !asset) {
      console.error('Asset verification error:', assetError);
      return new Response(
        JSON.stringify({ error: 'Asset not found or does not belong to you' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for existing deliverable
    const { data: existingDeliverable } = await supabase
      .from('marketplace_deliverables')
      .select('id')
      .eq('campaign_id', campaign_id)
      .eq('deliverable_type', deliverable_type)
      .maybeSingle();

    if (existingDeliverable) {
      return new Response(
        JSON.stringify({ error: 'Deliverable of this type already submitted for this campaign' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create deliverable
    const { data: deliverable, error: deliverableError } = await supabase
      .from('marketplace_deliverables')
      .insert({
        campaign_id,
        creator_id: creatorAccount.id,
        asset_id,
        deliverable_type,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (deliverableError) {
      console.error('Deliverable creation error:', deliverableError);
      return new Response(
        JSON.stringify({ error: 'Failed to create deliverable', details: deliverableError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification to brand
    await supabase.from('notifications').insert({
      user_id: campaign.brands.user_id,
      title: 'New Deliverable Submitted',
      message: `A deliverable has been submitted for "${campaign.title}"`,
      category: 'system',
      metadata: { campaign_id, deliverable_id: deliverable.id },
    });

    console.log('Deliverable submitted successfully:', deliverable.id);

    return new Response(
      JSON.stringify({ deliverable_id: deliverable.id, deliverable }),
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
