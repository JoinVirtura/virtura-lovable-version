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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      throw new Error("Unauthorized");
    }

    const { feature_name } = await req.json();

    if (!feature_name) {
      throw new Error("Feature name is required");
    }

    console.log(`Tracking feature usage: ${feature_name} for user ${user.id}`);

    // Check if user is on trial
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user.id)
      .eq("status", "trialing")
      .single();

    if (!subscription) {
      return new Response(
        JSON.stringify({ success: true, message: "Not on trial" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update or insert feature usage
    const { error: upsertError } = await supabase
      .from("trial_feature_usage")
      .upsert({
        user_id: user.id,
        feature_name,
        trial_id: subscription.id,
        usage_count: 1,
        last_used_at: new Date().toISOString(),
      }, {
        onConflict: "user_id,feature_name,trial_id",
        ignoreDuplicates: false,
      });

    if (upsertError) {
      // If upsert fails due to unique constraint, increment the count
      const { data: existing } = await supabase
        .from("trial_feature_usage")
        .select("usage_count")
        .eq("user_id", user.id)
        .eq("feature_name", feature_name)
        .eq("trial_id", subscription.id)
        .single();

      if (existing) {
        await supabase
          .from("trial_feature_usage")
          .update({
            usage_count: existing.usage_count + 1,
            last_used_at: new Date().toISOString(),
          })
          .eq("user_id", user.id)
          .eq("feature_name", feature_name)
          .eq("trial_id", subscription.id);
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error tracking feature usage:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
