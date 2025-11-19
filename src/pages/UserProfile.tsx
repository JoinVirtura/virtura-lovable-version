import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUserProfile } from "@/hooks/useUserProfile";
import { EnhancedProfileHeader } from "@/components/profile/EnhancedProfileHeader";
import { MasonryPostGrid } from "@/components/profile/MasonryPostGrid";
import { ProfileSkeleton } from "@/components/profile/ProfileSkeleton";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { profile, posts, loading } = useUserProfile(userId || '');
  const [activeTab, setActiveTab] = useState('posts');

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
      <EnhancedProfileHeader 
        profile={profile}
        postsCount={posts.length}
        isOwnProfile={isOwnProfile}
        onEditProfile={isOwnProfile ? () => navigate('/settings') : undefined}
      />
      
      <div className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start border-b border-border/50 bg-transparent rounded-none h-auto p-0 mb-8">
            <TabsTrigger 
              value="posts" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="likes"
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-6 py-3"
            >
              Likes
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

          <TabsContent value="likes" className="text-center py-12 text-muted-foreground">
            Liked posts coming soon
          </TabsContent>

          <TabsContent value="about" className="max-w-2xl">
            {profile.bio ? (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">About</h3>
                <p className="text-muted-foreground">{profile.bio}</p>
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
