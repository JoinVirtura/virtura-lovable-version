import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { plan } = await req.json();
    if (!plan || !["starter", "pro", "scale"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan" }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
    }

    // Require authenticated user for subscription checkout
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, anonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required for subscription checkout" }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !data.user?.email) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication or missing email" }), 
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 401 }
      );
    }

    const customerEmail = data.user.email;
    console.log("Authenticated user:", customerEmail);

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create Stripe customer (required for Accounts V2 test mode)
    const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ email: customerEmail, metadata: { user_id: data.user.id } });
      customerId = newCustomer.id;
    }

    const priceMap: Record<string, number> = { starter: 2900, pro: 12900, scale: 17900 };

    // ── Duplicate prevention ─────────────────────────────────────
    // Block creating a new subscription if customer already has an active or trialing one.
    // The user must use update-subscription (upgrade/downgrade) or cancel first.
    const activeSubs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 100,
    });

    const blockingSub = activeSubs.data.find(s =>
      ["active", "trialing", "past_due", "unpaid"].includes(s.status)
    );

    if (blockingSub) {
      let currentPlan = blockingSub.metadata?.plan || null;
      if (!currentPlan) {
        // Infer plan from price amount
        const amount = blockingSub.items?.data?.[0]?.price?.unit_amount;
        const match = Object.entries(priceMap).find(([, cents]) => cents === amount);
        currentPlan = match ? match[0] : "unknown";
      }
      console.log(`⚠️ Customer ${customerId} already has active subscription (${blockingSub.id}) on plan "${currentPlan}". Blocking duplicate.`);
      return new Response(
        JSON.stringify({
          error: "ALREADY_SUBSCRIBED",
          message: `You already have an active subscription on the ${currentPlan} plan. Use upgrade/downgrade or cancel first.`,
          currentPlan,
          subscriptionId: blockingSub.id,
        }),
        { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      metadata: { plan, user_id: data.user.id },
      subscription_data: {
        metadata: { plan, user_id: data.user.id },
      },
      line_items: [
        {
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: priceMap[plan],
            product_data: { name: `Virtura ${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan` },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/payment-success`,
      cancel_url: `${origin}/payment-canceled`,
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("create-checkout error:", message);
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
