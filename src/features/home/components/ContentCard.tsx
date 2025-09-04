import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCardProps } from '../types';
import { cn } from '@/lib/utils';

export const ContentCard: React.FC<ContentCardProps> = ({ 
  tile, 
  className, 
  size = 'md' 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Size variants
  const sizeClasses = {
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80'
  };

  // Intersection Observer for performance
  useEffect(() => {
    if (!tile.previewVideoUrl || !cardRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
        // If not in view, pause video
        if (!entry.isIntersecting && videoRef.current) {
          videoRef.current.pause();
          setIsPlaying(false);
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '50px'
      }
    );

    observerRef.current.observe(cardRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [tile.previewVideoUrl]);

  // Handle video interactions
  const handlePlayVideo = async () => {
    if (!videoRef.current || !isInView) return;

    try {
      if (!isVideoLoaded) {
        // Load video metadata first
        await new Promise((resolve, reject) => {
          if (!videoRef.current) return reject();
          
          videoRef.current.onloadedmetadata = resolve;
          videoRef.current.onerror = reject;
          videoRef.current.load();
        });
        setIsVideoLoaded(true);
      }

      await videoRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.warn('Video play failed:', error);
    }
  };

  const handlePauseVideo = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Mouse interactions
  const handleMouseEnter = () => {
    setIsHovered(true);
    if (tile.previewVideoUrl && isInView) {
      handlePlayVideo();
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (tile.previewVideoUrl) {
      handlePauseVideo();
    }
  };

  // Keyboard interactions
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (tile.previewVideoUrl) {
        if (isPlaying) {
          handlePauseVideo();
        } else {
          handlePlayVideo();
        }
      }
    }
  };

  // Format views number
  const formatViews = (views?: number) => {
    if (!views) return '';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('group', className)}
    >
      <Card 
        className={cn(
          'relative overflow-hidden cursor-pointer bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl transition-all duration-300',
          'hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30',
          'focus-within:ring-2 focus-within:ring-primary/50',
          sizeClasses[size]
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Media Container */}
        <div className="relative w-full h-full overflow-hidden">
          {/* Poster Image */}
          <img
            src={tile.posterUrl}
            alt={tile.title}
            loading="lazy"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-300',
              // Ken Burns effect for images
              !tile.previewVideoUrl && isHovered && 'scale-105',
              // Fade out when video is playing
              tile.previewVideoUrl && isPlaying && 'opacity-0'
            )}
            style={{
              filter: !tile.previewVideoUrl && isHovered 
                ? 'brightness(1.1) contrast(1.05)' 
                : undefined
            }}
          />

          {/* Preview Video */}
          {tile.previewVideoUrl && (
            <video
              ref={videoRef}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-opacity duration-200',
                isPlaying ? 'opacity-100' : 'opacity-0'
              )}
              muted
              playsInline
              loop
              preload="metadata"
              onLoadedMetadata={() => setIsVideoLoaded(true)}
            >
              <source src={tile.previewVideoUrl} type="video/mp4" />
            </video>
          )}

          {/* Overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div 
            className={cn(
              'absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 transition-opacity duration-300',
              isHovered && 'opacity-100'
            )} 
          />

          {/* Accessibility Button */}
          {tile.previewVideoUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-0 w-full h-full bg-transparent border-none rounded-none opacity-0 focus:opacity-100"
              onKeyDown={handleKeyDown}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              <Play className={cn(
                'w-8 h-8 text-white/80 transition-all',
                isPlaying && 'opacity-0'
              )} />
            </Button>
          )}
        </div>

        {/* Top Badges */}
        {tile.tag && (
          <Badge 
            className="absolute top-3 left-3 bg-black/70 text-white border-none backdrop-blur-sm"
          >
            {tile.tag}
          </Badge>
        )}

        {/* Duration Badge */}
        {tile.duration && (
          <Badge 
            className="absolute top-3 right-3 bg-black/70 text-white border-none backdrop-blur-sm font-mono text-xs"
          >
            {tile.duration}
          </Badge>
        )}

        {/* Content Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
            {tile.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-white/70">
            {tile.byline && (
              <span className="truncate">{tile.byline}</span>
            )}
            
            {tile.views && (
              <div className="flex items-center gap-1 shrink-0">
                <Eye className="w-3 h-3" />
                <span>{formatViews(tile.views)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Hover glow effect */}
        <div 
          className={cn(
            'absolute -inset-1 bg-gradient-to-r from-primary/20 to-emerald-500/20 rounded-2xl opacity-0 transition-opacity duration-300 -z-10',
            isHovered && 'opacity-100'
          )}
        />
      </Card>
    </motion.div>
  );
};