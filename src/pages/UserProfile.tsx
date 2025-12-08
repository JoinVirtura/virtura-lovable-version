import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ImmersiveProfileHeader } from "@/components/profile/ImmersiveProfileHeader";
import { ProfileNotificationCenter } from "@/components/profile/ProfileNotificationCenter";
import { CircularStatsRing } from "@/components/profile/CircularStatsRing";
import { BentoContentGrid } from "@/components/profile/BentoContentGrid";
import { QuickActionBar } from "@/components/profile/QuickActionBar";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { AchievementBadges } from "@/components/profile/AchievementBadges";
import { EnhancedProfileTabs } from "@/components/profile/EnhancedProfileTabs";
import { ProfessionalAboutSection } from "@/components/profile/ProfessionalAboutSection";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { BookmarkIcon, Loader2 } from "lucide-react";

// Lazy load heavy components
const CollaborationHistory = lazy(() => import("@/components/profile/CollaborationHistory").then(m => ({ default: m.CollaborationHistory })));

const TabLoader = () => (
  <div className="flex justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function UserProfile() {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const userId = paramUserId || user?.id || '';
  
  const { profile, posts, loading, updateProfile, refetch } = useUserProfile(userId);
  const [activeTab, setActiveTab] = useState('grid');
  const [currentFollowerCount, setCurrentFollowerCount] = useState(0);

  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    if (profile) {
      setCurrentFollowerCount(profile.follower_count);
    }
  }, [profile]);

  const handleFollowChange = (isFollowing: boolean, newCount: number) => {
    setCurrentFollowerCount(newCount);
    setTimeout(() => refetch(), 1000);
  };


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

  const handleProfileUpdate = async (updates: { bio?: string; website_url?: string }) => {
    await updateProfile(updates);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Immersive Header - No delay */}
      <ImmersiveProfileHeader 
        profile={profile}
        postsCount={posts.length}
        isOwnProfile={isOwnProfile}
        onFollowChange={handleFollowChange}
      />
      
      <div className="container mx-auto px-4 md:px-6 py-8 space-y-6 pb-24">
        {/* Notification Center - Only for own profile */}
        {isOwnProfile && <ProfileNotificationCenter />}

        {/* Circular Stats Dashboard - Real data */}
        <CircularStatsRing 
          views={posts.reduce((acc, post) => acc + (post.view_count || 0), 0)}
          likes={posts.reduce((acc, post) => acc + (post.like_count || 0), 0)}
          followers={currentFollowerCount}
          engagement={posts.length > 0 ? 
            Math.round((posts.reduce((acc, post) => acc + (post.like_count || 0) + (post.comment_count || 0), 0) / 
            Math.max(posts.reduce((acc, post) => acc + (post.view_count || 1), 0), 1)) * 1000) / 10 : 0
          }
        />

        {/* Achievement Badges */}
        <AchievementBadges />

        {/* Enhanced Content Tabs */}
        <EnhancedProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwnProfile={isOwnProfile}
        />

        {activeTab === "grid" && (
          <div className="mt-0">
            {posts.length > 0 ? (
              <BentoContentGrid 
                posts={posts}
                savedPosts={[]}
                isOwnProfile={isOwnProfile}
              />
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/10 flex items-center justify-center">
                  <BookmarkIcon className="w-8 h-8 text-violet-400" />
                </div>
                <p className="text-muted-foreground">No posts yet</p>
                {isOwnProfile && (
                  <p className="text-sm text-muted-foreground/60 mt-2">Create your first post from the Feed!</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "collaborations" && (
          <Suspense fallback={<TabLoader />}>
            <CollaborationHistory />
          </Suspense>
        )}

        {activeTab === "about" && (
          <div className="max-w-3xl mx-auto">
            <ProfessionalAboutSection
              profile={profile}
              isOwnProfile={isOwnProfile}
              onUpdateProfile={handleProfileUpdate}
            />
          </div>
        )}

      </div>

      {/* Quick Action Bar */}
      <QuickActionBar 
        isOwnProfile={isOwnProfile}
        isFollowing={false}
        onEdit={() => navigate('/settings')}
        onAnalytics={() => setActiveTab('analytics')}
        onSettings={() => navigate('/settings')}
      />
    </div>
  );
}
