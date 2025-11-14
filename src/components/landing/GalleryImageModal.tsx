import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface GalleryImage {
  id: string;
  image_url: string;
  title: string;
  prompt: string;
  tags: string[];
}

interface GalleryImageModalProps {
  image: GalleryImage | null;
  isOpen: boolean;
  onClose: () => void;
  relatedImages: GalleryImage[];
}

export function GalleryImageModal({ image, isOpen, onClose, relatedImages }: GalleryImageModalProps) {
  const navigate = useNavigate();
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random()}`);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleCTAClick = async () => {
    // Track analytics
    try {
      await fetch('https://ujaoziqnxhjqlmnvlxav.supabase.co/functions/v1/track-landing-analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'gallery_modal_cta_clicked',
          prompt: image?.prompt,
          session_id: sessionId,
          metadata: { image_id: image?.id }
        })
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }

    navigate('/auth');
  };

  if (!image) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">{image.title}</DialogTitle>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Main Image */}
          <div className="lg:col-span-2 relative bg-black">
            <img
              src={image.image_url}
              alt={image.title}
              className="w-full h-full object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
              onClick={onClose}
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Sidebar */}
          <div className="p-6 overflow-y-auto bg-card">
            <div className="space-y-6">
              {/* Title & Prompt */}
              <div>
                <h2 className="text-2xl font-bold mb-2">{image.title}</h2>
                <p className="text-sm text-muted-foreground italic">"{image.prompt}"</p>
              </div>

              {/* CTA Button */}
              <Button
                onClick={handleCTAClick}
                className="w-full bg-gradient-primary hover:opacity-90"
                size="lg"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Your Own
              </Button>

              {/* Related Images */}
              {relatedImages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Related Showcase</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {relatedImages.slice(0, 6).map((related) => (
                      <button
                        key={related.id}
                        onClick={() => {
                          // Update to show related image
                          window.location.hash = related.id;
                        }}
                        className="aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                      >
                        <img
                          src={related.image_url}
                          alt={related.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <h3 className="text-sm font-semibold mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags.filter(tag => !['showcase', 'gallery', 'featured'].includes(tag)).map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-muted text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}