import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface SavedPost {
  id: string;
  post_id: string;
  folder: string;
  saved_at: string;
}

export function useSavedPosts(folder: string = 'default') {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
    }
  }, [user, folder]);

  const fetchSavedPosts = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select('*')
        .eq('user_id', user.id)
        .eq('folder', folder)
        .order('saved_at', { ascending: false });

      if (error) throw error;
      setSavedPosts(data || []);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePost = async (postId: string, folderName: string = 'default') => {
    if (!user) {
      toast.error('Please sign in to save posts');
      return false;
    }

    try {
      const { error } = await supabase
        .from('saved_posts')
        .insert({
          user_id: user.id,
          post_id: postId,
          folder: folderName,
        });

      if (error) throw error;
      
      toast.success('Post saved');
      fetchSavedPosts();
      return true;
    } catch (error: any) {
      if (error.code === '23505') {
        toast.info('Post already saved');
      } else {
        console.error('Error saving post:', error);
        toast.error('Failed to save post');
      }
      return false;
    }
  };

  const unsavePost = async (postId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('saved_posts')
        .delete()
        .eq('user_id', user.id)
        .eq('post_id', postId);

      if (error) throw error;
      
      toast.success('Post removed from saved');
      fetchSavedPosts();
      return true;
    } catch (error) {
      console.error('Error unsaving post:', error);
      toast.error('Failed to remove saved post');
      return false;
    }
  };

  const isPostSaved = (postId: string): boolean => {
    return savedPosts.some(sp => sp.post_id === postId);
  };

  return {
    savedPosts,
    loading,
    savePost,
    unsavePost,
    isPostSaved,
    refetch: fetchSavedPosts,
  };
}
