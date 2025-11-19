import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function useCreatePost() {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const uploadMedia = async (files: File[]): Promise<string[]> => {
    if (!user) throw new Error('Not authenticated');

    const uploadPromises = files.map(async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('social-media')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('social-media')
        .getPublicUrl(data.path);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const createPost = async (params: {
    contentType: 'image' | 'video' | 'text' | 'carousel';
    caption: string;
    mediaFiles?: File[];
    isPaid: boolean;
    priceCents?: number;
    isAiGenerated?: boolean;
    scheduledFor?: Date;
  }) => {
    if (!user) {
      toast({ title: 'Please sign in to create posts', variant: 'destructive' });
      return false;
    }

    setUploading(true);
    try {
      let mediaUrls: string[] = [];
      
      if (params.mediaFiles && params.mediaFiles.length > 0) {
        mediaUrls = await uploadMedia(params.mediaFiles);
      }

      const { error } = await supabase.functions.invoke('create-post', {
        body: {
          content_type: params.contentType,
          caption: params.caption,
          media_urls: mediaUrls,
          is_paid: params.isPaid,
          price_cents: params.priceCents || 0,
          is_ai_generated: params.isAiGenerated || false,
          scheduled_for: params.scheduledFor?.toISOString()
        }
      });

      if (error) throw error;

      toast({ 
        title: params.scheduledFor ? 'Post scheduled successfully' : 'Post created successfully' 
      });
      return true;
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({ 
        title: 'Failed to create post', 
        description: error.message,
        variant: 'destructive' 
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return {
    createPost,
    uploading
  };
}
