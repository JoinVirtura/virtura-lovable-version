import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, CheckCircle, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface StoryRingProps {
  avatar?: string | null;
  username?: string;
  hasStory?: boolean;
  isYourStory?: boolean;
  isVerified?: boolean;
  isBrand?: boolean;
  storyCount?: number;
  onClick?: () => void;
}

export function StoryRing({ avatar, username, hasStory, isYourStory, isVerified, isBrand, storyCount, onClick }: StoryRingProps) {
  return (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center gap-2 flex-shrink-0 group"
      whileHover={{ scale: 1.08, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="relative">
        {/* Outer Glow Effect */}
        {hasStory && (
          <motion.div
            className="absolute -inset-2 rounded-full bg-gradient-to-tr from-primary via-secondary to-primary-blue opacity-40 blur-md"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          />
        )}
        
        {/* Animated Gradient Ring */}
        {hasStory && (
          <motion.div
            className="absolute -inset-1 rounded-full"
            style={{
              background: 'linear-gradient(135deg, hsl(270 100% 70%), hsl(320 85% 65%), hsl(217 91% 60%), hsl(270 100% 70%))',
              backgroundSize: '300% 300%',
            }}
            animate={{ 
              rotate: 360,
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              rotate: { duration: 4, repeat: Infinity, ease: "linear" },
              backgroundPosition: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
        )}
        
        {/* Your Story Ring (dashed) */}
        {isYourStory && !hasStory && (
          <div className="absolute -inset-1 rounded-full border-2 border-dashed border-primary/50" />
        )}
        
        {/* Avatar Container */}
        <div className="relative">
          <Avatar className={`h-16 w-16 border-[3px] ${hasStory ? 'border-background' : 'border-muted/50'} transition-all duration-300 group-hover:border-primary/50`}>
            <AvatarImage src={avatar || undefined} className="object-cover" />
            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground font-semibold">
              {username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* Plus Icon for Your Story */}
          {isYourStory && (
            <motion.div 
              className="absolute bottom-0 right-0 bg-gradient-to-r from-primary to-secondary rounded-full p-1 border-2 border-background shadow-[0_0_10px_hsl(270_100%_70%/0.5)]"
              whileHover={{ scale: 1.1 }}
            >
              <Plus className="h-3 w-3 text-primary-foreground" />
            </motion.div>
          )}
          
          {/* Verified Badge */}
          {isVerified && !isYourStory && (
            <motion.div 
              className="absolute bottom-0 right-0 bg-primary-blue rounded-full p-0.5 border-2 border-background shadow-[0_0_10px_hsl(217_91%_60%/0.5)]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
            >
              <CheckCircle className="h-3 w-3 text-white fill-white" />
            </motion.div>
          )}
          
          {/* Brand Badge */}
          {isBrand && !isYourStory && !isVerified && (
            <motion.div 
              className="absolute bottom-0 right-0 bg-secondary rounded-full p-0.5 border-2 border-background shadow-[0_0_10px_hsl(320_85%_65%/0.5)]"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
            >
              <BadgeCheck className="h-3 w-3 text-white fill-white" />
            </motion.div>
          )}
        </div>
      </div>
      
      {/* Username with story count */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground lowercase group-hover:text-foreground transition-colors font-medium">
          {isYourStory ? 'Your Story' : username?.length > 10 ? `${username.slice(0, 10)}...` : username}
        </span>
        {storyCount && storyCount > 1 && (
          <span className="text-[10px] text-primary/70 font-medium">{storyCount} stories</span>
        )}
      </div>
    </motion.button>
  );
}
