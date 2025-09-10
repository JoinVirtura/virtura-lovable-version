import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Shuffle, Play, Eye, Sparkles, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCard } from './ContentCard';
import { Tile } from '../types';
import { cn } from '@/lib/utils';

interface TrendingRowProps {
  tiles: Tile[];
  className?: string;
}

export const TrendingRow: React.FC<TrendingRowProps> = ({ tiles, className }) => {
  const [shuffledTiles, setShuffledTiles] = useState(tiles);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...tiles].sort(() => Math.random() - 0.5);
      setShuffledTiles(shuffled);
      setIsShuffling(false);
    }, 600);
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

  // Dynamic card sizing logic for innovative layout
  const getCardSize = (index: number, tile: Tile) => {
    const patterns = [
      { span: "md:col-span-2 md:row-span-2", size: "hero" }, // Hero card
      { span: "md:col-span-1", size: "standard" }, // Standard
      { span: "md:col-span-1", size: "standard" }, // Standard
      { span: "md:col-span-2", size: "wide" }, // Wide card
      { span: "md:col-span-1", size: "standard" }, // Standard
      { span: "md:col-span-1 md:row-span-2", size: "tall" }, // Tall card
      { span: "md:col-span-1", size: "standard" }, // Standard
      { span: "md:col-span-2", size: "wide" }, // Wide card
    ];
    return patterns[index % patterns.length] || patterns[1];
  };

  return (
    <section className={cn('space-y-8 relative overflow-hidden', className)} ref={containerRef}>
      {/* Revolutionary Header Design */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative"
      >
        {/* Background Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5 blur-3xl" />
        
        <div className="relative flex items-end justify-between">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center gap-3"
            >
              <div className="w-1 h-8 bg-gradient-to-b from-primary to-primary-dark rounded-full" />
              <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                TRENDING CREATIONS
              </h2>
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-primary" />
              </motion.div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-muted-foreground max-w-2xl leading-relaxed"
            >
              Discover what the community is creating across every dimension of visual expression
            </motion.p>
          </div>
          
          {/* Advanced Control Panel */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-3"
          >
            <Button 
              variant="outline" 
              size="sm"
              className={`
                relative overflow-hidden backdrop-blur-sm border-primary/20 bg-card/50 hover:bg-primary/10 
                group transition-all duration-500 hover:scale-105 hover:shadow-lg hover:shadow-primary/20
                ${isShuffling ? 'animate-pulse' : ''}
              `}
              onClick={handleShuffle}
              disabled={isShuffling}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <Shuffle className={`mr-2 h-4 w-4 transition-all duration-300 ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180'}`} />
              <span className="relative z-10 font-semibold">
                {isShuffling ? 'REGENERATING' : 'SURPRISE ME'}
              </span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary-dark hover:bg-primary/10 group relative overflow-hidden"
              onClick={() => window.location.href = '/library'}
            >
              <span className="relative z-10 font-semibold">VIEW ALL</span>
              <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-2 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 to-primary/10 translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Revolutionary Dynamic Grid Layout */}
      <div className="relative">
        {/* Mouse Follower Effect */}
        <motion.div
          className="absolute w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none z-0"
          animate={{
            x: mousePosition.x - 64,
            y: mousePosition.y - 64,
          }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6 auto-rows-auto relative z-10">
          <AnimatePresence mode="wait">
            {shuffledTiles.slice(0, 24).map((tile, index) => {
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
                    rotateX: 45,
                  }}
                  animate={{ 
                    opacity: 1, 
                    scale: 1, 
                    y: 0,
                    rotateX: 0,
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8, 
                    y: -60,
                    rotateX: -45,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.1,
                    ease: [0.25, 0.25, 0, 1],
                    layout: { duration: 0.5 }
                  }}
                  className={cn(
                    "group relative",
                    cardSize.span,
                    isHovered && "z-20"
                  )}
                  onHoverStart={() => setHoveredCard(tile.id)}
                  onHoverEnd={() => setHoveredCard(null)}
                  style={{
                    perspective: "1000px",
                  }}
                >
                  {/* Advanced Card Container */}
                  <motion.div
                    className="relative h-full"
                    whileHover={{ 
                      scale: 1.03,
                      rotateY: index % 2 === 0 ? 2 : -2,
                      z: 50,
                    }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20 
                    }}
                  >
                    {/* Glow Effect on Hover */}
                    <motion.div
                      className="absolute -inset-2 bg-gradient-to-br from-primary/20 via-transparent to-primary/10 rounded-3xl blur-xl"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: isHovered ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                    
                    {/* Enhanced ContentCard */}
                    <div className="relative h-full">
                      <ContentCard 
                        tile={tile} 
                        size={cardSize.size as any}
                        className={cn(
                          "h-full transform-gpu transition-all duration-500",
                          "hover:shadow-2xl hover:shadow-primary/20",
                          cardSize.size === "hero" && "min-h-[400px]",
                          cardSize.size === "tall" && "min-h-[350px]",
                          cardSize.size === "wide" && "min-h-[200px]",
                          cardSize.size === "standard" && "min-h-[250px]"
                        )}
                      />
                      
                      {/* Interactive Overlay */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            <span className="text-sm font-medium">{tile.views?.toLocaleString()}</span>
                          </div>
                          {tile.kind === 'video' && (
                            <div className="flex items-center gap-1">
                              <Play className="w-3 h-3" />
                              <span className="text-xs">{tile.duration}</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};