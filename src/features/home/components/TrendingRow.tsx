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

      {/* Revolutionary Header Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mb-20"
      >        
        <div className="relative flex items-end justify-between">
          <div className="space-y-8">
            {/* Ultra-Modern Title with 3D Effects */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Background Glow Effect */}
              <motion.div
                className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent blur-3xl"
                animate={{ 
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              
              {/* Main Title Container */}
              <div className="relative flex items-center gap-6">
                {/* Dynamic Accent Bar */}
                <motion.div 
                  className="w-2 bg-gradient-to-b from-primary via-secondary to-accent rounded-full shadow-lg shadow-primary/50"
                  animate={{ 
                    height: [60, 80, 60],
                    boxShadow: [
                      '0 0 20px rgba(255, 215, 0, 0.5)',
                      '0 0 40px rgba(255, 215, 0, 0.8)',
                      '0 0 20px rgba(255, 215, 0, 0.5)'
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
                
                {/* Revolutionary Typography */}
                <div className="space-y-1">
                  {/* "Trending" with Glass Morphism - Reduced Size */}
                  <motion.h2 
                    className="text-5xl md:text-6xl font-black relative leading-[1.1] py-2"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF6B35 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 8px 16px rgba(255, 215, 0, 0.3))'
                    }}
                    animate={{ 
                      backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                    }}
                    transition={{ duration: 6, repeat: Infinity }}
                  >
                    Trending
                    
                    {/* Glass Reflection Effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-200%', '200%'],
                        opacity: [0, 0.8, 0]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 2,
                        ease: "easeInOut"
                      }}
                      style={{
                        maskImage: 'linear-gradient(45deg, transparent 30%, black 50%, transparent 70%)',
                        WebkitMaskImage: 'linear-gradient(45deg, transparent 30%, black 50%, transparent 70%)'
                      }}
                    />
                  </motion.h2>
                  
                  {/* "Creations" with Sophisticated Styling */}
                  <motion.div 
                    className="text-2xl md:text-3xl font-light tracking-[0.5em] text-muted-foreground/80 relative ml-2"
                    initial={{ opacity: 0, letterSpacing: '0.2em' }}
                    animate={{ 
                      opacity: 1, 
                      letterSpacing: '0.5em',
                    }}
                    transition={{ delay: 1, duration: 1.5 }}
                  >
                    Creations
                    
                    {/* Subtle Underline Animation */}
                    <motion.div
                      className="absolute -bottom-2 left-0 h-0.5 bg-gradient-to-r from-primary/60 to-transparent"
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 1.5, duration: 2 }}
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
            
            {/* Enhanced Description */}
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl font-light relative"
            >
              <span className="relative">
                Discover the most 
                <motion.span 
                  className="text-primary font-semibold mx-2 relative"
                  animate={{ 
                    textShadow: [
                      '0 0 10px rgba(255, 215, 0, 0.5)',
                      '0 0 20px rgba(255, 215, 0, 0.8)',
                      '0 0 10px rgba(255, 215, 0, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  viral creations
                  
                  {/* Animated Highlight */}
                  <motion.div
                    className="absolute -bottom-1 left-0 h-1 bg-gradient-to-r from-primary/80 to-transparent rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 2, duration: 1.5 }}
                  />
                </motion.span>
                shaping digital culture — from stunning visuals to groundbreaking concepts
              </span>
              
              {/* Floating Accent Dots */}
              <motion.div
                className="absolute -right-8 top-2 w-2 h-2 bg-primary/60 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </motion.p>
          </div>
          
          {/* Ultra-Advanced Control Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-col gap-4"
          >
            <Button 
              variant="outline" 
              size="lg"
              className="relative overflow-hidden backdrop-blur-xl border-2 border-primary/30 bg-gradient-to-r from-background/80 to-card/80 hover:from-primary/20 hover:to-secondary/20 group transition-all duration-700 hover:scale-110 hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/60 px-8 py-4"
              onClick={handleShuffle}
              disabled={isShuffling}
            >
              {/* Dynamic Background Sweep */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
                animate={{
                  x: ['-200%', '200%']
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: "easeInOut"
                }}
              />
              
              {/* Shuffle Icon with Advanced Animation */}
              <motion.div
                animate={isShuffling ? { 
                  rotate: [0, 180, 360],
                  scale: [1, 1.2, 1]
                } : {}}
                transition={{ 
                  duration: 1.5, 
                  repeat: isShuffling ? Infinity : 0,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                
              </motion.div>
              
              <span className="relative z-10 font-bold text-lg">
                {isShuffling ? 'MORPHING REALITY' : 'REGENERATE'}
              </span>
              
              {/* Pulsing Border Effect */}
              <motion.div
                className="absolute inset-0 border-2 border-primary/20 rounded-lg"
                animate={{
                  borderColor: isShuffling ? 
                    ['rgba(255, 215, 0, 0.2)', 'rgba(255, 215, 0, 0.8)', 'rgba(255, 215, 0, 0.2)'] :
                    'rgba(255, 215, 0, 0.2)'
                }}
                transition={{ duration: 1, repeat: isShuffling ? Infinity : 0 }}
              />
            </Button>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="relative backdrop-blur-xl border-primary/20 bg-card/60 hover:bg-primary/10 group hover:scale-105 transition-all duration-300 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                />
                <Filter className="mr-2 h-4 w-4 relative z-10" />
                <span className="font-semibold relative z-10">FILTER</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="text-primary hover:text-primary-dark hover:bg-primary/10 group relative overflow-hidden hover:scale-105 transition-all duration-300"
                onClick={handleViewAll}
              >
                <span className="relative z-10 font-semibold">
                  {isExpanded ? 'SHOW LESS' : 'VIEW ALL'}
                </span>
                <motion.div
                  animate={{ x: isExpanded ? 0 : [0, 5, 0] }}
                  transition={{ duration: 0.5, repeat: isExpanded ? 0 : Infinity }}
                >
                  <ArrowRight className="ml-2 h-4 w-4 relative z-10 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
                </motion.div>
                
                {/* Sliding Background */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/20"
                  initial={{ x: '100%' }}
                  whileHover={{ x: '0%' }}
                  transition={{ duration: 0.5 }}
                />
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