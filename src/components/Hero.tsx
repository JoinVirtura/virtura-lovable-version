import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Users, Zap, Crown, Lock, Camera, Video, Heart } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen bg-gradient-hero flex items-center justify-center overflow-hidden">
      {/* Enhanced Background */}
      <div className="absolute inset-0 bg-gradient-glow" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,127,0.15)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,127,0.1)_0%,transparent_50%)]" />
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        {/* Premium Badge */}
        <div className="mb-8">
          <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2 text-sm font-medium">
            <Crown className="w-4 h-4 mr-2" />
            Premium AI Avatar Studio
          </Badge>
        </div>

        {/* Main Headline */}
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-6xl md:text-8xl lg:text-9xl font-bold text-foreground mb-8 leading-tight">
            Create
            <span className="block bg-gradient-warm bg-clip-text text-transparent">Irresistible</span>
            <span className="block text-foreground">AI Avatars</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Generate hyper-realistic, stunning avatars with unprecedented detail and allure. 
            Professional-grade AI technology meets artistic perfection.
          </p>
        </div>

        {/* Enhanced CTA Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg" 
              className="px-12 py-6 text-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow transition-all duration-300 hover:scale-105 hover:shadow-intense"
            >
              <Sparkles className="mr-3 h-6 w-6" />
              Start Creating Now
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="px-12 py-6 text-xl font-semibold border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
            >
              <Video className="mr-3 h-6 w-6" />
              Watch Demo
            </Button>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-card/50 border-border/50">
              <Lock className="w-4 h-4 mr-2" />
              Private & Secure
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-card/50 border-border/50">
              <Camera className="w-4 h-4 mr-2" />
              HD Quality
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 text-sm bg-card/50 border-border/50">
              <Heart className="w-4 h-4 mr-2" />
              Loved by 100k+ users
            </Badge>
          </div>
        </div>

        {/* Enhanced Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="group">
            <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-luxury hover:shadow-intense transition-all duration-500 hover:scale-105 hover:border-primary/30">
              <div className="w-16 h-16 bg-gradient-warm rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-glow">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">Hyper-Realistic</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Advanced AI creates incredibly lifelike avatars with micro-expressions, natural lighting, and captivating allure.
              </p>
              <div className="mt-4 flex space-x-2">
                <Badge variant="secondary" className="text-xs">4K Quality</Badge>
                <Badge variant="secondary" className="text-xs">Emotion AI</Badge>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-luxury hover:shadow-intense transition-all duration-500 hover:scale-105 hover:border-primary/30">
              <div className="w-16 h-16 bg-gradient-warm rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-glow">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">Lightning Fast</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Generate professional-quality avatars in under 30 seconds. Perfect for rapid content creation and iteration.
              </p>
              <div className="mt-4 flex space-x-2">
                <Badge variant="secondary" className="text-xs">Sub-30s</Badge>
                <Badge variant="secondary" className="text-xs">Batch Gen</Badge>
              </div>
            </div>
          </div>

          <div className="group">
            <div className="bg-gradient-card border border-border/50 rounded-2xl p-8 shadow-luxury hover:shadow-intense transition-all duration-500 hover:scale-105 hover:border-primary/30">
              <div className="w-16 h-16 bg-gradient-warm rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform shadow-glow">
                <Crown className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-4">Premium Studio</h3>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Advanced customization tools, premium models, and exclusive features for creating unique, captivating avatars.
              </p>
              <div className="mt-4 flex space-x-2">
                <Badge variant="secondary" className="text-xs">Pro Tools</Badge>
                <Badge variant="secondary" className="text-xs">Exclusive</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Decorative Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-60 h-60 bg-primary/15 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-10 w-20 h-20 bg-primary/25 rounded-full blur-2xl animate-pulse delay-500" />
      <div className="absolute bottom-1/3 right-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse delay-700" />
    </section>
  );
};