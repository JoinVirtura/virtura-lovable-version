import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Earning {
  id: string;
  creator_id: string;
  source_type: string;
  source_id: string | null;
  amount_cents: number;
  creator_amount_cents: number;
  platform_fee_cents: number;
  status: string | null;
  payout_date: string | null;
  stripe_payout_id: string | null;
  metadata: any;
  created_at: string | null;
}

interface EarningsStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidOutEarnings: number;
  totalTransactions: number;
}

export function useCreatorEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidOutEarnings: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get creator account first
      const { data: accountData } = await supabase
        .from('creator_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!accountData) {
        setLoading(false);
        return;
      }

      // Fetch earnings
      const { data, error } = await supabase
        .from('creator_earnings')
        .select('*')
        .eq('creator_id', accountData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setEarnings(data || []);

      // Calculate stats
      const total = data?.reduce((sum, e) => sum + e.creator_amount_cents, 0) || 0;
      const pending = data?.filter(e => e.status === 'pending')
        .reduce((sum, e) => sum + e.creator_amount_cents, 0) || 0;
      const paidOut = data?.filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + e.creator_amount_cents, 0) || 0;

      setStats({
        totalEarnings: total / 100,
        pendingEarnings: pending / 100,
        paidOutEarnings: paidOut / 100,
        totalTransactions: data?.length || 0,
      });
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      toast({
        title: 'Error loading earnings',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, [user]);

  return {
    earnings,
    stats,
    loading,
    refetch: fetchEarnings,
  };
}
