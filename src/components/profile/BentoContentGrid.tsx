import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Play, Heart, MessageCircle, Loader2 } from "lucide-react";
import { PostLightboxModal } from "./PostLightboxModal";

interface Post {
  id: string;
  user_id: string;
  media_urls?: string[] | null;
  caption?: string | null;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  content_type?: string;
  published_at?: string;
}

interface BentoContentGridProps {
  posts: Post[];
  hasMore?: boolean;
  loadMore?: () => void;
  loadingMore?: boolean;
  onPostDeleted?: () => void;
}

export function BentoContentGrid({ 
  posts, 
  hasMore = false, 
  loadMore, 
  loadingMore = false,
  onPostDeleted 
}: BentoContentGridProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

  // Infinite scroll observer
  useEffect(() => {
    if (!loadMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loadingMore]);

  const handlePostClick = useCallback((post: Post) => {
    setSelectedPost(post);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedPost(null);
  }, []);

  const handlePostDeleted = useCallback(() => {
    setSelectedPost(null);
    onPostDeleted?.();
  }, [onPostDeleted]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
          <Play className="w-10 h-10 text-violet-400" />
        </div>
        <p className="text-muted-foreground">No posts yet</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Posts will appear here</p>
      </div>
    );
  }

  return (
    <>
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
            onClick={() => handlePostClick(post)}
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

            {/* Multi-media indicator */}
            {(post.media_urls?.length || 0) > 1 && (
              <div className="absolute top-2 right-2 bg-black/50 px-1.5 py-0.5 rounded text-xs text-white font-medium">
                1/{post.media_urls?.length}
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

      {/* Load more sentinel */}
      {hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          {loadingMore && (
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
          )}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedPost && (
        <PostLightboxModal
          post={selectedPost}
          isOpen={!!selectedPost}
          onClose={handleCloseModal}
          onDelete={handlePostDeleted}
        />
      )}
    </>
  );
}