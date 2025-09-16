import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Invalid authorization');
    }

    const { title, description, metadata = {} } = await req.json();

    if (!title) {
      throw new Error('Project title is required');
    }

    // Check project limits
    const { data: subscription } = await supabaseClient
      .from('subscriptions')
      .select('plan_name')
      .eq('user_id', user.id)
      .single();

    const planName = subscription?.plan_name || 'free';
    const projectLimits = {
      free: 3,
      pro: 25,
      enterprise: -1
    };

    const limit = projectLimits[planName as keyof typeof projectLimits] || 3;

    if (limit !== -1) {
      const { count } = await supabaseClient
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (count && count >= limit) {
        throw new Error(`Project limit reached. Upgrade to create more projects.`);
      }
    }

    // Create project
    const { data: project, error: projectError } = await supabaseClient
      .from('projects')
      .insert({
        user_id: user.id,
        title,
        description,
        status: 'draft',
        metadata: {
          ...metadata,
          created_from: 'api',
          wizard_step: 1
        }
      })
      .select()
      .single();

    if (projectError) {
      throw projectError;
    }

    // Track usage
    await supabaseClient
      .from('usage_tracking')
      .insert({
        user_id: user.id,
        resource_type: 'projects',
        amount: 1,
        metadata: { project_id: project.id }
      });

    // Initialize user role if not exists
    const { data: existingRole } = await supabaseClient
      .from('user_roles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!existingRole) {
      await supabaseClient
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: 'owner'
        });
    }

    return new Response(JSON.stringify({
      success: true,
      project,
      message: 'Project created successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Project creation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});