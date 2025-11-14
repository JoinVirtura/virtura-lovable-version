import { Rocket, Brain, Shield, Infinity, BarChart3, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BenefitsSectionProps {
  id?: string;
}

export function BenefitsSection({ id }: BenefitsSectionProps) {
  const benefits = [
    {
      icon: Rocket,
      title: "Lightning Fast Creation",
      description: "Generate professional-grade content in seconds, not hours. 10x faster than traditional creative workflows.",
    },
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Advanced neural networks trained on millions of images deliver consistently stunning results every time.",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "Bank-level encryption and data privacy. Your creations and intellectual property remain 100% yours.",
    },
    {
      icon: Infinity,
      title: "Unlimited Possibilities",
      description: "Generate infinite variations, styles, and iterations. Experiment freely without constraints or additional costs.",
    },
    {
      icon: BarChart3,
      title: "Data-Driven Insights",
      description: "Track performance metrics, analyze engagement, and optimize your content strategy with built-in analytics.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Real-time collaboration tools, shared libraries, and brand consistency across your entire organization.",
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
            Why <span className="bg-gradient-text bg-clip-text text-transparent">Virtura AI</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Transform your content creation workflow with enterprise-grade AI technology
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
