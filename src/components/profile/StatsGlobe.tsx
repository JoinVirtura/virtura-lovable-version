import { motion } from 'framer-motion';
import { TrendingUp, Eye, Heart, Users } from 'lucide-react';

interface StatsGlobeProps {
  views: number;
  likes: number;
  followers: number;
  engagement: number;
}

export function StatsGlobe({ views, likes, followers, engagement }: StatsGlobeProps) {
  const stats = [
    { label: 'Views', value: views, icon: Eye, color: 'from-blue-500 to-cyan-500', delay: 0 },
    { label: 'Likes', value: likes, icon: Heart, color: 'from-pink-500 to-rose-500', delay: 0.1 },
    { label: 'Followers', value: followers, icon: Users, color: 'from-violet-500 to-purple-500', delay: 0.2 },
    { label: 'Engagement', value: `${engagement}%`, icon: TrendingUp, color: 'from-green-500 to-emerald-500', delay: 0.3 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: stat.delay, type: 'spring' }}
            whileHover={{ scale: 1.05, rotateY: 5 }}
            className="relative group"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Glow effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${stat.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-2xl`} />
            
            {/* Card */}
            <div className="relative p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-primary/10 group-hover:border-primary/30 transition-all">
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <motion.p 
                    className="text-2xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: stat.delay + 0.2 }}
                  >
                    {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                  </motion.p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
