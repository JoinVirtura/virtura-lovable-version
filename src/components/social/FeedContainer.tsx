import { useEffect, useRef } from 'react';
import { useSocialPosts } from '@/hooks/useSocialPosts';
import { usePostActions } from '@/hooks/usePostActions';
import { PostCard } from './PostCard';
import { Loader2, Sparkles, Users, TrendingUp, Plus } from 'lucide-react';
import { useState } from 'react';
import { CommentModal } from './CommentModal';
import { PostUnlockPaymentModal } from './PostUnlockPaymentModal';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { motion } from 'framer-motion';

interface FeedContainerProps {
  filterType?: 'all' | 'following' | 'own' | 'trending';
  onFilterChange?: (filter: 'all' | 'following' | 'trending') => void;
}

export function FeedContainer({ filterType = 'all', onFilterChange }: FeedContainerProps) {
  const { posts, loading, hasMore, fetchMore, refresh } = useSocialPosts(filterType);
  const { toggleLike, followUser, unlockPost } = usePostActions();
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<{
    clientSecret: string;
    postId: string;
    amount: number;
  } | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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

  const handleUnlock = async (postId: string, priceCents: number) => {
    const result = await unlockPost(postId);
    if (result?.clientSecret) {
      setPaymentData({
        clientSecret: result.clientSecret,
        postId: postId,
        amount: priceCents,
      });
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
    const emptyStateContent = {
      all: {
        icon: Sparkles,
        title: "Welcome to Virtura Social",
        description: "Be the first to share your creation!",
        cta: null
      },
      following: {
        icon: Users,
        title: "No posts from followed users",
        description: "Follow creators to see their content here",
        cta: null
      },
      trending: {
        icon: TrendingUp,
        title: "No trending posts yet",
        description: "Check back soon for popular content",
        cta: null
      },
      own: {
        icon: Sparkles,
        title: "You haven't posted yet",
        description: "Share your first creation with the world",
        cta: null
      }
    };

    const content = emptyStateContent[filterType];
    
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto px-4">
        <content.icon className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">{content.title}</h3>
        <p className="text-muted-foreground mb-6">{content.description}</p>
        {content.cta && (
          <Button onClick={content.cta.action} size="lg" className="gap-2">
            <Plus className="w-4 h-4" />
            {content.cta.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary 
      fallbackTitle="Failed to load feed"
      fallbackMessage="We couldn't load the posts. Please try again."
    >
      <>
        <div className="space-y-6 max-w-2xl mx-auto scroll-smooth">
        {posts.map((post, index) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{
              delay: index * 0.05,
              duration: 0.4,
              type: "spring",
              stiffness: 100
            }}
          >
            <PostCard
              post={post}
              onLike={toggleLike}
              onComment={setSelectedPostId}
              onUnlock={handleUnlock}
              onFollow={followUser}
            />
          </motion.div>
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

        <PostUnlockPaymentModal
          isOpen={!!paymentData}
          onClose={() => setPaymentData(null)}
          clientSecret={paymentData?.clientSecret || ''}
          postId={paymentData?.postId || ''}
          amount={paymentData?.amount || 0}
          onSuccess={() => {
            setPaymentData(null);
            refresh();
          }}
        />
      </>
    </ErrorBoundary>
  );
}
