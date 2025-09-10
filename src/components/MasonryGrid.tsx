import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Filter, ArrowRight } from 'lucide-react';
import { ContentCard } from '@/features/home/components/ContentCard';
import { Tile } from '@/features/home/types';
import { cn } from '@/lib/utils';

interface MasonryGridProps {
  tiles: Tile[];
  className?: string;
}

export const MasonryGrid: React.FC<MasonryGridProps> = ({ tiles, className }) => {
  const [shuffledTiles, setShuffledTiles] = useState(tiles);
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update shuffled tiles when tiles prop changes
  useEffect(() => {
    setShuffledTiles(tiles);
  }, [tiles]);

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...tiles].sort(() => Math.random() - 0.5);
      setShuffledTiles(shuffled);
      setIsShuffling(false);
    }, 600);
  };

  const handleViewAll = () => {
    if (isExpanded) {
      setDisplayCount(50);
      setIsExpanded(false);
    } else {
      setDisplayCount(tiles.length);
      setIsExpanded(true);
    }
  };

  // Pinterest-style 5-column dynamic heights
  const getItemHeight = (index: number) => {
    const heights = [
      'h-72', 'h-80', 'h-64', 'h-96', 'h-68',   // Row 1
      'h-80', 'h-64', 'h-88', 'h-72', 'h-84',   // Row 2
      'h-64', 'h-92', 'h-68', 'h-80', 'h-76',   // Row 3
      'h-88', 'h-72', 'h-84', 'h-64', 'h-80',   // Row 4
      'h-72', 'h-84', 'h-68', 'h-88', 'h-80',   // Row 5
    ];
    return heights[index % heights.length];
  };

  const displayedTiles = shuffledTiles.slice(0, displayCount);

  return (
    <section className={cn('relative overflow-hidden min-h-screen w-full', className)}>
      {/* Background effects */}
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
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 mb-16 px-6"
      >        
        <div className="relative flex items-end justify-between max-w-none w-full">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative flex items-center gap-6">
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
                
                <div className="space-y-1">
                  <motion.h2 
                    className="text-5xl md:text-6xl font-black relative leading-[1.1] py-2"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFC107 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      filter: 'drop-shadow(0 8px 16px rgba(255, 215, 0, 0.3))'
                    }}
                  >
                    Trending
                  </motion.h2>
                </div>
              </div>
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-4xl font-light"
            >
              Discover the most 
              <span className="text-primary font-semibold mx-2">viral creations</span>
              shaping digital culture — from stunning visuals to groundbreaking concepts
            </motion.p>
          </div>
          
          {/* Control Panel */}
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
              <span className="relative z-10 font-bold text-lg">
                {isShuffling ? 'Regenerate' : 'Regenerate'}
              </span>
            </Button>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="sm"
                className="relative backdrop-blur-xl border-primary/20 bg-card/60 hover:bg-primary/10 group hover:scale-105 transition-all duration-300"
              >
                <Filter className="mr-2 h-4 w-4" />
                <span className="font-semibold">FILTER</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="text-primary hover:text-primary-dark hover:bg-primary/10 group relative overflow-hidden hover:scale-105 transition-all duration-300"
                onClick={handleViewAll}
              >
                <span className="font-semibold">
                  {isExpanded ? 'VIEW ALL' : 'VIEW ALL'}
                </span>
                <ArrowRight className="ml-2 h-4 w-4 transition-all duration-300 group-hover:translate-x-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Custom 5-Column Masonry Grid - Full Width */}
      <div className="relative w-full px-0">
        <div className="grid grid-cols-5 gap-0 w-full min-h-screen">
          {displayedTiles.map((tile, index) => {
            const heightClass = getItemHeight(index);
            
            return (
              <motion.div
                key={`${tile.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: (index % 25) * 0.03,
                  ease: "easeOut"
                }}
                className={`relative group ${heightClass} w-full`}
                whileHover={{ 
                  scale: 1.02,
                  zIndex: 10,
                  transition: { duration: 0.2 }
                }}
              >
                <ContentCard 
                  tile={tile} 
                  className="w-full h-full"
                  size="sm"
                />
              </motion.div>
            );
          })}
        </div>
        
        {/* Load More Section */}
        {!isExpanded && tiles.length > displayCount && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-center pt-16"
          >
            <Button
              onClick={handleViewAll}
              size="lg"
              className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all duration-300"
            >
              Load More Creations
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};