
import Navigation from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { TrendingRow } from "@/features/home/components/TrendingRow";
import { getMockTiles } from "@/features/home/mock-data";

const Index = () => {
  const trendingTiles = getMockTiles('trending', 50); // Get all 50 tiles for full page coverage

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Full Viewport Trending Creations - Revolutionary Layout */}
      <div className="px-4 sm:px-6 lg:px-8 pb-20">
        <TrendingRow tiles={trendingTiles} className="min-h-screen" />
      </div>
    </div>
  );
};

export default Index;
