
import Navigation from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { TrendingRow } from "@/features/home/components/TrendingRow";
import { getMockTiles } from "@/features/home/mock-data";

const Index = () => {
  const trendingTiles = getMockTiles('trending', 24); // Get 24 tiles for full page

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      
      {/* Full Page Trending Creations */}
      <div className="container mx-auto px-6 py-16">
        <TrendingRow tiles={trendingTiles} className="pb-20" />
      </div>
    </div>
  );
};

export default Index;
