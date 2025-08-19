
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Zap, Crown, Lock, Camera, Video, Heart, ChevronDown } from "lucide-react";

// Import hero model images
import heroModel1 from "@/assets/hero-model-1.jpg";
import heroModel2 from "@/assets/hero-model-2.jpg";
import heroModel3 from "@/assets/hero-model-3.jpg";

export const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-cyber overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 bg-gradient-glow animate-pulse" />
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000" />
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center min-h-screen">
          {/* Left Content */}
          <div className="space-y-8">
            <Badge className="bg-white/10 text-white border-white/30 px-6 py-3 text-base font-semibold backdrop-blur-sm">
              <Crown className="w-5 h-5 mr-3" />
              Revolutionary AI Technology
            </Badge>

            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight mb-6 drop-shadow-2xl">
                <span className="block text-white">Create</span>
                <span className="block bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">stunning</span>
                <span className="block bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">AI avatars</span>
                <span className="block text-white text-4xl md:text-5xl lg:text-6xl">instantly.</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl drop-shadow-lg font-medium">
                Virtura empowers professionals, creators, and brands with hyper-realistic, brand-ready digital avatars — no design skills required.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg font-bold bg-white text-black hover:bg-white/90 shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Create Your Avatar Now
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg font-semibold border-white/30 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 group"
              >
                Discover
                <ChevronDown className="ml-3 h-5 w-5 group-hover:translate-y-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Badge variant="secondary" className="px-4 py-2 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <Lock className="w-4 h-4 mr-2" />
                Private & Secure
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <Zap className="w-4 h-4 mr-2" />
                Instant Generation
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-white/10 border-white/20 text-white backdrop-blur-sm">
                <Camera className="w-4 h-4 mr-2" />
                Studio Quality
              </Badge>
            </div>
          </div>

          {/* Right - Model Showcase */}
          <div className="relative animate-subtle-bounce">
            <div className="grid grid-cols-2 gap-8 h-[700px]">
              {/* Main Model - Large */}
              <div className="col-span-1 row-span-2 relative group overflow-hidden rounded-3xl shadow-intense animate-flirty flirty-hover">
                <img 
                  src={heroModel1} 
                  alt="Realistic AI Model"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <Badge className="bg-primary/90 text-primary-foreground border-0 mb-3 animate-glow-pulse">
                    Professional Style
                  </Badge>
                  <p className="text-white/90 text-sm font-medium">Studio Quality Avatars</p>
                </div>
                <div className="absolute top-6 right-6 w-3 h-3 bg-destructive rounded-full animate-pulse" />
              </div>

              {/* Second Model - Top Right */}
              <div className="relative group overflow-hidden rounded-3xl shadow-warm animate-flirty flirty-hover" style={{animationDelay: '0.8s'}}>
                <img 
                  src={heroModel2} 
                  alt="Brunette AI Model"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="bg-secondary/90 text-secondary-foreground border-0 text-sm animate-glow-pulse">
                    Creative Style
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-pulse" />
              </div>

              {/* Third Model - Bottom Right */}
              <div className="relative group overflow-hidden rounded-3xl shadow-luxury animate-flirty flirty-hover" style={{animationDelay: '1.6s'}}>
                <img 
                  src={heroModel3} 
                  alt="Redhead AI Model"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 group-hover:brightness-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="bg-accent/90 text-accent-foreground border-0 text-sm animate-glow-pulse">
                    Brand Ready
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-secondary rounded-full animate-pulse" />
              </div>
            </div>

            {/* Floating Glow Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-destructive/20 rounded-full blur-xl animate-pulse delay-500" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/15 rounded-full blur-xl animate-pulse delay-700" />
            <div className="absolute top-1/2 -right-4 w-20 h-20 bg-secondary/25 rounded-full blur-lg animate-pulse delay-300" />
          </div>
        </div>

      </div>
    </section>
  );
};
