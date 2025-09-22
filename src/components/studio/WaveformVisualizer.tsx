import React, { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  audioData?: string | number[]; // Can accept audio URL or waveform data array
  isPlaying?: boolean;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

import { EnhancedWaveformVisualizer } from './EnhancedWaveformVisualizer';

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = (props) => {
  return <EnhancedWaveformVisualizer {...props} />;
};
