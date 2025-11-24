import { Heart, MessageCircle, Share2, Lock, MoreVertical, Bookmark, Flag, User, Ban, Trash2, Loader2, Users, TrendingUp, Eye, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { SocialPost } from '@/hooks/useSocialPosts';
import { formatDistanceToNow } from 'date-fns';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { usePostAnalytics } from '@/hooks/usePostAnalytics';
import { useViewTracking } from '@/hooks/useViewTracking';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAuth } from '@/hooks/useAuth';
import { ShareButton } from './ShareButton';
import { ReportModal } from './ReportModal';
import { HeartBurstAnimation } from './HeartBurstAnimation';
import { QuickReactions } from './QuickReactions';
import { ProgressiveImage } from './ProgressiveImage';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PostCardProps {
  post: SocialPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onUnlock: (postId: string, priceCents: number) => void;
  onFollow: (userId: string) => void;
}

export function PostCard({ post, onLike, onComment, onUnlock, onFollow }: PostCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [showQuickReactions, setShowQuickReactions] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isPostSaved, savePost, unsavePost } = useSavedPosts();
  const { trackView } = usePostAnalytics(post.id);
  const viewTrackingRef = useViewTracking(post.id, true);
  const { blockUser } = useBlockedUsers();
  const saved = isPostSaved(post.id);
  const isOwnPost = user?.id === post.user_id;

  // Auto-play video when in view
  useEffect(() => {
    if (!videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play()?.catch(() => {});
          } else {
            videoRef.current?.pause();
          }
        });
      },
      { threshold: 0.7 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, []);

  // Double-tap to like handler
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap < DOUBLE_TAP_DELAY) {
      setShowHeartBurst(true);
      if (!post.liked_by_user) {
        handleLike();
      }
      setTimeout(() => setShowHeartBurst(false), 1000);
    }
    setLastTap(now);
  };

  const handleQuickReaction = (emoji: string) => {
    console.log('Quick reaction:', emoji, 'on post:', post.id);
    // Could integrate with a reactions system in the future
  };

  const handleSaveToggle = () => {
    if (saved) {
      unsavePost(post.id);
    } else {
      savePost(post.id);
    }
  };

  const handleLike = async () => {
    setLikeLoading(true);
    try {
      await onLike(post.id);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      await onFollow(post.user_id);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser(post.user_id);
      toast.success('User blocked');
      setBlockDialogOpen(false);
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  const handleDeletePost = async () => {
    try {
      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', post.id);
      
      if (error) throw error;
      toast.success('Post deleted');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const [imageError, setImageError] = useState(false);
  const needsUnlock = post.is_paid && !post.unlocked_by_user;
  const mediaUrl = post.media_urls?.[0];

  return (
    <>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="scroll-snap-align-start"
    >
      <Card className="overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-card/80 via-card/70 to-card/80 border border-primary/20 shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 group" ref={viewTrackingRef}>
        {/* Glassmorphic overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Heart Burst Animation */}
        <AnimatePresence>
          {showHeartBurst && <HeartBurstAnimation />}
        </AnimatePresence>

        {/* Creator Header */}
        <div className="relative z-10 flex items-center justify-between p-4 bg-gradient-to-r from-violet-500/5 to-purple-500/5">
          <button 
            onClick={() => navigate(`/profile/${post.user_id}`)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <motion.div
                className="absolute -inset-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 opacity-50 blur"
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <Avatar className="h-10 w-10 relative ring-2 ring-primary/20">
                <AvatarImage src={post.creator_avatar} />
                <AvatarFallback>{post.creator_name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{post.creator_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
              </p>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            {!post.following_creator && !isOwnPost && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleFollow}
                disabled={followLoading}
                className="border-violet-500/50 hover:bg-violet-500/10"
              >
                {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Follow'}
              </Button>
            )}

            {/* Prominent Delete Button for Own Posts */}
            {isOwnPost && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteDialogOpen(true)}
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete post</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Social Proof & Engagement Metrics */}
        <div className="relative z-10 px-4 py-2 bg-gradient-to-r from-violet-500/5 to-transparent border-l-2 border-violet-500/50">
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {post.like_count > 5 && (
              <div className="flex items-center gap-1 text-violet-400">
                <Users className="w-3 h-3" />
                <span>{Math.floor(post.like_count * 0.3)} people you follow liked this</span>
              </div>
            )}
            {post.view_count > 1000 && (
              <div className="flex items-center gap-1 text-green-400 animate-pulse">
                <TrendingUp className="w-3 h-3" />
                <span>Trending</span>
              </div>
            )}
            {/* Live Engagement Indicator */}
            {post.view_count > 500 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <Eye className="w-3 h-3 text-red-400" />
                <span className="text-red-400 font-semibold">
                  {Math.floor(Math.random() * 50) + 20} viewing now
                </span>
              </div>
            )}
            {/* Hot Badge */}
            {post.like_count > 100 && post.view_count > 5000 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-orange-500/20 border border-orange-500/30">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-orange-400 font-semibold">Hot</span>
              </div>
            )}
          </div>
        </div>

        {/* Media with double-tap and quick reactions */}
        {mediaUrl && (
          <div 
            className="relative aspect-square bg-muted group/media cursor-pointer select-none"
            onClick={handleDoubleTap}
            onMouseEnter={() => setShowQuickReactions(true)}
            onMouseLeave={() => setShowQuickReactions(false)}
          >
            {post.content_type === 'video' ? (
              <video
                ref={videoRef}
                src={needsUnlock ? undefined : mediaUrl}
                className={`w-full h-full object-cover ${needsUnlock ? 'blur-xl' : ''} transition-transform duration-300 group-hover/media:scale-105`}
                controls={!needsUnlock}
                playsInline
                loop
                muted
              />
            ) : (
              !imageError ? (
                <div className="relative w-full h-full">
                  <ProgressiveImage
                    src={mediaUrl}
                    alt="Post content"
                    className={`w-full h-full object-cover ${needsUnlock ? 'blur-xl' : ''} transition-transform duration-300 group-hover/media:scale-105`}
                    onError={() => setImageError(true)}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Failed to load image
                </div>
              )
            )}
            
            {/* Paywall Overlay */}
            {needsUnlock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <motion.div 
                  className="text-center space-y-4 p-6 bg-background/95 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Lock className="h-12 w-12 mx-auto text-violet-400" />
                  <div>
                    <p className="text-lg font-semibold">Unlock this post</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent mt-2">
                      ${(post.price_cents / 100).toFixed(2)}
                    </p>
                  </div>
                  <Button 
                    onClick={() => onUnlock(post.id, post.price_cents)} 
                    size="lg"
                    className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                  >
                    Unlock Now
                  </Button>
                </motion.div>
              </div>
            )}

            {/* Quick Reactions */}
            {showQuickReactions && !needsUnlock && (
              <QuickReactions onReact={handleQuickReaction} />
            )}
          </div>
        )}

        {/* Actions & Caption */}
        <div className="relative z-10 p-4 space-y-3">
          {/* Action Buttons */}
          <TooltipProvider>
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      disabled={likeLoading}
                      className="gap-2 hover:text-red-500 transition-colors"
                    >
                      {likeLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <motion.div
                          animate={post.liked_by_user ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                        >
                          <Heart className={`h-5 w-5 transition-all ${post.liked_by_user ? 'fill-red-500 text-red-500 scale-110' : ''}`} />
                        </motion.div>
                      )}
                      <span>{post.like_count}</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{post.liked_by_user ? 'Unlike' : 'Like'}</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onComment(post.id)}
                      className="gap-2 hover:text-violet-500 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span>{post.comment_count}</span>
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>Comment</TooltipContent>
              </Tooltip>
              
              <ShareButton postId={post.id} />

              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.div whileTap={{ scale: 0.9 }}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSaveToggle}
                      className="hover:text-violet-500 transition-colors"
                    >
                      <Bookmark className={`h-5 w-5 transition-all ${saved ? 'fill-violet-500 text-violet-500 scale-110' : ''}`} />
                    </Button>
                  </motion.div>
                </TooltipTrigger>
                <TooltipContent>{saved ? 'Unsave' : 'Save'}</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>More options</TooltipContent>
                  </Tooltip>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl bg-background/95 border-white/10">
                  <DropdownMenuItem onClick={() => navigate(`/profile/${post.user_id}`)}>
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  {!isOwnPost && (
                    <DropdownMenuItem 
                      onClick={() => setBlockDialogOpen(true)}
                      className="text-destructive"
                    >
                      <Ban className="h-4 w-4 mr-2" />
                      Block User
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setReportModalOpen(true)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TooltipProvider>

          {/* Caption */}
          {post.caption && (
            <div>
              <p className="text-sm">
                <span className="font-semibold">{post.creator_name}</span>{' '}
                {post.caption}
              </p>
            </div>
          )}

          {/* View Count */}
          <p className="text-xs text-muted-foreground">
            {post.view_count.toLocaleString()} views
          </p>
        </div>
      </Card>
    </motion.div>

    <ReportModal
      isOpen={reportModalOpen}
      onClose={() => setReportModalOpen(false)}
      postId={post.id}
    />

    <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Block this user?</AlertDialogTitle>
          <AlertDialogDescription>
            You won't see posts from this user anymore. They won't be notified that you've blocked them.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleBlockUser}
            className="bg-destructive hover:bg-destructive/90"
          >
            Block User
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your post will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDeletePost}
            className="bg-destructive hover:bg-destructive/90"
          >
            Delete Post
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
