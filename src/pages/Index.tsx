
import Navigation from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { TrendingRow } from "@/features/home/components/TrendingRow";
import { getMockTiles } from "@/features/home/mock-data";

const Index = () => {
  const trendingTiles = getMockTiles('trending', 50);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <Hero />
      <div className="flex-1">
        <TrendingRow tiles={trendingTiles} />
      </div>
    </div>
  );
};

export default Index;
