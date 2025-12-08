import { useMemo } from 'react';

export interface DemoEarning {
  id: string;
  amount_cents: number;
  creator_amount_cents: number;
  platform_fee_cents: number;
  source_type: string;
  status: string;
  created_at: string;
  payout_date: string | null;
  metadata: Record<string, unknown>;
}

export interface DemoTimeSeriesData {
  date: string;
  subscriptions: number;
  tips: number;
  ppv: number;
  brand_deals: number;
  total: number;
}

export interface DemoStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidOutEarnings: number;
  totalTransactions: number;
  projectedMonthly: number;
  timeSeriesData: DemoTimeSeriesData[];
  revenueBySource: {
    source: string;
    amount: number;
    percentage: number;
  }[];
  sourceBreakdown: {
    source: string;
    gross: number;
    fees: number;
    net: number;
    count: number;
  }[];
}

export interface DemoPayout {
  id: string;
  amount_cents: number;
  status: 'completed' | 'processing' | 'failed';
  created_at: string;
  transaction_count: number;
}

const generateTimeSeriesData = (): DemoTimeSeriesData[] => {
  const data: DemoTimeSeriesData[] = [];
  const now = new Date();
  
  for (let i = 89; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
    
    const subscriptions = Math.round((15 + Math.random() * 25) * weekendMultiplier);
    const tips = Math.round((5 + Math.random() * 15) * weekendMultiplier);
    const ppv = Math.round((10 + Math.random() * 20) * weekendMultiplier);
    const brand_deals = i % 14 === 0 ? Math.round(200 + Math.random() * 300) : 0;
    
    data.push({
      date: date.toISOString().split('T')[0],
      subscriptions,
      tips,
      ppv,
      brand_deals,
      total: subscriptions + tips + ppv + brand_deals,
    });
  }
  
  return data;
};

const generateDemoEarnings = (): DemoEarning[] => {
  const earnings: DemoEarning[] = [];
  const sources = ['creator_subscription', 'tip', 'content_unlock', 'brand_deal'];
  const statuses = ['pending', 'paid', 'paid', 'paid', 'paid'];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const baseAmount = source === 'brand_deal' ? 25000 : source === 'creator_subscription' ? 999 : 500 + Math.random() * 2000;
    const amount_cents = Math.round(baseAmount);
    const platform_fee_cents = Math.round(amount_cents * 0.1);
    const creator_amount_cents = amount_cents - platform_fee_cents;
    
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    earnings.push({
      id: `demo-earning-${i}`,
      amount_cents,
      creator_amount_cents,
      platform_fee_cents,
      source_type: source,
      status,
      created_at: date.toISOString(),
      payout_date: status === 'paid' ? new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
      metadata: { demo: true },
    });
  }
  
  return earnings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

const generateDemoPayouts = (): DemoPayout[] => {
  const payouts: DemoPayout[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7 + Math.floor(Math.random() * 3)));
    
    const status: 'completed' | 'processing' | 'failed' = i === 0 ? 'processing' : i === 8 ? 'failed' : 'completed';
    
    payouts.push({
      id: `demo-payout-${i}`,
      amount_cents: 5000 + Math.round(Math.random() * 15000),
      status,
      created_at: date.toISOString(),
      transaction_count: 5 + Math.floor(Math.random() * 15),
    });
  }
  
  return payouts;
};

export function useDemoEarningsData() {
  const data = useMemo(() => {
    const timeSeriesData = generateTimeSeriesData();
    const earnings = generateDemoEarnings();
    const payouts = generateDemoPayouts();
    
    const totalEarnings = earnings.reduce((sum, e) => sum + e.creator_amount_cents, 0) / 100;
    const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.creator_amount_cents, 0) / 100;
    const paidOutEarnings = earnings.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.creator_amount_cents, 0) / 100;
    
    const last30Days = timeSeriesData.slice(-30);
    const dailyAvg = last30Days.reduce((sum, d) => sum + d.total, 0) / 30;
    const projectedMonthly = dailyAvg * 30;
    
    const sourceMap = new Map<string, { amount: number; count: number; gross: number; fees: number }>();
    earnings.forEach(e => {
      const existing = sourceMap.get(e.source_type) || { amount: 0, count: 0, gross: 0, fees: 0 };
      sourceMap.set(e.source_type, {
        amount: existing.amount + e.creator_amount_cents,
        count: existing.count + 1,
        gross: existing.gross + e.amount_cents,
        fees: existing.fees + e.platform_fee_cents,
      });
    });
    
    const totalAmount = earnings.reduce((sum, e) => sum + e.creator_amount_cents, 0);
    const revenueBySource = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      amount: data.amount / 100,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }));
    
    const sourceBreakdown = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      gross: data.gross / 100,
      fees: data.fees / 100,
      net: data.amount / 100,
      count: data.count,
    }));
    
    const stats: DemoStats = {
      totalEarnings,
      pendingEarnings,
      paidOutEarnings,
      totalTransactions: earnings.length,
      projectedMonthly,
      timeSeriesData,
      revenueBySource,
      sourceBreakdown,
    };
    
    return { earnings, stats, payouts };
  }, []);
  
  return {
    ...data,
    loading: false,
    isDemo: true,
  };
}
