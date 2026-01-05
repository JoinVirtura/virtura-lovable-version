import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, attempt_type, success, failure_reason, metadata } = await req.json();

    // Validate required fields
    if (!email || !attempt_type) {
      console.error("[track-auth-attempt] Missing required fields:", { email, attempt_type });
      return new Response(
        JSON.stringify({ error: "Missing required fields: email and attempt_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate attempt_type
    if (!["login", "signup"].includes(attempt_type)) {
      console.error("[track-auth-attempt] Invalid attempt_type:", attempt_type);
      return new Response(
        JSON.stringify({ error: "Invalid attempt_type. Must be 'login' or 'signup'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get IP and user agent from request headers
    const ip_address = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                       req.headers.get("x-real-ip") || 
                       "unknown";
    const user_agent = req.headers.get("user-agent") || "unknown";

    // Create Supabase client with service role key for insert
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert auth attempt record
    const { data, error } = await supabase
      .from("auth_attempts")
      .insert({
        email: email.toLowerCase().trim(),
        attempt_type,
        success: success ?? false,
        failure_reason: failure_reason || null,
        ip_address,
        user_agent,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      console.error("[track-auth-attempt] Database insert error:", error);
      return new Response(
        JSON.stringify({ error: "Failed to track auth attempt" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("[track-auth-attempt] Successfully tracked:", {
      id: data.id,
      email: email.substring(0, 3) + "***",
      attempt_type,
      success,
    });

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[track-auth-attempt] Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
