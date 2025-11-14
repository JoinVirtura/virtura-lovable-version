import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Sparkles, Share2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";

interface StyleData {
  id: string;
  kind: string;
  posterUrl: string;
  title: string;
  tag: string;
  views: number;
  prompt: string;
  videoUrl?: string;
}

interface StyleLightboxModalProps {
  style: StyleData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function StyleLightboxModal({ style, isOpen, onClose }: StyleLightboxModalProps) {
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleGenerate = () => {
    navigate('/auth');
  };

  const handleShare = async () => {
    if (!style) return;
    
    const shareUrl = `${window.location.origin}/#style-${style.id}`;
    const shareText = `Check out this amazing ${style.title} style! ${style.prompt}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: style.title,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (!style) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-border/50">
        <DialogTitle className="sr-only">{style.title}</DialogTitle>
        
        <div className="relative h-full flex flex-col">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-background/80 to-transparent">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                  {style.tag}
                </span>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Eye className="w-4 h-4" />
                  <span className="text-sm">{style.views.toLocaleString()}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/50 hover:bg-background/70 backdrop-blur-sm"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center p-4 pt-20">
            {style.videoUrl && isVideoPlaying ? (
              <video
                src={style.videoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onError={() => setIsVideoPlaying(false)}
              />
            ) : (
              <img
                src={style.posterUrl}
                alt={style.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                onMouseEnter={() => style.videoUrl && setIsVideoPlaying(true)}
                onMouseLeave={() => setIsVideoPlaying(false)}
              />
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-xl border-t border-border/50">
            <div className="max-w-4xl mx-auto space-y-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">{style.title}</h2>
                <p className="text-muted-foreground italic">"{style.prompt}"</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handleGenerate}
                  className="flex-1 min-w-[200px] bg-gradient-primary hover:opacity-90"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate with this Style
                </Button>
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
