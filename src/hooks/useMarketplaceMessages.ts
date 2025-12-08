import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Message {
  id: string;
  campaign_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export function useMarketplaceMessages(campaignId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: 'Error',
        description: 'Failed to load messages',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (campaignId) {
      fetchMessages();

      // Subscribe to realtime updates
      const channel = supabase
        .channel(`messages-${campaignId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'marketplace_messages',
            filter: `campaign_id=eq.${campaignId}`
          },
          (payload) => {
            setMessages(prev => [...prev, payload.new as Message]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [campaignId]);

  const sendMessage = async (messageText: string) => {
    if (!user || !messageText.trim()) return;

    try {
      const { error } = await supabase
        .from('marketplace_messages')
        .insert({
          campaign_id: campaignId,
          sender_id: user.id,
          message: messageText.trim()
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const markAsRead = async () => {
    if (!user) return;

    try {
      await supabase
        .from('marketplace_messages')
        .update({ is_read: true })
        .eq('campaign_id', campaignId)
        .neq('sender_id', user.id);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    markAsRead,
    refetch: fetchMessages,
  };
}
