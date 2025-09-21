import React, { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  audioData?: string; // base64 audio data
  isPlaying?: boolean;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  audioData,
  isPlaying = false,
  width = 300,
  height = 60,
  color = 'hsl(51 100% 50%)',
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate mock waveform data for visualization
  useEffect(() => {
    if (audioData) {
      // In a real implementation, you would decode the audio and extract actual waveform data
      const mockWaveform = Array.from({ length: 100 }, (_, i) => {
        return Math.sin(i * 0.1) * 0.5 + Math.random() * 0.3;
      });
      setWaveformData(mockWaveform);
    } else {
      // Generate a random waveform for demo purposes
      const demoWaveform = Array.from({ length: 100 }, () => Math.random() * 0.8);
      setWaveformData(demoWaveform);
    }
  }, [audioData]);

  // Animate the waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const barWidth = width / waveformData.length;
      const centerY = height / 2;

      waveformData.forEach((amplitude, index) => {
        const x = index * barWidth;
        const barHeight = amplitude * height * 0.8;
        
        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2);
        
        if (isPlaying) {
          // Animated playing state
          const playPosition = (animationFrame * 0.02) % 1;
          const distance = Math.abs((index / waveformData.length) - playPosition);
          const intensity = Math.max(0, 1 - distance * 5);
          
          gradient.addColorStop(0, `hsl(51 100% ${50 + intensity * 20}%)`);
          gradient.addColorStop(0.5, `hsl(51 100% ${40 + intensity * 30}%)`);
          gradient.addColorStop(1, `hsl(51 100% ${30 + intensity * 20}%)`);
        } else {
          // Static state
          gradient.addColorStop(0, color);
          gradient.addColorStop(0.5, `${color}80`);
          gradient.addColorStop(1, `${color}40`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - barHeight/2, barWidth - 1, barHeight);
      });

      if (isPlaying) {
        animationFrame++;
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [waveformData, isPlaying, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={`rounded ${className}`}
      style={{ background: 'hsl(0 0% 15%)' }}
    />
  );
};