
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
                <span className="block bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-lg">AI Avatars</span>
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

          {/* Right - Model Showcase with Interactive Effects */}
          <div className="relative animate-subtle-bounce">
            <div className="grid grid-cols-2 gap-8 h-[700px]">
              {/* Main Model - Large with enhanced interactivity */}
              <div className="col-span-1 row-span-2 relative group overflow-hidden rounded-3xl shadow-intense animate-flirty flirty-hover cursor-pointer">
                <img 
                  src={heroModel1} 
                  alt="Realistic AI Model"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110 group-hover:contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/60 group-hover:via-black/5 transition-all duration-500" />
                
                {/* Interactive glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />
                
                {/* Floating particles that appear on hover */}
                <div className="absolute top-8 left-8 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                </div>
                <div className="absolute top-16 left-12 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-3 group-hover:translate-y-0">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" style={{animationDelay: '0.3s'}} />
                </div>
                <div className="absolute top-12 right-12 opacity-0 group-hover:opacity-100 transition-all duration-600 transform translate-x-2 group-hover:translate-x-0">
                  <div className="w-2.5 h-2.5 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.1s'}} />
                </div>
                
                <div className="absolute bottom-8 left-8 right-8 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Badge className="bg-primary/90 text-primary-foreground border-0 mb-3 animate-glow-pulse group-hover:scale-105 transition-transform duration-200">
                    Professional Style
                  </Badge>
                  <p className="text-white/90 text-sm font-medium group-hover:text-white transition-colors duration-300">Studio Quality Avatars</p>
                </div>
                
                <div className="absolute top-6 right-6 w-3 h-3 bg-destructive rounded-full animate-pulse group-hover:animate-ping transition-all duration-200" />
                
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-4 border-t-4 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-l-8 group-hover:border-t-8" />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-4 border-b-4 border-primary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-r-8 group-hover:border-b-8" />
              </div>

              {/* Second Model - Top Right with enhanced interactivity */}
              <div className="relative group overflow-hidden rounded-3xl shadow-warm animate-flirty flirty-hover cursor-pointer" style={{animationDelay: '0.8s'}}>
                <img 
                  src={heroModel2} 
                  alt="Brunette AI Model"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110 group-hover:contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/60 group-hover:via-black/5 transition-all duration-500" />
                
                {/* Interactive glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-secondary/20 via-transparent to-transparent" />
                
                {/* Floating particles */}
                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                </div>
                <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-all duration-600 transform translate-x-1 group-hover:translate-x-0">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}} />
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Badge className="bg-secondary/90 text-secondary-foreground border-0 text-sm animate-glow-pulse group-hover:scale-105 transition-transform duration-200">
                    Creative Style
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-pulse group-hover:animate-ping transition-all duration-200" />
                
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-3 border-t-3 border-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-l-6 group-hover:border-t-6" />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-3 border-b-3 border-secondary opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-r-6 group-hover:border-b-6" />
              </div>

              {/* Third Model - Bottom Right with enhanced interactivity */}
              <div className="relative group overflow-hidden rounded-3xl shadow-luxury animate-flirty flirty-hover cursor-pointer" style={{animationDelay: '1.6s'}}>
                <img 
                  src={heroModel3} 
                  alt="Redhead AI Model"
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110 group-hover:contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/60 group-hover:via-black/5 transition-all duration-500" />
                
                {/* Interactive glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-t from-accent/20 via-transparent to-transparent" />
                
                {/* Floating particles */}
                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                  <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                </div>
                <div className="absolute top-4 right-6 opacity-0 group-hover:opacity-100 transition-all duration-600 transform translate-x-1 group-hover:translate-x-0">
                  <div className="w-1.5 h-1.5 bg-destructive rounded-full animate-pulse" style={{animationDelay: '0.4s'}} />
                </div>
                
                <div className="absolute bottom-6 left-6 right-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <Badge className="bg-accent/90 text-accent-foreground border-0 text-sm animate-glow-pulse group-hover:scale-105 transition-transform duration-200">
                    Brand Ready
                  </Badge>
                </div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-secondary rounded-full animate-pulse group-hover:animate-ping transition-all duration-200" />
                
                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-0 h-0 border-l-3 border-t-3 border-accent opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-l-6 group-hover:border-t-6" />
                <div className="absolute bottom-0 right-0 w-0 h-0 border-r-3 border-b-3 border-accent opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-r-6 group-hover:border-b-6" />
              </div>
            </div>

            {/* Enhanced Floating Glow Elements */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-destructive/20 rounded-full blur-xl animate-pulse delay-500" />
            <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary/15 rounded-full blur-xl animate-pulse delay-700" />
            <div className="absolute top-1/2 -right-4 w-20 h-20 bg-secondary/25 rounded-full blur-lg animate-pulse delay-300" />
          </div>
        </div>

      </div>
    </section>
  );
};
