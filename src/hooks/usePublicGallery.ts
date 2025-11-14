import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GalleryItem {
  id: string;
  image_url: string;
  title: string | null;
  tags: string[] | null;
  created_at: string;
  prompt: string;
  is_video: boolean;
  video_url?: string | null;
  thumbnail_url?: string | null;
  duration?: number | null;
}

export const usePublicGallery = (limit: number = 100) => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadGalleryItems();
  }, [limit]);

  const loadGalleryItems = async () => {
    try {
      setLoading(true);
      
      // First, get showcase images (always prioritized)
      const { data: showcaseData, error: showcaseError } = await supabase
        .from('avatar_library')
        .select('id, image_url, title, tags, created_at, prompt, is_video, video_url, thumbnail_url, duration')
        .contains('tags', ['showcase'])
        .eq('is_video', false)
        .order('created_at', { ascending: false })
        .limit(12);

      if (showcaseError) throw showcaseError;

      const showcaseItems = showcaseData || [];
      
      // If we have less than 12 showcase images, fill with recent public images
      if (showcaseItems.length < limit) {
        const { data: recentData, error: recentError } = await supabase
          .from('avatar_library')
          .select('id, image_url, title, tags, created_at, prompt, is_video, video_url, thumbnail_url, duration')
          .eq('is_video', false)
          .order('created_at', { ascending: false })
          .limit(limit - showcaseItems.length);

        if (recentError) throw recentError;

        // Combine showcase + recent, avoiding duplicates
        const showcaseIds = new Set(showcaseItems.map(item => item.id));
        const recentFiltered = (recentData || []).filter(item => !showcaseIds.has(item.id));
        
        setItems([...showcaseItems, ...recentFiltered]);
      } else {
        setItems(showcaseItems);
      }
      
    } catch (error: any) {
      console.error('Error loading gallery items:', error);
      toast({
        title: "Error loading gallery",
        description: error.message,
        variant: "destructive",
      });
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    loading,
    refresh: loadGalleryItems,
  };
};
