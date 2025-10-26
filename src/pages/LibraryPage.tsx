import { RealAvatarLibrary } from "@/components/studio/RealAvatarLibrary";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { MotionBackground } from "@/components/MotionBackground";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
        {/* Library Component */}
        <RealAvatarLibrary
          onSelectAvatar={handleSelectAvatar}
          isProcessing={false}
        />
      </main>
    </div>
  );
}
