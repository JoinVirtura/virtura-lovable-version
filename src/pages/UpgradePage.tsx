import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "basic",
    name: "Basic",
    price: "$9/mo",
    amount: 9,
    highlights: [
      "200 credits/month",
      "Photorealistic avatars",
      "1 Export Pack/mo",
      "Community support",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19/mo",
    amount: 19,
    highlights: [
      "1,000 credits/month",
      "Unlimited generations (fair use)",
      "All Export Packs",
      "Priority queue",
      "Advanced editing",
      "Email support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$49/mo",
    amount: 49,
    highlights: [
      "5,000 credits/month",
      "Unlimited avatars + brand assets",
      "All Export Packs",
      "Team seats (up to 5)",
      "Brand Kit",
      "Priority support",
    ],
    popular: false,
  },
] as const;

const tokenPacks = [
  { tokens: 100, price: "$5", amount: 5 },
  { tokens: 500, price: "$20", amount: 20 },
  { tokens: 1500, price: "$50", amount: 50 },
] as const;

export default function UpgradePage() {
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Upgrade Plan | Virtura";
  }, []);

  const startSubscription = async (planId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { plan: planId },
    });
    if (error || !data?.url) {
      toast({ title: "Subscription failed", description: error?.message || "Please sign in and try again.", variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  const buyTokens = async (tokens: number) => {
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: { tokens },
    });
    if (error || !data?.url) {
      toast({ title: "Checkout failed", description: error?.message || "Please try again.", variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  const openCustomerPortal = async () => {
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error || !data?.url) {
      toast({ title: "Portal error", description: error?.message || "Please sign in and try again.", variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  return (
    <main className="container mx-auto px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-display font-bold">Upgrade your Virtura plan</h1>
        <p className="text-muted-foreground mt-2">Choose a plan or top up tokens when you need more credits.</p>
      </header>

      <section aria-labelledby="pricing-plans" className="mb-12">
        <h2 id="pricing-plans" className="sr-only">Pricing Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={`p-6 relative ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-6 bg-gradient-gold">Most Popular</Badge>
              )}
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold">{plan.name}</h3>
                <p className="text-2xl font-display font-bold">{plan.price}</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {plan.highlights.map((h) => (
                  <li key={h}>• {h}</li>
                ))}
              </ul>
              <Button className="mt-6 w-full" onClick={() => startSubscription(plan.id)}>
                Choose {plan.name}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="token-topups" className="mb-12">
        <h2 id="token-topups" className="text-xl font-display font-bold mb-4">Need more credits? Buy tokens</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tokenPacks.map((pack) => (
            <Card key={pack.tokens} className="p-6">
              <h3 className="text-lg font-display font-bold">{pack.tokens} tokens</h3>
              <p className="text-2xl font-display font-bold mt-1">{pack.price}</p>
              <p className="text-sm text-muted-foreground mt-2">One-off purchase</p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => buyTokens(pack.tokens)}>
                Buy tokens
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="manage-subscription" className="text-center">
        <h2 id="manage-subscription" className="sr-only">Manage subscription</h2>
        <Button variant="secondary" onClick={openCustomerPortal}>
          Manage subscription & billing
        </Button>
      </section>
    </main>
  );
}
