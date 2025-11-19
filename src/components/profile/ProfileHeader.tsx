import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, MessageCircle, Share2, Ban, Loader2, ExternalLink } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useBlockedUsers } from "@/hooks/useBlockedUsers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { UserProfile } from "@/hooks/useUserProfile";
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

interface ProfileHeaderProps {
  profile: UserProfile & { bio?: string; website_url?: string };
  onEditProfile?: () => void;
}

export function ProfileHeader({ profile, onEditProfile }: ProfileHeaderProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { blockUser, isUserBlocked } = useBlockedUsers();
  const [isFollowing, setIsFollowing] = useState(profile.is_following);
  const [followerCount, setFollowerCount] = useState(profile.follower_count);
  const [loading, setLoading] = useState(false);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  
  const isOwnProfile = user?.id === profile.id;
  const isBlocked = isUserBlocked(profile.id);

  const handleFollow = async () => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }

    setLoading(true);
    try {
      if (isFollowing) {
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) throw error;
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
        toast.success('Unfollowed');
      } else {
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
          });

        if (error) throw error;
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
        toast.success('Following');
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/profile/${profile.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: profile.full_name,
          url: url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(url);
      toast.success('Profile link copied!');
    }
  };

  const handleBlockUser = async () => {
    try {
      await blockUser(profile.id);
      toast.success('User blocked');
      setBlockDialogOpen(false);
      navigate('/social');
    } catch (error) {
      toast.error('Failed to block user');
    }
  };

  return (
    <>
      <div className="border-b border-border bg-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start">
          <Avatar className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-primary/20">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-xl sm:text-2xl">
              {profile.full_name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4 w-full text-center sm:text-left">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{profile.full_name}</h1>
              <p className="text-muted-foreground">@{profile.full_name.toLowerCase().replace(/\s+/g, '')}</p>
              {profile.bio && (
                <p className="text-foreground mt-2">{profile.bio}</p>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  {profile.website_url.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            <TooltipProvider>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2">
                {isOwnProfile ? (
                  <Button onClick={onEditProfile} variant="outline" className="w-full sm:w-auto">
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={handleFollow} 
                      disabled={loading || isBlocked}
                      variant={isFollowing ? "outline" : "default"}
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : isFollowing ? (
                        <UserCheck className="w-4 h-4 mr-2" />
                      ) : (
                        <UserPlus className="w-4 h-4 mr-2" />
                      )}
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full sm:w-auto"
                          onClick={() => navigate(`/messages?user=${profile.id}`)}
                          disabled={isBlocked}
                        >
                          <MessageCircle className="w-4 h-4 sm:mr-2" />
                          <span className="hidden sm:inline">Message</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Send a message</TooltipContent>
                    </Tooltip>
                    {!isBlocked && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setBlockDialogOpen(true)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Block user</TooltipContent>
                      </Tooltip>
                    )}
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleShare}
                      className="w-full sm:w-auto"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Share profile</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </div>
        </div>
      </div>

      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {profile.full_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You won't see posts or content from this user anymore. They won't be notified that you've blocked them.
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
    </>
  );
}
