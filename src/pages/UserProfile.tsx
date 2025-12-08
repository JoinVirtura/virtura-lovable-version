import { useState, useEffect, Suspense, lazy } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { ImmersiveProfileHeader } from "@/components/profile/ImmersiveProfileHeader";
import { ProfileNotificationCenter } from "@/components/profile/ProfileNotificationCenter";
import { CircularStatsRing } from "@/components/profile/CircularStatsRing";
import { BentoContentGrid } from "@/components/profile/BentoContentGrid";
import { QuickActionBar } from "@/components/profile/QuickActionBar";
import { MasonryPostGrid } from "@/components/profile/MasonryPostGrid";
import { EditableBio } from "@/components/profile/EditableBio";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { AchievementBadges } from "@/components/profile/AchievementBadges";
import { EnhancedProfileTabs } from "@/components/profile/EnhancedProfileTabs";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TabsContent } from "@/components/ui/tabs";
import { BookmarkIcon, Loader2 } from "lucide-react";

// Lazy load heavy components
const AnalyticsDashboard = lazy(() => import("@/components/profile/AnalyticsDashboard").then(m => ({ default: m.AnalyticsDashboard })));
const CollaborationHistory = lazy(() => import("@/components/profile/CollaborationHistory").then(m => ({ default: m.CollaborationHistory })));
const PortfolioShowcase = lazy(() => import("@/components/profile/PortfolioShowcase").then(m => ({ default: m.PortfolioShowcase })));
const MediaKitSection = lazy(() => import("@/components/profile/MediaKitSection").then(m => ({ default: m.MediaKitSection })));

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
  const { savedPosts, loading: savedLoading } = useSavedPosts();
  const [activeTab, setActiveTab] = useState('grid');
  const [savedPostsData, setSavedPostsData] = useState<any[]>([]);
  const [loadingSavedPosts, setLoadingSavedPosts] = useState(false);
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

  useEffect(() => {
    const fetchSavedPostsData = async () => {
      if (!isOwnProfile || savedPosts.length === 0) {
        setSavedPostsData([]);
        return;
      }

      setLoadingSavedPosts(true);
      try {
        const postIds = savedPosts.map(sp => sp.post_id);
        
        const { data, error } = await supabase
          .from('social_posts')
          .select(`*, profiles!social_posts_user_id_fkey (display_name, avatar_url)`)
          .in('id', postIds)
          .eq('status', 'published');

        if (error) throw error;

        const formattedPosts = data?.map(post => ({
          id: post.id,
          user_id: post.user_id,
          media_urls: post.media_urls,
          caption: post.caption,
          content_type: post.content_type,
          is_paid: post.is_paid,
          price_cents: post.price_cents,
          published_at: post.published_at,
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
        })) || [];

        setSavedPostsData(formattedPosts);
      } catch (error) {
        console.error('Error fetching saved posts:', error);
        toast.error('Failed to load saved posts');
      } finally {
        setLoadingSavedPosts(false);
      }
    };

    if (activeTab === 'saved' && isOwnProfile) {
      fetchSavedPostsData();
    }
  }, [savedPosts, activeTab, isOwnProfile]);

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

  const handleBioSave = async (newBio: string) => {
    try {
      await updateProfile({ bio: newBio });
      toast.success('Bio updated successfully');
    } catch (error) {
      toast.error('Failed to update bio');
      throw error;
    }
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
          savedCount={savedPosts.length}
        />

        {activeTab === "grid" && (
          <div className="mt-0">
            {posts.length > 0 ? (
              <BentoContentGrid 
                posts={posts}
                savedPosts={savedPostsData}
                isOwnProfile={isOwnProfile}
                onNavigateToAnalytics={() => setActiveTab('analytics')}
                onNavigateToSaved={() => setActiveTab('saved')}
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

        {activeTab === "portfolio" && (
          <Suspense fallback={<TabLoader />}>
            <PortfolioShowcase />
          </Suspense>
        )}

        {activeTab === "analytics" && isOwnProfile && (
          <Suspense fallback={<TabLoader />}>
            <AnalyticsDashboard />
          </Suspense>
        )}

        {activeTab === "saved" && isOwnProfile && (
          <>
            {loadingSavedPosts || savedLoading ? (
              <TabLoader />
            ) : savedPostsData.length > 0 ? (
              <MasonryPostGrid posts={savedPostsData} userId={userId} />
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-pink-500/10 flex items-center justify-center">
                  <BookmarkIcon className="w-8 h-8 text-pink-400" />
                </div>
                <p className="text-muted-foreground">No saved posts yet</p>
              </div>
            )}
          </>
        )}

        {activeTab === "collaborations" && (
          <Suspense fallback={<TabLoader />}>
            <CollaborationHistory />
          </Suspense>
        )}

        {activeTab === "about" && (
          <div className="max-w-2xl">
            <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-violet-950/20 to-slate-900/80 backdrop-blur-xl">
              {isOwnProfile ? (
                <EditableBio bio={profile.bio} onSave={handleBioSave} />
              ) : profile.bio ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-white">About</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">No bio yet</p>
              )}
            </div>
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
