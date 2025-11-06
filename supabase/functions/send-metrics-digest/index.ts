import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { digest_type } = await req.json();

    console.log(`Sending ${digest_type} metrics digest...`);

    // Get admins who want this digest
    const digestField = `${digest_type}_enabled`;
    const { data: admins, error: adminsError } = await supabase
      .from("admin_digest_preferences")
      .select("*")
      .eq(digestField, true);

    if (adminsError) {
      throw adminsError;
    }

    console.log(`Found ${admins?.length || 0} admins subscribed to ${digest_type} digest`);

    // Fetch current metrics
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Active users (last 24 hours)
    const { count: activeUsers } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", oneDayAgo.toISOString());

    // Failed jobs
    const { count: failedJobs } = await supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed");

    // Low balance users
    const { count: lowBalanceUsers } = await supabase
      .from("user_tokens")
      .select("*", { count: "exact", head: true })
      .lt("balance", 10);

    // Revenue today
    const { data: costData } = await supabase
      .from("api_cost_tracking")
      .select("cost_usd")
      .gte("created_at", oneDayAgo.toISOString());

    const revenueToday = costData?.reduce((sum, record) => sum + Number(record.cost_usd), 0) || 0;

    const metrics = {
      activeUsers: activeUsers || 0,
      failedJobs: failedJobs || 0,
      lowBalanceUsers: lowBalanceUsers || 0,
      revenueToday: revenueToday.toFixed(2),
      timestamp: now.toISOString(),
    };

    console.log("Metrics collected:", metrics);

    // In a real implementation, you would send emails here using a service like Resend
    // For now, we'll just log that we would send the email
    for (const admin of admins || []) {
      console.log(`Would send ${digest_type} digest to ${admin.admin_email}`);
      console.log("Metrics:", metrics);
      
      // TODO: Implement actual email sending using Resend or similar service
      // const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
      // await resend.emails.send({
      //   from: 'System Metrics <metrics@yourdomain.com>',
      //   to: admin.admin_email,
      //   subject: `${digest_type.charAt(0).toUpperCase() + digest_type.slice(1)} System Metrics Report`,
      //   html: generateEmailTemplate(metrics, digest_type),
      // });
    }

    return new Response(
      JSON.stringify({
        success: true,
        recipients: admins?.length || 0,
        metrics,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-metrics-digest:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

function generateEmailTemplate(metrics: any, digestType: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .metric-card { background: #f8f9fa; padding: 20px; margin: 15px 0; border-radius: 8px; border-left: 4px solid #667eea; }
          .metric-value { font-size: 32px; font-weight: bold; color: #667eea; }
          .metric-label { color: #6c757d; font-size: 14px; text-transform: uppercase; }
          .footer { text-align: center; padding: 20px; color: #6c757d; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${digestType.charAt(0).toUpperCase() + digestType.slice(1)} System Metrics Report</h1>
            <p>${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Active Users (24h)</div>
            <div class="metric-value">${metrics.activeUsers}</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Revenue Today</div>
            <div class="metric-value">$${metrics.revenueToday}</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Failed Jobs</div>
            <div class="metric-value">${metrics.failedJobs}</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-label">Low Balance Users</div>
            <div class="metric-value">${metrics.lowBalanceUsers}</div>
          </div>
          
          <div class="footer">
            <p>This is an automated report from your System Metrics Dashboard</p>
            <p><a href="#">View Full Dashboard</a> | <a href="#">Unsubscribe</a></p>
          </div>
        </div>
      </body>
    </html>
  `;
}