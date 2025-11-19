import { useEffect, useState } from "react";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { supabase } from "@/integrations/supabase/client";
import { ProfilePostsGrid } from "@/components/profile/ProfilePostsGrid";

export default function SavedPosts() {
  const { savedPosts, loading: savedLoading } = useSavedPosts();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      if (savedPosts.length === 0) {
        setLoading(false);
        return;
      }

      const postIds = savedPosts.map(sp => sp.post_id);
      const { data, error } = await supabase
        .from('social_posts')
        .select('*')
        .in('id', postIds)
        .eq('status', 'published');

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    };

    if (!savedLoading) {
      fetchPosts();
    }
  }, [savedPosts, savedLoading]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="border-b border-border bg-card p-6">
          <h1 className="text-2xl font-bold text-foreground">Saved Posts</h1>
          <p className="text-muted-foreground mt-1">
            {savedPosts.length} saved {savedPosts.length === 1 ? 'post' : 'posts'}
          </p>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-muted-foreground">No saved posts yet</p>
          </div>
        ) : (
          <ProfilePostsGrid posts={posts} />
        )}
      </div>
    </div>
  );
}
