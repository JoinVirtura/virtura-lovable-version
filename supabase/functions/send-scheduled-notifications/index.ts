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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[send-scheduled-notifications] Running scheduled notification checks...');

    let trialNotificationsCount = 0;
    let graceExpiredCount = 0;

    // 1. Check for trial expiration notifications (3 days, 1 day, today)
    const trialDaysList = [3, 1, 0];
    
    for (const daysRemaining of trialDaysList) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysRemaining);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      // Get creator subscriptions with expiring trials
      const { data: expiringTrials } = await supabase
        .from('creator_subscriptions')
        .select(`
          id,
          trial_end,
          creator_id,
          creator_accounts!inner(user_id)
        `)
        .eq('status', 'trialing')
        .not('trial_end', 'is', null);

      for (const trial of expiringTrials || []) {
        const trialEndDate = new Date(trial.trial_end).toISOString().split('T')[0];
        if (trialEndDate !== targetDateStr) continue;

        const userId = (trial.creator_accounts as any).user_id;
        
        // Check if notification already sent today
        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('title', daysRemaining === 0 ? 'Trial Expires Today' : daysRemaining === 1 ? 'Trial Ends Tomorrow' : 'Trial Ending Soon')
          .gte('created_at', new Date().toISOString().split('T')[0])
          .maybeSingle();

        if (existingNotification) continue;

        // Send notification
        const titles = {
          3: 'Trial Ending Soon',
          1: 'Trial Ends Tomorrow',
          0: 'Trial Expires Today',
        };
        const messages = {
          3: 'Your subscription trial ends in 3 days. Subscribe now to keep your benefits!',
          1: 'Your subscription trial ends tomorrow! Subscribe now to avoid interruption.',
          0: 'Your subscription trial expires today. Subscribe now to continue enjoying premium features!',
        };

        await supabase.from('notifications').insert({
          user_id: userId,
          title: titles[daysRemaining as keyof typeof titles],
          message: messages[daysRemaining as keyof typeof messages],
          category: 'billing',
          priority: 'high',
          metadata: {
            subscription_id: trial.id,
            trial_end: trial.trial_end,
            days_remaining: daysRemaining,
          },
        });

        trialNotificationsCount++;
        console.log(`[send-scheduled-notifications] Sent trial notification to user ${userId} (${daysRemaining} days remaining)`);
      }
    }

    // 2. Check for verification grace period expirations
    const { data: expiredGracePeriods } = await supabase
      .from('user_verification')
      .select('id, user_id')
      .eq('subscription_status', 'grace_period')
      .not('badge_expires_at', 'is', null)
      .lt('badge_expires_at', new Date().toISOString());

    for (const verification of expiredGracePeriods || []) {
      // Update status to expired
      await supabase
        .from('user_verification')
        .update({
          subscription_status: 'expired',
          updated_at: new Date().toISOString(),
        })
        .eq('id', verification.id);

      // Send notification
      await supabase.from('notifications').insert({
        user_id: verification.user_id,
        title: 'Verification Badge Removed',
        message: 'Your verification badge has been removed due to subscription cancellation. Resubscribe to restore your verified status.',
        category: 'account',
        priority: 'high',
        metadata: { verification_id: verification.id },
      });

      graceExpiredCount++;
      console.log(`[send-scheduled-notifications] Removed verification badge for user ${verification.user_id}`);
    }

    console.log(`[send-scheduled-notifications] Complete. Trial notifications: ${trialNotificationsCount}, Grace expirations: ${graceExpiredCount}`);

    return new Response(
      JSON.stringify({
        success: true,
        trialNotifications: trialNotificationsCount,
        graceExpirations: graceExpiredCount,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[send-scheduled-notifications] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});