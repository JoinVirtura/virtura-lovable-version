import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useFollowUser(userId: string) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    if (!user || !userId) return;

    const checkFollowStatus = async () => {
      const { data } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', userId)
        .maybeSingle();

      setIsFollowing(!!data);
    };

    const fetchFollowerCount = async () => {
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);

      setFollowerCount(count || 0);
    };

    checkFollowStatus();
    fetchFollowerCount();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`follows:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'follows',
          filter: `following_id=eq.${userId}`
        },
        () => {
          fetchFollowerCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userId]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error('Please sign in to follow users');
      return;
    }

    setLoading(true);
    try {
      console.log('[Follow] Attempting to toggle follow for user:', userId);
      console.log('[Follow] Current user:', user.id);
      
      const { data, error } = await supabase.functions.invoke('follow-user', {
        body: { following_id: userId }
      });

      console.log('[Follow] Response:', { data, error });

      if (error) throw error;

      setIsFollowing(data.following);
      setFollowerCount(prev => data.following ? prev + 1 : prev - 1);
      
      toast.success(data.following ? 'Following user!' : 'Unfollowed user');
    } catch (error) {
      console.error('[Follow] Error:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return {
    isFollowing,
    loading,
    followerCount,
    toggleFollow
  };
}
