import { useEffect, useState } from "react";
import { useSavedPosts } from "@/hooks/useSavedPosts";
import { supabase } from "@/integrations/supabase/client";
import { ProfilePostsGrid } from "@/components/profile/ProfilePostsGrid";
import { Button } from "@/components/ui/button";
import { Bookmark, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavedPosts() {
  const { savedPosts, loading: savedLoading } = useSavedPosts();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
          <div className="grid grid-cols-3 gap-1 p-6">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-md" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <Bookmark className="w-16 h-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No saved posts yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Save posts you love to revisit them later
            </p>
            <Button onClick={() => navigate('/social')} size="lg" className="gap-2">
              <Plus className="w-4 h-4" />
              Browse Feed
            </Button>
          </div>
        ) : (
          <ProfilePostsGrid posts={posts} />
        )}
      </div>
    </div>
  );
}
