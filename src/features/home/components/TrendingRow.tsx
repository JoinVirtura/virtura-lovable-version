import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shuffle, Play, Eye, Sparkles, Heart, Share2, Filter } from 'lucide-react';
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

  // Track mouse movement for advanced interactions
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePosition({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      return () => container.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  // Update shuffled tiles when tiles prop changes
  React.useEffect(() => {
    setShuffledTiles(tiles);
  }, [tiles]);

  // Pinterest-style masonry layout with ultra variety and zero gaps
  const getCardSize = (index: number, tile: Tile) => {
    // Create dynamic patterns based on content type and position for maximum visual impact
    const isHighImpact = ['WILDLIFE', 'ABSTRACT', 'SCI-FI', 'AUTOMOTIVE', 'AI TECH', 'ARCHITECTURE'].includes(tile.tag || '');
    const isVideo = tile.kind === 'video';
    
    // Ultra-varied patterns for Pinterest-style masonry
    const patterns = [
      { span: "col-span-4 row-span-4", size: "hero" }, // 0 - Ultra hero
      { span: "col-span-2 row-span-3", size: "tall" }, // 1 - Tall
      { span: "col-span-2 row-span-2", size: "standard" }, // 2
      { span: "col-span-2 row-span-2", size: "standard" }, // 3
      { span: "col-span-3 row-span-2", size: "wide" }, // 4 - Wide
      { span: "col-span-2 row-span-3", size: "tall" }, // 5 - Tall
      { span: "col-span-2 row-span-2", size: "standard" }, // 6
      { span: "col-span-2 row-span-2", size: "standard" }, // 7
      { span: "col-span-3 row-span-3", size: "hero" }, // 8 - Medium hero
      { span: "col-span-2 row-span-2", size: "standard" }, // 9
      { span: "col-span-2 row-span-4", size: "tall" }, // 10 - Ultra tall
      { span: "col-span-3 row-span-2", size: "wide" }, // 11 - Wide
      { span: "col-span-2 row-span-2", size: "standard" }, // 12
      { span: "col-span-2 row-span-2", size: "standard" }, // 13
      { span: "col-span-4 row-span-3", size: "hero" }, // 14 - Wide hero
      { span: "col-span-2 row-span-3", size: "tall" }, // 15
      { span: "col-span-2 row-span-2", size: "standard" }, // 16
      { span: "col-span-2 row-span-2", size: "standard" }, // 17
      { span: "col-span-3 row-span-2", size: "wide" }, // 18
      { span: "col-span-2 row-span-2", size: "standard" }, // 19
    ];
    
    let pattern = patterns[index % patterns.length];
    
    // Boost high-impact content with bigger sizes
    if (isHighImpact && index % 8 === 0) {
      pattern = { span: "col-span-4 row-span-4", size: "hero" };
    }
    
    // Give videos more prominence
    if (isVideo && index % 6 === 0) {
      pattern = { span: "col-span-3 row-span-3", size: "hero" };
    }
    
    return pattern;
  };

  return (
    <section className={cn('relative overflow-hidden min-h-screen', className)} ref={containerRef}>
      {/* Ultra-Disruptive Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-radial from-primary/20 via-primary/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-gradient-radial from-secondary/20 via-secondary/5 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -100, 50, 0],
            y: [0, 50, -100, 0],
            scale: [0.8, 1.2, 1, 0.8],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        />
      </div>

      {/* Steve Jobs Inspired Header Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mb-20"
      >        
        <div className="relative flex items-end justify-between">
          <div className="space-y-12">
            {/* Minimalist Title Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Primary Heading - Apple Style */}
              <motion.h1 
                className="text-6xl md:text-7xl lg:text-8xl font-thin tracking-tight leading-[0.85]"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <span className="text-foreground">Trending</span>
              </motion.h1>
              
              {/* Secondary Line - Refined */}
              <motion.div 
                className="text-2xl md:text-3xl lg:text-4xl font-extralight tracking-[0.2em] text-muted-foreground/90 ml-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Creations
              </motion.div>
            </motion.div>
            
            {/* Elegant Description */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="max-w-4xl space-y-4"
            >
              <p className="text-xl md:text-2xl font-light leading-relaxed text-muted-foreground">
                Discover the most {' '}
                <span className="text-foreground font-normal">viral creations</span>
                {' '} shaping digital culture
              </p>
              
              <p className="text-lg md:text-xl font-light leading-relaxed text-muted-foreground/80">
                From stunning visuals to groundbreaking concepts
              </p>
            </motion.div>
          </div>
          
          {/* Refined Control Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex flex-col gap-3"
          >
            <Button 
              variant="outline" 
              size="lg"
              className="backdrop-blur-xl border border-border/40 bg-card/60 hover:bg-card/80 hover:border-foreground/20 group transition-all duration-300 px-6 py-3 font-medium"
              onClick={handleShuffle}
              disabled={isShuffling}
            >
              <motion.div
                animate={isShuffling ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isShuffling ? Infinity : 0 }}
              >
                <Shuffle className="mr-2 h-4 w-4" />
              </motion.div>
              <span className="text-sm font-medium tracking-wide">
                {isShuffling ? 'REGENERATING' : 'REGENERATE'}
              </span>
            </Button>

            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-xs font-medium tracking-wide"
              >
                <Filter className="mr-1.5 h-3.5 w-3.5" />
                FILTER
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 text-xs font-medium tracking-wide group"
                onClick={handleViewAll}
              >
                <span>{isExpanded ? 'SHOW LESS' : 'VIEW ALL'}</span>
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Zero-Gap Pinterest Masonry Grid with Proper Spacing */}
      <div className="relative min-h-screen mt-16">{/* Added mt-16 for spacing */}
        {/* Mouse Follower Effect */}
        <motion.div
          className="absolute w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"
          animate={{
            x: mousePosition.x - 64,
            y: mousePosition.y - 64,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        />
        
        {/* ABSOLUTE ZERO-GAP MASONRY - FORCED SEAMLESS */}
        <div 
          style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gridAutoRows: '100px',
            gap: '0px',
            rowGap: '0px',
            columnGap: '0px',
            gridGap: '0px',
            margin: '0px',
            padding: '0px',
            border: 'none',
            outline: 'none',
            boxSizing: 'border-box',
            width: '100%',
            height: 'auto'
          }}
        >
            {shuffledTiles.slice(0, displayCount).map((tile, index) => {
              const cardSize = getCardSize(index, tile);
              const isHovered = hoveredCard === tile.id;
              
              return (
                <motion.div
                  key={`${tile.id}-${shuffledTiles.length}`}
                  layout
                  initial={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: 60,
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: -60,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.05,
                    ease: [0.25, 0.25, 0, 1],
                    layout: { duration: 0.5 }
                  }}
                  style={{
                    gridColumn: cardSize.span.includes('col-span-2') ? 'span 2' : 
                               cardSize.span.includes('col-span-3') ? 'span 3' : 
                               cardSize.span.includes('col-span-4') ? 'span 4' : 'span 2',
                    gridRow: cardSize.span.includes('row-span-2') ? 'span 2' : 
                            cardSize.span.includes('row-span-3') ? 'span 3' : 
                            cardSize.span.includes('row-span-4') ? 'span 4' : 'span 2',
                    margin: '0',
                    padding: '0',
                    border: 'none',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onHoverStart={() => setHoveredCard(tile.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  {/* SINGLE PREMIUM CARD - SEAMLESS */}
                  <ContentCard 
                    tile={tile} 
                    size={cardSize.size as any}
                    className="w-full h-full"
                  />
                </motion.div>
              );
            })}
        </div>
      </div>
    </section>
  );
};