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
    const packId = String(body?.packId || "");

    // Boost pack catalog
    const BOOST_PACKS: Record<string, { name: string; priceCents: number; generations: number; videos: number; priority: boolean }> = {
      "starter-boost": { name: "Starter Boost", priceCents: 1900, generations: 30, videos: 3, priority: false },
      "creator-boost": { name: "Creator Boost", priceCents: 3900, generations: 70, videos: 7, priority: false },
      "power-boost":   { name: "Power Boost",   priceCents: 7900, generations: 150, videos: 15, priority: false },
      "ultra-boost":   { name: "Ultra Boost",   priceCents: 14900, generations: 290, videos: 29, priority: false },
      "elite-boost":   { name: "Elite Boost",   priceCents: 24900, generations: 490, videos: 49, priority: true },
    };

    const pack = BOOST_PACKS[packId];
    if (!pack) {
      return new Response(JSON.stringify({ error: "Invalid boost pack. Valid options: " + Object.keys(BOOST_PACKS).join(", ") }), {
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

    const origin = req.headers.get("origin") || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId, // Store user ID for webhook
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: pack.priceCents,
            product_data: {
              name: pack.name,
              description: `${pack.generations} generations + ${pack.videos} video generations${pack.priority ? " (priority)" : ""}`
            },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/payment-success?pack=${packId}`,
      cancel_url: `${origin}/payment-canceled`,
      metadata: {
        pack_id: packId,
        generations: String(pack.generations),
        videos: String(pack.videos),
        user_id: userId || "unknown",
      },
    });

    return new Response(JSON.stringify({ url: session.url }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
