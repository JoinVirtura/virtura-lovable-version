import { Check, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

interface PricingSectionProps {
  id?: string;
}

export function PricingSection({ id }: PricingSectionProps) {
  const navigate = useNavigate();

  const plans = [
    {
      name: "Starter",
      price: "$100",
      period: "/month",
      description: "Perfect for individuals starting out",
      features: [
        "500 AI generations/month",
        "Basic templates",
        "Standard support",
        "1080p exports",
        "Community access",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Pro",
      price: "$200",
      period: "/month",
      description: "Most popular for professionals",
      features: [
        "2,000 AI generations/month",
        "Premium templates",
        "Priority support",
        "4K exports",
        "Advanced features",
        "Commercial license",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "$300",
      period: "/month",
      description: "For teams and organizations",
      features: [
        "Unlimited generations",
        "Custom templates",
        "Dedicated support",
        "8K exports",
        "White-label option",
        "Custom integrations",
        "Team collaboration",
        "Advanced analytics",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  return (
    <section id={id} className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Transparent Pricing That <span className="bg-gradient-text bg-clip-text text-transparent">Scales With You</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            No hidden fees. Cancel anytime.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border">
            <span className="text-sm text-muted-foreground">Annual billing saves 20%</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative ${plan.popular ? 'border-primary shadow-violet-glow scale-105' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-primary px-4 py-1">
                    <Crown className="w-3 h-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-5xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <Button 
                  onClick={() => plan.cta === "Contact Sales" ? null : navigate("/auth")}
                  className={plan.popular ? "bg-gradient-primary hover:shadow-violet-glow w-full" : "w-full"}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money-back Guarantee */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            <span className="text-primary font-semibold">30-day money-back guarantee</span> • No questions asked
          </p>
        </div>
      </div>
    </section>
  );
}
