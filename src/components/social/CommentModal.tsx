import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { usePostActions } from '@/hooks/usePostActions';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
}

interface CommentModalProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded?: () => void;
}

export function CommentModal({ postId, isOpen, onClose, onCommentAdded }: CommentModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const { createComment, updateComment, deleteComment } = usePostActions();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!postId || !isOpen) return;

    const fetchComments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('post_comments')
          .select('*')
          .eq('post_id', postId)
          .is('parent_comment_id', null)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Fetch profiles for commenters
        const enrichedComments = await Promise.all(
          (data || []).map(async (comment) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('display_name, avatar_url')
              .eq('id', comment.user_id)
              .maybeSingle();

            return {
              ...comment,
              display_name: profile?.display_name || 'Unknown User',
              avatar_url: profile?.avatar_url
            };
          })
        );

        setComments(enrichedComments);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();

    // Real-time subscription
    const channel = supabase
      .channel(`comments_${postId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'post_comments',
        filter: `post_id=eq.${postId}`
      }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, isOpen]);

  const handleSubmit = async () => {
    if (!postId || !newComment.trim()) return;

    const success = await createComment(postId, newComment);
    if (success) {
      setNewComment('');
      onCommentAdded?.();
    }
  };

  const handleStartEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    const success = await updateComment(commentId, editContent);
    if (success) {
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, content: editContent } : c
      ));
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId || !postId) return;
    
    const success = await deleteComment(deleteConfirmId, postId);
    if (success) {
      setComments(prev => prev.filter(c => c.id !== deleteConfirmId));
    }
    setDeleteConfirmId(null);
  };

  const handleProfileClick = (userId: string) => {
    navigate(`/profile/${userId}`);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No comments yet. Be the first!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group">
                  {editingId === comment.id ? (
                    // Edit mode
                    <div className="flex-1 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="resize-none"
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleCancelEdit}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveEdit(comment.id)}
                          disabled={!editContent.trim()}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <>
                      <button
                        onClick={() => handleProfileClick(comment.user_id)}
                        className="flex-shrink-0"
                      >
                        <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity">
                          <AvatarImage src={comment.avatar_url} />
                          <AvatarFallback>{comment.display_name?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleProfileClick(comment.user_id)}
                            className="font-semibold text-sm hover:underline"
                          >
                            {comment.display_name}
                          </button>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm mt-1 break-words">{comment.content}</p>
                      </div>
                      
                      {/* Edit/Delete buttons for own comments */}
                      {user?.id === comment.user_id && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => handleStartEdit(comment)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteConfirmId(comment.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <div className="space-y-2 pt-4 border-t">
            <Textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim()}
              className="w-full"
            >
              Post Comment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this comment? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
