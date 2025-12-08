import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface CampaignInvite {
  id: string;
  campaign_id: string;
  brand_id: string;
  creator_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  message: string | null;
  invited_at: string;
  responded_at: string | null;
  expires_at: string;
  campaign?: {
    id: string;
    title: string;
    description: string;
    budget_cents: number;
    deadline: string;
  };
  brand?: {
    id: string;
    name: string;
    logo_url: string;
  };
}

export function useCreatorInvites() {
  const { user } = useAuth();
  const [invites, setInvites] = useState<CampaignInvite[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInvites = useCallback(async () => {
    if (!user) return;
    
    try {
      // First get creator account
      const { data: creatorAccount } = await supabase
        .from('creator_accounts')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (!creatorAccount) {
        setInvites([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('campaign_invites')
        .select(`
          *,
          campaign:marketplace_campaigns(id, title, description, budget_cents, deadline),
          brand:brands(id, name, logo_url)
        `)
        .eq('creator_id', creatorAccount.id)
        .order('invited_at', { ascending: false });

      if (error) throw error;
      setInvites((data as unknown as CampaignInvite[]) || []);
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const respondToInvite = async (inviteId: string, accept: boolean) => {
    try {
      const { error } = await supabase
        .from('campaign_invites')
        .update({
          status: accept ? 'accepted' : 'declined',
          responded_at: new Date().toISOString(),
        })
        .eq('id', inviteId);

      if (error) throw error;
      
      toast.success(accept ? 'Invitation accepted!' : 'Invitation declined');
      fetchInvites();
      return true;
    } catch (error) {
      console.error('Error responding to invite:', error);
      toast.error('Failed to respond to invitation');
      return false;
    }
  };

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const pendingCount = invites.filter(i => i.status === 'pending').length;

  return {
    invites,
    loading,
    pendingCount,
    respondToInvite,
    refetch: fetchInvites,
  };
}

export function useSendInvite() {
  const [sending, setSending] = useState(false);

  const sendInvite = async (campaignId: string, creatorId: string, message?: string) => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('invite-creator-to-campaign', {
        body: { campaignId, creatorId, message },
      });

      if (error) throw error;
      
      toast.success('Invitation sent successfully!');
      return { success: true, data };
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invitation');
      return { success: false, error };
    } finally {
      setSending(false);
    }
  };

  return { sendInvite, sending };
}
