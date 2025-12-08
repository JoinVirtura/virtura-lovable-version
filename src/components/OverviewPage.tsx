import React from "react";
import { Hero } from "./Hero";
import { StudioBackground } from "./StudioBackground";
import { NeuralVisual } from "./NeuralVisual";

interface OverviewPageProps {
  onViewChange: (view: string) => void;
}

export function OverviewPage({ onViewChange }: OverviewPageProps) {
  return (
    <StudioBackground>
      <NeuralVisual />
      <Hero />
    </StudioBackground>
  );
}
