import { useState } from 'react';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { SmartCalendar } from '@/components/scheduling/SmartCalendar';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Calendar } from 'lucide-react';

export default function ScheduledPostsPage() {
  const { posts, loading, publishNow, deleteScheduledPost } = useScheduledPosts();
  const [createModalOpen, setCreateModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
            Scheduled Posts
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Manage your content calendar
          </p>
        </div>
        
        {/* Schedule Post Button */}
        <Button 
          onClick={() => setCreateModalOpen(true)}
          className="bg-gradient-to-r from-primary to-primary-blue shadow-lg w-full sm:w-auto"
          size="default"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          <span className="sm:inline">Schedule Post</span>
        </Button>
      </div>

      <SmartCalendar
        posts={posts}
        onPublishNow={publishNow}
        onDelete={deleteScheduledPost}
      />

      {/* Create Post Modal with Scheduling Enabled by Default */}
      <CreatePostModal 
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        defaultScheduled={true}
      />
    </div>
  );
}
