import { Sparkles, Zap, Layers, Shield, Users, Infinity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface BenefitsSectionProps {
  id?: string;
}

export function BenefitsSection({ id }: BenefitsSectionProps) {
  const benefits = [
    {
      icon: Sparkles,
      title: "Studio-Grade Quality",
      description: "Cinematic lighting, clean composition, and premium aesthetics built for creators and brands.",
    },
    {
      icon: Zap,
      title: "Content Scaling at Speed",
      description: "Generate a month's worth of content in minutes — no shoots, no scheduling, no limitations.",
    },
    {
      icon: Layers,
      title: "Multiple Vertical Tools",
      description: "Avatars, branded templates, campaign scenes, product visuals, lifestyle shots, and more.",
    },
    {
      icon: Shield,
      title: "Privacy-Driven & SFW Only",
      description: "Your likeness, assets, and content remain private and secure. No NSFW. No exceptions.",
    },
    {
      icon: Users,
      title: "Creators, Consumers & Brands Welcome",
      description: "Virtura is built for everyone — from creators growing their audience to fans browsing profiles to brands building campaigns.",
    },
    {
      icon: Infinity,
      title: "Built for the Future of Content",
      description: "One platform. Unlimited creativity. Endless ways to evolve your identity online.",
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
            Why <span className="bg-gradient-text bg-clip-text text-transparent">Virtura</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The platform built for creators, brands, and the future of content
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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
