import { useState, useEffect } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Grid3X3, BookmarkIcon, User, BarChart3, Briefcase } from "lucide-react";
import { Loader2 } from "lucide-react";
import { AnalyticsDashboard } from "@/components/profile/AnalyticsDashboard";
import { CollaborationHistory } from "@/components/profile/CollaborationHistory";
import { PortfolioShowcase } from "@/components/profile/PortfolioShowcase";
import { MediaKitSection } from "@/components/profile/MediaKitSection";

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
      {/* Immersive Header */}
      <ImmersiveProfileHeader 
        profile={profile}
        postsCount={posts.length}
        isOwnProfile={isOwnProfile}
        onFollowChange={handleFollowChange}
      />
      
      <div className="container mx-auto px-4 md:px-6 py-8 space-y-8 pb-24">
        {/* Notification Center - Only for own profile */}
        {isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProfileNotificationCenter />
          </motion.div>
        )}

        {/* Circular Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <CircularStatsRing 
            views={523000}
            likes={45200}
            followers={currentFollowerCount}
            engagement={12.8}
          />
        </motion.div>

        {/* Achievement Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <AchievementBadges />
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-white/5 border border-white/10 rounded-xl p-1 mb-6 overflow-x-auto">
              <TabsTrigger 
                value="grid" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Posts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="portfolio"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Portfolio</span>
              </TabsTrigger>
              {isOwnProfile && (
                <>
                  <TabsTrigger 
                    value="analytics"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span className="hidden sm:inline">Analytics</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="saved"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Saved</span>
                  </TabsTrigger>
                </>
              )}
              <TabsTrigger 
                value="collaborations"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Collabs</span>
              </TabsTrigger>
              <TabsTrigger 
                value="about"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500/20 data-[state=active]:to-pink-500/20 data-[state=active]:text-white rounded-lg px-4 py-2 flex items-center gap-2"
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">About</span>
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <TabsContent value="grid" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {posts.length > 0 ? (
                    <BentoContentGrid 
                      posts={posts}
                      savedPosts={savedPostsData}
                      isOwnProfile={isOwnProfile}
                      onNavigateToAnalytics={() => setActiveTab('analytics')}
                      onNavigateToSaved={() => setActiveTab('saved')}
                    />
                  ) : (
                    <div className="text-center py-16 text-muted-foreground">
                      <p>No posts yet</p>
                    </div>
                  )}
                </motion.div>
              </TabsContent>

              <TabsContent value="portfolio" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <PortfolioShowcase />
                </motion.div>
              </TabsContent>

              {isOwnProfile && (
                <>
                  <TabsContent value="analytics" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <AnalyticsDashboard />
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="saved" className="mt-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {loadingSavedPosts || savedLoading ? (
                        <div className="flex justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
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
                    </motion.div>
                  </TabsContent>
                </>
              )}

              <TabsContent value="collaborations" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <CollaborationHistory />
                </motion.div>
              </TabsContent>

              <TabsContent value="about" className="mt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-2xl"
                >
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
                </motion.div>
              </TabsContent>
            </AnimatePresence>
          </Tabs>
        </motion.div>
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
