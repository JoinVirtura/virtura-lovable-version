import { RealAvatarLibrary } from "@/components/studio/RealAvatarLibrary";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { MotionBackground } from "@/components/MotionBackground";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function LibraryPage() {
  const navigate = useNavigate();

  const handleSelectAvatar = (avatarUrl: string, metadata: any) => {
    // Store selected avatar in sessionStorage
    sessionStorage.setItem('selectedAvatar', JSON.stringify({ avatarUrl, metadata }));
    
    // Navigate to Studio Pro with the selected avatar
    navigate('/video-pro');
    
    toast.success('Avatar selected! Opening Studio Pro...');
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MotionBackground />
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 mt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent">
            AI Generation Library
          </h1>
          <p className="text-muted-foreground text-lg">
            Your complete collection of AI-generated content
          </p>
        </div>

        {/* Library Component */}
        <RealAvatarLibrary
          onSelectAvatar={handleSelectAvatar}
          isProcessing={false}
        />
      </main>
    </div>
  );
}
