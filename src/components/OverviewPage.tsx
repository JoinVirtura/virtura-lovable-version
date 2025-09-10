import React, { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { TrendingRow, FeatureCards, RecentRow, TrendingWall, getMockTiles, mockTutorials } from "@/features/home";
import type { Tile } from "@/features/home";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {
  const [trendingTiles, setTrendingTiles] = useState<Tile[]>([]);
  const [wallTiles, setWallTiles] = useState<Tile[]>([]);
  const [tutorials, setTutorials] = useState<Tile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // TODO: Replace with actual Supabase query when gallery table exists
        // const { data: galleryData } = await supabase
        //   .from('gallery')
        //   .select('id, kind, poster_url, preview_video_url, title, tag, duration, views, byline')
        //   .order('created_at', { ascending: false });

        // For now, use mock data
        const trending = getMockTiles('trending', 50); // Get more tiles for full page coverage
        const wall = getMockTiles('wall', 30);
        const tutorialData = getMockTiles('recent', 2);

        setTrendingTiles(trending);
        setWallTiles(wall);
        setTutorials(tutorialData);
      } catch (error) {
        console.error('Error loading gallery data:', error);
        // Fallback to mock data
        setTrendingTiles(getMockTiles('trending', 50));
        setWallTiles(getMockTiles('wall', 30));
        setTutorials(mockTutorials);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <Hero />
      
      {/* Trending Creations - Fill remaining space */}
      <div className="flex-1">
        <div className="container mx-auto px-6 py-16">
          <TrendingRow 
            tiles={trendingTiles}
            className="animate-fade-in"
          />
        </div>
      </div>
    </div>
  );
}
