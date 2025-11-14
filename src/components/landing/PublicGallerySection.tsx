import { usePublicGallery } from "@/hooks/usePublicGallery";
import { WatermarkedImageCard } from "./WatermarkedImageCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface PublicGallerySectionProps {
  id?: string;
}

export function PublicGallerySection({ id }: PublicGallerySectionProps) {
  const { items, loading } = usePublicGallery(12);

  // Filter to only show images (not videos) for landing page
  const imageItems = items.filter(item => !item.is_video);

  return (
    <section id={id} className="py-24 bg-background relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Community Creations</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">Discover What Others </span>
            <span className="bg-gradient-text bg-clip-text text-transparent">
              Are Creating
            </span>
          </h2>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get inspired by AI-generated images from our community. Each creation showcases the power of Virtura AI.
          </p>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </Card>
            ))}
          </div>
        ) : imageItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {imageItems.slice(0, 12).map((item, index) => (
              <WatermarkedImageCard
                key={item.id}
                image={item.image_url}
                prompt={item.prompt}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No public images available yet. Be the first to create!</p>
          </div>
        )}

        {/* Bottom CTA */}
        {!loading && imageItems.length > 0 && (
          <div className="text-center mt-16 animate-fade-in">
            <p className="text-muted-foreground mb-4">
              Ready to create your own AI masterpieces?
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Sign up to download watermark-free images</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
