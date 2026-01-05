import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Verify the requesting user is authenticated
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify JWT and get user
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user is admin using user_roles table
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      console.log("Non-admin user attempted to search users:", user.id);
      return new Response(JSON.stringify({ error: "Forbidden - Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { searchQuery } = await req.json();
    
    if (!searchQuery || searchQuery.length < 2) {
      return new Response(JSON.stringify({ users: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Admin searching users with query:", searchQuery);

    // Search auth.users by email using admin API
    const { data: authData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      perPage: 50,
    });

    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    // Filter users by email match
    const matchingAuthUsers = authData.users.filter(u => 
      u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20);

    const userIds = matchingAuthUsers.map(u => u.id);

    if (userIds.length === 0) {
      return new Response(JSON.stringify({ users: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get profile data for matching users
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);

    // Get token balances
    const { data: tokens } = await supabaseAdmin
      .from("user_tokens")
      .select("user_id, balance")
      .in("user_id", userIds);

    // Combine data
    const users = matchingAuthUsers.map(authUser => {
      const profile = profiles?.find(p => p.id === authUser.id);
      const tokenData = tokens?.find(t => t.user_id === authUser.id);
      
      return {
        id: authUser.id,
        email: authUser.email,
        display_name: profile?.display_name || null,
        avatar_url: profile?.avatar_url || null,
        balance: tokenData?.balance || 0,
      };
    });

    console.log(`Found ${users.length} users matching email query`);

    return new Response(JSON.stringify({ users }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in admin-search-users:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
