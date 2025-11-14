import { useState } from "react";
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
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      monthlyPrice: 100,
      annualPrice: 80,
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
      monthlyPrice: 200,
      annualPrice: 160,
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
      monthlyPrice: 300,
      annualPrice: 240,
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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            No hidden fees. Cancel anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm ${!isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 bg-card border-2 border-border rounded-full transition-colors duration-300 hover:border-primary"
            >
              <div
                className={`absolute top-0.5 left-0.5 w-6 h-6 bg-gradient-primary rounded-full transition-transform duration-300 ${
                  isAnnual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
              Annual <span className="text-primary">(Save 20%)</span>
            </span>
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
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-12 pt-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="mb-12">
                  <span className="text-5xl font-bold">
                    ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                  {isAnnual && (
                    <div className="text-sm text-muted-foreground mt-2">
                      Billed annually (${plan.annualPrice * 12}/year)
                    </div>
                  )}
                </div>
                <div className="pt-4">
                  <Button 
                    onClick={() => plan.cta === "Contact Sales" ? null : navigate("/auth")}
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
