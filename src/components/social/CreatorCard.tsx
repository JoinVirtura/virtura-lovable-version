import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, UserCheck } from 'lucide-react';

interface CreatorCardProps {
  avatar?: string | null;
  name: string;
  category: string;
  followers: string;
  isFollowing: boolean;
  onFollow: () => void;
}

export function CreatorCard({ avatar, name, category, followers, isFollowing, onFollow }: CreatorCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="p-4 rounded-2xl bg-card/50 backdrop-blur-xl border border-primary/10 hover:border-primary/30 transition-all text-center"
    >
      <Avatar className="h-16 w-16 mx-auto mb-3 ring-2 ring-primary/20">
        <AvatarImage src={avatar || undefined} />
        <AvatarFallback>{name[0]}</AvatarFallback>
      </Avatar>
      <h4 className="font-semibold text-sm mb-1">{name}</h4>
      <Badge variant="secondary" className="text-xs mb-2">{category}</Badge>
      <p className="text-xs text-muted-foreground mb-3">{followers} followers</p>
      <Button
        size="sm"
        variant={isFollowing ? "outline" : "default"}
        onClick={onFollow}
        className="w-full"
      >
        {isFollowing ? (
          <>
            <UserCheck className="w-3 h-3 mr-1" />
            Following
          </>
        ) : (
          <>
            <UserPlus className="w-3 h-3 mr-1" />
            Follow
          </>
        )}
      </Button>
    </motion.div>
  );
}
