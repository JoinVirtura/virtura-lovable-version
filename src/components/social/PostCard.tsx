import { Heart, MessageCircle, Share2, Lock, MoreVertical, Bookmark, Flag, User, Ban, Trash2, Loader2, Users, TrendingUp, Eye, Flame, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { SubscribeCreatorButton } from './SubscribeCreatorButton';
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

  // Check if post is AI-generated (based on metadata or caption keywords)
  const isAIGenerated = post.caption?.toLowerCase().includes('#ai') || 
                        post.caption?.toLowerCase().includes('ai-generated') ||
                        post.caption?.toLowerCase().includes('ai created');

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
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="scroll-snap-align-start"
    >
      <Card className="overflow-hidden bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group" ref={viewTrackingRef}>
        {/* Heart Burst Animation */}
        <AnimatePresence>
          {showHeartBurst && <HeartBurstAnimation />}
        </AnimatePresence>

        {/* Creator Header - Twitter Style */}
        <div className="flex items-start justify-between p-4">
          <button 
            onClick={() => navigate(`/profile/${post.user_id}`)}
            className="flex items-start gap-3 hover:opacity-80 transition-opacity"
          >
            <Avatar className="h-12 w-12 ring-2 ring-border">
              <AvatarImage src={post.creator_avatar} />
              <AvatarFallback>{post.creator_name?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm">{post.creator_name}</p>
                {isAIGenerated && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 bg-gradient-to-r from-violet-500/10 to-purple-500/10 border-violet-500/30">
                    <Sparkles className="h-3 w-3 mr-1 text-violet-400" />
                    AI
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                @{post.creator_name?.toLowerCase().replace(/\s+/g, '')} · {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
              </p>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            {/* Price Badge or FREE Badge */}
            {post.is_paid ? (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                ${(post.price_cents / 100).toFixed(2)}
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">FREE</Badge>
            )}

            {/* Follow Button */}
            {!post.following_creator && !isOwnPost && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleFollow}
                disabled={followLoading}
                className="border-primary/50 hover:bg-primary/10 h-8"
              >
                {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Follow'}
              </Button>
            )}

            {/* Subscribe Button for Creators */}
            {!isOwnPost && (
              <SubscribeCreatorButton creatorId={post.user_id} size="sm" />
            )}

            {/* Delete Button for Own Posts */}
            {isOwnPost && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeleteDialogOpen(true)}
                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
        </div>

        {/* Caption - Before Media (Twitter Style) */}
        {post.caption && (
          <div className="px-4 pb-3">
            <p className="text-sm whitespace-pre-wrap">{post.caption}</p>
          </div>
        )}

        {/* Engagement Badges */}
        {(post.view_count > 1000 || post.like_count > 100) && (
          <div className="px-4 pb-2 flex gap-2 flex-wrap">
            {post.view_count > 5000 && post.like_count > 100 && (
              <Badge variant="outline" className="text-xs bg-orange-500/10 border-orange-500/30 text-orange-500">
                <Flame className="h-3 w-3 mr-1" />
                Hot
              </Badge>
            )}
            {post.view_count > 1000 && (
              <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                Trending
              </Badge>
            )}
          </div>
        )}

        {/* Media with double-tap and quick reactions */}
        {mediaUrl && (
          <div 
            className="relative aspect-[4/3] bg-muted cursor-pointer select-none"
            onClick={handleDoubleTap}
            onMouseEnter={() => setShowQuickReactions(true)}
            onMouseLeave={() => setShowQuickReactions(false)}
          >
            {post.content_type === 'video' ? (
              <video
                ref={videoRef}
                src={needsUnlock ? undefined : mediaUrl}
                className={`w-full h-full object-cover ${needsUnlock ? 'blur-xl' : ''}`}
                controls={!needsUnlock}
                playsInline
                loop
                muted
              />
            ) : (
              !imageError ? (
                <ProgressiveImage
                  src={mediaUrl}
                  alt="Post content"
                  className={`w-full h-full object-cover ${needsUnlock ? 'blur-xl' : ''}`}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Failed to load image
                </div>
              )
            )}
            
            {/* Paywall Overlay - Improved */}
            {needsUnlock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <motion.div 
                  className="text-center space-y-4 p-6 bg-card/95 backdrop-blur-xl rounded-2xl border border-border shadow-2xl max-w-xs mx-4"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Lock className="h-10 w-10 mx-auto text-primary" />
                  <div>
                    <p className="text-lg font-semibold">Premium Content</p>
                    <p className="text-2xl font-bold text-primary mt-1">
                      ${(post.price_cents / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">One-time purchase</p>
                  </div>
                  <Button 
                    onClick={() => onUnlock(post.id, post.price_cents)} 
                    size="lg"
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock Now
                  </Button>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span>or</span>
                  </div>
                  <SubscribeCreatorButton creatorId={post.user_id} variant="outline" className="w-full" />
                </motion.div>
              </div>
            )}

            {/* Quick Reactions */}
            {showQuickReactions && !needsUnlock && (
              <QuickReactions onReact={handleQuickReaction} />
            )}
          </div>
        )}

        {/* Actions - Twitter/TikTok Style */}
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeLoading}
                  className="gap-1.5 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  {likeLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-red-500 text-red-500' : ''}`} />
                  )}
                  <span className="text-sm">{post.like_count}</span>
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComment(post.id)}
                  className="gap-1.5 hover:text-primary hover:bg-primary/10"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm">{post.comment_count}</span>
                </Button>
              </motion.div>
              
              <ShareButton postId={post.id} />
            </div>

            <div className="flex items-center gap-1">
              {/* View Count */}
              <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
                <Eye className="h-4 w-4" />
                {post.view_count > 1000 ? `${(post.view_count / 1000).toFixed(1)}K` : post.view_count}
              </span>

              <motion.div whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                  className="hover:text-primary hover:bg-primary/10"
                >
                  <Bookmark className={`h-5 w-5 ${saved ? 'fill-primary text-primary' : ''}`} />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>

    {/* Modals and Dialogs */}
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
            You won't see their posts anymore. They won't be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlockUser} className="bg-destructive hover:bg-destructive/90">
            Block
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
          <AlertDialogAction onClick={handleDeletePost} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}