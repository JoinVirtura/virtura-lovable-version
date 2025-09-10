
import Navigation from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { TrendingRow } from "@/features/home/components/TrendingRow";
import { getMockTiles } from "@/features/home/mock-data";

const Index = () => {
  const trendingTiles = getMockTiles('trending', 50);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <TrendingRow tiles={trendingTiles} />
    </div>
  );
};

export default Index;
