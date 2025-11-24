import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Award, Zap, Star, Trophy, Crown, Target } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: typeof Award;
  color: string;
  unlocked: boolean;
}

interface AchievementBadgesProps {
  achievements?: Achievement[];
}

const defaultAchievements: Achievement[] = [
  { id: '1', title: 'Early Adopter', description: 'Joined in the first 1000 users', icon: Zap, color: 'from-yellow-500 to-orange-500', unlocked: true },
  { id: '2', title: 'Content Creator', description: 'Posted 100+ pieces of content', icon: Star, color: 'from-blue-500 to-cyan-500', unlocked: true },
  { id: '3', title: 'Influencer', description: 'Reached 10K followers', icon: Trophy, color: 'from-purple-500 to-pink-500', unlocked: true },
  { id: '4', title: 'Viral Success', description: 'Post reached 1M views', icon: Crown, color: 'from-violet-500 to-purple-500', unlocked: false },
  { id: '5', title: 'Collaboration Master', description: 'Completed 50 brand deals', icon: Target, color: 'from-green-500 to-emerald-500', unlocked: true },
];

export function AchievementBadges({ achievements = defaultAchievements }: AchievementBadgesProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-violet-400" />
          Achievements
        </h3>
        <Badge variant="secondary">
          {achievements.filter(a => a.unlocked).length}/{achievements.length} Unlocked
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="relative group"
            >
              {/* Glow effect for unlocked badges */}
              {achievement.unlocked && (
                <motion.div
                  className={`absolute -inset-2 bg-gradient-to-r ${achievement.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity rounded-2xl`}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
              
              {/* Badge card */}
              <div className={`relative p-4 rounded-2xl backdrop-blur-xl border transition-all ${
                achievement.unlocked 
                  ? 'bg-card/50 border-primary/20 hover:border-primary/40' 
                  : 'bg-card/20 border-border/20 opacity-50 grayscale'
              }`}>
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className={`p-3 rounded-xl ${
                    achievement.unlocked 
                      ? `bg-gradient-to-br ${achievement.color} shadow-lg` 
                      : 'bg-muted'
                  }`}>
                    <Icon className={`w-6 h-6 ${achievement.unlocked ? 'text-white' : 'text-muted-foreground'}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">{achievement.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                </div>
              </div>
              
              {/* Lock overlay for locked badges */}
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-2xl">
                  <div className="text-4xl">🔒</div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
