import { Heart, MessageCircle, Share2, Lock, MoreVertical, Bookmark, Flag, User, Ban, Trash2, Loader2, Eye, Flame, Sparkles, TrendingUp, Zap, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
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
import { GlowBadge } from './GlowBadge';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  const [editCaptionDialogOpen, setEditCaptionDialogOpen] = useState(false);
  const [editedCaption, setEditedCaption] = useState('');
  const [savingCaption, setSavingCaption] = useState(false);
  const [localCaption, setLocalCaption] = useState(post.caption);
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

  // Check if post is AI-generated
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

  const handleEditCaption = () => {
    setEditedCaption(localCaption || '');
    setEditCaptionDialogOpen(true);
  };

  const handleSaveCaption = async () => {
    setSavingCaption(true);
    try {
      const { error } = await supabase
        .from('social_posts')
        .update({ caption: editedCaption })
        .eq('id', post.id);
      
      if (error) throw error;
      setLocalCaption(editedCaption);
      toast.success('Caption updated');
      setEditCaptionDialogOpen(false);
    } catch (error) {
      toast.error('Failed to update caption');
    } finally {
      setSavingCaption(false);
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
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className="scroll-snap-align-start"
    >
      {/* Premium Glassmorphic Card Container */}
      <Card 
        className="overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-card/90 via-card/70 to-muted/50 border border-white/15 shadow-[0_8px_32px_hsl(var(--primary)/0.15)] hover:shadow-[0_20px_60px_hsl(var(--primary)/0.25)] hover:border-primary/40 transition-all duration-500 group relative rounded-2xl" 
        ref={viewTrackingRef}
      >
        {/* Animated Gradient Border Effect */}
        <motion.div 
          className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary-blue/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          animate={{ 
            background: [
              'linear-gradient(135deg, hsl(var(--primary)/0.2), transparent, hsl(var(--secondary)/0.2))',
              'linear-gradient(225deg, hsl(var(--secondary)/0.2), transparent, hsl(var(--primary)/0.2))',
              'linear-gradient(135deg, hsl(var(--primary)/0.2), transparent, hsl(var(--secondary)/0.2))'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Subtle shimmer overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000 pointer-events-none" />
        
        {/* Heart Burst Animation */}
        <AnimatePresence>
          {showHeartBurst && <HeartBurstAnimation />}
        </AnimatePresence>

        {/* Creator Header */}
        <div className="flex items-start justify-between p-4 relative z-10">
          <button 
            onClick={() => navigate(`/profile/${post.user_id}`)}
            className="flex items-start gap-3 hover:opacity-80 transition-opacity"
          >
            {/* Avatar with Neon Ring */}
            <div className="relative">
              <motion.div
                className="absolute -inset-1 rounded-full bg-gradient-to-tr from-primary via-secondary to-primary-blue opacity-60 blur-sm group-hover:opacity-100 transition-opacity"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              />
              <Avatar className="h-12 w-12 ring-2 ring-background relative">
                <AvatarImage src={post.creator_avatar} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground">
                  {post.creator_name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">{post.creator_name}</p>
                {isAIGenerated && (
                  <GlowBadge variant="ai">
                    <Sparkles className="h-3 w-3" />
                    AI
                  </GlowBadge>
                )}
              </div>
              <p className="text-xs text-muted-foreground/80">
                @{post.creator_name?.toLowerCase().replace(/\s+/g, '')} · {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
              </p>
            </div>
          </button>
          
          <div className="flex items-center gap-2">
            {/* Price Badge or FREE Badge */}
            {post.is_paid ? (
              <GlowBadge variant="premium">
                <Zap className="h-3 w-3" />
                ${(post.price_cents / 100).toFixed(2)}
              </GlowBadge>
            ) : (
              <GlowBadge variant="free">FREE</GlowBadge>
            )}

            {/* Follow Button */}
            {!post.following_creator && !isOwnPost && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleFollow}
                disabled={followLoading}
                className="border-primary/40 bg-primary/5 hover:bg-primary/20 hover:border-primary/60 h-8 backdrop-blur-sm"
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
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/5">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-xl bg-card/95 border-white/10">
                <DropdownMenuItem onClick={() => navigate(`/profile/${post.user_id}`)}>
                  <User className="h-4 w-4 mr-2" />
                  View Profile
                </DropdownMenuItem>
                {isOwnPost && (
                  <DropdownMenuItem onClick={handleEditCaption}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Caption
                  </DropdownMenuItem>
                )}
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

        {/* Caption */}
        {localCaption && (
          <div className="px-4 pb-3 relative z-10">
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{localCaption}</p>
          </div>
        )}

        {/* Engagement Badges */}
        {(post.view_count > 1000 || post.like_count > 100) && (
          <div className="px-4 pb-3 flex gap-2 flex-wrap relative z-10">
            {post.view_count > 5000 && post.like_count > 100 && (
              <GlowBadge variant="hot">
                <Flame className="h-3 w-3" />
                Hot
              </GlowBadge>
            )}
            {post.view_count > 1000 && (
              <GlowBadge variant="trending">
                <TrendingUp className="h-3 w-3" />
                Trending
              </GlowBadge>
            )}
          </div>
        )}

        {/* Media with double-tap and quick reactions */}
        {mediaUrl && (
          <div 
            className="relative aspect-[4/3] bg-muted/30 cursor-pointer select-none overflow-hidden"
            onClick={handleDoubleTap}
            onMouseEnter={() => setShowQuickReactions(true)}
            onMouseLeave={() => setShowQuickReactions(false)}
          >
            {post.content_type === 'video' ? (
              <video
                ref={videoRef}
                src={needsUnlock ? undefined : mediaUrl}
                className={`w-full h-full object-cover ${needsUnlock ? 'blur-xl scale-105' : ''}`}
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
                  className={`w-full h-full object-cover ${needsUnlock ? 'blur-xl scale-105' : ''} transition-transform duration-500 group-hover:scale-[1.02]`}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  Failed to load image
                </div>
              )
            )}
            
            {/* Premium Holographic Paywall Overlay */}
            {needsUnlock && (
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-black/70 via-black/60 to-primary/20 backdrop-blur-md">
                <motion.div 
                  className="text-center space-y-4 p-6 bg-gradient-to-br from-card/95 via-card/90 to-muted/80 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-[0_0_60px_hsl(270_100%_70%/0.3)] max-w-xs mx-4 relative overflow-hidden"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {/* Holographic shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
                  
                  <motion.div
                    className="relative"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Lock className="h-12 w-12 mx-auto text-primary drop-shadow-[0_0_15px_hsl(270_100%_70%/0.6)]" />
                  </motion.div>
                  <div className="relative">
                    <p className="text-lg font-semibold">Premium Content</p>
                    <p className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-primary-blue bg-clip-text text-transparent mt-1">
                      ${(post.price_cents / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">One-time purchase</p>
                  </div>
                  <Button 
                    onClick={() => onUnlock(post.id, post.price_cents)} 
                    size="lg"
                    className="w-full bg-gradient-to-r from-primary via-secondary to-primary hover:from-primary/90 hover:to-secondary/90 shadow-[0_0_30px_hsl(270_100%_70%/0.4)] relative overflow-hidden group/btn"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700" />
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock Now
                  </Button>
                  <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                    <span>or</span>
                  </div>
                  <SubscribeCreatorButton creatorId={post.user_id} variant="outline" className="w-full border-white/20 hover:bg-white/5" />
                </motion.div>
              </div>
            )}

            {/* Quick Reactions */}
            {showQuickReactions && !needsUnlock && (
              <QuickReactions onReact={handleQuickReaction} />
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className="p-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <motion.div whileTap={{ scale: 0.85 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`gap-1.5 transition-all duration-300 ${
                    post.liked_by_user 
                      ? 'text-red-500 bg-red-500/10 hover:bg-red-500/20' 
                      : 'hover:text-red-500 hover:bg-red-500/10'
                  }`}
                >
                  {likeLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 transition-all ${post.liked_by_user ? 'fill-red-500 scale-110' : ''}`} />
                  )}
                  <motion.span 
                    key={post.like_count}
                    initial={{ scale: 1.3, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-sm font-medium"
                  >
                    {post.like_count}
                  </motion.span>
                </Button>
              </motion.div>

              <motion.div whileTap={{ scale: 0.85 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComment(post.id)}
                  className="gap-1.5 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span className="text-sm font-medium">{post.comment_count}</span>
                </Button>
              </motion.div>
              
              <ShareButton postId={post.id} />
            </div>

            <div className="flex items-center gap-2">
              {/* View Count with Glow */}
              <span className="text-xs text-muted-foreground flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5">
                <Eye className="h-4 w-4" />
                {post.view_count > 1000 ? `${(post.view_count / 1000).toFixed(1)}K` : post.view_count}
              </span>

              <motion.div whileTap={{ scale: 0.85 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                  className={`transition-all duration-300 ${
                    saved 
                      ? 'text-primary bg-primary/10 hover:bg-primary/20' 
                      : 'hover:text-primary hover:bg-primary/10'
                  }`}
                >
                  <Bookmark className={`h-5 w-5 transition-all ${saved ? 'fill-primary scale-110' : ''}`} />
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
      <AlertDialogContent className="backdrop-blur-xl bg-card/95 border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle>Block this user?</AlertDialogTitle>
          <AlertDialogDescription>
            You won't see their posts anymore. They won't be notified.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBlockUser} className="bg-destructive hover:bg-destructive/90">
            Block
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <AlertDialogContent className="backdrop-blur-xl bg-card/95 border-white/10">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. Your post will be permanently deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-white/10">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletePost} className="bg-destructive hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    {/* Edit Caption Dialog */}
    <Dialog open={editCaptionDialogOpen} onOpenChange={setEditCaptionDialogOpen}>
      <DialogContent className="backdrop-blur-xl bg-card/95 border-white/10">
        <DialogHeader>
          <DialogTitle>Edit Caption</DialogTitle>
        </DialogHeader>
        <Textarea
          value={editedCaption}
          onChange={(e) => setEditedCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={4}
          className="resize-none"
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditCaptionDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveCaption} disabled={savingCaption}>
            {savingCaption ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
