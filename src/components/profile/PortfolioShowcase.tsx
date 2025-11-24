import { motion } from 'framer-motion';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Play, Heart, Eye } from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  views: number;
  likes: number;
  type: 'video' | 'image';
}

const mockPortfolio: PortfolioItem[] = [
  { id: '1', title: 'Fashion Editorial', thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400', category: 'Fashion', views: 45000, likes: 2300, type: 'image' },
  { id: '2', title: 'Tech Review: iPhone', thumbnail: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=400', category: 'Tech', views: 125000, likes: 8900, type: 'video' },
  { id: '3', title: 'Motion Graphics', thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400', category: 'Animation', views: 78000, likes: 4500, type: 'video' },
  { id: '4', title: 'Product Photography', thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', category: 'Photography', views: 32000, likes: 1800, type: 'image' },
  { id: '5', title: 'Brand Campaign', thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', category: 'Marketing', views: 95000, likes: 6200, type: 'video' },
  { id: '6', title: 'Editorial Shoot', thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400', category: 'Fashion', views: 52000, likes: 3100, type: 'image' },
];

const categories = ['All', 'Fashion', 'Tech', 'Animation', 'Photography', 'Marketing'];

export function PortfolioShowcase() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPortfolio = selectedCategory === 'All' 
    ? mockPortfolio 
    : mockPortfolio.filter(item => item.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                : 'bg-card/50 hover:bg-card border border-border'
            }`}
          >
            {category}
          </motion.button>
        ))}
      </div>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {filteredPortfolio.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            className="break-inside-avoid"
          >
            <div className="relative group overflow-hidden rounded-2xl bg-card/50 backdrop-blur-xl border border-primary/10 hover:border-primary/30 transition-all cursor-pointer">
              {/* Thumbnail */}
              <div className="relative aspect-square">
                <img 
                  src={item.thumbnail} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Play icon for videos */}
                  {item.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white" />
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-4 text-white text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {(item.views / 1000).toFixed(1)}K
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {(item.likes / 1000).toFixed(1)}K
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                <Badge className="absolute top-3 left-3 bg-violet-500/90 text-white">
                  {item.category}
                </Badge>
              </div>

              {/* Title */}
              <div className="p-4">
                <h4 className="font-semibold text-sm">{item.title}</h4>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
