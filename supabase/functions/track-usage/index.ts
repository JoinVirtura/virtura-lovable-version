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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Verify user with anon key
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { resource_type, amount = 1, metadata = {} } = await req.json();
    
    // Input validation
    const validResources = ['voice_generation', 'video_generation', 'storage', 'avatar_generation', 'image_generation'];
    if (!resource_type || !validResources.includes(resource_type)) {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid resource_type. Must be one of: ' + validResources.join(', ') 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (typeof amount !== 'number' || amount < 1 || amount > 1000) {
      return new Response(
        JSON.stringify({ error: 'Amount must be a number between 1 and 1000' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to insert usage tracking
    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    
    const { error: insertError } = await serviceClient
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        resource_type,
        amount,
        metadata: {
          ...metadata,
          tracked_at: new Date().toISOString()
        }
      });

    if (insertError) {
      console.error('Usage tracking insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to track usage' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Usage tracked: ${user.id} - ${resource_type} (${amount})`);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Track usage error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
