import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';

export interface SocialPost {
  id: string;
  user_id: string;
  content_type: string;
  caption: string;
  media_urls: string[];
  is_paid: boolean;
  price_cents: number;
  like_count: number;
  comment_count: number;
  view_count: number;
  published_at: string;
  creator_email?: string;
  creator_name?: string;
  creator_avatar?: string;
  liked_by_user?: boolean;
  following_creator?: boolean;
  unlocked_by_user?: boolean;
}

export function useSocialPosts(filterType: 'all' | 'following' | 'own' | 'trending' = 'all') {
  const { user } = useAuth();
  const { blockedUsers } = useBlockedUsers();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchPosts = async (reset = false) => {
    if (!user) return;
    
    const currentOffset = reset ? 0 : offset;
    setLoading(true);

    try {
      let query = supabase
        .from('social_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(currentOffset, currentOffset + 9);

      if (filterType === 'following') {
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        const followingIds = following?.map(f => f.following_id) || [];
        if (followingIds.length > 0) {
          query = query.in('user_id', followingIds);
        } else {
          setPosts([]);
          setLoading(false);
          setHasMore(false);
          return;
        }
      } else if (filterType === 'own') {
        query = query.eq('user_id', user.id);
      } else if (filterType === 'trending') {
        // Trending: recent posts with high engagement
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('published_at', oneDayAgo);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Filter out blocked users
      const blockedUserIds = blockedUsers.map(b => b.blocked_user_id);
      const filteredData = (data || []).filter(post => !blockedUserIds.includes(post.user_id));

      // Enrich with user interactions and profiles
      const enrichedPosts = await Promise.all(
        filteredData.map(async (post) => {
          const [profile, likes, follows, unlocks] = await Promise.all([
            supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', post.user_id)
              .maybeSingle(),
            supabase
              .from('post_likes')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle(),
            supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('following_id', post.user_id)
              .maybeSingle(),
            supabase
              .from('post_unlocks')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle()
          ]);

          return {
            ...post,
            media_urls: (post.media_urls as string[]) || [],
            creator_name: profile.data?.display_name || 'Unknown User',
            creator_avatar: profile.data?.avatar_url || undefined,
            liked_by_user: !!likes.data,
            following_creator: !!follows.data,
            unlocked_by_user: !!unlocks.data
          } as SocialPost;
        })
      );

      // Sort trending by engagement score
      let finalPosts = enrichedPosts;
      if (filterType === 'trending') {
        finalPosts = enrichedPosts.sort((a, b) => {
          const scoreA = a.like_count * 3 + a.comment_count * 5 + a.view_count * 0.1;
          const scoreB = b.like_count * 3 + b.comment_count * 5 + b.view_count * 0.1;
          return scoreB - scoreA;
        });
      }

      if (reset) {
        setPosts(finalPosts);
        setOffset(10);
      } else {
        setPosts(prev => [...prev, ...finalPosts]);
        setOffset(prev => prev + 10);
      }

      setHasMore(finalPosts.length === 10);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);

    // Real-time subscription for all post changes (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('social_posts_realtime')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'social_posts'
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // New post added - refresh if it's published
          if ((payload.new as any)?.status === 'published') {
            fetchPosts(true);
          }
        } else if (payload.eventType === 'UPDATE') {
          // Post updated - could be status change from draft/scheduled to published
          if ((payload.new as any)?.status === 'published') {
            fetchPosts(true);
          }
        } else if (payload.eventType === 'DELETE') {
          // Post deleted - remove from local state immediately
          setPosts(prev => prev.filter(p => p.id !== (payload.old as any)?.id));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, filterType, blockedUsers]);

  // Optimistic update for likes
  const updatePostLike = (postId: string, isLiked: boolean) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              liked_by_user: isLiked, 
              like_count: isLiked ? post.like_count + 1 : Math.max(0, post.like_count - 1) 
            } 
          : post
      )
    );
  };

  // Optimistic update for comments
  const updatePostComment = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { ...post, comment_count: post.comment_count + 1 } 
          : post
      )
    );
  };

  return {
    posts,
    loading,
    hasMore,
    fetchMore: () => fetchPosts(false),
    refresh: () => fetchPosts(true),
    updatePostLike,
    updatePostComment
  };
}
