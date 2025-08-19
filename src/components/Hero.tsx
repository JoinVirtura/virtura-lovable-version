import { Button } from "@/components/ui/button";
import { Sparkles, Users, Zap } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(179,127,79,0.1)_0%,transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Main Headline */}
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-tight">
            Create Stunning
            <span className="block text-primary font-display">AI Avatars</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your ideas into hyper-realistic avatars with professional-grade AI technology. 
            Perfect for content creators, businesses, and storytellers.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            size="lg" 
            className="px-8 py-4 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-warm transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Start Creating
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-4 text-lg font-semibold border-primary/30 text-foreground hover:bg-primary/10 transition-all duration-300"
          >
            View Gallery
          </Button>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="group">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-luxury hover:shadow-warm transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/30 transition-colors">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Hyper-Realistic</h3>
              <p className="text-muted-foreground">Advanced AI creates incredibly lifelike avatars with micro-expressions and natural movement.</p>
            </div>
          </div>

          <div className="group">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-luxury hover:shadow-warm transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/30 transition-colors">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Generate professional-quality avatars in seconds, not hours. Perfect for rapid content creation.</p>
            </div>
          </div>

          <div className="group">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-luxury hover:shadow-warm transition-all duration-300 hover:scale-105">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 mx-auto group-hover:bg-primary/30 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">For Everyone</h3>
              <p className="text-muted-foreground">Whether you're a creator, business, or storyteller - our platform adapts to your needs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000" />
    </section>
  );
};