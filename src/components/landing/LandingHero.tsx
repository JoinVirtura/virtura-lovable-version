import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InteractiveHeroInput } from "./InteractiveHeroInput";
import { WatermarkedImageCard } from "./WatermarkedImageCard";
import { useLandingImageGeneration } from "@/hooks/useLandingImageGeneration";

interface LandingHeroProps {
  id?: string;
}

export function LandingHero({ id }: LandingHeroProps) {
  const navigate = useNavigate();
  const { images, isGenerating, generateImages } = useLandingImageGeneration();

  return (
    <section id={id} className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-blue/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-magenta/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Social Proof Badge */}
          <div className="flex justify-center mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Trusted by 10,000+ creators worldwide</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-10">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-foreground">Where Identity </span>
              <span className="bg-gradient-text bg-clip-text text-transparent">
                Evolves
              </span>
            </h1>

            <p className="text-xl text-muted-foreground mb-4 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: "0.2s" }}>
              Type what you want to create and see the magic happen
            </p>
          </div>

          {/* Interactive Input Section */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <InteractiveHeroInput 
              onGenerate={generateImages}
              isGenerating={isGenerating}
            />
          </div>

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center mb-12 animate-fade-in">
              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Creating your masterpiece...</span>
              </div>
            </div>
          )}

          {/* Generated Images Grid */}
          {images.length > 0 && (
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {images.map((img, index) => (
                  <WatermarkedImageCard
                    key={index}
                    image={img.image || ''}
                    prompt={img.prompt}
                    index={index}
                  />
                ))}
              </div>

              {/* Conversion CTA */}
              <div className="mt-12 text-center animate-fade-in">
                <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-blue/10 border border-border/50 backdrop-blur-sm">
                  <h3 className="text-xl font-bold mb-2">
                    <span className="bg-gradient-text bg-clip-text text-transparent">Love what you see?</span>
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 max-w-lg mx-auto">
                    Start your free trial to download watermark-free images
                  </p>
                  <Button
                    onClick={() => navigate("/auth")}
                    size="lg"
                    className="bg-gradient-primary hover:shadow-violet-glow transition-all px-6"
                  >
                    Start Free Trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Default CTA (when no images) */}
          {images.length === 0 && !isGenerating && (
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <p className="text-sm text-muted-foreground">
                No credit card required • 7-day free trial • Cancel anytime
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
