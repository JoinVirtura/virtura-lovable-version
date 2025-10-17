import React, { useEffect, useRef, useState } from 'react';

interface EnhancedWaveformVisualizerProps {
  audioData?: string | number[]; 
  isPlaying?: boolean;
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  fillContainer?: boolean;
  showSpectrum?: boolean;
  showFrequencyBands?: boolean;
  animationSpeed?: number;
}

export const EnhancedWaveformVisualizer: React.FC<EnhancedWaveformVisualizerProps> = ({
  audioData,
  isPlaying = false,
  width = 600,
  height = 120,
  color = 'hsl(51 100% 50%)',
  className = '',
  fillContainer = true,
  showSpectrum = true,
  showFrequencyBands = false,
  animationSpeed = 0.02
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [spectrumData, setSpectrumData] = useState<number[]>([]);
  const [containerSize, setContainerSize] = useState({ width, height });

  // Handle container resizing
  useEffect(() => {
    if (!fillContainer) return;

    const updateSize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        const rect = canvas.parentElement.getBoundingClientRect();
        setContainerSize({
          width: rect.width || width,
          height: rect.height || height
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [fillContainer, width, height]);

  useEffect(() => {
    if (audioData) {
      if (Array.isArray(audioData)) {
        setWaveformData(audioData.length > 0 ? audioData : generateRealisticWaveform(200));
      } else {
        // Generate realistic waveform from audio URL
        setWaveformData(generateRealisticWaveform(200));
      }
    } else {
      setWaveformData(generateRealisticWaveform(200));
    }

    // Generate spectrum data for enhanced visualization
    if (showSpectrum) {
      setSpectrumData(generateSpectrumData(64));
    }
  }, [audioData, showSpectrum]);

  const generateRealisticWaveform = (length: number): number[] => {
    return Array.from({ length }, (_, i) => {
      // Create more realistic audio patterns
      const baseWave = Math.sin(i * 0.1) * 0.5;
      const highFreq = Math.sin(i * 0.5) * 0.2;
      const noise = (Math.random() - 0.5) * 0.3;
      const envelope = Math.exp(-Math.abs(i - length/2) / (length/4)) * 0.8;
      
      return Math.abs(baseWave + highFreq + noise) * envelope + 0.1;
    });
  };

  const generateSpectrumData = (length: number): number[] => {
    return Array.from({ length }, (_, i) => {
      // Generate frequency spectrum simulation
      const frequency = i / length;
      const amplitude = Math.exp(-frequency * 3) * (0.3 + Math.random() * 0.7);
      return amplitude;
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const actualWidth = fillContainer ? containerSize.width : width;
    const actualHeight = fillContainer ? containerSize.height : height;

    // Set canvas size
    canvas.width = actualWidth;
    canvas.height = actualHeight;

    let animationFrame = 0;

    const animate = () => {
      ctx.clearRect(0, 0, actualWidth, actualHeight);

      if (showSpectrum && spectrumData.length > 0) {
        renderSpectrum(ctx, actualWidth, actualHeight, animationFrame);
      }

      renderWaveform(ctx, actualWidth, actualHeight, animationFrame);

      if (showFrequencyBands) {
        renderFrequencyBands(ctx, actualWidth, actualHeight, animationFrame);
      }

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
  }, [waveformData, spectrumData, isPlaying, containerSize, showSpectrum, showFrequencyBands, fillContainer, width, height, color, animationSpeed]);

  const renderWaveform = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
    const barWidth = w / waveformData.length;
    const centerY = h / 2;

    waveformData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * h * 0.6;
      
      try {
        // Create enhanced gradient
        const gradient = ctx.createLinearGradient(0, centerY - barHeight/2, 0, centerY + barHeight/2);
        
        if (isPlaying) {
          // Dynamic animation
          const playPosition = (frame * animationSpeed) % 1;
          const distance = Math.abs((index / waveformData.length) - playPosition);
          const intensity = Math.max(0, 1 - distance * 3);
          const glow = Math.sin(frame * 0.1) * 0.3 + 0.7;
          
          // Enhanced color animation
          gradient.addColorStop(0, `hsl(51, 100%, ${Math.min(100, 40 + intensity * 40 * glow)}%)`);
          gradient.addColorStop(0.3, `hsl(${51 + intensity * 20}, 100%, ${Math.min(100, 50 + intensity * 30)}%)`);
          gradient.addColorStop(0.7, `hsl(${51 + intensity * 10}, 100%, ${Math.min(100, 60 + intensity * 25)}%)`);
          gradient.addColorStop(1, `hsl(51, 100%, ${Math.min(100, 45 + intensity * 35)}%)`);
        } else {
          // Enhanced static state
          gradient.addColorStop(0, '#a855f7'); // violet-500
          gradient.addColorStop(0.3, '#c084fc'); // violet-400
          gradient.addColorStop(0.7, '#3b82f6'); // blue-500
          gradient.addColorStop(1, '#60a5fa'); // blue-400
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(x, centerY - barHeight/2, barWidth - 1, barHeight);

        // Add glow effect when playing
        if (isPlaying) {
          const playPosition = (frame * animationSpeed) % 1;
          const distance = Math.abs((index / waveformData.length) - playPosition);
          if (distance < 0.1) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#c084fc';
            ctx.fillRect(x, centerY - barHeight/2, barWidth - 1, barHeight);
            ctx.shadowBlur = 0;
          }
        }
      } catch (error) {
        // Fallback
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(x, centerY - barHeight/2, barWidth - 1, barHeight);
      }
    });
  };

  const renderSpectrum = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
    if (!spectrumData.length) return;

    const barWidth = w / spectrumData.length;
    
    spectrumData.forEach((amplitude, index) => {
      const x = index * barWidth;
      const barHeight = amplitude * h * 0.3;
      
      // Spectrum bars at the bottom
      const gradient = ctx.createLinearGradient(0, h - barHeight, 0, h);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.6)'); // violet-500 with alpha
      gradient.addColorStop(1, 'rgba(168, 85, 247, 0.2)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, h - barHeight, barWidth - 1, barHeight);
    });
  };

  const renderFrequencyBands = (ctx: CanvasRenderingContext2D, w: number, h: number, frame: number) => {
    // Render frequency band indicators
    const bandCount = 8;
    const bandWidth = w / bandCount;
    
    for (let i = 0; i < bandCount; i++) {
      const x = i * bandWidth;
      const intensity = Math.sin(frame * 0.05 + i * 0.5) * 0.3 + 0.7;
      
      ctx.strokeStyle = `rgba(234, 179, 8, ${intensity * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  };

  return (
    <div className={`relative ${fillContainer ? 'w-full h-full' : ''} ${className}`}>
      <canvas
        ref={canvasRef}
        width={fillContainer ? containerSize.width : width}
        height={fillContainer ? containerSize.height : height}
        className="rounded-lg bg-gradient-to-b from-background/80 to-muted/20 backdrop-blur-sm border border-primary/10"
        style={{
          width: fillContainer ? '100%' : width,
          height: fillContainer ? '100%' : height
        }}
      />
      
      {/* Overlay effects */}
      {isPlaying && (
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 via-transparent to-primary/5 pointer-events-none animate-pulse" />
      )}
    </div>
  );
};