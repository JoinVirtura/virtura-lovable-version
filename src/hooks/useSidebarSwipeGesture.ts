import { useEffect, useRef } from 'react';
import { useSidebar } from '@/components/ui/sidebar';

export function useSidebarSwipeGesture() {
  const { open, setOpen } = useSidebar();
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      
      // Only track swipes from left edge when closed
      if (!open && touchStartX.current < 50) {
        isSwiping.current = true;
      }
      // Track swipes anywhere when open
      else if (open) {
        isSwiping.current = true;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isSwiping.current) return;
      
      touchEndX.current = e.touches[0].clientX;
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);
      
      // Prevent default if horizontal swipe (not vertical scroll)
      if (Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      if (!isSwiping.current) return;
      
      const deltaX = touchEndX.current - touchStartX.current;
      const deltaY = Math.abs(touchEndX.current - touchStartY.current);
      
      // Minimum swipe distance
      const minSwipeDistance = 80;
      
      // Ensure horizontal swipe (not vertical)
      if (Math.abs(deltaX) > deltaY) {
        // Swipe right from left edge to open
        if (!open && deltaX > minSwipeDistance && touchStartX.current < 50) {
          setOpen(true);
        }
        // Swipe left to close
        else if (open && deltaX < -minSwipeDistance) {
          setOpen(false);
        }
      }
      
      isSwiping.current = false;
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchEndX.current = 0;
    };

    // Only add listeners on mobile
    if (window.innerWidth < 768) {
      document.addEventListener('touchstart', handleTouchStart, { passive: false });
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('touchstart', handleTouchStart);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [open, setOpen]);
}
