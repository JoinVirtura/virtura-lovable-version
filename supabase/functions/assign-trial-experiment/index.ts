import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.55.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssignmentRequest {
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { userId }: AssignmentRequest = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Assigning trial experiment for user ${userId}`);

    // Check for active experiment
    const { data: experimentJson, error: expError } = await supabase.rpc(
      "get_active_trial_experiment"
    );

    if (expError) {
      console.error("Error fetching active experiment:", expError);
      throw expError;
    }

    if (!experimentJson) {
      console.log("No active experiment found, using default 7-day trial");
      return new Response(
        JSON.stringify({ trialDays: 7, experimentAssigned: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    const experiment = experimentJson;
    console.log(`Active experiment found: ${experiment.name}`);

    // Check if user already assigned
    const { data: existingAssignment } = await supabase
      .from("trial_experiment_assignments")
      .select("*")
      .eq("experiment_id", experiment.id)
      .eq("user_id", userId)
      .single();

    if (existingAssignment) {
      console.log(`User already assigned to variant: ${existingAssignment.variant_name}`);
      return new Response(
        JSON.stringify({
          trialDays: existingAssignment.trial_days,
          experimentAssigned: true,
          variantName: existingAssignment.variant_name,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
      );
    }

    // Random assignment based on weights
    const variants = experiment.variants;
    const totalWeight = variants.reduce((sum: number, v: any) => sum + (v.weight || 0), 0);
    const random = Math.random() * totalWeight;
    
    let cumulativeWeight = 0;
    let selectedVariant = variants[0];
    
    for (const variant of variants) {
      cumulativeWeight += variant.weight || 0;
      if (random <= cumulativeWeight) {
        selectedVariant = variant;
        break;
      }
    }

    console.log(`Assigning user to variant: ${selectedVariant.name} (${selectedVariant.trial_days} days)`);

    // Create assignment
    const { error: assignError } = await supabase
      .from("trial_experiment_assignments")
      .insert({
        experiment_id: experiment.id,
        user_id: userId,
        variant_name: selectedVariant.name,
        trial_days: selectedVariant.trial_days,
        metadata: {
          experiment_name: experiment.name,
          variant_weight: selectedVariant.weight,
        },
      });

    if (assignError) {
      console.error("Error creating assignment:", assignError);
      throw assignError;
    }

    return new Response(
      JSON.stringify({
        trialDays: selectedVariant.trial_days,
        experimentAssigned: true,
        variantName: selectedVariant.name,
        experimentName: experiment.name,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("Error in assign-trial-experiment:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
