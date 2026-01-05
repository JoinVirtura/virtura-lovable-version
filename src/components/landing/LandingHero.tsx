import { Button } from "@/components/ui/button";
import { Sparkles, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { InteractiveHeroInput } from "./InteractiveHeroInput";
import { WatermarkedImageCard } from "./WatermarkedImageCard";
import { ImageGenerationSkeleton } from "./ImageGenerationSkeleton";
import { useLandingImageGeneration } from "@/hooks/useLandingImageGeneration";
import { useRef, useState } from "react";

interface LandingHeroProps {
  id?: string;
}

export function LandingHero({ id }: LandingHeroProps) {
  const navigate = useNavigate();
  const { images, isGenerating, generateImages, clearImages, sessionId } = useLandingImageGeneration();
  const inputRef = useRef<HTMLDivElement>(null);
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleClearAndFocus = () => {
    clearImages();
    setCurrentPrompt("");
    setTimeout(() => {
      inputRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

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

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Social Proof Badge */}
          <div className="flex justify-center mb-6 sm:mb-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-card/50 backdrop-blur-sm border border-border">
              <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm text-muted-foreground">Trusted by 10,000+ creators worldwide</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="text-center mb-8 sm:mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <span className="text-foreground">Where Identity </span>
              <span className="bg-gradient-text bg-clip-text text-transparent">
                Evolves
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 animate-fade-in max-w-3xl mx-auto px-2" style={{ animationDelay: "0.2s" }}>
              Create studio-quality AI content — avatars, branded visuals, campaigns, and concepts — all in seconds.
            </p>
          </div>

          {/* Interactive Input Section */}
          <div ref={inputRef} className="mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <InteractiveHeroInput 
              onGenerate={generateImages}
              isGenerating={isGenerating}
              value={currentPrompt}
              onChange={setCurrentPrompt}
            />
          </div>

          {/* Loading Skeleton */}
          {isGenerating && (
            <div className="mb-12">
              <ImageGenerationSkeleton />
              
              {/* Loading Status Message */}
              <div className="text-center mt-6 animate-fade-in">
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-card/50 backdrop-blur-sm border border-border">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm text-muted-foreground">Creating your masterpiece...</span>
                </div>
              </div>
            </div>
          )}

          {/* Generated Images Grid */}
          {!isGenerating && images.length > 0 && (
            <div className="mb-12">
              {/* Try Again Button */}
              <div className="flex justify-center mb-6">
                <Button
                  onClick={handleClearAndFocus}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again with Different Prompt
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {images.map((img, index) => (
                  <WatermarkedImageCard
                    key={index}
                    image={img.image || ''}
                    prompt={img.prompt}
                    index={index}
                    sessionId={sessionId}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Default CTA (when no images) */}
          {images.length === 0 && !isGenerating && (
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <p className="text-sm text-muted-foreground">
                No credit card required • 7-day free trial • SFW only • Cancel anytime
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
