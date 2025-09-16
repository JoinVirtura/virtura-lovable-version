import React from 'react';

interface MotionBackgroundProps {
  className?: string;
}

export const MotionBackground: React.FC<MotionBackgroundProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Deep Space Gradient Foundation */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />
      
      {/* Morphing Geometric Shapes */}
      <div className="absolute top-1/4 left-1/6 w-64 h-64 opacity-30">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent animate-morph-1 blur-xl" />
      </div>
      <div className="absolute bottom-1/3 right-1/6 w-80 h-80 opacity-25">
        <div className="w-full h-full bg-gradient-to-tl from-primary/15 to-transparent animate-morph-2 blur-2xl" />
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-20">
        <div className="w-full h-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-morph-3 blur-3xl" />
      </div>
      
      {/* Advanced Particle Trail System */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-1 h-1 bg-primary animate-particle-trail-1" />
        <div className="absolute top-32 left-24 w-0.5 h-0.5 bg-primary/80 animate-particle-trail-2" />
        <div className="absolute top-24 left-28 w-0.5 h-0.5 bg-primary/60 animate-particle-trail-3" />
        
        <div className="absolute top-40 right-32 w-1 h-1 bg-primary animate-particle-trail-4" />
        <div className="absolute top-52 right-36 w-0.5 h-0.5 bg-primary/80 animate-particle-trail-5" />
        
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-primary animate-particle-trail-6" />
        <div className="absolute bottom-24 left-1/3 w-0.5 h-0.5 bg-primary/70 animate-particle-trail-7" />
        
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-primary animate-particle-trail-8" />
      </div>
      
      {/* Holographic Grid System */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-grid-holographic animate-grid-pulse" />
      </div>
      
      {/* Revolutionary Rotating Energy Rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[800px] h-[800px] border border-primary/10 rounded-full animate-ring-rotate-1" />
        <div className="absolute w-[600px] h-[600px] border border-primary/8 rounded-full animate-ring-rotate-2" />
        <div className="absolute w-[400px] h-[400px] border border-primary/6 rounded-full animate-ring-rotate-3" />
      </div>
      
      {/* Advanced Scanning Matrix */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-matrix-1" />
        <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan-matrix-2" />
        <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent animate-scan-vertical-1" />
        <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan-vertical-2" />
      </div>
      
      {/* Depth-Creating Parallax Layers */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-primary/40 rounded-full animate-parallax-1" />
        <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-primary/50 rounded-full animate-parallax-2" />
        <div className="absolute bottom-16 left-1/4 w-1 h-1 bg-primary/60 rounded-full animate-parallax-3" />
        <div className="absolute bottom-10 right-1/3 w-2.5 h-2.5 bg-primary/30 rounded-full animate-parallax-4" />
      </div>
      
      {/* Glitch Effect Overlays */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-glitch-1" />
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary/15 to-transparent animate-glitch-2" />
      </div>
      
      {/* Cinematic Corner Illumination */}
      <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent animate-corner-glow-1" />
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/12 via-primary/4 to-transparent animate-corner-glow-2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent animate-corner-glow-3" />
      <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/12 via-primary/4 to-transparent animate-corner-glow-4" />
    </div>
  );
};