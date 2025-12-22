import { Check } from "lucide-react";
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
      price: 29,
      description: "Perfect entry point for new creators",
      features: [
        "120 monthly generations",
        "AI photos, avatars, and concepts",
        "1080p exports",
        "Essential styles & presets",
        "SFW content only",
        "Basic support",
      ],
      cta: "Start Free Trial",
      popular: false,
    },
    {
      name: "Pro",
      price: 129,
      description: "For serious creators & growing brands",
      features: [
        "700 monthly generations",
        "Hyper-realistic quality & advanced styles",
        "4K exports",
        "Branded content tools",
        "Commercial license",
        "Priority support",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: 349,
      description: "For agencies, teams & large-scale operations",
      features: [
        "2,200 monthly generations",
        "Dedicated account manager",
        "White-label options",
        "Custom model training",
        "Team seats & collaboration",
        "8K exports",
        "Advanced analytics",
        "Priority API access",
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
            💳 <span className="bg-gradient-text bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. Cancel anytime.
          </p>
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
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-12 pt-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="mb-12">
                  <span className="text-5xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={() => plan.cta === "Contact Sales" ? window.location.href = "mailto:sales@virtura.ai" : navigate("/auth")}
                    className={plan.popular ? "bg-gradient-primary hover:shadow-violet-glow w-full" : "w-full"}
                    variant={plan.popular ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
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
