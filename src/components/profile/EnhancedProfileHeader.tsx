import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Settings, Share2, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Profile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
}

interface EnhancedProfileHeaderProps {
  profile: Profile;
  postsCount: number;
  isOwnProfile: boolean;
  onEditProfile?: () => void;
}

export function EnhancedProfileHeader({ 
  profile, 
  postsCount, 
  isOwnProfile, 
  onEditProfile 
}: EnhancedProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary-blue/10 to-background -z-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent -z-10" />

      <div className="container mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          {/* Avatar with Glow Effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-blue rounded-full blur-2xl opacity-50 animate-pulse" />
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-4 border-primary/50 shadow-2xl relative">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary-blue text-3xl text-white">
                {profile.display_name?.charAt(0) || profile.username?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-blue to-primary-magenta bg-clip-text text-transparent">
                  {profile.display_name || profile.username}
                </h1>
                {profile.is_verified && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: 'spring' }}
                  >
                    <CheckCircle2 className="w-7 h-7 text-primary drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                  </motion.div>
                )}
              </div>
              <p className="text-muted-foreground text-lg">@{profile.username}</p>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-6"
            >
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {postsCount}
                </div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {profile.follower_count}
                </div>
                <div className="text-sm text-muted-foreground">Followers</div>
              </div>
              <div className="group cursor-pointer">
                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                  {profile.following_count}
                </div>
                <div className="text-sm text-muted-foreground">Following</div>
              </div>
            </motion.div>

            {/* Bio */}
            {profile.bio && (
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-foreground max-w-2xl"
              >
                {profile.bio}
              </motion.p>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex gap-3"
            >
              {isOwnProfile ? (
                <Button 
                  onClick={onEditProfile}
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button className="bg-gradient-to-r from-primary to-primary-blue hover:opacity-90">
                    Follow
                  </Button>
                  <Button variant="outline" className="border-primary/50">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                </>
              )}
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Share2 className="w-4 h-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}