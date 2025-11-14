import { Check, Crown, Sparkles, Award } from "lucide-react";
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/8 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Transparent Pricing That <span className="bg-gradient-text bg-clip-text text-transparent">Scales With You</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            No hidden fees. Cancel anytime. Start with a 14-day free trial.
          </p>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 backdrop-blur-sm border border-primary/20 shadow-lg">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Annual billing saves 20%</span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={index}
              className={`relative transition-all duration-500 hover:-translate-y-2 ${
                plan.popular 
                  ? 'border-primary/50 shadow-[0_0_60px_rgba(168,85,247,0.4)] scale-105 bg-gradient-to-br from-card via-card to-primary/5' 
                  : 'border-border/50 hover:border-primary/30 hover:shadow-violet-glow/30'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-primary px-6 py-2 text-base font-semibold shadow-violet-glow">
                    <Crown className="w-4 h-4 mr-2" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-8 pt-10">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-sm mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold bg-gradient-text bg-clip-text text-transparent">{plan.price}</span>
                  <span className="text-muted-foreground text-lg">{plan.period}</span>
                </div>
                <Button 
                  onClick={() => plan.cta === "Contact Sales" ? null : navigate("/auth")}
                  className={plan.popular 
                    ? "bg-gradient-primary hover:shadow-violet-glow w-full h-12 text-base font-semibold" 
                    : "w-full h-12 text-base font-semibold hover:bg-primary/10 hover:border-primary/50"
                  }
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </CardHeader>

              <CardContent className="pt-6 border-t border-border/50">
                <ul className="space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-muted-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Money-back Guarantee */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Award className="w-5 h-5 text-primary" />
            <p className="text-foreground font-medium">
              <span className="text-primary font-semibold">30-day money-back guarantee</span> · No questions asked
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
