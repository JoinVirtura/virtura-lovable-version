import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function SocialFeed() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Social Feed</h1>
          <p className="text-muted-foreground mt-2">
            Discover and share content from creators
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <h3 className="text-2xl font-semibold">Coming Soon</h3>
          <p className="text-muted-foreground">
            The social feed is being built. You'll soon be able to:
          </p>
          <ul className="text-left space-y-2 text-sm text-muted-foreground">
            <li>• Scroll through an infinite feed of content</li>
            <li>• Create free and paid posts</li>
            <li>• Unlock premium content</li>
            <li>• Subscribe to your favorite creators</li>
            <li>• Follow and engage with creators</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
