import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function Upgrade() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [trialInfo, setTrialInfo] = useState<{
    daysRemaining: number;
    trialEnd: string;
  } | null>(null);

  useEffect(() => {
    checkTrialStatus();
  }, []);

  const checkTrialStatus = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("subscriptions")
      .select("trial_end, status")
      .eq("user_id", user.id)
      .eq("status", "trialing")
      .single();

    if (data?.trial_end) {
      const daysRemaining = Math.ceil(
        (new Date(data.trial_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      setTrialInfo({
        daysRemaining,
        trialEnd: data.trial_end,
      });
    }
  };

  const handleUpgrade = async (plan: string, price: number) => {
    if (!user) {
      toast.error("Please sign in to upgrade");
      navigate("/auth");
      return;
    }

    setLoading(true);
    try {
      // Track trial conversion (non-blocking)
      if (trialInfo) {
        const trialStart = new Date(trialInfo.trialEnd);
        trialStart.setDate(trialStart.getDate() - 7);
        const timeToConvert = Math.round((Date.now() - trialStart.getTime()) / (1000 * 60 * 60));

        supabase.from("trial_conversions").insert({
          user_id: user.id,
          trial_start: trialStart.toISOString(),
          trial_end: trialInfo.trialEnd,
          converted_at: new Date().toISOString(),
          conversion_plan: plan,
          discount_code: discountCode || null,
          time_to_convert_hours: timeToConvert,
        }).then(({ error }) => {
          if (error) console.warn("Trial conversion tracking failed:", error.message);
        });
      }

      // Create checkout session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          plan,
          discountCode: discountCode || undefined,
          successUrl: `${window.location.origin}/dashboard?upgraded=true`,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error("Upgrade error:", error);
      toast.error(error.message || "Failed to process upgrade");
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Pro",
      price: 29,
      icon: Zap,
      features: [
        "Unlimited AI generations",
        "Advanced voice synthesis",
        "Premium brand tools",
        "Priority support",
        "Custom avatars",
        "HD video export",
      ],
    },
    {
      name: "Enterprise",
      price: 99,
      icon: Crown,
      popular: true,
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "SLA guarantee",
        "Advanced analytics",
        "Team collaboration",
        "White-label options",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" />
            {trialInfo ? `${trialInfo.daysRemaining} days left in trial` : "Upgrade Your Plan"}
          </Badge>
          <h1 className="text-4xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {trialInfo
              ? "Don't lose access to premium features. Upgrade now and save 20% with your trial discount!"
              : "Unlock unlimited AI power and take your content to the next level"}
          </p>
        </div>

        {trialInfo && (
          <Card className="mb-8 border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Trial Ending Soon!</h3>
                  <p className="text-sm text-muted-foreground">
                    Upgrade now to keep access to all premium features. Use code <strong>TRIAL20</strong> for 20% off your first month.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mb-6">
          <Label htmlFor="discount">Have a discount code?</Label>
          <Input
            id="discount"
            placeholder="Enter discount code (e.g., TRIAL20)"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
            className="max-w-md"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const discountedPrice =
              discountCode === "TRIAL20" ? plan.price * 0.8 : plan.price;

            return (
              <Card
                key={plan.name}
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg scale-105"
                    : "border-border"
                }`}
              >
                {plan.popular && (
                  <Badge
                    className="absolute -top-3 left-1/2 -translate-x-1/2"
                    variant="default"
                  >
                    Most Popular
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <div className="mt-2">
                    <span className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold text-foreground">
                        ${discountedPrice.toFixed(0)}
                      </span>
                      <span className="text-muted-foreground">/month</span>
                    </span>
                    {discountCode === "TRIAL20" && (
                      <span className="text-sm text-green-600 mt-1 block">
                        <s className="text-muted-foreground">${plan.price}</s> 20%
                        off applied!
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleUpgrade(plan.name.toLowerCase(), discountedPrice)}
                    disabled={loading}
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {loading ? "Processing..." : `Upgrade to ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            All plans include a 30-day money-back guarantee
          </p>
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            Continue with Free Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
