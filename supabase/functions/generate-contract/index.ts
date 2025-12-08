import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PLATFORM_FEE_PERCENTAGE = 10;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { campaignId, creatorId, agreedRateCents } = await req.json();

    if (!campaignId || !creatorId || !agreedRateCents) {
      return new Response(
        JSON.stringify({ error: "campaignId, creatorId, and agreedRateCents are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Generating contract for campaign ${campaignId}, creator ${creatorId}, rate ${agreedRateCents}`);

    // Fetch campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("marketplace_campaigns")
      .select(`
        *,
        brands:brand_id(id, name, user_id)
      `)
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      console.error("Campaign not found:", campaignError);
      return new Response(
        JSON.stringify({ error: "Campaign not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch creator profile
    const { data: creator } = await supabase
      .from("creator_accounts")
      .select("id, user_id")
      .eq("id", creatorId)
      .single();

    if (!creator) {
      return new Response(
        JSON.stringify({ error: "Creator not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: creatorProfile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", creator.user_id)
      .single();

    // Calculate payment split
    const platformFeeCents = Math.round(agreedRateCents * (PLATFORM_FEE_PERCENTAGE / 100));
    const creatorPayoutCents = agreedRateCents - platformFeeCents;

    // Build contract terms
    const contractTerms = {
      campaignTitle: campaign.title,
      campaignDescription: campaign.description,
      brandName: campaign.brands?.name || "Brand",
      creatorName: creatorProfile?.display_name || "Creator",
      deliverables: campaign.deliverables,
      requirements: campaign.requirements,
      deadline: campaign.deadline,
      paymentTerms: {
        totalAmount: agreedRateCents,
        platformFee: platformFeeCents,
        platformFeePercentage: PLATFORM_FEE_PERCENTAGE,
        creatorPayout: creatorPayoutCents,
        currency: "USD",
      },
      usageRights: "Brand receives full commercial usage rights for all deliverables upon approval and payment.",
      revisionPolicy: "Creator will provide up to 2 rounds of revisions at no additional cost.",
      cancellationPolicy: "Either party may cancel with 48 hours notice. Partial payment may apply for work completed.",
      confidentiality: "Both parties agree to keep project details confidential until content is published.",
      generatedAt: new Date().toISOString(),
    };

    // Build deliverables summary
    let deliverablesSummary = "";
    if (campaign.deliverables && typeof campaign.deliverables === "object") {
      const deliverablesObj = campaign.deliverables as Record<string, any>;
      deliverablesSummary = Object.entries(deliverablesObj)
        .map(([key, value]) => `${key}: ${value}`)
        .join("; ");
    }

    // Check if contract already exists
    const { data: existingContract } = await supabase
      .from("marketplace_contracts")
      .select("id")
      .eq("campaign_id", campaignId)
      .maybeSingle();

    if (existingContract) {
      // Update existing contract
      const { data: updatedContract, error: updateError } = await supabase
        .from("marketplace_contracts")
        .update({
          creator_id: creatorId,
          contract_terms: contractTerms,
          payment_amount_cents: agreedRateCents,
          platform_fee_cents: platformFeeCents,
          creator_payout_cents: creatorPayoutCents,
          deliverables_summary: deliverablesSummary,
          deadline: campaign.deadline,
          status: "pending_brand",
          brand_signed_at: null,
          creator_signed_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingContract.id)
        .select()
        .single();

      if (updateError) {
        console.error("Error updating contract:", updateError);
        throw updateError;
      }

      console.log(`Updated existing contract ${existingContract.id}`);
      return new Response(
        JSON.stringify({ contract: updatedContract }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new contract
    const { data: contract, error: contractError } = await supabase
      .from("marketplace_contracts")
      .insert({
        campaign_id: campaignId,
        brand_id: campaign.brands?.id || campaign.brand_id,
        creator_id: creatorId,
        contract_terms: contractTerms,
        payment_amount_cents: agreedRateCents,
        platform_fee_cents: platformFeeCents,
        creator_payout_cents: creatorPayoutCents,
        deliverables_summary: deliverablesSummary,
        deadline: campaign.deadline,
        status: "pending_brand",
      })
      .select()
      .single();

    if (contractError) {
      console.error("Error creating contract:", contractError);
      throw contractError;
    }

    console.log(`Created contract ${contract.id}`);

    return new Response(
      JSON.stringify({ contract }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-contract:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate contract" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
