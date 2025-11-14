import React from "react";
import { Hero } from "./Hero";
import { TrendingRow } from "@/features/home";
import { StudioBackground } from "./StudioBackground";
import { NeuralVisual } from "./NeuralVisual";
import { showcaseGallery } from "@/data/showcase-gallery";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {
  return (
    <StudioBackground>
      <NeuralVisual />
      <Hero />
      <div className="pt-8">
        <TrendingRow tiles={showcaseGallery} className="px-0" />
      </div>
    </StudioBackground>
  );
}
