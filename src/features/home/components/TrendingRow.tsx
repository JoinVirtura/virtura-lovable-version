import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Eye, Sparkles, Heart, Share2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCard } from './ContentCard';
import { Tile } from '../types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface TrendingRowProps {
  tiles: Tile[];
  className?: string;
}

export const TrendingRow: React.FC<TrendingRowProps> = ({ tiles, className }) => {
  const [shuffledTiles, setShuffledTiles] = useState(tiles);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleShuffle = () => {
    setIsShuffling(true);
    toast({
      title: "Regenerating Gallery",
      description: "Discovering new creative possibilities...",
    });
    setTimeout(() => {
      const shuffled = [...tiles].sort(() => Math.random() - 0.5);
      setShuffledTiles(shuffled);
      setIsShuffling(false);
    }, 600);
  };

  const handleLike = (tileId: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(tileId)) {
        newLiked.delete(tileId);
        toast({ title: "Removed from favorites" });
      } else {
        newLiked.add(tileId);
        toast({ title: "Added to favorites" });
      }
      return newLiked;
    });
  };

  const handleShare = async (tile: Tile) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: tile.title,
          text: `Check out this amazing ${tile.tag} creation by ${tile.byline}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleViewAll = () => {
    if (isExpanded) {
      setDisplayCount(50);
      setIsExpanded(false);
      toast({ title: "Showing curated selection" });
    } else {
      setDisplayCount(tiles.length);
      setIsExpanded(true);
      toast({ title: "Showing complete gallery" });
    }
  };

  // Update shuffled tiles when tiles prop changes
  React.useEffect(() => {
    setShuffledTiles(tiles);
  }, [tiles]);

  const displayedTiles = shuffledTiles.slice(0, displayCount);

  return (
    <section className={cn('relative py-8 px-4 md:px-6 lg:px-8', className)} ref={containerRef}>
      {/* Hero-Matched Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep Space Gradient Foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />
        
        {/* Morphing Geometric Shapes */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent animate-morph-1 blur-xl" />
        </div>
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 opacity-25">
          <div className="w-full h-full bg-gradient-to-tl from-primary/15 to-transparent animate-morph-2 blur-2xl" />
        </div>
        
        {/* Advanced Particle Trail System */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-1 h-1 bg-primary animate-particle-trail-1" />
          <div className="absolute top-32 left-24 w-0.5 h-0.5 bg-primary/80 animate-particle-trail-2" />
          <div className="absolute top-40 right-32 w-1 h-1 bg-primary animate-particle-trail-4" />
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-primary animate-particle-trail-6" />
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
        </div>
        
        {/* Advanced Scanning Matrix */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-matrix-1" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent animate-scan-vertical-1" />
        </div>
        
        {/* Depth-Creating Parallax Layers */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-primary/40 rounded-full animate-parallax-1" />
          <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-primary/50 rounded-full animate-parallax-2" />
          <div className="absolute bottom-16 left-1/4 w-1 h-1 bg-primary/60 rounded-full animate-parallax-3" />
          <div className="absolute bottom-10 right-1/3 w-2.5 h-2.5 bg-primary/30 rounded-full animate-parallax-4" />
        </div>
        
        {/* Cinematic Corner Illumination */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent animate-corner-glow-1" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/12 via-primary/4 to-transparent animate-corner-glow-2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent animate-corner-glow-3" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/12 via-primary/4 to-transparent animate-corner-glow-4" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 space-y-6"
        >
          {/* Main Title with Holographic Effect */}
          <div className="relative">
            <div className="flex items-center gap-6 mb-8">
              {/* Pulsing Energy Bar */}
              <div className="relative w-2 h-24">
                <div className="absolute inset-0 bg-gradient-to-b from-purple-400 via-violet-500 to-fuchsia-600 rounded-full shadow-2xl shadow-purple-500/50 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-purple-600 rounded-full blur-xl opacity-60 animate-pulse" />
              </div>
              
              <div className="relative">
                {/* Holographic Glitch Title */}
                <div className="relative">
                  <h2 className="relative text-6xl md:text-7xl lg:text-8xl font-black leading-tight tracking-tighter">
                    {/* Main gradient text */}
                    <span className="relative inline-block bg-gradient-to-r from-purple-400 via-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent animate-gradient-flow bg-[length:200%_auto]">
                      Trending
                    </span>
                    {/* Holographic overlay effect */}
                    <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent opacity-40 blur-sm animate-pulse" aria-hidden="true">
                      Trending
                    </span>
                    {/* Glitch shadow */}
                    <span className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent opacity-20 blur-md animate-glitch-1" aria-hidden="true">
                      Trending
                    </span>
                  </h2>
                </div>
                
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-px w-16 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                  <p className="text-xl md:text-2xl font-light bg-gradient-to-r from-purple-300 to-violet-400 bg-clip-text text-transparent tracking-[0.3em] uppercase">
                    Creations
                  </p>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
                </div>
              </div>
            </div>
            
            {/* Enhanced Description with Neon Effect */}
            <div className="relative max-w-4xl">
              <div className="absolute -inset-4 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 blur-2xl" />
              <p className="relative text-xl md:text-2xl text-foreground/90 leading-relaxed font-light">
                Experience the future of <span className="relative inline-block font-bold bg-gradient-to-r from-purple-400 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">
                  viral creativity
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-400 to-cyan-400 blur-lg opacity-30 animate-pulse" aria-hidden="true" />
                </span> — where innovation meets imagination in stunning detail
              </p>
            </div>
          </div>

          {/* Revolutionary Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-6">
            <Button
              onClick={handleShuffle}
              disabled={isShuffling}
              size="lg"
              className="group relative overflow-hidden bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 hover:from-purple-500 hover:via-violet-500 hover:to-fuchsia-500 text-white font-bold px-10 py-6 h-auto border-2 border-purple-400/30 shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all duration-300 hover:scale-105"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-2">
                <span className={isShuffling ? 'animate-spin' : ''}>✨</span>
                {isShuffling ? 'REGENERATING...' : 'REGENERATE'}
              </span>
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="group relative overflow-hidden bg-transparent backdrop-blur-sm border-2 border-purple-400/40 hover:border-purple-400 px-8 py-6 h-auto font-bold text-foreground hover:text-white transition-all duration-300 hover:bg-purple-500/20 hover:shadow-lg hover:shadow-purple-500/30"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center gap-2">
                <Filter className="w-5 h-5" />
                FILTER
              </span>
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="group relative text-purple-400 hover:text-white font-bold px-8 py-6 h-auto hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-fuchsia-500/20 transition-all duration-300"
              onClick={handleViewAll}
            >
              <span className="relative flex items-center gap-2">
                {isExpanded ? 'SHOW LESS' : 'VIEW ALL'}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 to-fuchsia-400 scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </Button>
          </div>
        </motion.div>

        {/* Innovative Masonry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 auto-rows-[200px] md:auto-rows-[240px] lg:auto-rows-[280px]">
          {displayedTiles.map((tile, index) => {
            // Dynamic sizing for visual interest
            const getCardSize = (index: number) => {
              const pattern = index % 20;
              if (pattern === 0) return 'col-span-2 row-span-2'; // Large featured
              if (pattern === 7 || pattern === 14) return 'col-span-2'; // Wide
              if (pattern === 3 || pattern === 10 || pattern === 17) return 'row-span-2'; // Tall
              return ''; // Standard 1x1
            };

            return (
              <motion.div
                key={`${tile.id}-${index}`}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: (index % 12) * 0.05,
                  ease: "easeOut"
                }}
                className={cn(
                  'relative group cursor-pointer overflow-hidden',
                  getCardSize(index)
                )}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
                onHoverStart={() => {
                  setHoveredCard(tile.id);
                }}
                onHoverEnd={() => setHoveredCard(null)}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setMousePosition({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top
                  });
                }}
              >
                <ContentCard 
                  tile={tile} 
                  className="h-full w-full border-0 rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300"
                  size="md"
                />
                
                {/* Enhanced Hover Overlay */}
                <AnimatePresence>
                  {hoveredCard === tile.id && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl flex items-end p-4"
                    >
                      <div className="w-full space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-white">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">{tile.views.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(tile.id);
                              }}
                            >
                              <Heart className={cn(
                                "w-4 h-4",
                                likedItems.has(tile.id) ? "fill-red-500 text-red-500" : ""
                              )} />
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-0 h-8 w-8 p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShare(tile);
                              }}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Load More Section */}
        {!isExpanded && displayedTiles.length < tiles.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center pt-8"
          >
            <Button
              onClick={() => setDisplayCount(prev => prev + 50)}
              size="lg"
              variant="outline"
              className="group relative overflow-hidden px-12 py-8 text-xl font-black bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 backdrop-blur-md hover:from-purple-500/20 hover:to-fuchsia-500/20 text-white transition-all duration-500 border-2 border-purple-400/40 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-3">
                <span className="text-2xl">⚡</span>
                Load More Creations
                <span className="text-2xl">⚡</span>
              </span>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};