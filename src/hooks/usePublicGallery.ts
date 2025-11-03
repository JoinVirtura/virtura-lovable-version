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
      const { data, error } = await supabase
        .from('avatar_library')
        .select('id, image_url, title, tags, created_at, prompt, is_video, video_url, thumbnail_url, duration')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setItems(data || []);
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
