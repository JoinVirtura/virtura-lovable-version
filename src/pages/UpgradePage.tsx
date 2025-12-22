import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const plans = [
  {
    id: "starter",
    name: "Starter",
    price: "$29/mo",
    amount: 29,
    highlights: [
      "120 monthly generations",
      "AI photos, avatars & concepts",
      "1080p exports",
      "Essential styles & presets",
      "Basic support",
    ],
    popular: false,
    description: "Perfect entry point for new creators"
  },
  {
    id: "pro",
    name: "Pro",
    price: "$129/mo",
    amount: 129,
    highlights: [
      "700 monthly generations",
      "Hyper-realistic quality",
      "4K exports",
      "Branded content tools",
      "Commercial license",
      "Priority support & API access",
    ],
    popular: true,
    description: "For serious creators & growing brands"
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$349/mo",
    amount: 349,
    highlights: [
      "2,200 monthly generations",
      "Dedicated account manager",
      "White-label options",
      "Custom model training",
      "Team seats & 8K exports",
      "Advanced analytics",
    ],
    popular: false,
    description: "For agencies, teams & large-scale operations"
  },
] as const;

const tokenPacks = [
  { tokens: 100, price: "$15", amount: 15 },
  { tokens: 500, price: "$75", amount: 75 },
  { tokens: 1000, price: "$150", amount: 150 },
  { tokens: 5000, price: "$750", amount: 750 },
  { tokens: 10000, price: "$1,500", amount: 1500 },
] as const;

export default function UpgradePage() {
  const { toast } = useToast();
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    document.title = "Upgrade Plan | Virtura";
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .maybeSingle();
    
    setHasSubscription(!!data?.stripe_customer_id);
  };

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
            <Card key={plan.id} className={`p-6 relative h-full flex flex-col ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-6 bg-gradient-primary">Most Popular</Badge>
              )}
              <div className="space-y-2">
                <h3 className="text-xl font-display font-bold">{plan.name}</h3>
                <p className="text-2xl font-display font-bold">{plan.price}</p>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
                {plan.highlights.map((h) => (
                  <li key={h}>• {h}</li>
                ))}
              </ul>
              <Button className="mt-6 w-full bg-gradient-primary hover:bg-gradient-secondary text-white shadow-violet-glow" onClick={() => startSubscription(plan.id)}>
                Choose {plan.name}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="token-topups" className="mb-12">
        <h2 id="token-topups" className="text-xl font-display font-bold mb-4">Need more tokens? À la carte pricing</h2>
        <p className="text-sm text-muted-foreground mb-6">Premium rate: $0.15 per token (vs $0.10 in subscriptions)</p>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {tokenPacks.map((pack) => (
            <Card key={pack.tokens} className="p-6 h-full flex flex-col">
              <h3 className="text-lg font-display font-bold">{pack.tokens} tokens</h3>
              <p className="text-2xl font-display font-bold mt-1">{pack.price}</p>
              <p className="text-sm text-muted-foreground mt-2 flex-1">One-off purchase</p>
              <Button variant="outline" className="mt-4 w-full" onClick={() => buyTokens(pack.tokens)}>
                Buy tokens
              </Button>
            </Card>
          ))}
        </div>
      </section>

      {hasSubscription && (
        <section aria-labelledby="manage-subscription" className="text-center">
          <h2 id="manage-subscription" className="sr-only">Manage subscription</h2>
          <Button variant="secondary" onClick={openCustomerPortal}>
            Manage subscription & billing
          </Button>
        </section>
      )}
    </main>
  );
}
