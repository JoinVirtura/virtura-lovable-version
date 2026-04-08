import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Plan tier ordering (higher = more expensive)
const PLAN_TIER: Record<string, number> = {
  starter: 1,
  pro: 2,
  scale: 3,
};

const PLAN_PRICE_CENTS: Record<string, number> = {
  starter: 2900,
  pro: 12900,
  scale: 17900,
};

const PLAN_NAMES: Record<string, string> = {
  starter: "Virtura Starter Plan",
  pro: "Virtura Pro Plan",
  scale: "Virtura Scale Plan",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { newPlan } = await req.json();
    if (!newPlan || !PLAN_TIER[newPlan]) {
      return new Response(
        JSON.stringify({ error: "Invalid plan. Must be one of: starter, pro, scale" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, anonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !userData.user?.email) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = userData.user.id;
    const customerEmail = userData.user.email;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // Find Stripe customer
    const customers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    if (customers.data.length === 0) {
      return new Response(
        JSON.stringify({ error: "No Stripe customer found. Please subscribe first." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const customerId = customers.data[0].id;

    // Find current active subscription
    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });
    const currentSub = subs.data.find(s => ["active", "trialing", "past_due"].includes(s.status));

    if (!currentSub) {
      return new Response(
        JSON.stringify({ error: "No active subscription found. Use checkout to subscribe." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentPlan = currentSub.metadata?.plan || "unknown";
    if (currentPlan === newPlan) {
      return new Response(
        JSON.stringify({ error: `Already subscribed to ${newPlan} plan` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const currentTier = PLAN_TIER[currentPlan] || 0;
    const newTier = PLAN_TIER[newPlan];
    const isUpgrade = newTier > currentTier;

    console.log(`📊 Subscription change: ${currentPlan} → ${newPlan} (${isUpgrade ? "UPGRADE" : "DOWNGRADE"})`);

    // Get the current subscription item ID (needed to swap the price)
    const itemId = currentSub.items.data[0]?.id;
    if (!itemId) throw new Error("Could not find subscription item");

    if (isUpgrade) {
      // ── UPGRADE: Apply immediately with proration ──────────────
      // Stripe will charge the prorated difference automatically
      const updated = await stripe.subscriptions.update(currentSub.id, {
        items: [
          {
            id: itemId,
            price_data: {
              currency: "usd",
              product_data: { name: PLAN_NAMES[newPlan] },
              unit_amount: PLAN_PRICE_CENTS[newPlan],
              recurring: { interval: "month" },
            },
          },
        ],
        proration_behavior: "create_prorations",
        metadata: { ...currentSub.metadata, plan: newPlan, user_id: userId },
      });

      console.log(`✅ Upgraded subscription ${updated.id} to ${newPlan} (prorated)`);

      return new Response(
        JSON.stringify({
          success: true,
          action: "upgraded",
          fromPlan: currentPlan,
          toPlan: newPlan,
          subscriptionId: updated.id,
          message: `Upgraded to ${newPlan}. You'll be charged the prorated difference.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      // ── DOWNGRADE: Schedule for end of current period ─────────
      // Use a subscription schedule so the change takes effect at period end
      // without losing benefits in the current cycle.
      const schedule = await stripe.subscriptionSchedules.create({
        from_subscription: currentSub.id,
      });

      // Build the phases: keep current until period end, then switch to new plan
      const updatedSchedule = await stripe.subscriptionSchedules.update(schedule.id, {
        end_behavior: "release",
        phases: [
          {
            // Phase 1: current plan, until current period end
            items: [
              {
                price_data: {
                  currency: "usd",
                  product: currentSub.items.data[0].price.product as string,
                  unit_amount: currentSub.items.data[0].price.unit_amount!,
                  recurring: { interval: "month" },
                },
                quantity: 1,
              },
            ],
            start_date: currentSub.current_period_start,
            end_date: currentSub.current_period_end,
            metadata: { plan: currentPlan, user_id: userId },
          },
          {
            // Phase 2: new (downgraded) plan, starts when current ends
            items: [
              {
                price_data: {
                  currency: "usd",
                  product_data: { name: PLAN_NAMES[newPlan] },
                  unit_amount: PLAN_PRICE_CENTS[newPlan],
                  recurring: { interval: "month" },
                },
                quantity: 1,
              },
            ],
            iterations: 1,
            metadata: { plan: newPlan, user_id: userId },
          },
        ],
      });

      console.log(`✅ Scheduled downgrade ${currentSub.id} → ${newPlan} for ${new Date(currentSub.current_period_end * 1000).toISOString()}`);

      return new Response(
        JSON.stringify({
          success: true,
          action: "downgrade_scheduled",
          fromPlan: currentPlan,
          toPlan: newPlan,
          subscriptionId: currentSub.id,
          scheduleId: updatedSchedule.id,
          effectiveDate: new Date(currentSub.current_period_end * 1000).toISOString(),
          message: `Downgrade to ${newPlan} scheduled. You'll keep ${currentPlan} benefits until your current billing period ends.`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("update-subscription error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
