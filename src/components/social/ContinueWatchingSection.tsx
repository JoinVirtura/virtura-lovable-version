import { motion } from 'framer-motion';
import { ContinueWatchingCard } from './ContinueWatchingCard';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useVideoProgress } from '@/hooks/useVideoProgress';

const mockVideos = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400',
    title: 'Ultimate Tech Review 2024',
    duration: '12:34',
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    title: 'Motion Design Tutorial',
    duration: '08:45',
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    title: 'Fashion Week Highlights',
    duration: '15:20',
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
    title: 'Creative Workflow Tips',
    duration: '10:12',
  },
];

export function ContinueWatchingSection() {
  const { getContinueWatching, getProgress, clearProgress, clearAllProgress } = useVideoProgress();
  
  const continueWatching = getContinueWatching();
  
  // Map with mock data for now
  const videosWithProgress = mockVideos.map(video => {
    const progress = getProgress(video.id);
    return {
      ...video,
      progress: progress?.progress || Math.floor(Math.random() * 60) + 20 // Mock progress
    };
  }).slice(0, 4);

  if (videosWithProgress.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <span className="text-violet-400">Continue Watching</span>
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllProgress}
          className="text-muted-foreground hover:text-foreground"
        >
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {videosWithProgress.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <ContinueWatchingCard
              thumbnail={video.thumbnail}
              title={video.title}
              progress={video.progress}
              duration={video.duration}
              onClick={() => console.log('Resume video:', video.id)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
