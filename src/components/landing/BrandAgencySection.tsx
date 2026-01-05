import { Target, Package, Palette, Zap, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface BrandAgencySectionProps {
  id?: string;
}

export function BrandAgencySection({ id }: BrandAgencySectionProps) {
  const features = [
    {
      icon: Target,
      title: "Campaign Development",
      description: "Create concept visuals, storyboards, and full campaign imagery in minutes.",
    },
    {
      icon: Package,
      title: "Product & Lifestyle Content",
      description: "Generate polished, professional assets that match your brand identity.",
    },
    {
      icon: Palette,
      title: "Consistent Brand Aesthetics",
      description: "Save presets for lighting, tone, style, and composition so your content always stays on-brand.",
    },
    {
      icon: Zap,
      title: "No Shoots. No Delays. No Overhead.",
      description: "Create endless high-quality assets with zero production costs, zero scheduling, and zero complexity.",
    },
    {
      icon: Building,
      title: "White-Label Options Available",
      description: "For enterprise clients looking to integrate Virtura into their workflows.",
    },
  ];

  return (
    <section id={id} className="py-20 sm:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-primary-magenta/5 rounded-full blur-3xl -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-10 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Building className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-primary font-medium">For Agencies & Brands</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 px-2">
            Produce Premium Creative Work — <span className="bg-gradient-text bg-clip-text text-transparent">Faster & Cheaper</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Without traditional limitations.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto mb-8 sm:mb-12">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`group hover:shadow-violet-glow/50 transition-all duration-300 ${
                index === 4 ? 'sm:col-span-2 lg:col-span-1 lg:col-start-2' : ''
              }`}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 sm:mb-2 text-sm sm:text-base">{feature.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button 
            onClick={() => window.location.href = "mailto:sales@virtura.ai"}
            size="lg"
            className="bg-gradient-primary hover:shadow-violet-glow transition-all text-sm sm:text-base"
          >
            Contact Sales
          </Button>
        </div>
      </div>
    </section>
  );
}
