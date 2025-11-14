import { Button } from "@/components/ui/button";
import { Play, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LandingHeroProps {
  id?: string;
}

export function LandingHero({ id }: LandingHeroProps) {
  const navigate = useNavigate();

  return (
    <section id={id} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-magenta/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Social Proof Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Trusted by 10,000+ creators worldwide</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="bg-gradient-text bg-clip-text text-transparent">
              Create Stunning AI Content
            </span>
            <br />
            <span className="text-foreground">in Minutes, Not Hours</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-muted-foreground mb-4 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
            Transform your ideas into professional images, videos, and avatars with the power of AI. No design skills needed.
          </p>

          {/* Problem Statement */}
          <p className="text-lg text-muted-foreground/80 mb-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            Tired of spending hours on content creation? Let AI do the heavy lifting.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-gradient-primary hover:shadow-violet-glow transition-all text-lg px-8 py-6 h-auto"
            >
              Start Creating Free
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-primary/30 hover:bg-primary/10 text-lg px-8 py-6 h-auto"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>

          {/* Trust Indicators */}
          <p className="text-sm text-muted-foreground mt-8 animate-fade-in" style={{ animationDelay: "0.5s" }}>
            No credit card required • 7-day free trial • Cancel anytime
          </p>

          {/* Product Showcase */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.6s" }}>
            <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-card bg-card/30 backdrop-blur-sm">
              <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary-blue/10 flex items-center justify-center">
                <div className="text-muted-foreground text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Play className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-lg">Product Demo Video</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
