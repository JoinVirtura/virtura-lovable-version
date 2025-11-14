import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface WatermarkedImageCardProps {
  image: string;
  prompt?: string;
  index: number;
  sessionId?: string;
}

export function WatermarkedImageCard({ image, prompt, index, sessionId }: WatermarkedImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleDownloadClick = async () => {
    console.log('[Landing] CTA clicked from image:', index);
    
    // Track analytics
    try {
      await fetch('https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/track-landing-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'signup_clicked',
          prompt,
          session_id: sessionId || `session_${Date.now()}`,
          metadata: { source: 'generated_image', index }
        })
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }

    navigate("/auth");
  };

  return (
    <div
      className="relative group overflow-hidden rounded-xl bg-card border border-border animate-fade-in"
      style={{ animationDelay: `${index * 0.15}s` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square">
        <img
          src={image}
          alt={prompt || `Generated image ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Watermark Overlay */}
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="watermark-overlay" />
        </div>

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-4 left-4 right-4">
            <Button
              onClick={handleDownloadClick}
              className="w-full bg-gradient-primary hover:shadow-violet-glow transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Sign Up to Download
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Badge */}
      <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/20">
        <span className="text-xs text-white font-medium">AI Generated</span>
      </div>
    </div>
  );
}
