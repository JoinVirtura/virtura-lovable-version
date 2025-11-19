import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';
import { useAuth } from './useAuth';

interface SchedulePostParams {
  contentType: string;
  caption: string;
  mediaFiles: File[];
  isPaid: boolean;
  priceCents: number;
  scheduledFor: Date;
  platforms: string[];
}

export function useSchedulePost() {
  const { user } = useAuth();
  const [scheduling, setScheduling] = useState(false);

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

  const schedulePost = async (params: SchedulePostParams): Promise<boolean> => {
    if (!user) {
      toast({ title: 'Please sign in to schedule posts', variant: 'destructive' });
      return false;
    }

    setScheduling(true);
    try {
      // Upload media files
      let mediaUrls: string[] = [];
      if (params.mediaFiles && params.mediaFiles.length > 0) {
        mediaUrls = await uploadMedia(params.mediaFiles);
      }

      // Create scheduled post
      const { error } = await supabase
        .from('scheduled_posts')
        .insert({
          user_id: user.id,
          content_type: params.contentType,
          caption: params.caption,
          media_urls: mediaUrls,
          is_paid: params.isPaid,
          price_cents: params.priceCents,
          scheduled_for: params.scheduledFor.toISOString(),
          platforms: params.platforms,
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Post Scheduled',
        description: `Your post will be published on ${params.scheduledFor.toLocaleString()}`,
      });

      return true;
    } catch (error: any) {
      console.error('Error scheduling post:', error);
      toast({
        title: 'Scheduling Failed',
        description: error.message,
        variant: 'destructive',
      });
      return false;
    } finally {
      setScheduling(false);
    }
  };

  return { schedulePost, scheduling };
}
