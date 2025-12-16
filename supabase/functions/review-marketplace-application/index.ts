import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReviewRequest {
  application_id: string;
  action: "approve" | "deny";
  denial_reason?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get admin user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: adminUser }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !adminUser) {
      throw new Error("Unauthorized");
    }

    // Verify admin role
    const { data: adminRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", adminUser.id)
      .eq("role", "admin")
      .single();

    if (!adminRole) {
      throw new Error("Admin access required");
    }

    const { application_id, action, denial_reason }: ReviewRequest = await req.json();

    if (!application_id || !action) {
      throw new Error("Missing required fields: application_id and action");
    }

    // Get the application details
    const { data: application, error: appError } = await supabase
      .from("marketplace_access")
      .select("*")
      .eq("id", application_id)
      .single();

    if (appError || !application) {
      throw new Error("Application not found");
    }

    // Get user email from auth
    const { data: { user: applicantUser }, error: userError } = await supabase.auth.admin.getUserById(application.user_id);
    
    if (userError || !applicantUser) {
      console.error("Could not fetch user:", userError);
      throw new Error("Could not fetch applicant user");
    }

    const userEmail = applicantUser.email;
    const roleRequested = application.role_requested;

    // Update application status
    const updateData: any = {
      status: action === "approve" ? "approved" : "denied",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUser.id,
    };

    if (action === "deny" && denial_reason) {
      updateData.denial_reason = denial_reason;
    }

    const { error: updateError } = await supabase
      .from("marketplace_access")
      .update(updateData)
      .eq("id", application_id);

    if (updateError) {
      console.error("Update error:", updateError);
      throw new Error("Failed to update application");
    }

    // Send email notification
    let emailSubject: string;
    let emailHtml: string;

    if (action === "approve") {
      emailSubject = "🎉 Welcome to Virtura Marketplace!";
      
      if (roleRequested === "creator") {
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B5CF6, #EC4899); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .badge { display: inline-block; background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
              .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
              .feature-list li:last-child { border-bottom: none; }
              .cta { display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Congratulations!</h1>
              </div>
              <div class="content">
                <span class="badge">Creator Approved</span>
                <h2>You're now a Virtura Creator!</h2>
                <p>Your application to join the Virtura Marketplace as a Creator has been approved. You now have access to exciting collaboration opportunities!</p>
                
                <div class="feature-list">
                  <h3>What you can do now:</h3>
                  <ul>
                    <li>✅ Browse and apply to brand campaigns</li>
                    <li>✅ Receive direct invitations from brands</li>
                    <li>✅ Negotiate rates and deliverables</li>
                    <li>✅ Earn 90% of campaign payments</li>
                    <li>✅ Build your creator portfolio</li>
                  </ul>
                </div>
                
                <p>Ready to start earning? Visit the Marketplace to explore available campaigns.</p>
                
                <a href="https://virtura.app/dashboard?view=marketplace" class="cta">Go to Marketplace</a>
                
                <div class="footer">
                  <p>Welcome to the Virtura creator community! 🚀</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
      } else {
        emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #8B5CF6, #3B82F6); padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
              .badge { display: inline-block; background: #3B82F6; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-bottom: 20px; }
              .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .feature-list li { padding: 8px 0; border-bottom: 1px solid #eee; }
              .feature-list li:last-child { border-bottom: none; }
              .cta { display: inline-block; background: #3B82F6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Welcome Aboard!</h1>
              </div>
              <div class="content">
                <span class="badge">Brand Approved</span>
                <h2>Your Brand Account is Ready!</h2>
                <p>Your application to join the Virtura Marketplace as a Brand has been approved. You can now connect with talented creators!</p>
                
                <div class="feature-list">
                  <h3>What you can do now:</h3>
                  <ul>
                    <li>✅ Create campaigns with detailed briefs</li>
                    <li>✅ Browse AI-recommended creators</li>
                    <li>✅ Invite creators directly to campaigns</li>
                    <li>✅ Review applications and portfolios</li>
                    <li>✅ Manage deliverables and payments</li>
                  </ul>
                </div>
                
                <p>Ready to launch your first campaign? Head to the Marketplace to get started.</p>
                
                <a href="https://virtura.app/dashboard?view=marketplace" class="cta">Create Campaign</a>
                
                <div class="footer">
                  <p>Let's build something amazing together! 🚀</p>
                </div>
              </div>
            </div>
          </body>
          </html>
        `;
      }
    } else {
      emailSubject = "Marketplace Application Update";
      emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #374151; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
            .header h1 { color: white; margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
            .reason-box { background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0; }
            .encouragement { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .cta { display: inline-block; background: #6B7280; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Application Update</h1>
            </div>
            <div class="content">
              <h2>Your Marketplace Application</h2>
              <p>Thank you for your interest in joining the Virtura Marketplace. After careful review, we were unable to approve your application at this time.</p>
              
              ${denial_reason ? `
              <div class="reason-box">
                <strong>Feedback from our team:</strong>
                <p>${denial_reason}</p>
              </div>
              ` : ''}
              
              <div class="encouragement">
                <h3>💡 What's Next?</h3>
                <p>We encourage you to:</p>
                <ul>
                  <li>Review and strengthen your portfolio</li>
                  <li>Build more experience on the platform</li>
                  <li>Reapply when you feel ready</li>
                </ul>
              </div>
              
              <p>We appreciate your interest and hope to see you succeed!</p>
              
              <div class="footer">
                <p>Questions? Contact our support team.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }

    // Send email
    if (userEmail) {
      try {
        await resend.emails.send({
          from: "Virtura <notifications@resend.dev>",
          to: [userEmail],
          subject: emailSubject,
          html: emailHtml,
        });
        console.log("Email sent successfully to:", userEmail);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
        // Don't throw - email failure shouldn't break the approval
      }
    }

    // Create in-app notification
    const notificationTitle = action === "approve" 
      ? `🎉 Marketplace Access Approved!`
      : `Marketplace Application Update`;
    
    const notificationMessage = action === "approve"
      ? `Your ${roleRequested} application has been approved! Visit the Marketplace to get started.`
      : `Your marketplace application was not approved. ${denial_reason ? `Reason: ${denial_reason}` : 'Please contact support for more information.'}`;

    await supabase
      .from("notifications")
      .insert({
        user_id: application.user_id,
        title: notificationTitle,
        message: notificationMessage,
        category: "account",
        priority: action === "approve" ? "high" : "normal",
        metadata: {
          type: "marketplace_review",
          action,
          role: roleRequested,
        },
      });

    console.log(`Application ${application_id} ${action}ed by admin ${adminUser.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Application ${action}ed successfully`,
        email_sent: !!userEmail 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error reviewing application:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
