import Navigation from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { MasonryGrid } from "@/components/MasonryGrid";
import { usePublicGallery } from "@/hooks/usePublicGallery";
import type { Tile } from "@/features/home";

const Index = () => {
  const { items, loading } = usePublicGallery(100);

  // Convert gallery items to Tile format
  const tiles: Tile[] = items.map(item => ({
    id: item.id,
    kind: item.is_video ? 'video' : 'image',
    posterUrl: item.is_video ? (item.thumbnail_url || item.image_url) : item.image_url,
    title: item.title || 'Untitled',
    tag: item.tags?.[0] || 'Generated',
    views: 0,
    byline: '',
    duration: item.is_video && item.duration ? `${item.duration}s` : undefined,
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <Hero />
      <div className="flex-1">
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading gallery...</div>
        ) : tiles.length > 0 ? (
          <MasonryGrid tiles={tiles} />
        ) : (
          <div className="text-center py-12 px-6">
            <p className="text-muted-foreground">No content available yet. Start creating to see your work here!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
