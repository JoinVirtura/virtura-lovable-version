import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Shuffle } from 'lucide-react';
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
  
  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...tiles].sort(() => Math.random() - 0.5);
      setShuffledTiles(shuffled);
      setIsShuffling(false);
    }, 300);
  };

  // Update shuffled tiles when tiles prop changes
  React.useEffect(() => {
    setShuffledTiles(tiles);
  }, [tiles]);

  return (
    <section className={cn('space-y-6', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">
            TRENDING CREATIONS
          </h2>
          <p className="text-muted-foreground">
            Discover what the community is creating
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className={`hover:bg-primary/10 group transition-all duration-300 ${isShuffling ? 'animate-spin' : ''}`}
            onClick={handleShuffle}
            disabled={isShuffling}
          >
            <Shuffle className={`mr-2 h-4 w-4 transition-transform ${isShuffling ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            {isShuffling ? 'SHUFFLING...' : 'SURPRISE ME'}
          </Button>
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary/80 hover:bg-primary/10 group"
            onClick={() => window.location.href = '/studio'}
          >
            VIEW ALL
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {shuffledTiles.slice(0, 8).map((tile, index) => (
          <motion.div
            key={`${tile.id}-${shuffledTiles.length}`}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              duration: 0.4, 
              delay: index * 0.1,
              ease: "easeOut"
            }}
          >
            <ContentCard 
              tile={tile} 
              size="md"
              className="h-full"
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};