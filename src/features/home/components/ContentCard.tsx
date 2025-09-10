import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Eye, Heart, Share2, Clock, Zap, Star, TrendingUp } from 'lucide-react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Revolutionary Size System for Dynamic Layouts
  const sizeClasses = {
    sm: 'h-48',
    md: 'h-64',
    lg: 'h-80',
    hero: 'h-96 md:h-[500px]',
    wide: 'h-48 md:h-56',
    tall: 'h-80 md:h-96',
    standard: 'h-64 md:h-72'
  };

  const contentSizes = {
    sm: { title: 'text-sm', meta: 'text-xs', padding: 'p-3' },
    md: { title: 'text-base', meta: 'text-xs', padding: 'p-4' },
    lg: { title: 'text-lg', meta: 'text-sm', padding: 'p-5' },
    hero: { title: 'text-2xl md:text-3xl', meta: 'text-base', padding: 'p-6 md:p-8' },
    wide: { title: 'text-base', meta: 'text-sm', padding: 'p-4' },
    tall: { title: 'text-lg', meta: 'text-sm', padding: 'p-5' },
    standard: { title: 'text-base', meta: 'text-sm', padding: 'p-4' }
  };

  // Mouse tracking for revolutionary effects
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Intersection Observer for performance
  useEffect(() => {
    if (!tile.previewVideoUrl || !cardRef.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        
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

  // Enhanced video interactions
  const handlePlayVideo = async () => {
    if (!videoRef.current || !isInView) return;

    try {
      if (!isVideoLoaded) {
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

  // Revolutionary mouse interactions
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

  // Format views with style
  const formatViews = (views?: number) => {
    if (!views) return '';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  // Dynamic tilt effect based on mouse position
  const getTiltTransform = () => {
    if (!isHovered || !cardRef.current) return {};
    
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = (mousePosition.y - centerY) / centerY * -8;
    const tiltY = (mousePosition.x - centerX) / centerX * 8;
    
    return {
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(20px)`,
    };
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.8, ease: [0.25, 0.25, 0, 1] }}
      className={cn('group relative', className)}
      onMouseMove={handleMouseMove}
      style={{ perspective: '1000px' }}
    >
      {/* Revolutionary Glow Field */}
      <motion.div
        className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        animate={{
          background: isHovered 
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 215, 0, 0.15) 0%, transparent 70%)`
            : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      />

      <Card 
        className={cn(
          'relative overflow-hidden cursor-pointer bg-gradient-to-br from-card/90 to-card/60 border border-border/20',
          'backdrop-blur-xl transition-all duration-700 transform-gpu',
          'hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10',
          'group-hover:scale-[1.02]',
          sizeClasses[size]
        )}
        style={getTiltTransform()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          // Navigate to detail view or trigger action based on tile type
          if (tile.kind === 'video') {
            window.location.href = `/video/${tile.id}`;
          } else {
            window.location.href = `/image/${tile.id}`;
          }
        }}
      >
        {/* Revolutionary Media Container */}
        <div className="relative w-full h-full overflow-hidden rounded-2xl">
          {/* Dynamic Background Mesh */}
          <motion.div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
            style={{
              background: `
                radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)
              `
            }}
          />

          {/* Enhanced Poster Image */}
          <motion.img
            src={tile.posterUrl}
            alt={tile.title}
            loading="lazy"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-all duration-1000',
              !tile.previewVideoUrl && 'group-hover:scale-110',
              tile.previewVideoUrl && isPlaying && 'opacity-0'
            )}
            animate={isHovered && !tile.previewVideoUrl ? {
              scale: 1.12,
              filter: 'brightness(1.2) contrast(1.15) saturate(1.3)',
            } : {
              scale: 1,
              filter: 'brightness(1) contrast(1) saturate(1)',
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Revolutionary Video Preview */}
          {tile.previewVideoUrl && (
            <motion.video
              ref={videoRef}
              className={cn(
                'absolute inset-0 w-full h-full object-cover transition-all duration-500',
                isPlaying ? 'opacity-100' : 'opacity-0'
              )}
              muted
              playsInline
              loop
              preload="metadata"
              onLoadedMetadata={() => setIsVideoLoaded(true)}
              animate={isPlaying ? {
                scale: 1.08,
                filter: 'brightness(1.15) contrast(1.1)',
              } : {}}
              transition={{ duration: 0.7 }}
            >
              <source src={tile.previewVideoUrl} type="video/mp4" />
            </motion.video>
          )}

          {/* Dynamic Gradient Overlays */}
          <motion.div 
            className="absolute inset-0"
            animate={isHovered ? {
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1), transparent)'
            } : {
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)'
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Holographic Effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Revolutionary Particle System */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-primary/60 rounded-full"
                    initial={{ 
                      opacity: 0, 
                      x: Math.random() * 300, 
                      y: Math.random() * 200,
                      scale: 0 
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      x: Math.random() * 300,
                      y: Math.random() * 200,
                      scale: [0, 1, 0]
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.2
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Revolutionary Badge System */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Badge className={cn(
              "bg-black/60 text-white border-primary/20 backdrop-blur-md",
              "transition-all duration-500 group-hover:bg-primary/90 group-hover:scale-110",
              "group-hover:shadow-lg group-hover:shadow-primary/30",
              size === 'hero' ? 'px-4 py-2 text-sm' : 'px-3 py-1.5 text-xs'
            )}>
              <TrendingUp className="w-3 h-3 mr-1" />
              {tile.tag}
            </Badge>
          </motion.div>

          {tile.duration && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="flex items-center gap-1 bg-black/60 rounded-full px-3 py-1.5 backdrop-blur-md"
            >
              <Clock className="w-3 h-3 text-primary" />
              <span className="text-white text-xs font-medium">{tile.duration}</span>
            </motion.div>
          )}
        </div>

        {/* Revolutionary Content Footer */}
        <motion.div 
          className={cn(
            "absolute bottom-0 left-0 right-0 space-y-3",
            contentSizes[size].padding
          )}
          initial={{ y: 20, opacity: 0.7 }}
          animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0.7 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="space-y-2">
            <h3 className={cn(
              "text-white font-bold leading-tight line-clamp-2",
              "transition-all duration-500 group-hover:text-primary",
              contentSizes[size].title
            )}>
              {tile.title}
            </h3>
            
            {tile.byline && (
              <p className={cn(
                "text-white/70 group-hover:text-white/90 transition-colors duration-300",
                contentSizes[size].meta
              )}>
                {tile.byline}
              </p>
            )}
          </div>
          
          {/* Enhanced Metadata Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div 
                className="flex items-center gap-1.5"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-white/90 text-sm font-medium">
                  {formatViews(tile.views)}
                </span>
              </motion.div>
              
              {tile.kind === 'video' && (
                <motion.div 
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100"
                  initial={{ x: -10 }}
                  animate={{ x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Play className="w-3 h-3 text-primary" />
                  <span className="text-primary text-xs font-medium">Watch</span>
                </motion.div>
              )}
            </div>

            {/* Revolutionary Action Panel */}
            <motion.div 
              className="flex items-center gap-2 opacity-0 group-hover:opacity-100"
              initial={{ scale: 0.8 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/30 hover:bg-primary/20 border border-white/20 hover:border-primary/40 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to favorites functionality
                  console.log('Added to favorites:', tile.id);
                }}
              >
                <Heart className="w-3 h-3 text-white hover:text-primary transition-colors" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 bg-black/30 hover:bg-primary/20 border border-white/20 hover:border-primary/40 backdrop-blur-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  // Share functionality
                  if (navigator.share) {
                    navigator.share({
                      title: tile.title,
                      text: `Check out this ${tile.tag} creation: ${tile.title}`,
                      url: window.location.href
                    });
                  } else {
                    // Fallback to copy link
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
              >
                <Share2 className="w-3 h-3 text-white hover:text-primary transition-colors" />
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Revolutionary Edge Effects */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Corner Accent Lines */}
          <div className="absolute top-0 left-0 w-12 h-12 border-l-2 border-t-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-r-2 border-b-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-700" />
          
          {/* Revolutionary Shimmer Sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: isHovered ? ['0%', '100%'] : ['0%', '0%'],
              opacity: isHovered ? [0, 0.6, 0] : 0
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 2
            }}
          />
        </motion.div>

        {/* Accessibility Enhancement */}
        {tile.previewVideoUrl && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute inset-0 w-full h-full bg-transparent border-none rounded-none opacity-0 focus:opacity-100"
            aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
          >
            <motion.div
              animate={isPlaying ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Play className="w-8 h-8 text-white/80" />
            </motion.div>
          </Button>
        )}
      </Card>
    </motion.div>
  );
};