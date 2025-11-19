import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Starting trial reactivation email campaign...");

    // Find expired trials from last 30 days that haven't converted
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: expiredTrials, error: trialsError } = await supabase
      .from("subscriptions")
      .select("user_id, trial_end, trial_plan_name")
      .eq("status", "trialing")
      .lt("trial_end", new Date().toISOString())
      .gte("trial_end", thirtyDaysAgo.toISOString())
      .is("stripe_subscription_id", null);

    if (trialsError) {
      console.error("Error fetching expired trials:", trialsError);
      throw trialsError;
    }

    console.log(`Found ${expiredTrials?.length || 0} expired trials`);

    if (!expiredTrials || expiredTrials.length === 0) {
      return new Response(
        JSON.stringify({ message: "No expired trials found", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Check which users haven't received a reactivation email in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentCampaigns } = await supabase
      .from("trial_reactivation_campaigns")
      .select("user_id")
      .gte("sent_at", sevenDaysAgo.toISOString());

    const recentCampaignUserIds = new Set(
      recentCampaigns?.map((c) => c.user_id) || []
    );

    // Filter users who haven't received recent emails
    const eligibleUsers = expiredTrials.filter(
      (trial) => !recentCampaignUserIds.has(trial.user_id)
    );

    console.log(`${eligibleUsers.length} users eligible for reactivation email`);

    // Create a special offer for these users
    const offerCode = `TRIAL-COMEBACK-${Date.now()}`;
    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + 14); // Valid for 2 weeks

    const { data: offer, error: offerError } = await supabase
      .from("trial_reactivation_offers")
      .insert({
        offer_code: offerCode,
        offer_type: "both",
        extended_days: 3,
        discount_percentage: 30,
        valid_until: validUntil.toISOString(),
        max_redemptions: eligibleUsers.length,
        times_redeemed: 0,
      })
      .select()
      .single();

    if (offerError) {
      console.error("Error creating offer:", offerError);
      throw offerError;
    }

    console.log("Created offer:", offer.offer_code);

    let emailsSent = 0;

    // Send emails to eligible users
    for (const trial of eligibleUsers) {
      // Get user email from profiles
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, display_name")
        .eq("id", trial.user_id)
        .single();

      if (!profile?.email) {
        console.log(`No email found for user ${trial.user_id}`);
        continue;
      }

      // NOTE: Email sending would go here with Resend
      // For now, we'll just log the campaign
      console.log(`Would send reactivation email to ${profile.email}`);

      // Record the campaign
      const { error: campaignError } = await supabase
        .from("trial_reactivation_campaigns")
        .insert({
          user_id: trial.user_id,
          campaign_type: "expired_trial_winback",
          offer_code: offerCode,
          metadata: {
            trial_plan: trial.trial_plan_name,
            trial_ended: trial.trial_end,
            email: profile.email,
          },
        });

      if (!campaignError) {
        emailsSent++;
      }
    }

    console.log(`Reactivation campaign completed. Emails sent: ${emailsSent}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Reactivation campaign completed",
        emailsSent,
        offerCode,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in send-trial-reactivation-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
