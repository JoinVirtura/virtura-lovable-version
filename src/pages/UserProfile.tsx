import { useState } from "react";
import { useParams } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { ProfilePostsGrid } from "@/components/profile/ProfilePostsGrid";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { useAuth } from "@/hooks/useAuth";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const { profile, posts, loading, updateProfile, uploadAvatar } = useUserProfile(userId || '');
  const [activeTab, setActiveTab] = useState('posts');
  const [showEditDialog, setShowEditDialog] = useState(false);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    );
  }

  const isOwnProfile = user?.id === userId;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <ProfileHeader 
          profile={profile}
          onEditProfile={isOwnProfile ? () => setShowEditDialog(true) : undefined}
        />
        
        <ProfileStats
          postsCount={posts.length}
          followersCount={profile.follower_count}
          followingCount={profile.following_count}
        />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'posts' && (
          <ProfilePostsGrid posts={posts} loading={loading} userId={userId} />
        )}

        {activeTab === 'likes' && (
          <div className="p-6 text-center text-muted-foreground">
            Liked posts coming soon
          </div>
        )}

        {activeTab === 'about' && (
          <div className="p-6">
            <p className="text-muted-foreground">No bio yet</p>
          </div>
        )}
      </div>

      {isOwnProfile && (
        <EditProfileModal
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={profile}
          onUpdate={updateProfile}
          onUploadAvatar={uploadAvatar}
        />
      )}
    </div>
  );
}
