import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface PostAnalytics {
  post_id: string;
  view_count: number;
  unique_viewers: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  unlock_count: number;
}

export function usePostAnalytics(postId: string) {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<PostAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (postId) {
      fetchAnalytics();
    }
  }, [postId]);

  const fetchAnalytics = async () => {
    try {
      // Fetch post with counts
      const { data: post, error: postError } = await supabase
        .from('social_posts')
        .select('id, like_count, comment_count, view_count')
        .eq('id', postId)
        .single();

      if (postError) throw postError;

      // Fetch unique viewers
      const { count: uniqueViewers, error: viewError } = await supabase
        .from('post_views')
        .select('viewer_id', { count: 'exact', head: true })
        .eq('post_id', postId)
        .not('viewer_id', 'is', null);

      if (viewError) throw viewError;

      // Fetch unlock count
      const { count: unlockCount, error: unlockError } = await supabase
        .from('post_unlocks')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      if (unlockError) throw unlockError;

      setAnalytics({
        post_id: post.id,
        view_count: post.view_count || 0,
        unique_viewers: uniqueViewers || 0,
        like_count: post.like_count || 0,
        comment_count: post.comment_count || 0,
        share_count: 0, // To be implemented
        unlock_count: unlockCount || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    if (!postId) return;

    try {
      const sessionId = sessionStorage.getItem('session_id') || crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);

      await supabase.from('post_views').insert({
        post_id: postId,
        viewer_id: user?.id || null,
        session_id: sessionId,
      });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  return {
    analytics,
    loading,
    trackView,
    refetch: fetchAnalytics,
  };
}
