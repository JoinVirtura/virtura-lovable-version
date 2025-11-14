import React from "react";
import { Hero } from "./Hero";
import { TrendingRow } from "@/features/home";
import type { Tile } from "@/features/home";
import { StudioBackground } from "./StudioBackground";
import { NeuralVisual } from "./NeuralVisual";
import { usePublicGallery } from "@/hooks/usePublicGallery";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {
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
    prompt: item.prompt,
  }));

  if (loading) {
    return (
      <StudioBackground>
        <NeuralVisual />
        <Hero />
        <div className="pt-8 px-6">
          <div className="text-center text-muted-foreground">Loading gallery...</div>
        </div>
      </StudioBackground>
    );
  }

  return (
    <StudioBackground>
      <NeuralVisual />
      <div className="px-4 sm:px-6 lg:px-8">
        <Hero />
      </div>
      <div className="pt-4 sm:pt-6 lg:pt-8">
        {tiles.length > 0 ? (
          <TrendingRow tiles={tiles} className="px-4 sm:px-6 lg:px-8" />
        ) : (
          <div className="text-center py-8 sm:py-12 px-4 sm:px-6">
            <p className="text-sm sm:text-base text-muted-foreground">No content available yet. Start creating to see your work here!</p>
          </div>
        )}
      </div>
    </StudioBackground>
  );
}
