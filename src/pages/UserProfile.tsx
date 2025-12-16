import { useState, useEffect, Suspense, lazy, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { ImmersiveProfileHeader } from "@/components/profile/ImmersiveProfileHeader";
import { BentoContentGrid } from "@/components/profile/BentoContentGrid";
import { QuickActionBar } from "@/components/profile/QuickActionBar";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { EnhancedProfileTabs } from "@/components/profile/EnhancedProfileTabs";
import { ProfessionalAboutSection } from "@/components/profile/ProfessionalAboutSection";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Lazy load heavy components
const ProfileNotificationCenter = lazy(() => import("@/components/profile/ProfileNotificationCenter").then(m => ({ default: m.ProfileNotificationCenter })));
const CircularStatsRing = lazy(() => import("@/components/profile/CircularStatsRing").then(m => ({ default: m.CircularStatsRing })));
const AchievementBadges = lazy(() => import("@/components/profile/AchievementBadges").then(m => ({ default: m.AchievementBadges })));

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
  
  const { profile, posts, loading, hasMore, loadingMore, loadMore, updateProfile, refetch } = useUserProfile(userId);
  const [activeTab, setActiveTab] = useState('grid');
  const [currentFollowerCount, setCurrentFollowerCount] = useState(0);

  const isOwnProfile = user?.id === userId;

  // Memoize stats calculations
  const stats = useMemo(() => {
    const views = posts.reduce((acc, post) => acc + (post.view_count || 0), 0);
    const likes = posts.reduce((acc, post) => acc + (post.like_count || 0), 0);
    const comments = posts.reduce((acc, post) => acc + (post.comment_count || 0), 0);
    const engagement = posts.length > 0 
      ? Math.round(((likes + comments) / Math.max(views, 1)) * 1000) / 10 
      : 0;
    return { views, likes, engagement };
  }, [posts]);

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
        {isOwnProfile && (
          <Suspense fallback={<div className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />}>
            <ProfileNotificationCenter />
          </Suspense>
        )}

        {/* Circular Stats Dashboard - Real data */}
        <Suspense fallback={<div className="h-32 bg-slate-800/50 rounded-xl animate-pulse" />}>
          <CircularStatsRing 
            views={stats.views}
            likes={stats.likes}
            followers={currentFollowerCount}
            engagement={stats.engagement}
          />
        </Suspense>

        {/* Achievement Badges */}
        <Suspense fallback={<div className="h-16 bg-slate-800/50 rounded-xl animate-pulse" />}>
          <AchievementBadges />
        </Suspense>

        {/* Enhanced Content Tabs */}
        <EnhancedProfileTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOwnProfile={isOwnProfile}
        />

        {activeTab === "grid" && (
          <div className="mt-0">
            <BentoContentGrid 
              posts={posts}
              hasMore={hasMore}
              loadMore={loadMore}
              loadingMore={loadingMore}
              onPostDeleted={refetch}
            />
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
        onEdit={() => navigate('/dashboard?view=settings')}
        onAnalytics={() => navigate('/dashboard?view=creator-dashboard')}
        onSettings={() => navigate('/dashboard?view=settings')}
      />
    </div>
  );
}
