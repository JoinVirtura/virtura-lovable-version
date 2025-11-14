import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface GalleryImageCardProps {
  image: string;
  prompt: string;
  index: number;
}

export function GalleryImageCard({ image, prompt, index }: GalleryImageCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="relative group overflow-hidden rounded-xl bg-card border border-border shadow-md hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Clean Image - NO WATERMARK (showcase quality) */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={image}
          alt={prompt || `Gallery showcase ${index + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Hover CTA Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 flex flex-col justify-end p-4">
            <Button
              onClick={() => navigate("/auth")}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
              size="sm"
            >
              Create Your Own
            </Button>
          </div>
        </div>
      </div>

      {/* Quality Badge */}
      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-white/10">
        <span className="text-xs text-white font-medium">HD Quality</span>
      </div>
    </div>
  );
}
