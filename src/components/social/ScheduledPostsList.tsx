import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useScheduledPosts } from '@/hooks/useScheduledPosts';
import { Calendar, Clock, Trash2, Send, Loader2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function ScheduledPostsList() {
  const { posts, loading, deleteScheduledPost, publishNow } = useScheduledPosts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'publishing':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'published':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'failed':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Posts</CardTitle>
          <CardDescription>Manage your scheduled posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No scheduled posts</h3>
            <p className="text-muted-foreground mb-6">
              Schedule posts to publish them automatically at a later time
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Posts ({posts.length})</CardTitle>
        <CardDescription>Manage your scheduled posts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card"
            >
              {/* Preview */}
              <div className="flex-shrink-0">
                {post.media_urls && post.media_urls.length > 0 ? (
                  <img
                    src={post.media_urls[0]}
                    alt="Post preview"
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-muted rounded flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2 mb-2">
                  {post.caption || 'No caption'}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.status === 'published' 
                      ? `Published ${formatDistanceToNow(new Date(post.scheduled_for))} ago`
                      : `In ${formatDistanceToNow(new Date(post.scheduled_for))}`
                    }
                  </div>
                  {post.platforms && post.platforms.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span>Platforms: {post.platforms.join(', ')}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getStatusColor(post.status)}>
                    {post.status}
                  </Badge>
                  {post.is_paid && (
                    <Badge variant="outline">
                      Paid: ${(post.price_cents / 100).toFixed(2)}
                    </Badge>
                  )}
                </div>

                {post.error_message && (
                  <div className="mt-2 flex items-start gap-2 text-xs text-destructive">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{post.error_message}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 flex-shrink-0">
                {post.status === 'pending' && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => publishNow(post.id)}
                      className="gap-2"
                    >
                      <Send className="w-3 h-3" />
                      Publish Now
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="gap-2 text-destructive">
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete scheduled post?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the scheduled post.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteScheduledPost(post.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
                {post.status === 'failed' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2 text-destructive">
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete failed post?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the failed post.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteScheduledPost(post.id)}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
