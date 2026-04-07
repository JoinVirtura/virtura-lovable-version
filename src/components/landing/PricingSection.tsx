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
      description: "Perfect for getting started",
      features: [
        "Up to 120 generations per month",
        "4K high-quality images",
        "Fast generation",
        "Up to 5 video generations",
        "Standard queue",
        "Basic support",
      ],
      cta: "Start Free Trial",
      popular: false,
      bestValue: false,
    },
    {
      name: "Pro",
      price: 129,
      description: "For creators and growing brands",
      features: [
        "Up to 600 generations per month",
        "4K ultra-quality images",
        "Faster generation priority",
        "Up to 25 video generations",
        "Priority queue",
        "Commercial license",
        "API access",
      ],
      cta: "Start Free Trial",
      popular: true,
      bestValue: false,
    },
    {
      name: "Scale",
      price: 179,
      description: "For power users and teams",
      features: [
        "Up to 900 generations per month",
        "4K premium outputs",
        "Fastest generation speed",
        "Up to 35 video generations",
        "Priority and faster queue",
        "Early access features",
        "Advanced tools",
      ],
      cta: "Start Free Trial",
      popular: false,
      bestValue: true,
    },
  ];

  return (
    <section id={id} className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            💳 <span className="bg-gradient-text bg-clip-text text-transparent">Pricing</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            No hidden fees. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative flex flex-col h-full ${plan.popular ? 'border-primary shadow-violet-glow md:scale-105' : plan.bestValue ? 'border-violet-500 shadow-violet-glow' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-primary px-4 py-1 text-xs sm:text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}
              {plan.bestValue && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 px-4 py-1 text-xs sm:text-sm">
                    Best Value
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pt-6 sm:pt-8 pb-4 sm:pb-6 flex-shrink-0">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mb-4 sm:mb-6">{plan.description}</p>
                <div>
                  <span className="text-3xl sm:text-4xl md:text-5xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground text-sm sm:text-base">/month</span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-col flex-grow">
                <ul className="space-y-2 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="pt-6 mt-auto">
                  <Button
                    onClick={() => navigate("/auth")}
                    className={plan.popular || plan.bestValue ? "bg-gradient-primary hover:shadow-violet-glow w-full" : "w-full"}
                    variant={plan.popular || plan.bestValue ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}
