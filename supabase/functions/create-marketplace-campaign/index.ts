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

    const {
      title,
      description,
      budget_cents,
      deliverables,
      requirements,
      deadline,
      category,
      visibility = 'public',
      brand_id
    } = await req.json();

    console.log('Creating marketplace campaign:', { title, brand_id, budget_cents });

    // Validate required fields
    if (!title || !budget_cents || !deliverables || !brand_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: title, budget_cents, deliverables, brand_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate budget minimum
    if (budget_cents < 10000) { // $100 minimum
      return new Response(
        JSON.stringify({ error: 'Minimum budget is $100' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify brand ownership
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('id', brand_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (brandError || !brand) {
      console.error('Brand verification error:', brandError);
      return new Response(
        JSON.stringify({ error: 'Brand not found or not owned by user' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('marketplace_campaigns')
      .insert({
        brand_id,
        title,
        description,
        budget_cents,
        deliverables,
        requirements,
        deadline,
        category,
        visibility,
        status: 'open',
      })
      .select()
      .single();

    if (campaignError) {
      console.error('Campaign creation error:', campaignError);
      return new Response(
        JSON.stringify({ error: 'Failed to create campaign', details: campaignError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Campaign created successfully:', campaign.id);

    return new Response(
      JSON.stringify({ campaign_id: campaign.id, campaign }),
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
