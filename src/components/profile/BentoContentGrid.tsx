import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Heart, Eye, MessageCircle } from "lucide-react";

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
  savedPosts?: Post[];
  isOwnProfile?: boolean;
}

export function BentoContentGrid({ posts }: BentoContentGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-2">
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.03 }}
          className="relative aspect-square group cursor-pointer overflow-hidden rounded-md border border-white/5"
          onMouseEnter={() => setHoveredId(post.id)}
          onMouseLeave={() => setHoveredId(null)}
        >
          {post.media_urls?.[0] ? (
            isVideo(post.media_urls[0]) ? (
              <video
                src={post.media_urls[0]}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                muted
                playsInline
                onMouseEnter={(e) => e.currentTarget.play()}
                onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
              />
            ) : (
              <img
                src={post.media_urls[0]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-violet-600/50 to-pink-600/50" />
          )}

          {/* Video indicator */}
          {(post.content_type === "video" || (post.media_urls?.[0] && isVideo(post.media_urls[0]))) && (
            <div className="absolute top-2 right-2">
              <Play className="w-4 h-4 text-white drop-shadow-lg fill-white/80" />
            </div>
          )}

          {/* Hover overlay with stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hoveredId === post.id ? 1 : 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center gap-4"
          >
            <div className="flex items-center gap-1 text-white text-sm font-medium">
              <Heart className="w-4 h-4 fill-white" />
              {formatNumber(post.like_count || 0)}
            </div>
            <div className="flex items-center gap-1 text-white text-sm font-medium">
              <MessageCircle className="w-4 h-4 fill-white" />
              {formatNumber(post.comment_count || 0)}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}
