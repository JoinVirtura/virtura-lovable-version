import React, { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { TrendingRow, FeatureCards, RecentRow, TrendingWall, getMockTiles, mockTutorials } from "@/features/home";
import type { Tile } from "@/features/home";
import { StudioBackground } from "./StudioBackground";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {
  return (
    <StudioBackground>
      <div className="pt-64">
        <Hero />
        <div className="pt-8">
          <TrendingRow tiles={getMockTiles('trending', 100)} className="px-0" />
        </div>
      </div>
    </StudioBackground>
  );
}
