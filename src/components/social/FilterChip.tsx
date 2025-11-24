import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface FilterChipProps {
  active: boolean;
  icon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

export function FilterChip({ active, icon, children, onClick }: FilterChipProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
        transition-all duration-200
        ${active 
          ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg shadow-violet-500/50' 
          : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
        }
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </motion.button>
  );
}
