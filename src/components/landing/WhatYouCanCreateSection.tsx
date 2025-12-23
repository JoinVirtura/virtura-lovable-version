import { Camera, Briefcase, Heart, User, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface WhatYouCanCreateSectionProps {
  id?: string;
}

export function WhatYouCanCreateSection({ id }: WhatYouCanCreateSectionProps) {
  const creations = [
    {
      icon: Camera,
      title: "AI-Generated Photos & Concepts",
      description: "Bring your creative vision to life with cinematic, professional-grade output.",
    },
    {
      icon: Briefcase,
      title: "Brand Campaigns & Visual Packs",
      description: "Create marketing assets for social, business, and ecommerce in seconds.",
    },
    {
      icon: Heart,
      title: "Lifestyle, Fitness & Aesthetic Shoots",
      description: "Generate endless lifestyle content tailored to your audience.",
    },
    {
      icon: User,
      title: "Digital Avatars & Personas",
      description: "One identity or many — build versions of yourself for different purposes and styles.",
    },
    {
      icon: ShoppingBag,
      title: "Product & Business Content",
      description: "Turn your brand into a world of creative possibilities.",
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
            What You Can <span className="bg-gradient-text bg-clip-text text-transparent">Create</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transform your ideas into visually stunning, high-quality AI content — instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {creations.map((creation, index) => (
            <Card 
              key={index}
              className={`group hover:shadow-violet-glow/50 transition-all duration-300 hover:-translate-y-2 ${
                index === 4 ? 'sm:col-span-2 lg:col-span-1 lg:col-start-2' : ''
              }`}
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-6 group-hover:shadow-violet-glow transition-all">
                  <creation.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{creation.title}</h3>
                <p className="text-muted-foreground">{creation.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
