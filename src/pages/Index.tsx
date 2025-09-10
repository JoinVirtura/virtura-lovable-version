
import Navigation from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { MasonryGrid } from "@/components/MasonryGrid";
import { getMockTiles } from "@/features/home/mock-data";

const Index = () => {
  const trendingTiles = getMockTiles('trending', 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <Hero />
      <div className="flex-1">
        <MasonryGrid tiles={trendingTiles} />
      </div>
    </div>
  );
};

export default Index;
