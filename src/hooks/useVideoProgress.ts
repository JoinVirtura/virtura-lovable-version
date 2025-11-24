import { useState, useEffect } from 'react';

interface VideoProgress {
  postId: string;
  progress: number;
  timestamp: number;
}

export function useVideoProgress() {
  const [progress, setProgress] = useState<Record<string, VideoProgress>>({});

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('video_progress');
    if (stored) {
      setProgress(JSON.parse(stored));
    }
  }, []);

  const updateProgress = (postId: string, progressPercent: number) => {
    const newProgress = {
      ...progress,
      [postId]: {
        postId,
        progress: progressPercent,
        timestamp: Date.now()
      }
    };
    setProgress(newProgress);
    localStorage.setItem('video_progress', JSON.stringify(newProgress));
  };

  const getProgress = (postId: string): VideoProgress | null => {
    return progress[postId] || null;
  };

  const clearProgress = (postId: string) => {
    const newProgress = { ...progress };
    delete newProgress[postId];
    setProgress(newProgress);
    localStorage.setItem('video_progress', JSON.stringify(newProgress));
  };

  const clearAllProgress = () => {
    setProgress({});
    localStorage.removeItem('video_progress');
  };

  const getContinueWatching = () => {
    // Return videos with >10% and <90% progress, sorted by timestamp
    return Object.values(progress)
      .filter(p => p.progress > 10 && p.progress < 90)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 8);
  };

  return {
    updateProgress,
    getProgress,
    clearProgress,
    clearAllProgress,
    getContinueWatching
  };
}
