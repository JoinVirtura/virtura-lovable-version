import { useState, useRef, MouseEvent, useEffect } from 'react';
import type { Tile } from '../types';
import { cn } from '@/lib/utils';

interface ContentCardProps {
  tile: Tile;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function ContentCard({ tile, className, size = 'md' }: ContentCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [imageError, setImageError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (showVideo && videoRef.current && tile.videoUrl) {
      videoRef.current.play().catch(console.error);
    }
  }, [showVideo, tile.videoUrl]);

  return (
    <div className={cn('group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl', size === 'lg' ? 'h-96' : 'h-64', className)} onMouseEnter={() => { setIsHovered(true); if (tile.videoUrl) setShowVideo(true); }} onMouseLeave={() => { setIsHovered(false); setShowVideo(false); if (videoRef.current) { videoRef.current.pause(); videoRef.current.currentTime = 0; } }}>
      <div className="relative w-full h-full bg-card overflow-hidden rounded-2xl">
        {showVideo && tile.videoUrl ? (
          <video ref={videoRef} src={tile.videoUrl} loop muted playsInline className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
        ) : (
          <img src={imageError ? `https://picsum.photos/seed/${tile.id}/800/1200` : tile.posterUrl} alt={tile.title} onError={() => setImageError(true)} className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent transition-opacity duration-500" style={{ opacity: isHovered ? 1 : 0.6 }} />
      </div>
    </div>
  );
}
