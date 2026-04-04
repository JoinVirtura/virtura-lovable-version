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
    const body = await req.json().catch(() => ({}));
    const tokens = Number(body?.tokens) || 0;
    
    // Support all token pack sizes
    const validPacks = [100, 500, 1000, 5000, 10000];
    if (!validPacks.includes(tokens)) {
      return new Response(JSON.stringify({ error: "Invalid token pack. Valid options: 100, 500, 1000, 5000, 10000" }), { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }, 
        status: 400 
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", { apiVersion: "2023-10-16" });

    // Get authenticated user
    let customerEmail = "guest@example.com";
    let userId = null;
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseClient = createClient(supabaseUrl, anonKey);

    const authHeader = req.headers.get("Authorization");
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      if (data.user) {
        customerEmail = data.user.email || "guest@example.com";
        userId = data.user.id;
      }
    }

    // Find or create Stripe customer (required for Accounts V2 test mode)
    const existingCustomers = await stripe.customers.list({ email: customerEmail, limit: 1 });
    let customerId: string;
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const newCustomer = await stripe.customers.create({ email: customerEmail, metadata: { user_id: userId || "unknown" } });
      customerId = newCustomer.id;
    }

    // Price map: token count -> cents (100 tokens = $15.00 = 1500 cents, etc.)
    const priceMap: Record<number, number> = {
      100: 1500,    // $15.00
      500: 7500,    // $75.00
      1000: 15000,  // $150.00
      5000: 75000,  // $750.00
      10000: 150000 // $1,500.00
    };

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId, // Store user ID for webhook
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: priceMap[tokens],
            product_data: { 
              name: `${tokens} Tokens Pack`,
              description: `${tokens} tokens for Virtura platform`
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?tokens=${tokens}`,
      cancel_url: `${origin}/payment-canceled`,
      metadata: {
        tokens: tokens.toString(),
        user_id: userId || "unknown",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
