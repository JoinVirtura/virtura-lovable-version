import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!roleData || roleData.role !== 'admin') {
      throw new Error('Admin access required');
    }

    const { user_id, action, denial_reason } = await req.json();

    if (!user_id || !action || (action !== 'approve' && action !== 'deny')) {
      throw new Error('Invalid request');
    }

    if (action === 'deny' && !denial_reason) {
      throw new Error('Denial reason required');
    }

    // Update verification status
    const { error: updateError } = await supabaseClient
      .from('user_verification')
      .update({
        status: action === 'approve' ? 'approved' : 'denied',
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        denial_reason: action === 'deny' ? denial_reason : null,
      })
      .eq('user_id', user_id);

    if (updateError) throw updateError;

    // Send notification to user
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: user_id,
        title: action === 'approve' ? '🎉 Verification Approved!' : 'Verification Denied',
        message: action === 'approve' 
          ? 'Your identity has been verified! Subscribe now to get your verified badge for $9.99/month.'
          : `Your verification request was denied. ${denial_reason}`,
        category: 'account',
        priority: 'high',
        metadata: { 
          action, 
          denial_reason,
          action_url: action === 'approve' ? '/verification' : null,
          action_label: action === 'approve' ? 'Subscribe Now' : null,
        },
      });

    console.log(`[admin-review-verification] ${action} verification for user ${user_id}`);

    return new Response(
      JSON.stringify({ success: true, action }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[admin-review-verification] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
