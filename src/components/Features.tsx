import { Card } from "@/components/ui/card";
import { 
  Camera, 
  Palette, 
  Download, 
  Shield, 
  Clock, 
  Users,
  Wand2,
  Video,
  Image
} from "lucide-react";

export const Features = () => {
  const features = [
    {
      icon: Camera,
      title: "Hyper-Realistic Generation",
      description: "Advanced AI creates incredibly lifelike avatars with natural micro-expressions and realistic facial movements.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Palette,
      title: "Personality Builder",
      description: "Customize traits, emotions, and behavioral patterns to create avatars with unique personalities and consistent character.",
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: Wand2,
      title: "Style Transformation",
      description: "Instantly change wardrobe, accessories, backgrounds, and lighting without starting from scratch.",
      gradient: "from-accent/20 to-accent/5"
    },
    {
      icon: Video,
      title: "Multi-Format Output",
      description: "Generate high-resolution photos, short-form videos, and long-form content up to 10 minutes in any format.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Image,
      title: "Batch Processing",
      description: "Create multiple variations simultaneously with different poses, expressions, and styles in one go.",
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: Clock,
      title: "Lightning Fast",
      description: "Professional-quality results in seconds, not hours. Perfect for creators who need rapid content production.",
      gradient: "from-accent/20 to-accent/5"
    },
    {
      icon: Shield,
      title: "SFW-First Platform",
      description: "Built with content safety as a priority. Professional, appropriate content for all business and creative needs.",
      gradient: "from-primary/20 to-primary/5"
    },
    {
      icon: Download,
      title: "High-Quality Export",
      description: "Download your creations in ultra-high resolution with watermark-free professional output.",
      gradient: "from-secondary/20 to-secondary/5"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Share projects, collaborate with team members, and maintain consistent avatar styles across campaigns.",
      gradient: "from-accent/20 to-accent/5"
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Powerful Features for
            <span className="block text-primary">Professional Creation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Everything you need to create stunning, professional-grade avatars for content creation, 
            marketing, and storytelling. Built for creators, by creators.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="group p-6 bg-card border-border hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-warm"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                
                <h3 className="font-display text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-6 py-3 mb-6">
            <Wand2 className="h-5 w-5 text-primary" />
            <span className="text-primary font-medium">Ready to get started?</span>
          </div>
          <p className="text-muted-foreground mb-6">
            Join thousands of creators already using Virtura to bring their visions to life.
          </p>
        </div>
      </div>
    </section>
  );
};