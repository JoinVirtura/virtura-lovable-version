import { RealAvatarLibrary } from "@/components/studio/RealAvatarLibrary";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { MotionBackground } from "@/components/MotionBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Sparkles, Upload, Film, Zap } from "lucide-react";

export default function LibraryPage() {
  const navigate = useNavigate();

  const handleSelectAvatar = (avatarUrl: string, metadata: any) => {
    sessionStorage.setItem('selectedAvatar', JSON.stringify({ avatarUrl, metadata }));
    navigate('/video-pro');
    toast.success('Avatar selected! Opening Studio Pro...');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MotionBackground />
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          {/* Main Library Content */}
          <div>
            <RealAvatarLibrary
              onSelectAvatar={handleSelectAvatar}
              isProcessing={false}
            />
          </div>

          {/* Sidebar - Quick Actions */}
          <div className="space-y-6">
            <Card className="border-violet-500/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/ai-image-studio')}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate New Avatar
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/upload')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Image
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => navigate('/video-pro')}
                >
                  <Film className="h-4 w-4 mr-2" />
                  Create Video
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
