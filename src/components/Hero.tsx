import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Zap, Crown, Lock, Camera, Video, Heart, ChevronDown } from "lucide-react";

// Import hero avatars
import heroAvatar1 from "@/assets/hero-avatar-1.jpg";
import heroAvatar2 from "@/assets/hero-avatar-2.jpg";
import heroAvatar3 from "@/assets/hero-avatar-3.jpg";

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
            <Badge className="bg-primary/20 text-primary border-primary/50 px-6 py-3 text-base font-semibold">
              <Crown className="w-5 h-5 mr-3" />
              Revolutionary AI Technology
            </Badge>

            <div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-tight mb-6">
                AI Porn
                <span className="block bg-gradient-warm bg-clip-text text-transparent">Generator</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl">
                Take control of your XXX sex fantasies and create uncensored free AI porn with best AI porn generator. 
                Ready to create your own interactive AI porn, hentai, furry, anime nudes and more.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                size="lg" 
                className="px-8 py-6 text-lg font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-neon transition-all duration-300 hover:scale-105"
              >
                <Heart className="mr-3 h-6 w-6" />
                Try For Free
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-6 text-lg font-semibold border-border/50 text-foreground hover:bg-muted/20 transition-all duration-300 group"
              >
                Discover
                <ChevronDown className="ml-3 h-5 w-5 group-hover:translate-y-1 transition-transform" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
              <Badge variant="secondary" className="px-4 py-2 bg-card/60 border-border/30">
                <Lock className="w-4 h-4 mr-2" />
                Private & Secure
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-card/60 border-border/30">
                <Zap className="w-4 h-4 mr-2" />
                Instant Generation
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 bg-card/60 border-border/30">
                <Camera className="w-4 h-4 mr-2" />
                4K Quality
              </Badge>
            </div>
          </div>

          {/* Right - Avatar Showcase */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-6 h-[600px]">
              {/* Main Avatar - Large */}
              <div className="col-span-1 row-span-2 relative group overflow-hidden rounded-3xl shadow-intense">
                <img 
                  src={heroAvatar1} 
                  alt="Realistic AI Avatar"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <Badge className="bg-primary/90 text-primary-foreground border-0 mb-2">
                    Realistic Style
                  </Badge>
                </div>
              </div>

              {/* Anime Avatar - Top Right */}
              <div className="relative group overflow-hidden rounded-3xl shadow-warm">
                <img 
                  src={heroAvatar2} 
                  alt="Anime AI Avatar"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-primary/90 text-primary-foreground border-0 text-sm">
                    Anime Style
                  </Badge>
                </div>
              </div>

              {/* Artistic Avatar - Bottom Right */}
              <div className="relative group overflow-hidden rounded-3xl shadow-luxury">
                <img 
                  src={heroAvatar3} 
                  alt="Artistic AI Avatar"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <Badge className="bg-primary/90 text-primary-foreground border-0 text-sm">
                    Artistic Style
                  </Badge>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/20 rounded-full blur-xl animate-pulse delay-500" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/15 rounded-full blur-xl animate-pulse delay-700" />
          </div>
        </div>

      </div>
    </section>
  );
};