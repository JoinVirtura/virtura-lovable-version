import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentCard } from './ContentCard';
import { Tile } from '../types';
import { cn } from '@/lib/utils';

interface TrendingRowProps {
  tiles: Tile[];
  className?: string;
}

export const TrendingRow: React.FC<TrendingRowProps> = ({ tiles, className }) => {
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
            Trending Creations
          </h2>
          <p className="text-muted-foreground">
            Discover what the community is creating
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          className="text-primary hover:text-primary/80 hover:bg-primary/10 group"
          onClick={() => window.location.href = '/dashboard#gallery'}
        >
          View All
          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Button>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tiles.slice(0, 6).map((tile, index) => (
          <motion.div
            key={tile.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
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