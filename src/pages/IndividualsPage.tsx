import { useState } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, Edit, Share2, Download, Eye } from "lucide-react";
import { toast } from "sonner";
import { AvatarService } from "@/services/avatarService";

interface GeneratedAvatar {
  id: string;
  image: string;
  prompt: string;
  timestamp: Date;
}

export default function IndividualsPage() {
  const [generatedAvatars, setGeneratedAvatars] = useState<GeneratedAvatar[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string) => {
    console.log("Generating individuals avatar with prompt:", prompt);
    setIsGenerating(true);
    
    try {
      // Avatar Studio workflow parameters
      const studioNegative = "blurry fingers, extra limbs, distorted faces, unrealistic body proportions, text, watermark, low quality, plastic skin, CGI, doll-like";
      const enhancedPrompt = `${prompt}, professional studio headshot, realistic natural lighting, high quality, professional photography, 8k resolution, sharp focus, realistic skin texture, detailed hair, photorealistic, single person`;
      
      console.log("About to generate avatars with enhanced prompt:", enhancedPrompt);
      
      // Generate 3 variations for individuals
      const results = await Promise.all([
        AvatarService.generateAvatar({
          prompt: `${enhancedPrompt}, professional headshot style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${enhancedPrompt}, creative artistic portrait`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${enhancedPrompt}, casual lifestyle portrait`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        })
      ]);

      console.log("Generation results:", results);

      const newAvatars: GeneratedAvatar[] = results
        .filter(result => result.success && result.image)
        .map((result, index) => ({
          id: `${Date.now()}_${index}`,
          image: result.image!,
          prompt: prompt,
          timestamp: new Date()
        }));

      console.log("Filtered avatars:", newAvatars);

      if (newAvatars.length > 0) {
        setGeneratedAvatars(prev => [...newAvatars, ...prev]);
        toast.success(`Generated ${newAvatars.length} high-quality avatars!`);
      } else {
        // Show more detailed error information
        const errors = results.filter(r => !r.success).map(r => r.error).join(", ");
        console.error("All generations failed. Errors:", errors);
        toast.error(`Failed to generate avatars. Errors: ${errors || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
      toast.error(`An error occurred while generating avatars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
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
                🎉 New here? Watch how to create your first avatar in 30 seconds.
              </h2>
              <p className="text-muted-foreground">
                Generate photorealistic avatars, headshots, and social content with AI
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface type="individuals" onGenerate={handleGenerate} />
            
            {/* Generated Previews */}
            <div className="mt-8">
              <h3 className="text-lg font-display font-bold mb-4">Generated Previews</h3>
              
              {isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <div className="aspect-square bg-muted relative flex items-center justify-center">
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
              
              {generatedAvatars.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedAvatars.map((avatar) => (
                    <Card key={avatar.id} className="group overflow-hidden hover-zoom">
                      <div className="aspect-square bg-muted relative">
                        <img 
                          src={avatar.image} 
                          alt={avatar.prompt}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              <Edit className="w-4 h-4 mr-1" />
                              Quick Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-white border-white/50"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = avatar.image;
                                link.download = `avatar-${avatar.id}.png`;
                                link.click();
                                toast.success('Avatar downloaded!');
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
                            {avatar.prompt}
                          </p>
                          <div className="flex gap-1 ml-2">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8"
                              onClick={() => {
                                if (navigator.share) {
                                  navigator.share({
                                    title: 'AI Generated Avatar',
                                    url: avatar.image
                                  });
                                } else {
                                  navigator.clipboard.writeText(avatar.image);
                                  toast.success('Image URL copied!');
                                }
                              }}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {avatar.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {!isGenerating && generatedAvatars.length === 0 && (
                <Card className="p-8 text-center">
                  <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No avatars generated yet. Try a prompt above!</p>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* AI Suggestions */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI Suggestions
              </h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Try different lighting</p>
                    <p className="text-sm text-muted-foreground">
                      "Professional headshot with golden hour lighting"
                    </p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Add expressions</p>
                    <p className="text-sm text-muted-foreground">
                      "Confident smile in business attire"
                    </p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Change background</p>
                    <p className="text-sm text-muted-foreground">
                      "Modern office environment backdrop"
                    </p>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Recent Avatars */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Recent Avatars</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Professional headshot</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Casual portrait</p>
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