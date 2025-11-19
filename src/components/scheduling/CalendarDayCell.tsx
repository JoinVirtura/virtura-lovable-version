import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ScheduledPost {
  id: string;
  platforms: string[];
  status: string;
}

interface CalendarDayCellProps {
  date: Date;
  posts: ScheduledPost[];
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  onClick: () => void;
}

const getPlatformColor = (platform: string) => {
  const colors: Record<string, string> = {
    instagram: 'bg-[#E4405F]',
    tiktok: 'bg-[#00F2EA]',
    youtube: 'bg-[#FF0000]',
    twitter: 'bg-[#1DA1F2]',
    facebook: 'bg-[#1877F2]',
  };
  return colors[platform.toLowerCase()] || 'bg-primary';
};

export function CalendarDayCell({
  date,
  posts,
  isCurrentMonth,
  isSelected,
  isToday,
  onClick,
}: CalendarDayCellProps) {
  const hasPosts = posts.length > 0;

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative min-h-[80px] p-2 rounded-lg border transition-all duration-300 hover:scale-105',
        'flex flex-col items-start justify-start',
        isCurrentMonth ? 'opacity-100' : 'opacity-40',
        isSelected && 'ring-2 ring-primary shadow-lg shadow-primary/20',
        isToday && 'bg-primary/10 border-primary',
        !isToday && !isSelected && 'border-border hover:border-primary/50',
        hasPosts && !isToday && 'bg-primary/5'
      )}
    >
      {/* Day Number */}
      <span
        className={cn(
          'text-sm font-semibold mb-1',
          isToday && 'text-primary',
          !isToday && 'text-foreground'
        )}
      >
        {format(date, 'd')}
      </span>

      {/* Post Indicators */}
      {hasPosts && (
        <div className="flex flex-wrap gap-1 mt-auto">
          {posts.slice(0, 3).map((post, idx) => {
            const platform = post.platforms[0] || 'instagram';
            return (
              <div
                key={idx}
                className={cn(
                  'w-2 h-2 rounded-full',
                  getPlatformColor(platform)
                )}
                title={platform}
              />
            );
          })}
          {posts.length > 3 && (
            <span className="text-[10px] text-muted-foreground font-medium">
              +{posts.length - 3}
            </span>
          )}
        </div>
      )}
    </button>
  );
}