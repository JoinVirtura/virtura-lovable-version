import { motion } from 'framer-motion';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
}

const categories = [
  { id: 'all', label: 'All Campaigns' },
  { id: 'video', label: 'Video Content' },
  { id: 'animation', label: 'Animation' },
  { id: 'social', label: 'Social Media' },
  { id: 'image', label: 'Photography' },
  { id: 'audio', label: 'Audio/Voice' },
  { id: 'music', label: 'Music' },
];

export function CategoryFilter({ selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id || (cat.id === 'all' && !selectedCategory);
        
        return (
          <motion.button
            key={cat.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectCategory(cat.id === 'all' ? null : cat.id)}
            className={`px-6 py-3 rounded-xl font-medium text-sm whitespace-nowrap transition-all ${
              isSelected
                ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border-2 border-violet-500 text-violet-400'
                : 'bg-card/50 border border-border hover:border-primary/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            {cat.label}
          </motion.button>
        );
      })}
    </div>
  );
}
