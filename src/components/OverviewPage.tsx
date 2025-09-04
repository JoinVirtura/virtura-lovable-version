import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  ArrowRight,
  Sparkles,
  Video,
  User,
  Clapperboard,
  TrendingUp,
  Clock,
  Eye
} from "lucide-react";

// Import hero avatars for the trending section
import heroAvatar1 from "@/assets/hero-avatar-1.jpg";
import heroAvatar2 from "@/assets/hero-avatar-2.jpg";
import heroAvatar3 from "@/assets/hero-avatar-3.jpg";
import model1 from "@/assets/model-aria.jpg";
import model2 from "@/assets/model-bella.jpg";
import model3 from "@/assets/model-diana.jpg";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null);

  const features = [
    {
      id: "avatar",
      title: "AI Avatar Creation",
      subtitle: "Transform ideas into photorealistic avatars",
      description: "Create stunning, lifelike avatars from text descriptions or photos",
      image: heroAvatar1,
      action: "Create Avatar",
      targetView: "create",
      gradient: "from-purple-600/20 to-pink-600/20",
      iconBg: "bg-purple-500/20",
      icon: User
    },
    {
      id: "talking",
      title: "AI Talking Avatar Studio",
      subtitle: "Craft dynamic talking avatars from script to screen",
      description: "Bring your avatars to life with advanced lip-sync and voice generation",
      image: heroAvatar2,
      action: "Open Studio",
      targetView: "talking-avatar",
      gradient: "from-emerald-600/20 to-teal-600/20",
      iconBg: "bg-emerald-500/20",
      icon: Sparkles
    },
    {
      id: "video",
      title: "AI Video Generation",
      subtitle: "Transform ideas into vibrant videos",
      description: "Generate professional-quality videos with AI-powered storytelling",
      image: heroAvatar3,
      action: "Generate Video",
      targetView: "studio",
      gradient: "from-blue-600/20 to-cyan-600/20",
      iconBg: "bg-blue-500/20",
      icon: Video
    },
    {
      id: "drama",
      title: "AI Drama Studio",
      subtitle: "Craft short dramas from script to screen",
      description: "Create cinematic narratives with AI-generated characters and scenes",
      image: model1,
      action: "Create Drama",
      targetView: "studio",
      gradient: "from-orange-600/20 to-red-600/20",
      iconBg: "bg-orange-500/20",
      icon: Clapperboard
    }
  ];

  const trendingCreations = [
    {
      id: 1,
      title: "Corporate Executive",
      creator: "Alex Chen",
      thumbnail: model1,
      duration: "2:45",
      views: "12.5K",
      category: "Professional"
    },
    {
      id: 2,
      title: "Fashion Campaign",
      creator: "Maya Studios",
      thumbnail: model2,
      duration: "1:30",
      views: "8.7K",
      category: "Fashion"
    },
    {
      id: 3,
      title: "Tech Presentation",
      creator: "David Kim",
      thumbnail: model3,
      duration: "3:20",
      views: "15.2K",
      category: "Technology"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-alive" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-gentle-sway" />
        
        <div className="relative container mx-auto px-8 py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <Badge variant="secondary" className="px-6 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
              <Sparkles className="w-4 h-4 mr-2" />
              Next-Generation AI Studio
            </Badge>
            
            <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary via-primary-dark to-accent bg-clip-text text-transparent">
                VISUALIZE
              </span>
              <br />
              <span className="text-foreground">YOUR STORY</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              All-in-one AI video creation platform. Transform ideas into photorealistic avatars, 
              talking personas, and cinematic experiences.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Button 
                size="xl" 
                className="px-8 py-4 text-lg font-bold bg-gradient-gold hover:bg-gradient-gold-hover shadow-gold hover:shadow-gold-intense hover:scale-105 transition-all duration-300"
                onClick={() => onViewChange("create")}
              >
                Start Creating
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                className="px-8 py-4 text-lg border-primary/20 hover:bg-primary/5 hover:border-primary/40 transition-all duration-300"
                onClick={() => onViewChange("library")}
              >
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="container mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4">
            Create Without Limits
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional-grade AI tools for every creative vision
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.id}
                className={`group relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-card cursor-pointer ${
                  hoveredFeature === feature.id ? 'scale-105' : ''
                }`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => onViewChange(feature.targetView)}
              >
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                
                <CardContent className="relative p-0">
                  {/* Image Section */}
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                    
                    {/* Icon */}
                    <div className={`absolute top-6 left-6 p-3 rounded-xl ${feature.iconBg} backdrop-blur-sm border border-white/10`}>
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="p-4 rounded-full bg-primary/20 backdrop-blur-sm border border-primary/30">
                        <Play className="w-8 h-8 text-primary fill-primary" />
                      </div>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-8">
                    <h3 className="text-2xl font-display font-bold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-primary font-medium mb-3">
                      {feature.subtitle}
                    </p>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    
                    <Button 
                      className="w-full bg-gradient-gold hover:bg-gradient-gold-hover shadow-gold hover:shadow-gold-intense group-hover:scale-105 transition-all duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewChange(feature.targetView);
                      }}
                    >
                      {feature.action}
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Trending Creations Section */}
      <section className="container mx-auto px-8 py-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Trending Creations
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover what the community is creating
            </p>
          </div>
          <Button 
            variant="outline" 
            className="border-primary/20 hover:bg-primary/5"
            onClick={() => onViewChange("library")}
          >
            View All
            <TrendingUp className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {trendingCreations.map((creation) => (
            <Card
              key={creation.id}
              className="group overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-card cursor-pointer"
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={creation.thumbnail}
                    alt={creation.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="p-3 rounded-full bg-primary/90 backdrop-blur-sm">
                      <Play className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                    </div>
                  </div>
                  
                  {/* Duration Badge */}
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 rounded text-white text-xs font-medium">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {creation.duration}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-primary/90 rounded-full text-primary-foreground text-xs font-medium">
                    {creation.category}
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <h3 className="font-display font-bold text-foreground mb-2">
                    {creation.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>by {creation.creator}</span>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {creation.views}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}