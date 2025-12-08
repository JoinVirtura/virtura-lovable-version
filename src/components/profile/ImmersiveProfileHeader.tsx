import { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { 
  BadgeCheck, 
  Sparkles, 
  TrendingUp,
  Crown,
  Zap
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFollowUser } from "@/hooks/useFollowUser";

interface Profile {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  is_verified: boolean;
  follower_count: number;
  following_count: number;
}

interface ImmersiveProfileHeaderProps {
  profile: Profile;
  postsCount: number;
  isOwnProfile: boolean;
  onFollowChange?: (isFollowing: boolean, newCount: number) => void;
}

export function ImmersiveProfileHeader({
  profile,
  postsCount,
  isOwnProfile,
  onFollowChange,
}: ImmersiveProfileHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const { isFollowing, loading: isLoading, toggleFollow, followerCount } = useFollowUser(profile.id);

  // Smooth spring values for parallax
  const springConfig = { stiffness: 100, damping: 30 };
  const rotateX = useSpring(useTransform(mouseY, [0, 300], [5, -5]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [0, 600], [-5, 5]), springConfig);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (onFollowChange && followerCount !== profile.follower_count) {
      onFollowChange(isFollowing, followerCount);
    }
  }, [isFollowing, followerCount]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div
      className="relative overflow-hidden"
      onMouseMove={handleMouseMove}
    >
      {/* Aurora Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-slate-900 to-pink-950" />
      
      {/* Animated mesh gradient */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-violet-600/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-pink-600/30 to-transparent rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/4 left-1/2 w-1/2 h-1/2 bg-gradient-to-b from-cyan-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      {/* Floating particles */}
      {mounted && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-white/30"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * 400,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* 3D Avatar with holographic ring */}
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="relative"
          >
            {/* Holographic glow rings */}
            <div className="absolute inset-0 -m-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-violet-500/30"
                style={{ transform: "rotateX(75deg)" }}
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full border-2 border-pink-500/30"
                style={{ transform: "rotateX(75deg) rotateZ(45deg)" }}
              />
            </div>

            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 rounded-full blur-2xl opacity-40 animate-pulse" />

            {/* Avatar */}
            <Avatar className="w-32 h-32 md:w-40 md:h-40 ring-4 ring-white/20 relative z-10">
              <AvatarImage src={profile.avatar_url} className="object-cover" />
              <AvatarFallback className="bg-gradient-to-br from-violet-600 to-pink-600 text-4xl text-white">
                {profile.display_name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            {/* Verified badge */}
            {profile.is_verified && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -bottom-2 -right-2 z-20"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/50">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Profile Info */}
          <div className="flex-1 text-center md:text-left">
            {/* Badges */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
              {profile.is_verified && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 to-pink-500/20 border border-violet-500/30"
                >
                  <BadgeCheck className="w-3 h-3 text-violet-400" />
                  <span className="text-xs text-violet-300">Verified</span>
                </motion.div>
              )}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30"
              >
                <Crown className="w-3 h-3 text-amber-400" />
                <span className="text-xs text-amber-300">Top Creator</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30"
              >
                <TrendingUp className="w-3 h-3 text-emerald-400" />
                <span className="text-xs text-emerald-300">Trending</span>
              </motion.div>
            </div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl md:text-5xl font-bold mb-2"
            >
              <span className="bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">
                {profile.display_name}
              </span>
            </motion.h1>

            {/* Username */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground text-lg mb-4"
            >
              @{profile.username}
            </motion.p>

            {/* Bio with typing effect */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white/80 max-w-xl mb-6 line-clamp-2"
            >
              {profile.bio || "No bio yet"}
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-8"
            >
              {[
                { label: "Posts", value: postsCount },
                { label: "Followers", value: followerCount },
                { label: "Following", value: profile.following_count },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-white">
                    {formatNumber(stat.value)}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Action Buttons */}
          {!isOwnProfile && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col gap-3"
            >
              <Button
                onClick={toggleFollow}
                disabled={isLoading}
                className={cn(
                  "px-8 py-6 rounded-xl text-base font-medium transition-all",
                  isFollowing
                    ? "bg-white/10 hover:bg-white/20 text-white border border-white/20"
                    : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-white shadow-lg shadow-violet-500/25"
                )}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isFollowing ? (
                  "Following"
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Follow
                  </>
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
