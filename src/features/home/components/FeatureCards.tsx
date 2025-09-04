import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface FeatureCardsProps {
  className?: string;
}

const features = [
  {
    id: 'video',
    title: 'AI Video',
    subtitle: 'Transform ideas into vibrant videos',
    route: '/video',
    icon: Play,
    gradient: 'from-blue-600/20 via-cyan-500/20 to-blue-800/20',
    glowColor: 'shadow-blue-500/20',
    borderGlow: 'hover:shadow-blue-500/30',
    iconBg: 'bg-blue-500/20',
  },
  {
    id: 'drama',
    title: 'AI Drama',
    subtitle: 'Craft short dramas from script to screen',
    route: '/talking-avatar',
    icon: Sparkles,
    gradient: 'from-emerald-600/20 via-teal-500/20 to-emerald-800/20',
    glowColor: 'shadow-emerald-500/20',
    borderGlow: 'hover:shadow-emerald-500/30',
    iconBg: 'bg-emerald-500/20',
  }
];

export const FeatureCards: React.FC<FeatureCardsProps> = ({ className }) => {
  const handleNavigation = (route: string) => {
    window.location.href = route;
  };

  return (
    <section className={cn('space-y-6', className)}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h2 className="text-4xl font-bold text-foreground mb-2">
          All-in-one AI Video Creation
        </h2>
        <p className="text-xl text-transparent bg-gradient-to-r from-amber-400 to-emerald-400 bg-clip-text font-semibold">
          VISUALIZE YOUR STORY
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          
          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.2,
                ease: "easeOut"
              }}
              whileHover={{ 
                scale: 1.01,
                transition: { duration: 0.2 }
              }}
              className="group"
            >
              <Card className={cn(
                'relative overflow-hidden p-8 h-64 cursor-pointer',
                'bg-gradient-to-br', feature.gradient,
                'backdrop-blur-sm border-border/50 rounded-2xl',
                'transition-all duration-300',
                'hover:shadow-2xl', feature.borderGlow,
                'focus-within:ring-2 focus-within:ring-primary/50'
              )}>
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-8 right-8 w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl" />
                  <div className="absolute bottom-8 left-8 w-24 h-24 rounded-full bg-gradient-to-br from-white/15 to-transparent blur-xl" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center',
                      feature.iconBg,
                      'group-hover:scale-110 transition-transform duration-300'
                    )}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-white/80 text-lg leading-relaxed">
                        {feature.subtitle}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleNavigation(feature.route)}
                    className={cn(
                      'bg-white/10 hover:bg-white/20 text-white border-white/30',
                      'backdrop-blur-sm px-8 py-6 text-lg font-semibold',
                      'transition-all duration-300 group-hover:scale-105',
                      'hover:shadow-lg'
                    )}
                  >
                    Create
                  </Button>
                </div>

                {/* Hover glow effect */}
                <div className={cn(
                  'absolute -inset-1 opacity-0 group-hover:opacity-100',
                  'bg-gradient-to-r from-primary/20 to-emerald-500/20',
                  'rounded-2xl transition-opacity duration-300 -z-10 blur-sm'
                )} />
              </Card>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};