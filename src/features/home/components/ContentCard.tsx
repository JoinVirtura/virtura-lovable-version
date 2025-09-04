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
          'relative overflow-hidden cursor-pointer bg-card border-0 rounded-xl transition-all duration-300',
          'hover:shadow-lg hover:scale-[1.01]',
          'focus-within:ring-2 focus-within:ring-primary/50',
          sizeClasses[size]
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Media Container */}
        <div className="relative w-full h-full overflow-hidden">
          {/* Poster Image with enhanced hover effects */}
          <motion.img
            src={tile.posterUrl}
            alt={tile.title}
            loading="lazy"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-700',
              // Enhanced Ken Burns effect for images with subtle movement
              !tile.previewVideoUrl && 'group-hover:scale-110',
              // Fade out when video is playing
              tile.previewVideoUrl && isPlaying && 'opacity-0'
            )}
            animate={isHovered && !tile.previewVideoUrl ? {
              scale: 1.1,
              filter: 'brightness(1.15) contrast(1.1) saturate(1.2)',
            } : {
              scale: 1,
              filter: 'brightness(1) contrast(1) saturate(1)',
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />

          {/* Preview Video */}
          {tile.previewVideoUrl && (
            <motion.video
              ref={videoRef}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-all duration-300',
                isPlaying ? 'opacity-100' : 'opacity-0'
              )}
              muted
              playsInline
              loop
              preload="metadata"
              onLoadedMetadata={() => setIsVideoLoaded(true)}
              animate={isPlaying ? {
                scale: 1.05,
                filter: 'brightness(1.1) contrast(1.05)',
              } : {}}
              transition={{ duration: 0.5 }}
            >
              <source src={tile.previewVideoUrl} type="video/mp4" />
            </motion.video>
          )}

          {/* Animated overlay gradients */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
            animate={isHovered ? {
              background: 'linear-gradient(to top, rgba(0,0,0,0.4), transparent, transparent)'
            } : {}}
            transition={{ duration: 0.4 }}
          />
          
          {/* Dynamic glow effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />

          {/* Floating particles effect for "come alive" feeling */}
          {isHovered && (
            <>
              <motion.div
                className="absolute w-2 h-2 bg-primary/60 rounded-full"
                initial={{ opacity: 0, x: 20, y: 20 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  x: [20, 60, 100],
                  y: [20, 40, 60]
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <motion.div
                className="absolute w-1.5 h-1.5 bg-emerald-400/40 rounded-full"
                initial={{ opacity: 0, x: 80, y: 30 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  x: [80, 40, 10],
                  y: [30, 50, 80]
                }}
                transition={{ 
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
              <motion.div
                className="absolute w-1 h-1 bg-amber-300/50 rounded-full"
                initial={{ opacity: 0, x: 50, y: 70 }}
                animate={{ 
                  opacity: [0, 1, 0],
                  x: [50, 30, 70],
                  y: [70, 20, 40]
                }}
                transition={{ 
                  duration: 2.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 1
                }}
              />
            </>
          )}

          {/* Accessibility Button */}
          {tile.previewVideoUrl && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute inset-0 w-full h-full bg-transparent border-none rounded-none opacity-0 focus:opacity-100"
              onKeyDown={handleKeyDown}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              <motion.div
                animate={isPlaying ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Play className="w-8 h-8 text-white/80" />
              </motion.div>
            </Button>
          )}
        </div>

        {/* Top Badges with enhanced animation */}
        {tile.tag && (
          <motion.div
            className="absolute top-3 left-3"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Badge className="bg-black/70 text-white border-none backdrop-blur-sm transition-all duration-300 group-hover:bg-primary/90 group-hover:scale-110">
              {tile.tag}
            </Badge>
          </motion.div>
        )}

        {/* Duration Badge with bounce effect */}
        {tile.duration && (
          <motion.div
            className="absolute top-3 right-3"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <Badge className="bg-black/70 text-white border-none backdrop-blur-sm font-mono text-xs transition-all duration-300 group-hover:bg-emerald-500/90 group-hover:scale-110">
              {tile.duration}
            </Badge>
          </motion.div>
        )}

        {/* Content Footer with slide-up animation */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 space-y-2"
          initial={{ y: 10, opacity: 0.8 }}
          animate={isHovered ? { y: 0, opacity: 1 } : { y: 10, opacity: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 transition-all duration-300 group-hover:text-amber-100">
            {tile.title}
          </h3>
          
          <div className="flex items-center justify-between text-xs text-white/70 group-hover:text-white/90 transition-colors duration-300">
            {tile.byline && (
              <span className="truncate">{tile.byline}</span>
            )}
            
            {tile.views && (
              <motion.div 
                className="flex items-center gap-1 shrink-0"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="w-3 h-3" />
                <span>{formatViews(tile.views)}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Enhanced outer glow effect */}
        <motion.div 
          className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-emerald-500/30 to-primary/30 rounded-2xl opacity-0 -z-10 blur-sm"
          animate={{ 
            opacity: isHovered ? 1 : 0,
            scale: isHovered ? 1.02 : 1
          }}
          transition={{ duration: 0.4 }}
        />
        
        {/* Pulse effect for avatar "heartbeat" */}
        {isHovered && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
            animate={{
              x: ['-100%', '100%'],
              opacity: [0, 0.3, 0]
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </Card>
    </motion.div>
  );
};