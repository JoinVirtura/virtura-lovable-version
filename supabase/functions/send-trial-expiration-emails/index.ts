import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    console.log("Checking for trials expiring in 1 day...");

    // Get trials expiring in approximately 24 hours (between 23 and 25 hours from now)
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 23);
    const dayAfter = new Date();
    dayAfter.setHours(dayAfter.getHours() + 25);

    const { data: expiringTrials, error: fetchError } = await supabase
      .from("subscriptions")
      .select(`
        user_id,
        trial_end,
        trial_plan_name
      `)
      .eq("status", "trialing")
      .gte("trial_end", tomorrow.toISOString())
      .lte("trial_end", dayAfter.toISOString());

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${expiringTrials?.length || 0} trials expiring soon`);

    if (!expiringTrials || expiringTrials.length === 0) {
      return new Response(
        JSON.stringify({ success: true, sent: 0, message: "No trials expiring" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let sentCount = 0;
    let errorCount = 0;

    for (const trial of expiringTrials) {
      try {
        // Get user email
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
          trial.user_id
        );

        if (userError || !userData.user?.email) {
          console.error(`Could not get email for user ${trial.user_id}:`, userError);
          errorCount++;
          continue;
        }

        const userEmail = userData.user.email;
        const trialEndDate = new Date(trial.trial_end);
        const hoursRemaining = Math.round((trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60));

        console.log(`Sending trial expiration email to ${userEmail}`);

        const emailResponse = await resend.emails.send({
          from: "Virtura <onboarding@resend.dev>",
          to: [userEmail],
          subject: `Your ${trial.trial_plan_name || 'Pro'} Trial Ends Tomorrow!`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Your Trial is Ending Soon!</h1>
                </div>
                
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">Hi there,</p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Your <strong>${trial.trial_plan_name || 'Pro'} trial</strong> will expire in approximately <strong>${hoursRemaining} hours</strong>.
                  </p>
                  
                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 25px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #92400e; font-size: 14px;">
                      <strong>⚠️ Don't lose access!</strong><br>
                      After your trial ends, you'll lose access to premium features including AI generation, advanced analytics, and unlimited storage.
                    </p>
                  </div>
                  
                  <h3 style="color: #1f2937; margin-top: 25px; margin-bottom: 15px;">What you'll miss:</h3>
                  <ul style="color: #4b5563; font-size: 15px; line-height: 1.8;">
                    <li>Unlimited AI image & video generation</li>
                    <li>Advanced voice synthesis</li>
                    <li>Premium brand management tools</li>
                    <li>Priority support</li>
                    <li>Unlimited storage</li>
                  </ul>
                  
                  <div style="text-align: center; margin: 35px 0;">
                    <a href="https://ujaoziqnxhjqlmnvlxav.supabase.co/dashboard" 
                       style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      Upgrade Now & Save 20%
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    Questions? Reply to this email or contact our support team.
                  </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                  <p>Virtura - AI Content Creation Platform</p>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`Email sent successfully to ${userEmail}:`, emailResponse);
        sentCount++;

        // Create an in-app notification as well
        await supabase.from("notifications").insert({
          user_id: trial.user_id,
          title: "Trial Ending Soon",
          message: `Your ${trial.trial_plan_name || 'Pro'} trial ends in ${hoursRemaining} hours. Upgrade now to keep your premium features!`,
          category: "billing",
          priority: "high",
          metadata: {
            trial_end: trial.trial_end,
            action: "upgrade",
          },
        });

      } catch (error) {
        console.error(`Error sending email for user ${trial.user_id}:`, error);
        errorCount++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        errors: errorCount,
        total: expiringTrials.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-trial-expiration-emails:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
