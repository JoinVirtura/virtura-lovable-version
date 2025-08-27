import { useState } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Sparkles, Edit, Share2 } from "lucide-react";

export default function IndividualsPage() {
  const [generatedAvatars, setGeneratedAvatars] = useState<any[]>([]);

  const handleGenerate = (prompt: string) => {
    console.log("Generating with prompt:", prompt);
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
            
            {/* Preview Grid */}
            {generatedAvatars.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-display font-bold mb-4">Generated Avatars</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedAvatars.map((avatar, index) => (
                    <Card key={index} className="group overflow-hidden hover-zoom">
                      <div className="aspect-square bg-muted relative">
                        {avatar.image && (
                          <img 
                            src={avatar.image} 
                            alt={avatar.prompt}
                            className="w-full h-full object-cover"
                          />
                        )}
                        
                        {/* Quick Edit Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              Hair
                            </Button>
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              Outfit
                            </Button>
                            <Button size="sm" variant="outline" className="text-white border-white/50">
                              Background
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-muted-foreground truncate">
                            {avatar.prompt}
                          </p>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
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