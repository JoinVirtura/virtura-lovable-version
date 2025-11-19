import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Play, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Post {
  id: string;
  caption: string;
  media_urls: string[];
  media_type?: string;
  like_count: number;
  comment_count: number;
  is_paid?: boolean;
  price_cents?: number;
}

interface MasonryPostGridProps {
  posts: Post[];
  userId?: string;
}

export function MasonryPostGrid({ posts, userId }: MasonryPostGridProps) {
  const navigate = useNavigate();
  const [hoveredPost, setHoveredPost] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📸</div>
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground">
          Share your first moment with the world
        </p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
      {posts.map((post, index) => {
        const mediaUrl = post.media_urls?.[0];
        const isHovered = hoveredPost === post.id;

        return (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="break-inside-avoid mb-4"
            onMouseEnter={() => setHoveredPost(post.id)}
            onMouseLeave={() => setHoveredPost(null)}
          >
            <div
              onClick={() => navigate(`/post/${post.id}`)}
              className="group relative overflow-hidden rounded-xl cursor-pointer bg-card border border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              {/* Media */}
              <div className="relative">
                {post.media_type === 'video' ? (
                  <div className="relative">
                    <video
                      src={mediaUrl}
                      className="w-full object-cover"
                      style={{ aspectRatio: 'auto' }}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                      <Play className="w-12 h-12 text-white drop-shadow-lg" />
                    </div>
                  </div>
                ) : (
                  <img
                    src={mediaUrl}
                    alt={post.caption}
                    className="w-full object-cover"
                    style={{ aspectRatio: 'auto' }}
                  />
                )}

                {/* Paid Content Badge */}
                {post.is_paid && (
                  <Badge className="absolute top-3 right-3 bg-gradient-to-r from-primary to-primary-blue">
                    <Lock className="w-3 h-3 mr-1" />
                    ${(post.price_cents || 0) / 100}
                  </Badge>
                )}

                {/* Hover Overlay */}
                <motion.div
                  initial={false}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                  }}
                  className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-4"
                >
                  <div className="flex items-center gap-4 text-white">
                    <div className="flex items-center gap-2">
                      <Heart className="w-5 h-5" fill={isHovered ? "white" : "none"} />
                      <span className="font-semibold">{post.like_count}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      <span className="font-semibold">{post.comment_count}</span>
                    </div>
                  </div>
                  {post.caption && (
                    <p className="text-white text-sm mt-2 line-clamp-2">
                      {post.caption}
                    </p>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}