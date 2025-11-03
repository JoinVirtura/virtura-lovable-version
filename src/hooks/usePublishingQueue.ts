import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PublishingQueueItem {
  id: string;
  content_id: string;
  brand_id: string;
  platform: string;
  scheduled_time: string;
  status: string;
  retry_count: number;
  published_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export function usePublishingQueue() {
  const [queueItems, setQueueItems] = useState<PublishingQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const loadQueue = useCallback(async (brandId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('publishing_queue')
        .select('*')
        .eq('brand_id', brandId)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;
      setQueueItems(data || []);
    } catch (error) {
      console.error('Error loading publishing queue:', error);
      toast.error('Failed to load publishing queue');
    } finally {
      setLoading(false);
    }
  }, []);

  const addToQueue = useCallback(async (data: {
    content_id: string;
    brand_id: string;
    platform: string;
    scheduled_time: string;
  }) => {
    try {
      const { data: newItem, error } = await supabase
        .from('publishing_queue')
        .insert({
          content_id: data.content_id,
          brand_id: data.brand_id,
          platform: data.platform,
          scheduled_time: data.scheduled_time,
          status: 'queued',
        })
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Content added to publishing queue');
      return newItem;
    } catch (error) {
      console.error('Error adding to queue:', error);
      toast.error('Failed to add content to queue');
      throw error;
    }
  }, []);

  const updateQueueItem = useCallback(async (
    id: string,
    updates: Partial<PublishingQueueItem>
  ) => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Queue item updated');
    } catch (error) {
      console.error('Error updating queue item:', error);
      toast.error('Failed to update queue item');
      throw error;
    }
  }, []);

  const retryPublish = useCallback(async (id: string) => {
    try {
      // Get current retry count
      const { data: item } = await supabase
        .from('publishing_queue')
        .select('retry_count')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('publishing_queue')
        .update({
          status: 'queued',
          retry_count: (item?.retry_count || 0) + 1,
          error_message: null,
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Publish retry queued');
    } catch (error) {
      console.error('Error retrying publish:', error);
      toast.error('Failed to retry publish');
      throw error;
    }
  }, []);

  const deleteQueueItem = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('publishing_queue')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Queue item removed');
    } catch (error) {
      console.error('Error deleting queue item:', error);
      toast.error('Failed to remove queue item');
      throw error;
    }
  }, []);

  const publishNow = useCallback(async (contentId: string, platform: string) => {
    try {
      // Here you would integrate with actual platform APIs
      // For now, we'll simulate the publish
      toast.success(`Publishing to ${platform}...`);
      
      // Update content status
      const { error } = await supabase
        .from('campaign_content')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
        })
        .eq('id', contentId);

      if (error) throw error;
      
      toast.success(`Successfully published to ${platform}`);
    } catch (error) {
      console.error('Error publishing now:', error);
      toast.error('Failed to publish content');
      throw error;
    }
  }, []);

  return {
    queueItems,
    loading,
    loadQueue,
    addToQueue,
    updateQueueItem,
    retryPublish,
    deleteQueueItem,
    publishNow,
  };
}
