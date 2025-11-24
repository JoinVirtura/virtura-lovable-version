import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Edit, MessageCircle, UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useFollowUser } from '@/hooks/useFollowUser';

interface Profile {
  id: string;
  display_name: string | null;
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
  onFollowChange?: (isFollowing: boolean, newCount: number) => void;
}

export function EnhancedProfileHeader({ 
  profile, 
  postsCount, 
  isOwnProfile,
  onEditProfile,
  onFollowChange
}: EnhancedProfileHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const { isFollowing, loading: followLoading, followerCount, toggleFollow } = useFollowUser(profile.id);

  // Notify parent of follow changes
  useEffect(() => {
    if (onFollowChange && followerCount !== profile.follower_count) {
      onFollowChange(isFollowing, followerCount);
    }
  }, [isFollowing, followerCount]);

  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  // Animated counter
  const AnimatedCounter = ({ value }: { value: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!mounted) return;
      let start = 0;
      const end = value;
      const duration = 1000;
      const increment = end / (duration / 16);

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }, [value, mounted]);

    return <span>{count.toLocaleString()}</span>;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900/30 via-purple-900/20 to-pink-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * 400,
            }}
            animate={{
              y: [null, Math.random() * 400],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <motion.div
        className="relative backdrop-blur-3xl bg-gradient-to-br from-background/40 via-background/20 to-background/40 border border-white/10 rounded-3xl shadow-2xl p-8"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Holographic Shine Effect */}
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 opacity-20"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
            }}
            animate={{
              x: ["-100%", "200%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>

        <div className="relative flex flex-col md:flex-row items-center md:items-start gap-8">
          {/* Avatar Section */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Glow Ring */}
            <motion.div
              className="absolute -inset-4 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-50 blur-2xl"
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity },
              }}
            />
            
            {/* Avatar with 3D effect */}
            <motion.div
              className="relative"
              style={{
                transform: "translateZ(50px)",
              }}
            >
              <Avatar className="h-32 w-32 border-4 border-white/20 shadow-2xl ring-4 ring-violet-500/50">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl font-bold bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  {profile.display_name?.[0] || profile.username[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {/* Verification Badge */}
              {profile.is_verified && (
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-violet-500 rounded-full p-1 shadow-lg"
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.3, type: "spring" }}
                >
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </motion.div>
              )}
            </motion.div>
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left space-y-4">
            {/* Name & Username */}
            <div>
              <motion.h1
                className="text-4xl font-bold mb-2 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                {profile.display_name || profile.username}
              </motion.h1>
              <motion.p
                className="text-muted-foreground flex items-center justify-center md:justify-start gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                @{profile.username}
                {profile.is_verified && (
                  <Badge variant="secondary" className="gap-1 bg-violet-500/20 text-violet-300 border-violet-500/30">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </Badge>
                )}
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 blur-xl opacity-30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="text-2xl font-bold relative bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                    <AnimatedCounter value={postsCount} />
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Posts</p>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-xl opacity-30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <p className="text-2xl font-bold relative bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    <AnimatedCounter value={followerCount} />
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Followers</p>
              </motion.div>

              <motion.div
                className="text-center"
                whileHover={{ scale: 1.1 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-pink-500 to-violet-500 blur-xl opacity-30"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                  <p className="text-2xl font-bold relative bg-gradient-to-r from-pink-400 to-violet-400 bg-clip-text text-transparent">
                    <AnimatedCounter value={profile.following_count} />
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">Following</p>
              </motion.div>
            </motion.div>

            {/* Bio */}
            {profile.bio && (
              <motion.p
                className="text-foreground/80 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                {profile.bio}
              </motion.p>
            )}

            {/* Action Buttons */}
            <motion.div
              className="flex gap-3 justify-center md:justify-start flex-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {isOwnProfile ? (
                <Button
                  onClick={onEditProfile}
                  className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg shadow-violet-500/50"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={toggleFollow}
                    disabled={followLoading}
                    className={`gap-2 shadow-lg ${
                      isFollowing 
                        ? 'bg-card border-2 border-violet-500/50 hover:bg-card/80' 
                        : 'bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-violet-500/50'
                    }`}
                  >
                    {followLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-violet-500/50 hover:bg-violet-500/10"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Message
                  </Button>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
