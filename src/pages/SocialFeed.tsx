import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { FeedContainer } from '@/components/social/FeedContainer';
import { CreatePostModal } from '@/components/social/CreatePostModal';

export default function SocialFeed() {
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Feed</h1>
          <p className="text-muted-foreground mt-2">
            Discover and share content from creators
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <FeedContainer />

      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
