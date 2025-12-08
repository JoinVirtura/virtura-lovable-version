import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { EnhancedProfileHeader } from "@/components/profile/EnhancedProfileHeader";
import { MasonryPostGrid } from "@/components/profile/MasonryPostGrid";
import { EditableBio } from "@/components/profile/EditableBio";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { StatsGlobe } from "@/components/profile/StatsGlobe";
import { AchievementBadges } from "@/components/profile/AchievementBadges";
import { AnalyticsDashboard } from "@/components/profile/AnalyticsDashboard";
import { CollaborationHistory } from "@/components/profile/CollaborationHistory";
import { PortfolioShowcase } from "@/components/profile/PortfolioShowcase";
import { MediaKitSection } from "@/components/profile/MediaKitSection";

export default function UserProfile() {
  const { userId: paramUserId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Use param userId if provided, otherwise fall back to current user's ID
  const userId = paramUserId || user?.id || '';
  
  const { profile, posts, loading, updateProfile, refetch } = useUserProfile(userId);
  const { savedPosts, loading: savedLoading } = useSavedPosts();
  const [activeTab, setActiveTab] = useState('posts');
  const [savedPostsData, setSavedPostsData] = useState<any[]>([]);
  const [loadingSavedPosts, setLoadingSavedPosts] = useState(false);
  const [currentFollowerCount, setCurrentFollowerCount] = useState(0);

  const isOwnProfile = user?.id === userId;

  // Update follower count when profile changes
  useEffect(() => {
    if (profile) {
      setCurrentFollowerCount(profile.follower_count);
    }
  }, [profile]);

  const handleFollowChange = (isFollowing: boolean, newCount: number) => {
    setCurrentFollowerCount(newCount);
    // Optionally refetch profile for full sync
    setTimeout(() => refetch(), 1000);
  };

  // Fetch full post data for saved posts
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
          .select(`
            *,
            profiles!social_posts_user_id_fkey (
              display_name,
              avatar_url
            )
          `)
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
    <div className="min-h-screen bg-background">
      <EnhancedProfileHeader 
        profile={profile}
        postsCount={posts.length}
        isOwnProfile={isOwnProfile}
        onEditProfile={isOwnProfile ? () => navigate('/settings') : undefined}
        onFollowChange={handleFollowChange}
      />
      
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Stats Dashboard */}
        <StatsGlobe 
          views={523000}
          likes={45200}
          followers={currentFollowerCount}
          engagement={12.8}
        />

        {/* Achievement Badges */}
        <AchievementBadges />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b border-border/50 bg-transparent rounded-none h-auto p-0 mb-8">
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="portfolio"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
            >
              Portfolio
            </TabsTrigger>
            {isOwnProfile && (
              <>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="saved"
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
                >
                  Saved
                </TabsTrigger>
              </>
            )}
            <TabsTrigger 
              value="collaborations"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
            >
              Collaborations
            </TabsTrigger>
            <TabsTrigger 
              value="media-kit"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
            >
              Media Kit
            </TabsTrigger>
            <TabsTrigger 
              value="about"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
            >
              About
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <MasonryPostGrid posts={posts} userId={userId} />
          </TabsContent>

          <TabsContent value="portfolio">
            <PortfolioShowcase />
          </TabsContent>

          {isOwnProfile && (
            <>
              <TabsContent value="analytics">
                <AnalyticsDashboard />
              </TabsContent>

              <TabsContent value="saved">
                {loadingSavedPosts || savedLoading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : savedPostsData.length > 0 ? (
                  <MasonryPostGrid posts={savedPostsData} userId={userId} />
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>No saved posts yet</p>
                  </div>
                )}
              </TabsContent>
            </>
          )}

          <TabsContent value="collaborations">
            <CollaborationHistory />
          </TabsContent>

          <TabsContent value="media-kit">
            <MediaKitSection />
          </TabsContent>

          <TabsContent value="about" className="max-w-2xl">
            {isOwnProfile ? (
              <EditableBio bio={profile.bio} onSave={handleBioSave} />
            ) : profile.bio ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">About</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio}</p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">No bio yet</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
