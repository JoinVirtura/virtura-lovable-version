import { Clock, Sparkles, Award, DollarSign, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BenefitsSectionProps {
  id?: string;
}

export function BenefitsSection({ id }: BenefitsSectionProps) {
  const benefits = [
    {
      icon: Clock,
      title: "Save Time",
      description: "Create professional content 10x faster than traditional methods",
    },
    {
      icon: Sparkles,
      title: "No Skills Required",
      description: "Anyone can create stunning visuals without design experience",
    },
    {
      icon: Award,
      title: "Consistent Quality",
      description: "AI ensures professional results every time",
    },
    {
      icon: DollarSign,
      title: "Cost Effective",
      description: "Replace expensive designers and studios with AI",
    },
    {
      icon: Zap,
      title: "Unlimited Creativity",
      description: "Generate unlimited variations until it's perfect",
    },
    {
      icon: TrendingUp,
      title: "Scale Effortlessly",
      description: "Produce content at scale without hiring more staff",
    },
  ];

  return (
    <section id={id} className="py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Choose <span className="bg-gradient-text bg-clip-text text-transparent">Virtura AI</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools designed to transform your content creation workflow
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <Card 
              key={index}
              className="group hover:shadow-violet-glow/50 transition-all duration-300 hover:-translate-y-2"
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:shadow-violet-glow transition-all">
                  <benefit.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
