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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { contractId, signerType } = await req.json();

    if (!contractId || !signerType) {
      return new Response(
        JSON.stringify({ error: "contractId and signerType are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["brand", "creator"].includes(signerType)) {
      return new Response(
        JSON.stringify({ error: "signerType must be 'brand' or 'creator'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Signing contract ${contractId} as ${signerType} by user ${user.id}`);

    // Fetch contract
    const { data: contract, error: contractError } = await supabase
      .from("marketplace_contracts")
      .select("*, campaign:campaign_id(*)")
      .eq("id", contractId)
      .single();

    if (contractError || !contract) {
      console.error("Contract not found:", contractError);
      return new Response(
        JSON.stringify({ error: "Contract not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is authorized to sign
    if (signerType === "brand") {
      const { data: brand } = await supabase
        .from("brands")
        .select("id")
        .eq("id", contract.brand_id)
        .eq("user_id", user.id)
        .single();

      if (!brand) {
        return new Response(
          JSON.stringify({ error: "You are not authorized to sign as brand" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else {
      const { data: creator } = await supabase
        .from("creator_accounts")
        .select("id")
        .eq("id", contract.creator_id)
        .eq("user_id", user.id)
        .single();

      if (!creator) {
        return new Response(
          JSON.stringify({ error: "You are not authorized to sign as creator" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Update signature
    const now = new Date().toISOString();
    const updateData: Record<string, any> = {
      updated_at: now,
    };

    if (signerType === "brand") {
      updateData.brand_signed_at = now;
      // If brand is first to sign, update status
      if (!contract.creator_signed_at) {
        updateData.status = "pending_creator";
      }
    } else {
      updateData.creator_signed_at = now;
      // If creator is first to sign, update status
      if (!contract.brand_signed_at) {
        updateData.status = "pending_brand";
      }
    }

    // Check if both have signed
    const brandSigned = signerType === "brand" || contract.brand_signed_at;
    const creatorSigned = signerType === "creator" || contract.creator_signed_at;

    if (brandSigned && creatorSigned) {
      updateData.status = "signed";
      
      // Update campaign to in_progress
      await supabase
        .from("marketplace_campaigns")
        .update({
          status: "in_progress",
          creator_id: contract.creator_id,
          creator_rate_cents: contract.payment_amount_cents,
          updated_at: now,
        })
        .eq("id", contract.campaign_id);

      console.log(`Both parties signed. Campaign ${contract.campaign_id} now in_progress`);
    }

    const { data: updatedContract, error: updateError } = await supabase
      .from("marketplace_contracts")
      .update(updateData)
      .eq("id", contractId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating contract:", updateError);
      throw updateError;
    }

    console.log(`Contract ${contractId} signed by ${signerType}. Status: ${updatedContract.status}`);

    return new Response(
      JSON.stringify({ 
        contract: updatedContract,
        message: updatedContract.status === "signed" 
          ? "Contract fully signed! Campaign is now in progress." 
          : `Signed as ${signerType}. Awaiting other party's signature.`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in sign-contract:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to sign contract" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
