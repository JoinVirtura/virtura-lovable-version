import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const PULL_THRESHOLD = 100;
  const MAX_PULL_DISTANCE = 150;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (container.scrollTop === 0) {
        setStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (startY === 0 || container.scrollTop > 0 || isRefreshing) return;

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0) {
        e.preventDefault();
        const dampedDistance = Math.min(distance * 0.5, MAX_PULL_DISTANCE);
        setPullDistance(dampedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
        setIsRefreshing(true);
        try {
          await onRefresh();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        setPullDistance(0);
      }
      setStartY(0);
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startY, pullDistance, isRefreshing, onRefresh]);

  const shouldTrigger = pullDistance >= PULL_THRESHOLD;
  const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);

  return (
    <div ref={containerRef} className="relative overflow-y-auto h-full">
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 flex justify-center items-center z-50"
            style={{ height: pullDistance }}
          >
            <div className="flex flex-col items-center gap-2">
              <motion.div
                animate={{
                  rotate: isRefreshing ? 360 : pullProgress * 360,
                  scale: isRefreshing ? 1 : 0.8 + pullProgress * 0.2,
                }}
                transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
                className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl ${
                  shouldTrigger ? 'bg-violet-500/30 border-violet-500' : 'bg-primary/20 border-primary/30'
                } border-2`}
              >
                <RefreshCw className={`w-5 h-5 ${shouldTrigger ? 'text-violet-400' : 'text-primary'}`} />
              </motion.div>
              <p className="text-xs font-medium text-muted-foreground">
                {isRefreshing ? 'Refreshing...' : shouldTrigger ? 'Release to refresh' : 'Pull to refresh'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ paddingTop: pullDistance }}>
        {children}
      </div>
    </div>
  );
}
