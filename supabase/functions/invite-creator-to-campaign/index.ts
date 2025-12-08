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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { campaignId, creatorId, message } = await req.json();

    if (!campaignId || !creatorId) {
      return new Response(JSON.stringify({ error: "Missing campaignId or creatorId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Sending invite for campaign ${campaignId} to creator ${creatorId}`);

    // Get campaign details and verify user owns the brand
    const { data: campaign, error: campaignError } = await supabase
      .from("marketplace_campaigns")
      .select(`
        id, 
        title, 
        description, 
        budget_cents, 
        deadline,
        brand:brands!inner(id, name, logo_url, user_id)
      `)
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign fetch error:", campaignError);
      return new Response(JSON.stringify({ error: "Campaign not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user owns the brand
    if ((campaign.brand as any).user_id !== user.id) {
      return new Response(JSON.stringify({ error: "Unauthorized - not campaign owner" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get creator account and user details
    const { data: creatorAccount, error: creatorError } = await supabase
      .from("creator_accounts")
      .select("id, user_id")
      .eq("id", creatorId)
      .single();

    if (creatorError || !creatorAccount) {
      console.error("Creator fetch error:", creatorError);
      return new Response(JSON.stringify({ error: "Creator not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if invite already exists
    const { data: existingInvite } = await supabase
      .from("campaign_invites")
      .select("id, status")
      .eq("campaign_id", campaignId)
      .eq("creator_id", creatorId)
      .single();

    if (existingInvite) {
      return new Response(JSON.stringify({ 
        error: "Invite already sent",
        status: existingInvite.status 
      }), {
        status: 409,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create the invite
    const { data: invite, error: inviteError } = await supabase
      .from("campaign_invites")
      .insert({
        campaign_id: campaignId,
        brand_id: (campaign.brand as any).id,
        creator_id: creatorId,
        message: message || null,
      })
      .select()
      .single();

    if (inviteError) {
      console.error("Invite creation error:", inviteError);
      return new Response(JSON.stringify({ error: "Failed to create invite" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Invite created:", invite.id);

    // Create in-app notification
    await supabase
      .from("notifications")
      .insert({
        user_id: creatorAccount.user_id,
        title: "New Campaign Invitation",
        message: `${(campaign.brand as any).name} has invited you to apply for "${campaign.title}"`,
        category: "product",
        priority: "high",
        metadata: {
          invite_id: invite.id,
          campaign_id: campaignId,
          brand_name: (campaign.brand as any).name,
        },
      });

    // Send email notification if Resend is configured
    if (resendApiKey) {
      const { data: creatorProfile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", creatorAccount.user_id)
        .single();

      const { data: authUser } = await supabase.auth.admin.getUserById(creatorAccount.user_id);
      const creatorEmail = authUser?.user?.email;

      if (creatorEmail) {
        try {
          await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${resendApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              from: "Virtura <noreply@virtura.com>",
              to: [creatorEmail],
              subject: `You've been invited to ${campaign.title}`,
              html: `
                <h2>You've Been Invited!</h2>
                <p>Hi ${creatorProfile?.display_name || 'Creator'},</p>
                <p><strong>${(campaign.brand as any).name}</strong> has invited you to apply for their campaign:</p>
                <h3>${campaign.title}</h3>
                <p>${campaign.description || ''}</p>
                <p><strong>Budget:</strong> $${((campaign.budget_cents || 0) / 100).toLocaleString()}</p>
                ${message ? `<p><strong>Personal message:</strong> "${message}"</p>` : ''}
                <p>Log in to Virtura to view and respond to this invitation.</p>
              `,
            }),
          });
          console.log("Email sent successfully");
        } catch (emailError) {
          console.error("Email send error:", emailError);
          // Don't fail the request if email fails
        }
      }
    }

    return new Response(JSON.stringify({ success: true, invite }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Invite error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
