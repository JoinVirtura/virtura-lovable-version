import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Grid3X3, 
  BookmarkIcon, 
  BarChart3, 
  Settings, 
  Play, 
  Heart,
  Eye,
  MessageCircle,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  media_urls?: string[] | null;
  caption?: string | null;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  content_type?: string;
}

interface BentoContentGridProps {
  posts: Post[];
  savedPosts: Post[];
  isOwnProfile: boolean;
  onNavigateToAnalytics?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToSaved?: () => void;
}

export function BentoContentGrid({
  posts,
  savedPosts,
  isOwnProfile,
  onNavigateToAnalytics,
  onNavigateToSettings,
  onNavigateToSaved,
}: BentoContentGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const featuredPost = posts[0];
  const recentPosts = posts.slice(1, 5);
  const portfolioHighlights = posts.slice(5, 8);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <div className="grid grid-cols-4 md:grid-cols-6 gap-3 md:gap-4 auto-rows-[120px] md:auto-rows-[140px]">
      {/* Featured Post - Large Hero Card */}
      {featuredPost && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="col-span-4 md:col-span-3 row-span-2 relative group cursor-pointer overflow-hidden rounded-2xl border border-white/10"
          onMouseEnter={() => setHoveredId(featuredPost.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {featuredPost.media_urls?.[0] ? (
            <img
              src={featuredPost.media_urls[0]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600 to-pink-600" />
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Featured badge */}
          <div className="absolute top-3 left-3">
            <div className="px-2 py-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-xs font-medium text-white flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Featured
            </div>
          </div>

          {/* Video indicator */}
          {featuredPost.content_type === "video" && (
            <div className="absolute top-3 right-3">
              <div className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </div>
          )}

          {/* Content overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: hoveredId === featuredPost.id ? 1 : 0.8, y: 0 }}
            className="absolute bottom-0 left-0 right-0 p-4"
          >
            <p className="text-white text-sm font-medium line-clamp-2 mb-2">
              {featuredPost.caption || "Featured creation"}
            </p>
            <div className="flex items-center gap-4 text-white/80 text-xs">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(featuredPost.view_count || 0)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatNumber(featuredPost.like_count || 0)}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {formatNumber(featuredPost.comment_count || 0)}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Recent Posts Grid */}
      {recentPosts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 + index * 0.05 }}
          className="col-span-2 md:col-span-1 relative group cursor-pointer overflow-hidden rounded-xl border border-white/10"
          onMouseEnter={() => setHoveredId(post.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {post.media_urls?.[0] ? (
            <img
              src={post.media_urls[0]}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
          )}

          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

          {post.content_type === "video" && (
            <div className="absolute top-2 right-2">
              <Play className="w-4 h-4 text-white drop-shadow-lg" />
            </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredId === post.id ? 1 : 0 }}
            className="absolute inset-0 flex items-center justify-center gap-3 text-white text-xs"
          >
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {formatNumber(post.like_count || 0)}
            </span>
          </motion.div>
        </motion.div>
      ))}

      {/* Quick Links - Only for own profile */}
      {isOwnProfile && (
        <>
          {/* Analytics Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={onNavigateToAnalytics}
            className="col-span-2 md:col-span-2 relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-emerald-500/20 via-emerald-600/10 to-transparent hover:border-emerald-500/30 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Analytics</h4>
                <p className="text-xs text-muted-foreground">View insights</p>
              </div>
            </div>
          </motion.div>

          {/* Saved Posts Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            onClick={onNavigateToSaved}
            className="col-span-2 md:col-span-2 relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-pink-500/20 via-pink-600/10 to-transparent hover:border-pink-500/30 transition-colors"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative p-4 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                  <BookmarkIcon className="w-5 h-5 text-pink-400" />
                </div>
                <span className="text-xs text-pink-400 font-medium">
                  {savedPosts.length} saved
                </span>
              </div>
              <div>
                <h4 className="text-white font-medium text-sm">Saved</h4>
                <p className="text-xs text-muted-foreground">Your collection</p>
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* Portfolio Highlights */}
      {portfolioHighlights.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-4 md:col-span-2 row-span-1 relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/20 via-purple-600/10 to-transparent"
        >
          <div className="relative p-4 h-full">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-white font-medium text-sm">Portfolio</h4>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
            </div>
            <div className="flex gap-2">
              {portfolioHighlights.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  className="w-16 h-16 rounded-lg overflow-hidden border border-white/10"
                >
                  {post.media_urls?.[0] ? (
                    <img
                      src={post.media_urls[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-violet-600 to-pink-600" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* All Posts Grid Link */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.45 }}
        className="col-span-2 md:col-span-2 relative group cursor-pointer overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-800/50 to-slate-900/50 hover:border-violet-500/30 transition-colors"
      >
        <div className="relative p-4 h-full flex flex-col justify-between">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
            <Grid3X3 className="w-5 h-5 text-white/60" />
          </div>
          <div>
            <h4 className="text-white font-medium text-sm">All Posts</h4>
            <p className="text-xs text-muted-foreground">{posts.length} creations</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
