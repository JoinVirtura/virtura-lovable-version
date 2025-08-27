import { useState } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Palette, Type, TrendingUp } from "lucide-react";

export default function BrandsPage() {
  const [brandAssets, setBrandAssets] = useState<any[]>([]);

  const handleGenerate = (prompt: string) => {
    console.log("Generating brand content with prompt:", prompt);
    // This will integrate with existing avatar generation service
  };

  return (
    <div className="min-h-screen bg-background">
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            
            {/* Preview Grid */}
            {brandAssets.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-display font-bold mb-4">Generated Brand Assets</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brandAssets.map((asset, index) => (
                    <Card key={index} className="group overflow-hidden hover-zoom">
                      <div className="aspect-video bg-muted relative">
                        {asset.image && (
                          <img 
                            src={asset.image} 
                            alt={asset.prompt}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Quick Edit Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              Brand Colors
                            </Button>
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              Logo
                            </Button>
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              Copy
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground truncate">
                          {asset.prompt}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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