import { motion } from 'framer-motion';
import { Video, Sparkles, Share2, Image, Mic, Music } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categories = [
  { id: 'all', icon: Sparkles, label: 'All Campaigns', color: 'violet' },
  { id: 'video', icon: Video, label: 'Video Content', color: 'blue' },
  { id: 'animation', icon: Sparkles, label: 'Animation', color: 'pink' },
  { id: 'social', icon: Share2, label: 'Social Media', color: 'cyan' },
  { id: 'image', icon: Image, label: 'Photography', color: 'green' },
  { id: 'audio', icon: Mic, label: 'Audio/Voice', color: 'purple' },
  { id: 'music', icon: Music, label: 'Music', color: 'orange' },
];

const colorClasses = {
  violet: 'from-violet-500/20 to-purple-500/20 border-violet-500 text-violet-400',
  blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500 text-blue-400',
  pink: 'from-pink-500/20 to-rose-500/20 border-pink-500 text-pink-400',
  cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500 text-cyan-400',
  green: 'from-green-500/20 to-emerald-500/20 border-green-500 text-green-400',
  purple: 'from-purple-500/20 to-violet-500/20 border-purple-500 text-purple-400',
  orange: 'from-orange-500/20 to-amber-500/20 border-orange-500 text-orange-400',
};

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory);
        const Icon = cat.icon;
        
        return (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectCategory(cat.id === 'all' ? null : cat.id)}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[110px] transition-all ${
              isSelected
                ? `bg-gradient-to-br ${colorClasses[cat.color as keyof typeof colorClasses]} border-2`
                : 'bg-card/50 border border-border hover:border-primary/30'
            }`}
          >
            <Icon className={`w-6 h-6 ${isSelected ? '' : 'text-muted-foreground'}`} />
            <span className={`text-xs font-medium whitespace-nowrap ${
              isSelected ? '' : 'text-muted-foreground'
            }`}>
              {cat.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
