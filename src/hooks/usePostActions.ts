import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function usePostActions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const toggleLike = async (postId: string) => {
    if (!user) {
      toast({ title: 'Please sign in to like posts', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('toggle-post-like', {
        body: { post_id: postId }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error toggling like:', error);
      toast({ title: 'Failed to like post', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const followUser = async (userId: string) => {
    if (!user) {
      toast({ title: 'Please sign in to follow users', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('follow-user', {
        body: { following_id: userId }
      });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error following user:', error);
      toast({ title: 'Failed to follow user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const unlockPost = async (postId: string) => {
    if (!user) {
      toast({ title: 'Please sign in to unlock posts', variant: 'destructive' });
      return null;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('unlock-post', {
        body: { post_id: postId }
      });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error unlocking post:', error);
      toast({ 
        title: 'Failed to unlock post', 
        description: error.message,
        variant: 'destructive' 
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createComment = async (postId: string, content: string, parentCommentId?: string) => {
    if (!user) {
      toast({ title: 'Please sign in to comment', variant: 'destructive' });
      return false;
    }

    if (!content.trim()) {
      toast({ title: 'Comment cannot be empty', variant: 'destructive' });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('create-comment', {
        body: { post_id: postId, content, parent_comment_id: parentCommentId }
      });

      if (error) throw error;
      toast({ title: 'Comment added successfully' });
      return true;
    } catch (error: any) {
      console.error('Error creating comment:', error);
      toast({ title: 'Failed to add comment', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user) {
      toast({ title: 'Please sign in', variant: 'destructive' });
      return false;
    }

    if (!content.trim()) {
      toast({ title: 'Comment cannot be empty', variant: 'destructive' });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .update({ content })
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;
      toast({ title: 'Comment updated' });
      return true;
    } catch (error: any) {
      console.error('Error updating comment:', error);
      toast({ title: 'Failed to update comment', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (commentId: string, postId: string) => {
    if (!user) {
      toast({ title: 'Please sign in', variant: 'destructive' });
      return false;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update post comment count directly
      const { data: post } = await supabase
        .from('social_posts')
        .select('comment_count')
        .eq('id', postId)
        .single();
      
      if (post) {
        await supabase
          .from('social_posts')
          .update({ comment_count: Math.max(0, (post.comment_count || 1) - 1) })
          .eq('id', postId);
      }

      toast({ title: 'Comment deleted' });
      return true;
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      toast({ title: 'Failed to delete comment', variant: 'destructive' });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    toggleLike,
    followUser,
    unlockPost,
    createComment,
    updateComment,
    deleteComment,
    loading
  };
}
