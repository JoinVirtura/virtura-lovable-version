import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'processing' | 'failed';
  stripePayoutId: string | null;
  transactionCount: number;
}

interface PayoutHistoryStats {
  payouts: Payout[];
  totalPaidOut: number;
  averagePayoutAmount: number;
  lastPayoutDate: string | null;
}

export function usePayoutHistory() {
  const { user } = useAuth();
  const [stats, setStats] = useState<PayoutHistoryStats>({
    payouts: [],
    totalPaidOut: 0,
    averagePayoutAmount: 0,
    lastPayoutDate: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayoutHistory = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: accountData } = await supabase
          .from('creator_accounts')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (!accountData) {
          setLoading(false);
          return;
        }

        // Get completed earnings grouped by payout
        const { data: earnings, error } = await supabase
          .from('creator_earnings')
          .select('*')
          .eq('creator_id', accountData.id)
          .eq('status', 'paid')
          .not('payout_date', 'is', null)
          .order('payout_date', { ascending: false });

        if (error) throw error;

        // Group by payout_date and stripe_payout_id
        const payoutMap = new Map<string, Payout>();
        
        earnings?.forEach(e => {
          const key = e.stripe_payout_id || e.payout_date || '';
          const existing = payoutMap.get(key);
          
          if (existing) {
            existing.amount += e.creator_amount_cents / 100;
            existing.transactionCount += 1;
          } else {
            payoutMap.set(key, {
              id: e.stripe_payout_id || e.id,
              date: e.payout_date || '',
              amount: e.creator_amount_cents / 100,
              status: 'completed',
              stripePayoutId: e.stripe_payout_id,
              transactionCount: 1,
            });
          }
        });

        const payouts = Array.from(payoutMap.values());
        const totalPaidOut = payouts.reduce((sum, p) => sum + p.amount, 0);
        
        setStats({
          payouts,
          totalPaidOut,
          averagePayoutAmount: payouts.length > 0 ? totalPaidOut / payouts.length : 0,
          lastPayoutDate: payouts[0]?.date || null,
        });
      } catch (error) {
        console.error('Error fetching payout history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayoutHistory();
  }, [user]);

  return { stats, loading };
}
