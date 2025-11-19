import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { SmartCalendar } from '@/components/scheduling/SmartCalendar';
import { Loader2 } from 'lucide-react';

export default function ScheduledPostsPage() {
  const { posts, loading, publishNow, deleteScheduledPost } = useScheduledPosts();

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
          Scheduled Posts
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your content calendar
        </p>
      </div>

      <SmartCalendar
        posts={posts}
        onPublishNow={publishNow}
        onDelete={deleteScheduledPost}
      />
    </div>
  );
}
