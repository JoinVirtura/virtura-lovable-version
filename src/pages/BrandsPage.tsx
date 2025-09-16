
import { useState } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { MotionBackground } from "@/components/MotionBackground";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Palette, Type, TrendingUp, Download, Share2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AvatarService } from "@/services/avatarService";

interface BrandAsset {
  id: string;
  image: string;
  prompt: string;
  timestamp: Date;
}

// Placeholder high-quality brand assets
const placeholderBrandAssets: BrandAsset[] = [
  {
    id: "brand-placeholder-1",
    image: "/src/assets/brand-marketing-campaign.jpg",
    prompt: "Professional marketing campaign imagery",
    timestamp: new Date()
  },
  {
    id: "brand-placeholder-2", 
    image: "/src/assets/brand-social-media.jpg",
    prompt: "Social media brand content",
    timestamp: new Date()
  },
  {
    id: "brand-placeholder-3",
    image: "/src/assets/brand-presentation-kit.jpg", 
    prompt: "Corporate presentation materials",
    timestamp: new Date()
  },
  {
    id: "brand-placeholder-4",
    image: "/src/assets/brand-logo-suite.jpg",
    prompt: "Brand logo and identity suite",
    timestamp: new Date()
  },
  {
    id: "brand-placeholder-5",
    image: "/src/assets/brand-signature-kit.jpg",
    prompt: "Brand signature kit design",
    timestamp: new Date()
  }
];

export default function BrandsPage() {
  const [brandAssets, setBrandAssets] = useState<BrandAsset[]>(placeholderBrandAssets);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string) => {
    console.log("Generating brand content with prompt:", prompt);
    setIsGenerating(true);
    
    try {
      // Brand-focused generation parameters
      const studioNegative = "blurry, low quality, text, watermark, logos, distorted, unrealistic, plastic";
      const brandPrompt = `${prompt}, professional commercial photography, high quality brand content, commercial advertising style, clean composition, professional lighting, marketing ready`;
      
      console.log("About to generate brand assets with prompt:", brandPrompt);
      
      // Generate brand assets with different orientations/styles
      const results = await Promise.all([
        AvatarService.generateAvatar({
          prompt: `${brandPrompt}, professional corporate style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${brandPrompt}, modern creative campaign style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${brandPrompt}, lifestyle marketing style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        })
      ]);

      console.log("Brand generation results:", results);

      const newAssets: BrandAsset[] = results
        .filter(result => result.success && result.image)
        .map((result, index) => ({
          id: `${Date.now()}_${index}`,
          image: result.image!,
          prompt: prompt,
          timestamp: new Date()
        }));

      console.log("Filtered brand assets:", newAssets);

      if (newAssets.length > 0) {
        setBrandAssets(prev => [...newAssets, ...prev]);
        toast.success(`Generated ${newAssets.length} brand assets!`);
      } else {
        // Show more detailed error information
        const errors = results.filter(r => !r.success).map(r => r.error).join(", ");
        console.error("All brand generations failed. Errors:", errors);
        toast.error(`Failed to generate brand assets. Errors: ${errors || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Brand asset generation error:', error);
      toast.error(`An error occurred while generating brand assets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MotionBackground />
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Welcome Banner */}
        <Card className="mb-8 p-6 bg-gradient-card border-primary/20">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h2 className="text-xl font-display font-bold text-foreground">
                🚀 Build ready-to-use commercials and campaigns powered by AI.
              </h2>
              <p className="text-muted-foreground">
                Create professional brand content, advertisements, and marketing materials
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              View Examples
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface type="brands" onGenerate={handleGenerate} />
            
            {/* Generated Previews */}
            <div className="mt-8">
              <h3 className="text-lg font-display font-bold mb-4">Generated Previews</h3>
              
              {isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <div className="aspect-video bg-muted relative flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground animate-spin" />
                      </div>
                      <div className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {brandAssets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {brandAssets.map((asset) => (
                    <Card key={asset.id} className="group overflow-hidden hover-zoom">
                      <div className="aspect-video bg-muted relative">
                        <img 
                          src={asset.image} 
                          alt={asset.prompt}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              Brand Colors
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-white border-white/50"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = asset.image;
                                link.download = `brand-asset-${asset.id}.png`;
                                link.click();
                                toast.success('Brand asset downloaded!');
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {asset.prompt}
                          </p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 ml-2"
                            onClick={() => {
                              if (navigator.share) {
                                navigator.share({
                                  title: 'AI Generated Brand Asset',
                                  url: asset.image
                                });
                              } else {
                                navigator.clipboard.writeText(asset.image);
                                toast.success('Image URL copied!');
                              }
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {asset.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Kit */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Brand Kit
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Palette className="w-4 h-4" />
                  Brand Colors
                </Button>
                <Button variant="outline" className="w-full justify-start gap-3">
                  <Type className="w-4 h-4" />
                  Brand Fonts
                </Button>
              </div>
              
              {/* Brand Preview */}
              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">Current Brand</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                  <div>
                    <p className="text-sm font-medium">Your Brand</p>
                    <p className="text-xs text-muted-foreground">No logo uploaded</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Campaign Templates */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Campaign Templates</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Product Launch</p>
                    <p className="text-sm text-muted-foreground">
                      Complete campaign assets for new products
                    </p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Social Media Pack</p>
                    <p className="text-sm text-muted-foreground">
                      Instagram, TikTok, and LinkedIn ready content
                    </p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Email Campaign</p>
                    <p className="text-sm text-muted-foreground">
                      Professional email marketing visuals
                    </p>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Recent Projects */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Recent Projects</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-muted rounded"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Summer Campaign</p>
                    <p className="text-xs text-muted-foreground">3 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 bg-muted rounded"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Product Mockups</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
