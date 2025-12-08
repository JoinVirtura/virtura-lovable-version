import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface GlowBadgeProps {
  variant: 'free' | 'premium' | 'ai' | 'hot' | 'trending' | 'live';
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

const variants = {
  free: {
    container: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    glow: 'shadow-[0_0_15px_hsl(160_84%_39%/0.3)]',
  },
  premium: {
    container: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300',
    glow: 'shadow-[0_0_15px_hsl(38_92%_50%/0.4)]',
  },
  ai: {
    container: 'bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-pink-500/15 border-violet-500/30 text-violet-300',
    glow: 'shadow-[0_0_15px_hsl(270_100%_70%/0.3)]',
  },
  hot: {
    container: 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-300',
    glow: 'shadow-[0_0_15px_hsl(25_95%_53%/0.4)]',
  },
  trending: {
    container: 'bg-gradient-to-r from-green-500/15 to-emerald-500/15 border-green-500/30 text-green-300',
    glow: 'shadow-[0_0_15px_hsl(142_71%_45%/0.3)]',
  },
  live: {
    container: 'bg-red-500/20 border-red-500/40 text-red-300',
    glow: 'shadow-[0_0_15px_hsl(0_84%_60%/0.4)]',
  },
};

export function GlowBadge({ variant, children, className, animate = true }: GlowBadgeProps) {
  const styles = variants[variant];
  
  return (
    <motion.span
      initial={animate ? { scale: 0.9, opacity: 0 } : false}
      animate={animate ? { scale: 1, opacity: 1 } : false}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border backdrop-blur-sm transition-all duration-300',
        styles.container,
        styles.glow,
        'hover:scale-105',
        className
      )}
    >
      {/* Shimmer effect for premium badge */}
      {variant === 'premium' && (
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </span>
      )}
      {children}
    </motion.span>
  );
}
