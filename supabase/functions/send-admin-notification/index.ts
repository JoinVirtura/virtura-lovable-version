import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';
import { logAdminAction } from '../_shared/audit-logger.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const { targetAudience, notificationType, subject, message } = await req.json();

    if (!targetAudience || !notificationType || !subject || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get target users based on audience
    let targetUserIds: string[] = [];
    
    switch (targetAudience) {
      case 'all_users': {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id');
        targetUserIds = profiles?.map(p => p.id) || [];
        break;
      }
      case 'active_users': {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: activity } = await supabase
          .from('token_transactions')
          .select('user_id')
          .gte('created_at', thirtyDaysAgo.toISOString());
        
        targetUserIds = [...new Set(activity?.map(a => a.user_id) || [])];
        break;
      }
      case 'low_balance_users': {
        const { data: tokens } = await supabase
          .from('user_tokens')
          .select('user_id')
          .lt('balance', 10);
        
        targetUserIds = tokens?.map(t => t.user_id) || [];
        break;
      }
      case 'premium_subscribers': {
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('status', 'active');
        
        targetUserIds = subs?.map(s => s.user_id) || [];
        break;
      }
      default:
        return new Response(JSON.stringify({ error: 'Invalid target audience' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Create in-app notifications
    if (notificationType === 'in_app' || notificationType === 'both') {
      const notifications = targetUserIds.map(userId => ({
        user_id: userId,
        title: subject,
        message: message,
      }));

      await supabase.from('notifications').insert(notifications);
    }

    // Log admin notification
    const { data: notificationRecord } = await supabase
      .from('admin_notifications')
      .insert({
        admin_id: user.id,
        admin_email: user.email,
        subject,
        message,
        target_audience: targetAudience,
        notification_type: notificationType,
        recipient_count: targetUserIds.length,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    // Log audit entry
    await logAdminAction({
      adminId: user.id,
      adminEmail: user.email!,
      actionType: 'send_notification',
      targetType: 'users',
      targetId: notificationRecord?.id,
      details: {
        target_audience: targetAudience,
        notification_type: notificationType,
        subject,
        recipient_count: targetUserIds.length,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        recipientCount: targetUserIds.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Send notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
