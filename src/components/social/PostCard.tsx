import { Heart, MessageCircle, Share2, Lock, MoreVertical, Bookmark, Flag, User, Ban, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { SocialPost } from '@/hooks/useSocialPosts';
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSavedPosts } from '@/hooks/useSavedPosts';
import { usePostAnalytics } from '@/hooks/usePostAnalytics';
import { useViewTracking } from '@/hooks/useViewTracking';
import { useBlockedUsers } from '@/hooks/useBlockedUsers';
import { useAuth } from '@/hooks/useAuth';
import { ShareButton } from './ShareButton';
import { ReportModal } from './ReportModal';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
  const { isPostSaved, savePost, unsavePost } = useSavedPosts();
  const { trackView } = usePostAnalytics(post.id);
  const viewTrackingRef = useViewTracking(post.id, true);
  const { blockUser } = useBlockedUsers();
  const saved = isPostSaved(post.id);
  const isOwnPost = user?.id === post.user_id;

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
    <Card className="overflow-hidden" ref={viewTrackingRef}>
      {/* Creator Header */}
      <div className="flex items-center justify-between p-4">
        <button 
          onClick={() => navigate(`/profile/${post.user_id}`)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.creator_avatar} />
            <AvatarFallback>{post.creator_name?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className="text-left">
            <p className="font-semibold text-sm">{post.creator_name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.published_at), { addSuffix: true })}
            </p>
          </div>
        </button>
        {!post.following_creator && !isOwnPost && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleFollow}
            disabled={followLoading}
          >
            {followLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Follow'}
          </Button>
        )}
      </div>

      {/* Media */}
      {mediaUrl && (
        <div className="relative aspect-square bg-muted">
          {post.content_type === 'video' ? (
            <video
              src={needsUnlock ? undefined : mediaUrl}
              className={`w-full h-full object-cover ${needsUnlock ? 'blur-xl' : ''}`}
              controls={!needsUnlock}
            />
          ) : (
            !imageError ? (
              <img
                src={needsUnlock ? mediaUrl : mediaUrl}
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
          
          {/* Paywall Overlay */}
          {needsUnlock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="text-center space-y-4 p-6 bg-background/90 backdrop-blur-sm rounded-lg">
                <Lock className="h-12 w-12 mx-auto text-primary" />
                <div>
                  <p className="text-lg font-semibold">Unlock this post</p>
                  <p className="text-2xl font-bold text-primary mt-2">
                    ${(post.price_cents / 100).toFixed(2)}
                  </p>
                </div>
                <Button onClick={() => onUnlock(post.id, post.price_cents)} size="lg">
                  Unlock Now
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions & Caption */}
      <div className="p-4 space-y-3">
        {/* Action Buttons */}
        <TooltipProvider>
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  disabled={likeLoading}
                  className="gap-2"
                >
                  {likeLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-red-500 text-red-500' : ''}`} />
                  )}
                  <span>{post.like_count}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{post.liked_by_user ? 'Unlike' : 'Like'}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onComment(post.id)}
                  className="gap-2"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>{post.comment_count}</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Comment</TooltipContent>
            </Tooltip>
            
            <ShareButton postId={post.id} />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSaveToggle}
                >
                  <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
                </Button>
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
                {isOwnPost && (
                  <DropdownMenuItem 
                    onClick={() => setDeleteDialogOpen(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Post
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
