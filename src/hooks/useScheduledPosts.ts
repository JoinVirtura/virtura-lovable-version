import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface ScheduledPost {
  id: string;
  user_id: string;
  content_type: string;
  caption: string;
  media_urls: any;
  is_paid: boolean;
  price_cents: number;
  scheduled_for: string;
  platforms: string[];
  status: string;
  post_id: string | null;
  published_to: any;
  error_message: string | null;
  hashtags: string[];
  created_at: string;
  updated_at: string;
}

export function useScheduledPosts() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScheduledPosts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_for', { ascending: true });

      if (error) throw error;
      setPosts(data || []);
    } catch (error: any) {
      console.error('Error fetching scheduled posts:', error);
      toast({
        title: 'Error loading scheduled posts',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteScheduledPost = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Scheduled post deleted' });
      fetchScheduledPosts();
    } catch (error: any) {
      console.error('Error deleting scheduled post:', error);
      toast({
        title: 'Delete failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const publishNow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_posts')
        .update({ status: 'publishing', scheduled_for: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      toast({ title: 'Publishing post now...' });
      fetchScheduledPosts();
    } catch (error: any) {
      console.error('Error publishing post:', error);
      toast({
        title: 'Publish failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchScheduledPosts();

    // Real-time subscription
    const channel = supabase
      .channel('scheduled_posts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'scheduled_posts',
          filter: `user_id=eq.${user?.id}`,
        },
        () => {
          fetchScheduledPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    posts,
    loading,
    refetch: fetchScheduledPosts,
    deleteScheduledPost,
    publishNow,
  };
}
