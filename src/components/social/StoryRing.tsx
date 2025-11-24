import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Plus, CheckCircle, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

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
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative">
        {/* Animated Gradient Ring */}
        {hasStory && (
          <motion.div
            className="absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-500 via-purple-500 to-pink-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        )}
        
        {/* Avatar */}
        <div className="relative">
          <Avatar className={`h-16 w-16 border-2 ${hasStory ? 'border-background' : 'border-muted'}`}>
            <AvatarImage src={avatar || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              {username?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          
          {/* Plus Icon for Your Story */}
          {isYourStory && (
            <div className="absolute bottom-0 right-0 bg-violet-500 rounded-full p-1 border-2 border-background">
              <Plus className="h-3 w-3 text-white" />
            </div>
          )}
          
          {/* Verified Badge */}
          {isVerified && !isYourStory && (
            <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-0.5 border-2 border-background">
              <CheckCircle className="h-3 w-3 text-white fill-white" />
            </div>
          )}
          
          {/* Brand Badge */}
          {isBrand && !isYourStory && (
            <div className="absolute bottom-0 right-0 bg-purple-500 rounded-full p-0.5 border-2 border-background">
              <BadgeCheck className="h-3 w-3 text-white fill-white" />
            </div>
          )}
        </div>
      </div>
      
      {/* Username with story count */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground lowercase group-hover:text-foreground transition-colors">
          {isYourStory ? 'Your Story' : username}
        </span>
        {storyCount && storyCount > 1 && (
          <span className="text-[10px] text-muted-foreground/70">{storyCount} stories</span>
        )}
      </div>
    </motion.button>
  );
}
