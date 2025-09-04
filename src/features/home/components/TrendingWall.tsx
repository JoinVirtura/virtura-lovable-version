import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentCard } from './ContentCard';
import { Tile } from '../types';
import { cn } from '@/lib/utils';

interface TrendingWallProps {
  tiles: Tile[];
  className?: string;
}

export const TrendingWall: React.FC<TrendingWallProps> = ({ tiles, className }) => {
  const [displayedTiles, setDisplayedTiles] = useState<Tile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  
  const itemsPerPage = 12;
  
  // Load initial tiles
  useEffect(() => {
    setDisplayedTiles(tiles.slice(0, itemsPerPage));
    setHasMore(tiles.length > itemsPerPage);
  }, [tiles]);

  const loadMore = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const start = nextPage * itemsPerPage;
      const end = start + itemsPerPage;
      const newTiles = tiles.slice(start, end);
      
      setDisplayedTiles(prev => [...prev, ...newTiles]);
      setCurrentPage(nextPage);
      setHasMore(end < tiles.length);
      setIsLoading(false);
    }, 1000); // Simulate loading
  };

  // Masonry layout helper - create a more balanced distribution
  const getMasonryItemClass = (index: number) => {
    // Create patterns that repeat every 12 items for better distribution
    const pattern = index % 12;
    
    const variants = [
      '', // normal - 1x1
      'col-span-2', // wide - 2x1
      'row-span-2', // tall - 1x2  
      '', // normal - 1x1
      'col-span-2 row-span-2', // large - 2x2
      '', // normal - 1x1
      'row-span-2', // tall - 1x2
      '', // normal - 1x1
      'col-span-2', // wide - 2x1
      '', // normal - 1x1
      '', // normal - 1x1
      'row-span-2' // tall - 1x2
    ];
    
    return variants[pattern] || '';
  };

  // Dynamic grid classes based on screen size
  const getGridClass = () => {
    return "grid gap-3 auto-rows-[180px] sm:gap-4 sm:auto-rows-[200px] md:gap-4 md:auto-rows-[220px] lg:gap-6 lg:auto-rows-[240px] " +
           "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8";
  };

  return (
    <section className={cn('space-y-8', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-4xl font-bold text-foreground mb-4">
          Trending Video
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Explore the most popular AI-generated content from our community
        </p>
      </motion.div>

      {/* Seamless Masonry Grid */}
      <div className={getGridClass()}>
        {displayedTiles.map((tile, index) => {
          const masonryClass = getMasonryItemClass(index);
          
          return (
            <motion.div
              key={`${tile.id}-${index}`}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: (index % 16) * 0.03, // Stagger animation
                ease: "easeOut"
              }}
              className={cn(
                'relative group',
                masonryClass
              )}
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
            >
              <ContentCard 
                tile={tile} 
                className="h-full w-full"
                size="md"
              />
            </motion.div>
          );
        })}
        
        {/* Loading Skeletons with proper grid placement */}
        {isLoading && Array.from({ length: 8 }).map((_, index) => {
          const skeletonClass = getMasonryItemClass(displayedTiles.length + index);
          
          return (
            <motion.div 
              key={`skeleton-${index}`} 
              className={cn('relative', skeletonClass)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Skeleton className="w-full h-full rounded-2xl bg-card/20" />
            </motion.div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center pt-8"
        >
          <Button
            onClick={loadMore}
            disabled={isLoading}
            size="lg"
            className={cn(
              'px-8 py-6 text-lg font-semibold',
              'bg-gradient-to-r from-primary to-emerald-500',
              'hover:shadow-lg transition-all duration-300',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </motion.div>
      )}

      {!hasMore && displayedTiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center pt-8"
        >
          <p className="text-muted-foreground text-lg">
            You've reached the end of trending videos
          </p>
        </motion.div>
      )}
    </section>
  );
};