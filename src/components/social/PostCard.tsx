import { Heart, MessageCircle, Share2, Lock, MoreVertical, Bookmark, Flag, User } from 'lucide-react';
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
import { ShareButton } from './ShareButton';
import { ReportModal } from './ReportModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: SocialPost;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onUnlock: (postId: string) => void;
  onFollow: (userId: string) => void;
}

export function PostCard({ post, onLike, onComment, onUnlock, onFollow }: PostCardProps) {
  const navigate = useNavigate();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const { isPostSaved, savePost, unsavePost } = useSavedPosts();
  const { trackView } = usePostAnalytics(post.id);
  const viewTrackingRef = useViewTracking(post.id, true);
  const saved = isPostSaved(post.id);

  const handleSaveToggle = () => {
    if (saved) {
      unsavePost(post.id);
    } else {
      savePost(post.id);
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
        {!post.following_creator && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onFollow(post.user_id)}
          >
            Follow
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
                <Button onClick={() => onUnlock(post.id)} size="lg">
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onLike(post.id)}
            className="gap-2"
          >
            <Heart className={`h-5 w-5 ${post.liked_by_user ? 'fill-red-500 text-red-500' : ''}`} />
            <span>{post.like_count}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onComment(post.id)}
            className="gap-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span>{post.comment_count}</span>
          </Button>
          
          <ShareButton postId={post.id} />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSaveToggle}
          >
            <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/profile/${post.user_id}`)}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setReportModalOpen(true)}>
                <Flag className="h-4 w-4 mr-2" />
                Report post
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
    </>
  );
}
