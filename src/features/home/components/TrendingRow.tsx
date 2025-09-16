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
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background/95">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.1),transparent),radial-gradient(circle_at_80%_20%,rgba(255,206,84,0.1),transparent),radial-gradient(circle_at_40%_40%,rgba(120,119,198,0.05),transparent)]" />
        <div className="absolute inset-0 opacity-30" style={{backgroundImage: "url('data:image/svg+xml;utf8,<svg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"><g fill=\"none\" fill-rule=\"evenodd\"><g fill=\"%23ffffff\" fill-opacity=\"0.02\"><circle cx=\"30\" cy=\"30\" r=\"1\"/></g></g></svg>')"}} />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Enhanced Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8 space-y-6"
        >
          {/* Main Title with Gradient and Accent */}
          <div className="relative">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-1 h-16 bg-gradient-to-b from-amber-400 via-orange-500 to-amber-600 rounded-full shadow-lg shadow-amber-500/20" />
              <div>
                <h2 className="text-5xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent leading-tight tracking-tight">
                  Trending
                </h2>
                <p className="text-2xl md:text-3xl font-light text-muted-foreground/80 tracking-[0.2em] uppercase mt-2">
                  Creations
                </p>
              </div>
            </div>
            
            {/* Description */}
            <div className="max-w-4xl">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Discover the most <span className="font-semibold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">viral creations</span> shaping digital culture — from stunning visuals to groundbreaking concepts
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Button
              onClick={handleShuffle}
              disabled={isShuffling}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-4 h-auto border-2 border-amber-400/20 shadow-lg hover:shadow-amber-500/25 transition-all duration-300"
            >
              {isShuffling ? 'REGENERATING...' : 'REGENERATE'}
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-muted-foreground/20 hover:border-amber-400/50 px-6 py-4 h-auto font-semibold text-foreground hover:text-amber-400 transition-all duration-300"
            >
              <Filter className="w-5 h-5 mr-2" />
              FILTER
            </Button>
            
            <Button
              variant="ghost"
              size="lg"
              className="text-amber-400 hover:text-amber-300 font-semibold px-6 py-4 h-auto hover:bg-amber-400/10 transition-all duration-300 group"
              onClick={handleViewAll}
            >
              {isExpanded ? 'SHOW LESS' : 'VIEW ALL'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
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
              className="px-8 py-6 text-lg font-semibold hover:bg-amber-400 hover:text-white transition-all duration-300 border-2 border-amber-400/30 hover:border-amber-400"
            >
              Load More Creations
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};