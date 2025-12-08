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

    const { campaignId, category, budgetCents } = await req.json();

    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: "campaignId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Recommending creators for campaign ${campaignId}, category: ${category}, budget: ${budgetCents}`);

    // Fetch all approved creators with their performance data
    const { data: creators, error: creatorsError } = await supabase
      .from("creator_accounts")
      .select(`
        id,
        user_id,
        total_earnings_cents,
        onboarding_complete
      `)
      .eq("onboarding_complete", true);

    if (creatorsError) {
      console.error("Error fetching creators:", creatorsError);
      throw creatorsError;
    }

    if (!creators || creators.length === 0) {
      return new Response(
        JSON.stringify({ recommendations: [], message: "No creators available" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get creator profiles for display info
    const creatorUserIds = creators.map(c => c.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url, bio, account_type")
      .in("id", creatorUserIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    // Get completed campaigns per creator
    const { data: completedCampaigns } = await supabase
      .from("marketplace_campaigns")
      .select("creator_id, category, status")
      .eq("status", "completed");

    const campaignCountMap = new Map<string, { count: number; categories: string[] }>();
    completedCampaigns?.forEach(c => {
      if (c.creator_id) {
        const existing = campaignCountMap.get(c.creator_id) || { count: 0, categories: [] };
        existing.count++;
        if (c.category) existing.categories.push(c.category);
        campaignCountMap.set(c.creator_id, existing);
      }
    });

    // Get active campaigns per creator (to check availability)
    const { data: activeCampaigns } = await supabase
      .from("marketplace_campaigns")
      .select("creator_id")
      .eq("status", "in_progress");

    const activeCampaignMap = new Map<string, number>();
    activeCampaigns?.forEach(c => {
      if (c.creator_id) {
        activeCampaignMap.set(c.creator_id, (activeCampaignMap.get(c.creator_id) || 0) + 1);
      }
    });

    // Score and rank creators
    const recommendations = creators.map(creator => {
      const profile = profileMap.get(creator.user_id);
      const completedData = campaignCountMap.get(creator.id) || { count: 0, categories: [] };
      const activeCount = activeCampaignMap.get(creator.id) || 0;

      // Calculate match score (0-100)
      let score = 50; // Base score
      const reasons: string[] = [];

      // Category match bonus (+20)
      if (category && completedData.categories.includes(category)) {
        score += 20;
        reasons.push(`Experienced in ${category}`);
      }

      // Completed campaigns bonus (+15 max)
      const completionBonus = Math.min(completedData.count * 5, 15);
      score += completionBonus;
      if (completedData.count > 0) {
        reasons.push(`${completedData.count} completed campaign${completedData.count > 1 ? 's' : ''}`);
      }

      // Earnings indicate experience (+10 max)
      const earningsBonus = Math.min((creator.total_earnings_cents || 0) / 10000, 10);
      score += earningsBonus;
      if ((creator.total_earnings_cents || 0) > 50000) {
        reasons.push("Top performer");
      }

      // Availability bonus (+10 if not busy)
      if (activeCount === 0) {
        score += 10;
        reasons.push("Available now");
      } else if (activeCount <= 2) {
        score += 5;
      }

      // Cap score at 100
      score = Math.min(Math.round(score), 100);

      if (reasons.length === 0) {
        reasons.push("New to marketplace");
      }

      return {
        creatorId: creator.id,
        userId: creator.user_id,
        displayName: profile?.display_name || "Creator",
        avatarUrl: profile?.avatar_url,
        bio: profile?.bio,
        matchScore: score,
        reasons,
        completedCampaigns: completedData.count,
        totalEarnings: creator.total_earnings_cents || 0,
        activeCampaigns: activeCount,
      };
    });

    // Sort by score descending and take top 6
    const sortedRecommendations = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);

    console.log(`Returning ${sortedRecommendations.length} recommendations`);

    return new Response(
      JSON.stringify({ recommendations: sortedRecommendations }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in recommend-creators:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to get recommendations" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
