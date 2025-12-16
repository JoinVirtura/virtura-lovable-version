import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MessageCircle, Share2, Bookmark, ChevronLeft, ChevronRight, Play, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
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
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
  user_avatar?: string;
}

interface Post {
  id: string;
  user_id: string;
  media_urls?: string[] | null;
  caption?: string | null;
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  content_type?: string;
  published_at?: string;
  creator_name?: string;
  creator_avatar?: string;
}

interface PostLightboxModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export function PostLightboxModal({ post, isOpen, onClose, onDelete }: PostLightboxModalProps) {
  const { user } = useAuth();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.like_count || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [creatorProfile, setCreatorProfile] = useState<{ display_name?: string; avatar_url?: string } | null>(null);

  const isOwnPost = user?.id === post.user_id;
  const mediaUrls = post.media_urls || [];
  const isVideo = (url: string) => /\.(mp4|webm|mov)$/i.test(url);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      checkUserInteractions();
      fetchCreatorProfile();
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, post.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentMediaIndex > 0) setCurrentMediaIndex(prev => prev - 1);
      if (e.key === "ArrowRight" && currentMediaIndex < mediaUrls.length - 1) setCurrentMediaIndex(prev => prev + 1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentMediaIndex, mediaUrls.length]);

  const fetchCreatorProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", post.user_id)
      .single();
    if (data) setCreatorProfile(data);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from("post_comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    
    if (data) {
      const enriched = await Promise.all(data.map(async (c) => {
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, avatar_url")
          .eq("id", c.user_id)
          .single();
        return {
          ...c,
          user_name: profile?.display_name || "User",
          user_avatar: profile?.avatar_url
        };
      }));
      setComments(enriched);
    }
  };

  const checkUserInteractions = async () => {
    if (!user) return;
    const { data: like } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", post.id)
      .eq("user_id", user.id)
      .maybeSingle();
    setIsLiked(!!like);
  };

  const handleLike = async () => {
    if (!user) return;
    const newLiked = !isLiked;
    setIsLiked(newLiked);
    setLikeCount(prev => newLiked ? prev + 1 : Math.max(0, prev - 1));

    if (newLiked) {
      await supabase.from("post_likes").insert({ post_id: post.id, user_id: user.id });
    } else {
      await supabase.from("post_likes").delete().eq("post_id", post.id).eq("user_id", user.id);
    }
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("post_comments").insert({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim()
    });
    if (!error) {
      setNewComment("");
      fetchComments();
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from("social_posts").delete().eq("id", post.id);
    if (!error) {
      toast.success("Post deleted");
      onDelete?.();
      onClose();
    } else {
      toast.error("Failed to delete post");
    }
    setShowDeleteDialog(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const { error } = await supabase.from("post_comments").delete().eq("id", commentId);
    if (!error) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("Comment deleted");
    } else {
      toast.error("Failed to delete comment");
    }
  };

  const displayName = creatorProfile?.display_name || post.creator_name || "User";
  const avatarUrl = creatorProfile?.avatar_url || post.creator_avatar;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-violet-950/50 to-slate-900 rounded-2xl overflow-hidden border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-10 text-white hover:bg-white/10"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="flex flex-col md:flex-row h-full max-h-[90vh]">
            {/* Media Section */}
            <div className="relative flex-1 min-h-[300px] md:min-h-0 bg-black flex items-center justify-center">
              {mediaUrls.length > 0 ? (
                <>
                  {isVideo(mediaUrls[currentMediaIndex]) ? (
                    <video
                      src={mediaUrls[currentMediaIndex]}
                      className="max-w-full max-h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    <img
                      src={mediaUrls[currentMediaIndex]}
                      alt=""
                      className="max-w-full max-h-full object-contain"
                    />
                  )}

                  {/* Navigation arrows */}
                  {mediaUrls.length > 1 && (
                    <>
                      {currentMediaIndex > 0 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => setCurrentMediaIndex(prev => prev - 1)}
                        >
                          <ChevronLeft className="w-6 h-6" />
                        </Button>
                      )}
                      {currentMediaIndex < mediaUrls.length - 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                          onClick={() => setCurrentMediaIndex(prev => prev + 1)}
                        >
                          <ChevronRight className="w-6 h-6" />
                        </Button>
                      )}
                      {/* Dots indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {mediaUrls.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentMediaIndex(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentMediaIndex ? "bg-white w-4" : "bg-white/50"}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-violet-600/30 to-pink-600/30" />
              )}
            </div>

            {/* Info Section */}
            <div className="w-full md:w-[350px] flex flex-col border-l border-white/10">
              {/* Header */}
              <div className="p-4 border-b border-white/10 flex items-center gap-3">
                <Avatar className="w-10 h-10 ring-2 ring-violet-500/30">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback className="bg-violet-500/20 text-violet-300">
                    {displayName[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    {post.published_at && formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
                  </p>
                </div>
                {isOwnPost && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="p-4 border-b border-white/10">
                  <p className="text-sm text-gray-200">{post.caption}</p>
                </div>
              )}

              {/* Comments */}
              <ScrollArea className="flex-1 p-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No comments yet</p>
                ) : (
                  <div className="space-y-4">
                    {comments.map((comment) => {
                      const canDeleteComment = user?.id === comment.user_id || isOwnPost;
                      return (
                        <div key={comment.id} className="flex gap-3 group">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={comment.user_avatar} />
                            <AvatarFallback className="bg-violet-500/20 text-violet-300 text-xs">
                              {comment.user_name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-medium text-white">{comment.user_name}</span>{" "}
                              <span className="text-gray-300">{comment.content}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </p>
                          </div>
                          {canDeleteComment && (
                            <button
                              onClick={() => handleDeleteComment(comment.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                              title="Delete comment"
                            >
                              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-300" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Engagement bar */}
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-4 mb-3">
                  <button onClick={handleLike} className="flex items-center gap-1.5 group">
                    <Heart className={`w-6 h-6 transition-all ${isLiked ? "fill-red-500 text-red-500" : "text-white group-hover:text-red-400"}`} />
                  </button>
                  <button className="flex items-center gap-1.5 group">
                    <MessageCircle className="w-6 h-6 text-white group-hover:text-violet-400 transition-colors" />
                  </button>
                  <button className="flex items-center gap-1.5 group">
                    <Share2 className="w-6 h-6 text-white group-hover:text-violet-400 transition-colors" />
                  </button>
                  <button onClick={() => setIsSaved(!isSaved)} className="ml-auto group">
                    <Bookmark className={`w-6 h-6 transition-all ${isSaved ? "fill-white text-white" : "text-white group-hover:text-violet-400"}`} />
                  </button>
                </div>
                <p className="text-sm font-medium text-white mb-3">{likeCount.toLocaleString()} likes</p>

                {/* Comment input */}
                {user && (
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[40px] max-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-gray-500 resize-none"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleComment())}
                    />
                    <Button
                      onClick={handleComment}
                      disabled={!newComment.trim() || loading}
                      className="bg-violet-500 hover:bg-violet-600"
                    >
                      Post
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delete confirmation */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-slate-900 border-white/10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Delete Post?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your post.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>
    </AnimatePresence>
  );
}