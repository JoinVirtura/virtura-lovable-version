import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Story {
  id: string;
  content_url: string;
  content_type: 'image' | 'video';
  duration?: number;
}

interface StoryData {
  id: string;
  username: string;
  avatar?: string | null;
  stories: Story[];
}

interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  stories: StoryData[];
  initialStoryIndex: number;
}

export function StoryViewer({ isOpen, onClose, stories, initialStoryIndex }: StoryViewerProps) {
  const [currentUserIndex, setCurrentUserIndex] = useState(initialStoryIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const currentUser = stories[currentUserIndex];
  const currentStory = currentUser?.stories[currentStoryIndex];
  const duration = currentStory?.duration || 5000;

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen, currentUserIndex, currentStoryIndex, duration]);

  const handleNext = () => {
    if (currentStoryIndex < currentUser.stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else if (currentUserIndex < stories.length - 1) {
      setCurrentUserIndex(currentUserIndex + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    } else if (currentUserIndex > 0) {
      setCurrentUserIndex(currentUserIndex - 1);
      const prevUser = stories[currentUserIndex - 1];
      setCurrentStoryIndex(prevUser.stories.length - 1);
      setProgress(0);
    }
  };

  const handleAreaClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const third = rect.width / 3;

    if (x < third) {
      handlePrevious();
    } else if (x > third * 2) {
      handleNext();
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative w-full max-w-md h-full max-h-[90vh] bg-background/10 rounded-3xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Progress Bars */}
          <div className="absolute top-0 left-0 right-0 z-50 flex gap-1 p-2">
            {currentUser.stories.map((_, index) => (
              <div key={index} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: '0%' }}
                  animate={{
                    width: index < currentStoryIndex ? '100%' : index === currentStoryIndex ? `${progress}%` : '0%'
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            ))}
          </div>

          {/* User Info */}
          <div className="absolute top-4 left-0 right-0 z-50 flex items-center justify-between px-4 mt-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-white">
                <AvatarImage src={currentUser.avatar || undefined} />
                <AvatarFallback>{currentUser.username[0]}</AvatarFallback>
              </Avatar>
              <span className="font-semibold text-white">{currentUser.username}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Story Content */}
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer"
            onClick={handleAreaClick}
          >
            {currentStory?.content_type === 'video' ? (
              <video
                key={currentStory.id}
                src={currentStory.content_url}
                className="w-full h-full object-contain"
                autoPlay
                muted
                playsInline
              />
            ) : (
              <img
                key={currentStory?.id}
                src={currentStory?.content_url}
                alt="Story"
                className="w-full h-full object-contain"
              />
            )}
          </div>

          {/* Navigation Arrows */}
          {currentUserIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}
          {currentUserIndex < stories.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
