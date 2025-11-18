import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Payment {
  id: string;
  campaign_id: string;
  creator_id: string;
  brand_id: string;
  total_amount_cents: number;
  creator_amount_cents: number;
  platform_fee_cents: number;
  status: string | null;
  stripe_payment_intent_id: string | null;
  stripe_transfer_id: string | null;
  paid_at: string | null;
  created_at: string | null;
}

export function useMarketplacePayments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get creator account
      const { data: creatorAccount } = await supabase
        .from('creator_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!creatorAccount) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('marketplace_payments')
        .select('*')
        .eq('creator_id', creatorAccount.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPayments(data || []);
    } catch (error: any) {
      console.error('Error fetching payments:', error);
      toast({
        title: 'Error loading payments',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const submitDeliverable = async (deliverableData: {
    campaign_id: string;
    asset_id: string;
    deliverable_type: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('submit-deliverable', {
        body: deliverableData,
      });

      if (error) throw error;

      toast({
        title: 'Deliverable submitted',
        description: 'The brand has been notified to review your work',
      });

      return data;
    } catch (error: any) {
      console.error('Error submitting deliverable:', error);
      toast({
        title: 'Error submitting deliverable',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const approveDeliverable = async (deliverableId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('approve-deliverable-payment', {
        body: { deliverable_id: deliverableId },
      });

      if (error) throw error;

      toast({
        title: 'Payment released',
        description: 'The creator has been paid',
      });

      fetchPayments();
      return data;
    } catch (error: any) {
      console.error('Error approving deliverable:', error);
      toast({
        title: 'Error releasing payment',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    payments,
    loading,
    refetch: fetchPayments,
    submitDeliverable,
    approveDeliverable,
  };
}
