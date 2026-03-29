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
      description: "One identity or many, build versions of yourself for different purposes and styles.",
    },
    {
      icon: ShoppingBag,
      title: "Product & Business Content",
      description: "Turn your brand into a world of creative possibilities.",
    },
  ];

  return (
    <section id={id} className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            What You Can <span className="bg-gradient-text bg-clip-text text-transparent">Create</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Transform your ideas into visually stunning, high-quality AI content, instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
          {creations.map((creation, index) => (
            <Card 
              key={index}
              className={`group hover:shadow-violet-glow/50 transition-all duration-300 hover:-translate-y-2 ${
                index === 4 ? 'sm:col-span-2 lg:col-span-1 lg:col-start-2' : ''
              }`}
            >
              <CardContent className="p-5 sm:p-6 md:p-8">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-primary flex items-center justify-center mb-4 sm:mb-6 group-hover:shadow-violet-glow transition-all">
                  <creation.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 break-words">{creation.title}</h3>
                <p className="text-sm sm:text-base text-muted-foreground break-words">{creation.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
