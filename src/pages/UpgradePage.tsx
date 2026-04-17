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
      "Up to 120 generations per month",
      "4K high-quality images",
      "Fast generation",
      "Up to 5 video generations",
      "Standard queue",
      "Basic support",
    ],
    popular: false,
    bestValue: false,
    description: "Perfect for getting started"
  },
  {
    id: "pro",
    name: "Pro",
    price: "$129/mo",
    amount: 129,
    highlights: [
      "Up to 600 generations per month",
      "4K ultra-quality images",
      "Faster generation priority",
      "Up to 25 video generations",
      "Priority queue",
      "Commercial license",
      "API access",
    ],
    popular: true,
    bestValue: false,
    description: "For creators and growing brands"
  },
  {
    id: "scale",
    name: "Scale",
    price: "$179/mo",
    amount: 179,
    highlights: [
      "Up to 900 generations per month",
      "4K premium outputs",
      "Fastest generation speed",
      "Up to 35 video generations",
      "Priority and faster queue",
      "Early access features",
      "Advanced tools",
    ],
    popular: false,
    bestValue: true,
    description: "For power users and teams"
  },
] as const;

const boostPacks = [
  { id: "starter-boost", name: "Starter Boost", price: "$19", amount: 19, generations: 30, videos: 3, popular: false, priority: false },
  { id: "creator-boost", name: "Creator Boost", price: "$39", amount: 39, generations: 70, videos: 7, popular: true, priority: false },
  { id: "power-boost", name: "Power Boost", price: "$79", amount: 79, generations: 150, videos: 15, popular: false, priority: false },
  { id: "ultra-boost", name: "Ultra Boost", price: "$149", amount: 149, generations: 290, videos: 29, popular: false, priority: false },
  { id: "elite-boost", name: "Elite Boost", price: "$249", amount: 249, generations: 490, videos: 49, popular: false, priority: true },
] as const;

export default function UpgradePage() {
  const { toast } = useToast();
  const [hasSubscription, setHasSubscription] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    document.title = "Upgrade Plan | Virtura";
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    const { data } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id, plan_name, status')
      .maybeSingle();

    const isActive = !!data?.stripe_customer_id && ['active', 'trialing', 'past_due'].includes(data?.status || '');
    setHasSubscription(isActive);
    setCurrentPlan(isActive ? (data?.plan_name || null) : null);
  };

  const getEdgeFunctionError = async (error: any, data: any): Promise<string> => {
    // supabase-js wraps non-2xx with generic message; extract real error from context
    if (error?.context) {
      try {
        const body = await error.context.json();
        return body?.message || body?.error || error.message;
      } catch {
        return error.message;
      }
    }
    // Sometimes data contains the error when status is non-2xx
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return error?.message || "Please try again.";
  };

  const startSubscription = async (planId: string) => {
    if (hasSubscription) {
      // Already subscribed — use update-subscription for upgrade/downgrade
      setChangingPlan(true);
      try {
        const { data, error } = await supabase.functions.invoke("update-subscription", {
          body: { newPlan: planId },
        });
        if (error || !data?.success) {
          const msg = await getEdgeFunctionError(error, data);
          toast({ title: "Heads up", description: msg, variant: "destructive" });
          return;
        }
        toast({
          title: data.action === "upgraded" ? "🎉 Plan Upgraded" : "✓ Downgrade Scheduled",
          description: data.message,
        });
        setCurrentPlan(planId);
      } finally {
        setChangingPlan(false);
      }
      return;
    }

    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { plan: planId },
    });
    if (error || !data?.url) {
      const msg = await getEdgeFunctionError(error, data);
      toast({ title: "Heads up", description: msg, variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  const buyBoostPack = async (packId: string) => {
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: { packId },
    });
    if (error || !data?.url) {
      const msg = await getEdgeFunctionError(error, data);
      toast({ title: "Checkout failed", description: msg, variant: "destructive" });
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
            <Card key={plan.id} className={`p-6 relative h-full flex flex-col ${plan.popular ? "ring-2 ring-primary" : plan.bestValue ? "ring-2 ring-violet-500" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-6 bg-gradient-primary">Most Popular</Badge>
              )}
              {plan.bestValue && (
                <Badge className="absolute -top-3 left-6 bg-violet-600">Best Value</Badge>
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
              <Button
                className="mt-6 w-full bg-gradient-primary hover:bg-gradient-secondary text-white shadow-violet-glow"
                onClick={() => startSubscription(plan.id)}
                disabled={currentPlan === plan.id || changingPlan}
              >
                {currentPlan === plan.id
                  ? "Current Plan"
                  : hasSubscription
                    ? `Switch to ${plan.name}`
                    : `Choose ${plan.name}`}
              </Button>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="boost-packs" className="mb-12">
        <h2 id="boost-packs" className="text-xl font-display font-bold mb-2">Add-On Boost Packs</h2>
        <p className="text-sm text-muted-foreground mb-6">One-time top-ups to extend your monthly limits</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {boostPacks.map((pack) => (
            <Card key={pack.id} className={`p-6 h-full flex flex-col relative ${pack.popular ? "ring-2 ring-primary" : ""}`}>
              {pack.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary">Most Popular</Badge>
              )}
              <h3 className="text-lg font-display font-bold">{pack.name}</h3>
              <p className="text-2xl font-display font-bold mt-1">{pack.price}</p>
              <ul className="text-sm text-muted-foreground mt-3 space-y-1 flex-1">
                <li>• Up to {pack.generations} generations</li>
                <li>• Up to {pack.videos} video generations</li>
                {pack.priority && <li>• Priority processing</li>}
              </ul>
              <Button variant="outline" className="mt-4 w-full" onClick={() => buyBoostPack(pack.id)}>
                Buy
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
