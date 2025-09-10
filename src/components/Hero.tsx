
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Mic, Send, Crown, Lock, Zap, Camera, Shuffle } from "lucide-react";
import { useState } from "react";

export const Hero = () => {
  const [inputValue, setInputValue] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      console.log("User input:", inputValue);
      // TODO: Implement actual generation logic
    }
  };

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-primary/8 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/3 to-transparent rounded-full blur-3xl animate-pulse delay-500" />
        
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-grid-pattern animate-grid-float"></div>
        </div>
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary/60 rounded-full animate-float-1" />
        <div className="absolute top-40 right-32 w-1.5 h-1.5 bg-primary/40 rounded-full animate-float-2" />
        <div className="absolute bottom-32 left-1/3 w-3 h-3 bg-primary/30 rounded-full animate-float-3" />
        <div className="absolute bottom-20 right-20 w-2.5 h-2.5 bg-primary/50 rounded-full animate-float-1" style={{animationDelay: '2s'}} />
        
        {/* Scanning Lines Effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan-line" />
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center justify-center min-h-screen text-center">
        {/* Header Badge */}
        <Badge className="bg-card/80 border-primary/20 text-foreground px-6 py-3 text-base font-semibold mb-8 animate-fade-in backdrop-blur-sm">
          <Crown className="w-5 h-5 mr-3 text-primary" />
          Revolutionary AI Technology
        </Badge>

        {/* Main Heading - Single Line */}
        <div className="mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6">
            <span className="text-foreground">WHERE IDENTITY </span>
            <span className="bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">EVOLVES</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
            Transform your vision into reality with hyper realistic AI avatars
          </p>
        </div>

        {/* Central Chat Interface */}
        <div className="w-full max-w-2xl mb-12 animate-fade-in">
          <form onSubmit={handleSubmit} className="relative">
            <div className="relative bg-card border border-border rounded-2xl p-6 backdrop-blur-sm shadow-card">
              <Input
                type="text"
                placeholder="Evolve Your Visions Into Reality..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full text-lg bg-transparent border-0 focus:ring-0 placeholder:text-muted-foreground/70 px-0 h-auto py-4"
              />
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Speak
                  </Button>
                  <span className="text-xs text-muted-foreground">or type to begin</span>
                </div>
                
                <Button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="bg-gradient-gold hover:bg-gradient-gold-hover shadow-gold"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Generate
                </Button>
              </div>
            </div>
          </form>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12 animate-fade-in">
          <Button 
            size="lg" 
            className="px-8 py-6 text-lg font-bold bg-gradient-gold hover:bg-gradient-gold-hover shadow-gold hover:shadow-gold-intense transition-all duration-300 hover:scale-105"
          >
            <Sparkles className="mr-3 h-6 w-6" />
            START CREATING
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="px-8 py-6 text-lg font-semibold transition-all duration-300"
          >
            EXPLORE GALLERY
          </Button>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
          <Badge variant="secondary" className="px-4 py-2 bg-card/80 border-primary/20 text-foreground backdrop-blur-sm">
            <Lock className="w-4 h-4 mr-2 text-primary" />
            PRIVATE & SECURE
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-card/80 border-primary/20 text-foreground backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2 text-primary" />
            INSTANT GENERATION
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-card/80 border-primary/20 text-foreground backdrop-blur-sm">
            <Camera className="w-4 h-4 mr-2 text-primary" />
            STUDIO QUALITY
          </Badge>
        </div>
      </div>

    </section>
  );
};
