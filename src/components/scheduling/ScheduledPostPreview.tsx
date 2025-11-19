import { format, parseISO } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Trash2, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledPost {
  id: string;
  caption: string;
  media_urls: any;
  scheduled_for: string;
  platforms: string[];
  status: string;
  is_paid: boolean;
  price_cents: number;
}

interface ScheduledPostPreviewProps {
  post: ScheduledPost;
  onPublishNow: (id: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, string> = {
    instagram: '📸',
    tiktok: '🎵',
    youtube: '📹',
    twitter: '🐦',
    facebook: '👥',
  };
  return icons[platform.toLowerCase()] || '📱';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'published':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'failed':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export function ScheduledPostPreview({ post, onPublishNow, onDelete, compact }: ScheduledPostPreviewProps) {
  const mediaUrl = Array.isArray(post.media_urls) ? post.media_urls[0] : post.media_urls;

  return (
    <Card className={cn(
      'p-3 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all',
      compact ? 'p-2' : 'p-4'
    )}>
      <div className="flex gap-3">
        {/* Media Preview */}
        {mediaUrl && !compact && (
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
            <img 
              src={mediaUrl} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className={cn(
              'text-sm line-clamp-2',
              compact && 'text-xs'
            )}>
              {post.caption || 'No caption'}
            </p>
            {post.is_paid && (
              <Badge variant="secondary" className="flex-shrink-0 text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                ${(post.price_cents / 100).toFixed(2)}
              </Badge>
            )}
          </div>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(parseISO(post.scheduled_for), 'MMM d, h:mm a')}
            </div>
            <div className="flex gap-1">
              {post.platforms.map(platform => (
                <span key={platform} title={platform}>
                  {getPlatformIcon(platform)}
                </span>
              ))}
            </div>
            <Badge variant="outline" className={getStatusColor(post.status)}>
              {post.status}
            </Badge>
          </div>

          {/* Actions */}
          {!compact && post.status === 'pending' && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="default"
                onClick={() => onPublishNow(post.id)}
                className="h-7 text-xs"
              >
                <Play className="w-3 h-3 mr-1" />
                Publish Now
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onDelete(post.id)}
                className="h-7 text-xs"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}