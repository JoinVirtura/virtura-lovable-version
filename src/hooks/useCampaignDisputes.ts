import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export type DisputeType = 'deliverable_quality' | 'payment_issue' | 'deadline_missed' | 'communication' | 'scope_disagreement' | 'other';
export type DisputeStatus = 'open' | 'under_review' | 'resolved_brand_favor' | 'resolved_creator_favor' | 'resolved_mutual' | 'closed';
export type DisputePriority = 'low' | 'medium' | 'high' | 'critical';

export interface CampaignDispute {
  id: string;
  campaign_id: string;
  raised_by_user_id: string;
  raised_by_type: 'brand' | 'creator';
  dispute_type: DisputeType;
  subject: string;
  description: string;
  evidence_urls: string[];
  status: DisputeStatus;
  priority: DisputePriority;
  admin_id: string | null;
  admin_notes: string | null;
  resolution_summary: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface DisputeMessage {
  id: string;
  dispute_id: string;
  user_id: string;
  message: string;
  is_admin: boolean;
  attachments: string[];
  created_at: string;
}

export function useCampaignDisputes(campaignId?: string) {
  const { user } = useAuth();
  const [disputes, setDisputes] = useState<CampaignDispute[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDisputes = useCallback(async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('campaign_disputes')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;
      setDisputes((data as CampaignDispute[]) || []);
    } catch (error) {
      console.error('Error fetching disputes:', error);
    } finally {
      setLoading(false);
    }
  }, [user, campaignId]);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const raiseDispute = async (data: {
    campaignId: string;
    disputeType: DisputeType;
    subject: string;
    description: string;
    evidenceUrls?: string[];
    raisedByType: 'brand' | 'creator';
  }) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('campaign_disputes')
        .insert({
          campaign_id: data.campaignId,
          raised_by_user_id: user.id,
          raised_by_type: data.raisedByType,
          dispute_type: data.disputeType,
          subject: data.subject,
          description: data.description,
          evidence_urls: data.evidenceUrls || [],
        });

      if (error) throw error;
      toast.success('Dispute raised successfully. Our team will review it shortly.');
      fetchDisputes();
      return { success: true };
    } catch (error) {
      console.error('Error raising dispute:', error);
      toast.error('Failed to raise dispute');
      return { success: false, error };
    }
  };

  const openCount = disputes.filter(d => d.status === 'open' || d.status === 'under_review').length;

  return {
    disputes,
    loading,
    openCount,
    raiseDispute,
    refetch: fetchDisputes,
  };
}

export function useDisputeMessages(disputeId: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<DisputeMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!disputeId) return;

    try {
      const { data, error } = await supabase
        .from('dispute_messages')
        .select('*')
        .eq('dispute_id', disputeId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as DisputeMessage[]) || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [disputeId]);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel(`dispute-messages-${disputeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dispute_messages',
          filter: `dispute_id=eq.${disputeId}`,
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as DisputeMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disputeId, fetchMessages]);

  const sendMessage = async (message: string, attachments?: string[]) => {
    if (!user) return { success: false };

    try {
      const { error } = await supabase
        .from('dispute_messages')
        .insert({
          dispute_id: disputeId,
          user_id: user.id,
          message,
          attachments: attachments || [],
          is_admin: false, // Will be set by RLS/trigger for actual admins
        });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return { success: false, error };
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    refetch: fetchMessages,
  };
}
