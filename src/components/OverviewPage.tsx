import React, { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { TrendingRow, FeatureCards, RecentRow, TrendingWall, getMockTiles, mockTutorials } from "@/features/home";
import type { Tile } from "@/features/home";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {

  return (
    <div className="min-h-screen w-full bg-background">
      <Hero />
      <TrendingRow tiles={getMockTiles('trending', 100)} className="px-0" />
    </div>
  );
}
