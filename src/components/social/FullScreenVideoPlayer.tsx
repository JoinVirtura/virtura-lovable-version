import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, Play, Pause, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { SocialPost } from '@/hooks/useSocialPosts';
import { useNavigate } from 'react-router-dom';

interface FullScreenVideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  posts: SocialPost[];
  initialIndex: number;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
}

export function FullScreenVideoPlayer({ 
  isOpen, 
  onClose, 
  posts, 
  initialIndex, 
  onLike,
  onComment
}: FullScreenVideoPlayerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentPost = posts[currentIndex];

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isOpen, currentIndex]);

  // Update progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent || 0);
    };

    video.addEventListener('timeupdate', updateProgress);
    return () => video.removeEventListener('timeupdate', updateProgress);
  }, [currentIndex]);

  // Auto-advance on video end
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      if (currentIndex < posts.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    };

    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [currentIndex, posts.length]);

  const handleSwipe = (info: PanInfo) => {
    const threshold = 100;
    if (info.offset.y < -threshold && currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else if (info.offset.y > threshold && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    onLike(currentPost.id);
  };

  const goToNext = () => {
    if (currentIndex < posts.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (!currentPost) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
        >
          {/* Video Container */}
          <motion.div
            className="relative w-full h-full flex items-center justify-center"
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={(_, info) => handleSwipe(info)}
          >
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 right-0 z-20">
              <Progress value={progress} className="h-1 rounded-none bg-white/20" />
            </div>

            {/* Close Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>

            {/* Navigation Hints */}
            {currentIndex > 0 && (
              <motion.button
                onClick={goToPrevious}
                className="absolute top-1/4 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronUp className="h-8 w-8" />
              </motion.button>
            )}
            {currentIndex < posts.length - 1 && (
              <motion.button
                onClick={goToNext}
                className="absolute bottom-1/4 left-1/2 -translate-x-1/2 z-20 text-white/50 hover:text-white"
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ChevronDown className="h-8 w-8" />
              </motion.button>
            )}

            {/* Video */}
            <video
              ref={videoRef}
              src={currentPost.media_urls?.[0]}
              className="max-w-full max-h-full object-contain"
              loop
              muted={isMuted}
              playsInline
              onClick={togglePlayPause}
            />

            {/* Play/Pause Indicator */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                  <div className="bg-black/50 rounded-full p-6">
                    <Play className="h-12 w-12 text-white" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Creator Info - Bottom Left */}
            <div className="absolute bottom-20 left-4 z-20 max-w-[70%]">
              <button
                onClick={() => {
                  onClose();
                  navigate(`/profile/${currentPost.user_id}`);
                }}
                className="flex items-center gap-3 mb-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-12 w-12 ring-2 ring-white/30">
                  <AvatarImage src={currentPost.creator_avatar} />
                  <AvatarFallback>{currentPost.creator_name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <p className="font-bold text-white text-sm">{currentPost.creator_name}</p>
                  <p className="text-white/70 text-xs">@{currentPost.creator_name?.toLowerCase().replace(/\s+/g, '')}</p>
                </div>
              </button>
              {currentPost.caption && (
                <p className="text-white text-sm line-clamp-3">{currentPost.caption}</p>
              )}
            </div>

            {/* Engagement Buttons - Right Side */}
            <div className="absolute right-4 bottom-32 z-20 flex flex-col gap-5">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-3 rounded-full ${liked ? 'bg-red-500' : 'bg-white/20'}`}>
                  <Heart className={`h-7 w-7 ${liked ? 'fill-white text-white' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs">{currentPost.like_count}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => onComment(currentPost.id)}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-3 rounded-full bg-white/20">
                  <MessageCircle className="h-7 w-7 text-white" />
                </div>
                <span className="text-white text-xs">{currentPost.comment_count}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-3 rounded-full bg-white/20">
                  <Share2 className="h-7 w-7 text-white" />
                </div>
                <span className="text-white text-xs">Share</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSaved(!saved)}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-3 rounded-full ${saved ? 'bg-primary' : 'bg-white/20'}`}>
                  <Bookmark className={`h-7 w-7 ${saved ? 'fill-white text-white' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs">Save</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsMuted(!isMuted)}
                className="flex flex-col items-center gap-1"
              >
                <div className="p-3 rounded-full bg-white/20">
                  {isMuted ? (
                    <VolumeX className="h-7 w-7 text-white" />
                  ) : (
                    <Volume2 className="h-7 w-7 text-white" />
                  )}
                </div>
              </motion.button>
            </div>

            {/* Video Counter */}
            <div className="absolute top-4 left-4 z-20">
              <span className="text-white/70 text-sm">
                {currentIndex + 1} / {posts.length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}