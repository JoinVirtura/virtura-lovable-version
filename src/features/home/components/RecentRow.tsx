import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ContentCard } from './ContentCard';
import { Tile } from '../types';
import { cn } from '@/lib/utils';

interface RecentRowProps {
  tutorials: Tile[];
  className?: string;
}

const quickActions = [
  {
    id: 'video',
    label: 'Generate Video',
    icon: Play,
    route: '/video',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'drama',
    label: 'Open Studio',
    icon: Sparkles,
    route: '/talking-avatar',
    gradient: 'from-emerald-500 to-teal-500',
  }
];

export const RecentRow: React.FC<RecentRowProps> = ({ tutorials, className }) => {
  const handleNavigation = (route: string) => {
    window.location.href = route;
  };

  return (
    <section className={cn('space-y-6', className)}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Recent Creations
        </h2>
        <p className="text-muted-foreground">
          Jump back into your latest projects and tutorials
        </p>
      </motion.div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Quick Actions - Left Column */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4 space-y-4"
        >
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 rounded-2xl">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                
                return (
                  <motion.div
                    key={action.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                  >
                    <Button
                      onClick={() => handleNavigation(action.route)}
                      className={cn(
                        'w-full justify-start gap-3 p-4 h-auto',
                        'bg-gradient-to-r', action.gradient,
                        'hover:shadow-lg transition-all duration-300',
                        'text-white font-semibold text-base',
                        'hover:scale-[1.02]'
                      )}
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      {action.label}
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>

        {/* Tutorials - Right Area */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutorials.slice(0, 2).map((tutorial, index) => (
              <motion.div
                key={tutorial.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.5 + index * 0.2 
                }}
              >
                <ContentCard 
                  tile={tutorial} 
                  size="lg"
                  className="h-full"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};