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

interface TimeSeriesData {
  date: string;
  total: number;
  pending: number;
  paid: number;
}

interface RevenueBySource {
  source_type: string;
  amount: number;
  count: number;
  percentage: number;
}

interface EarningsStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidOutEarnings: number;
  totalTransactions: number;
  projectedMonthly: number;
  timeSeriesData: TimeSeriesData[];
  revenueBySource: RevenueBySource[];
}

export function useCreatorEarnings() {
  const { user } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    pendingEarnings: 0,
    paidOutEarnings: 0,
    totalTransactions: 0,
    projectedMonthly: 0,
    timeSeriesData: [],
    revenueBySource: [],
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

      // Calculate time series data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const last30Days = data?.filter(e => 
        new Date(e.created_at || '') >= thirtyDaysAgo
      ) || [];

      const dateMap = new Map<string, { total: number; pending: number; paid: number }>();
      last30Days.forEach(e => {
        const date = new Date(e.created_at || '').toISOString().split('T')[0];
        const existing = dateMap.get(date) || { total: 0, pending: 0, paid: 0 };
        existing.total += e.creator_amount_cents;
        if (e.status === 'pending') existing.pending += e.creator_amount_cents;
        if (e.status === 'paid') existing.paid += e.creator_amount_cents;
        dateMap.set(date, existing);
      });

      const timeSeriesData: TimeSeriesData[] = Array.from(dateMap.entries())
        .map(([date, values]) => ({
          date,
          total: values.total / 100,
          pending: values.pending / 100,
          paid: values.paid / 100,
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Calculate revenue by source
      const sourceMap = new Map<string, { amount: number; count: number }>();
      data?.forEach(e => {
        const existing = sourceMap.get(e.source_type) || { amount: 0, count: 0 };
        existing.amount += e.creator_amount_cents;
        existing.count += 1;
        sourceMap.set(e.source_type, existing);
      });

      const revenueBySource: RevenueBySource[] = Array.from(sourceMap.entries())
        .map(([source_type, values]) => ({
          source_type,
          amount: values.amount / 100,
          count: values.count,
          percentage: total > 0 ? (values.amount / total) * 100 : 0,
        }));

      // Calculate projected monthly earnings
      const dailyAverage = last30Days.length > 0 
        ? last30Days.reduce((sum, e) => sum + e.creator_amount_cents, 0) / 30 
        : 0;
      const daysInMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        0
      ).getDate();
      const projectedMonthly = (dailyAverage * daysInMonth) / 100;

      setStats({
        totalEarnings: total / 100,
        pendingEarnings: pending / 100,
        paidOutEarnings: paidOut / 100,
        totalTransactions: data?.length || 0,
        projectedMonthly,
        timeSeriesData,
        revenueBySource,
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
