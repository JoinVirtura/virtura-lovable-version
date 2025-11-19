import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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

export function useSocialPosts(filterType: 'all' | 'following' | 'own' = 'all') {
  const { user } = useAuth();
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
          return;
        }
      } else if (filterType === 'own') {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Enrich with user interactions and profiles
      const enrichedPosts = await Promise.all(
        (data || []).map(async (post) => {
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

      if (reset) {
        setPosts(enrichedPosts);
        setOffset(10);
      } else {
        setPosts(prev => [...prev, ...enrichedPosts]);
        setOffset(prev => prev + 10);
      }

      setHasMore(enrichedPosts.length === 10);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);

    // Real-time subscription for new posts
    const channel = supabase
      .channel('social_posts_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'social_posts',
        filter: 'status=eq.published'
      }, () => {
        fetchPosts(true);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, filterType]);

  return {
    posts,
    loading,
    hasMore,
    fetchMore: () => fetchPosts(false),
    refresh: () => fetchPosts(true)
  };
}
