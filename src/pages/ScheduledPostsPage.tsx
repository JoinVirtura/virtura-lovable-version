import { ScheduledPostsList } from '@/components/social/ScheduledPostsList';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ScheduledPostsPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/social')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Scheduled Posts</h1>
          <p className="text-muted-foreground mt-1">
            Manage posts scheduled for future publication
          </p>
        </div>
      </div>

      <ScheduledPostsList />
    </div>
  );
}
