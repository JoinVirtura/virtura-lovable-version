import { Play, Heart, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Post {
  id: string;
  caption: string;
  media_url: string;
  media_type: string;
  like_count: number;
  comment_count: number;
}

interface ProfilePostsGridProps {
  posts: Post[];
  loading?: boolean;
}

export function ProfilePostsGrid({ posts, loading }: ProfilePostsGridProps) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 p-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-muted-foreground">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 p-6">
      {posts.map((post) => (
        <button
          key={post.id}
          onClick={() => navigate(`/social?postId=${post.id}`)}
          className="relative aspect-square group overflow-hidden bg-muted"
        >
          {post.media_type === 'video' ? (
            <>
              <video 
                src={post.media_url} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Play className="w-8 h-8 text-white opacity-80" />
              </div>
            </>
          ) : (
            <img 
              src={post.media_url} 
              alt={post.caption}
              className="w-full h-full object-cover"
            />
          )}
          
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <div className="flex items-center gap-1 text-white">
              <Heart className="w-5 h-5 fill-white" />
              <span className="font-semibold">{post.like_count}</span>
            </div>
            <div className="flex items-center gap-1 text-white">
              <MessageCircle className="w-5 h-5 fill-white" />
              <span className="font-semibold">{post.comment_count}</span>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
