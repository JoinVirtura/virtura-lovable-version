import { useEffect, useRef } from 'react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { usePostActions } from '@/hooks/usePostActions';
import { PostCard } from './PostCard';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { CommentModal } from './CommentModal';

interface FeedContainerProps {
  filterType?: 'all' | 'following' | 'own';
}

export function FeedContainer({ filterType = 'all' }: FeedContainerProps) {
  const { posts, loading, hasMore, fetchMore } = useSocialPosts(filterType);
  const { toggleLike, followUser, unlockPost } = usePostActions();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchMore();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, fetchMore]);

  const handleUnlock = async (postId: string) => {
    const result = await unlockPost(postId);
    if (result?.clientSecret) {
      // TODO: Integrate Stripe payment flow
      console.log('Payment required:', result.clientSecret);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">No posts yet. Be the first to post!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-2xl mx-auto">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onLike={toggleLike}
            onComment={setSelectedPostId}
            onUnlock={handleUnlock}
            onFollow={followUser}
          />
        ))}

        {hasMore && (
          <div ref={observerRef} className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <CommentModal
        postId={selectedPostId}
        isOpen={!!selectedPostId}
        onClose={() => setSelectedPostId(null)}
      />
    </>
  );
}
