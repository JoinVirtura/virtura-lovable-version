import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const viewedPosts = new Set<string>();

export function useViewTracking(postId: string, enabled: boolean = true) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !postId || viewedPosts.has(postId)) return;

    const trackView = async () => {
      if (viewedPosts.has(postId)) return;
      
      try {
        viewedPosts.add(postId);
        
        // Generate session ID for anonymous tracking
        let sessionId = sessionStorage.getItem('virtura_session_id');
        if (!sessionId) {
          sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          sessionStorage.setItem('virtura_session_id', sessionId);
        }

        const { data: { session } } = await supabase.auth.getSession();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`;
        }

        await supabase.functions.invoke('track-post-view', {
          body: { post_id: postId, session_id: sessionId },
        });
      } catch (error) {
        console.error('Error tracking view:', error);
        viewedPosts.delete(postId); // Allow retry on error
      }
    };

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            // Post is at least 50% visible
            trackView();
          }
        });
      },
      { threshold: 0.5 }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [postId, enabled]);

  return elementRef;
}
