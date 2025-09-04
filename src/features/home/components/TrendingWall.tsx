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

  // Masonry layout helper - assign random aspect ratios for variety
  const getMasonryItemClass = (index: number) => {
    const variants = [
      'row-span-2', // tall
      'col-span-2', // wide  
      'col-span-2 row-span-2', // large square
      '', // normal
      '', // normal
      '' // normal
    ];
    
    // Create a pseudo-random but deterministic distribution
    const variant = variants[index % variants.length];
    return variant;
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

      {/* Masonry Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 auto-rows-[200px] gap-4">
        {displayedTiles.map((tile, index) => {
          const masonryClass = getMasonryItemClass(index);
          
          return (
            <motion.div
              key={`${tile.id}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.4, 
                delay: (index % 12) * 0.05,
                ease: "easeOut"
              }}
              className={cn(
                'relative',
                masonryClass
              )}
            >
              <ContentCard 
                tile={tile} 
                className="h-full"
              />
            </motion.div>
          );
        })}
        
        {/* Loading Skeletons */}
        {isLoading && Array.from({ length: 6 }).map((_, index) => (
          <div key={`skeleton-${index}`} className="h-48">
            <Skeleton className="w-full h-full rounded-2xl" />
          </div>
        ))}
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