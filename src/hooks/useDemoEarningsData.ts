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
  paid: number;
  pending: number;
}

export interface DemoStats {
  totalEarnings: number;
  pendingEarnings: number;
  paidOutEarnings: number;
  totalTransactions: number;
  projectedMonthly: number;
  grossEarnings: number;
  netEarnings: number;
  platformFees: number;
  timeSeriesData: DemoTimeSeriesData[];
  revenueBySource: {
    source_type: string;
    amount: number;
    count: number;
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
  amount: number;
  status: 'completed' | 'processing' | 'failed';
  date: string;
  transactionCount: number;
  stripePayoutId: string | null;
}

export interface DemoPayoutStats {
  payouts: DemoPayout[];
  totalPayouts: number;
  averagePayoutAmount: number;
}

export interface DemoPost {
  id: string;
  caption: string;
  viewCount: number;
  likeCount: number;
  unlockCount: number;
  revenue: number;
  createdAt: string;
}

export interface DemoContentStats {
  posts: DemoPost[];
  topByRevenue: DemoPost[];
  topByViews: DemoPost[];
  totalViews: number;
  totalLikes: number;
  totalUnlocks: number;
  totalRevenue: number;
  engagementRate: number;
  unlockConversionRate: number;
  revenuePerThousandViews: number;
}

export interface DemoBrandDeal {
  id: string;
  campaign_id: string;
  brand_id: string;
  status: string;
  payment_amount_cents: number;
  creator_payout_cents: number;
  platform_fee_cents: number;
  deadline: string | null;
  created_at: string;
  campaign?: {
    title: string;
    brand?: {
      name: string;
      logo_url: string | null;
    };
  };
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
    const total = subscriptions + tips + ppv + brand_deals;
    const paid = Math.round(total * 0.8);
    const pending = total - paid;
    
    data.push({
      date: date.toISOString().split('T')[0],
      subscriptions,
      tips,
      ppv,
      brand_deals,
      total,
      paid,
      pending,
    });
  }
  
  return data;
};

const generateDemoEarnings = (): DemoEarning[] => {
  const earnings: DemoEarning[] = [];
  const sources = ['creator_subscription', 'creator_tip', 'post_unlock', 'campaign_completion'];
  const statuses = ['pending', 'paid', 'paid', 'paid', 'paid'];
  const now = new Date();
  
  for (let i = 0; i < 50; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const baseAmount = source === 'campaign_completion' ? 25000 : source === 'creator_subscription' ? 999 : 500 + Math.random() * 2000;
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

const generateDemoPayoutStats = (): DemoPayoutStats => {
  const payouts: DemoPayout[] = [];
  const now = new Date();
  
  for (let i = 0; i < 12; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (i * 7 + Math.floor(Math.random() * 3)));
    
    const status: 'completed' | 'processing' | 'failed' = i === 0 ? 'processing' : i === 8 ? 'failed' : 'completed';
    const amount = 50 + Math.random() * 150;
    
    payouts.push({
      id: `demo-payout-${i}`,
      amount,
      status,
      date: date.toISOString(),
      transactionCount: 5 + Math.floor(Math.random() * 15),
      stripePayoutId: status === 'completed' ? `po_demo_${i}` : null,
    });
  }
  
  const completedPayouts = payouts.filter(p => p.status === 'completed');
  const totalAmount = completedPayouts.reduce((sum, p) => sum + p.amount, 0);
  
  return {
    payouts,
    totalPayouts: completedPayouts.length,
    averagePayoutAmount: completedPayouts.length > 0 ? totalAmount / completedPayouts.length : 0,
  };
};

const generateDemoContentStats = (): DemoContentStats => {
  const posts: DemoPost[] = [];
  const now = new Date();
  const captions = [
    'Behind the scenes 🎬',
    'New tutorial coming soon!',
    'Thanks for 10K! 🎉',
    'Check out this exclusive...',
    'Working on something special',
    'Sneak peek 👀',
    'Just dropped! Link in bio',
    'What do you think? 💭',
    'My morning routine',
    'Travel vlog part 2',
    'Unboxing haul 📦',
    'Q&A session recap',
    'Collab announcement!',
    'Life update 💫',
    'This took forever to make...',
  ];
  
  for (let i = 0; i < 20; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));
    
    const viewCount = 1000 + Math.floor(Math.random() * 15000);
    const likeCount = Math.floor(viewCount * (0.03 + Math.random() * 0.08));
    const unlockCount = Math.floor(viewCount * (0.001 + Math.random() * 0.005));
    const revenue = unlockCount * (5 + Math.random() * 10);
    
    posts.push({
      id: `demo-post-${i}`,
      caption: captions[i % captions.length],
      viewCount,
      likeCount,
      unlockCount,
      revenue,
      createdAt: date.toISOString(),
    });
  }
  
  const sortedByRevenue = [...posts].sort((a, b) => b.revenue - a.revenue);
  const sortedByViews = [...posts].sort((a, b) => b.viewCount - a.viewCount);
  
  const totalViews = posts.reduce((sum, p) => sum + p.viewCount, 0);
  const totalLikes = posts.reduce((sum, p) => sum + p.likeCount, 0);
  const totalUnlocks = posts.reduce((sum, p) => sum + p.unlockCount, 0);
  const totalRevenue = posts.reduce((sum, p) => sum + p.revenue, 0);
  
  return {
    posts: posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    topByRevenue: sortedByRevenue.slice(0, 5),
    topByViews: sortedByViews.slice(0, 5),
    totalViews,
    totalLikes,
    totalUnlocks,
    totalRevenue,
    engagementRate: totalViews > 0 ? (totalLikes / totalViews) * 100 : 0,
    unlockConversionRate: totalViews > 0 ? (totalUnlocks / totalViews) * 100 : 0,
    revenuePerThousandViews: totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0,
  };
};

const generateDemoBrandDeals = (): DemoBrandDeal[] => {
  const deals: DemoBrandDeal[] = [];
  const now = new Date();
  
  const campaigns = [
    { title: 'Summer Fashion Campaign', brand: { name: 'StyleCo', logo_url: 'https://logo.clearbit.com/zara.com' } },
    { title: 'Fitness App Promo', brand: { name: 'FitLife', logo_url: 'https://logo.clearbit.com/nike.com' } },
    { title: 'Tech Review Series', brand: { name: 'GadgetHub', logo_url: 'https://logo.clearbit.com/apple.com' } },
    { title: 'Beauty Tutorial Collab', brand: { name: 'GlowUp Beauty', logo_url: 'https://logo.clearbit.com/sephora.com' } },
    { title: 'Gaming Stream Sponsorship', brand: { name: 'GameZone', logo_url: 'https://logo.clearbit.com/twitch.tv' } },
    { title: 'Travel Vlog Feature', brand: { name: 'Wanderlust Travel', logo_url: 'https://logo.clearbit.com/airbnb.com' } },
  ];
  
  const statuses = ['completed', 'completed', 'in_progress', 'signed', 'pending_signatures', 'brand_signed'];
  
  for (let i = 0; i < 6; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));
    
    const paymentAmount = 30000 + Math.floor(Math.random() * 70000); // $300-$1000
    const platformFee = Math.floor(paymentAmount * 0.1);
    const creatorPayout = paymentAmount - platformFee;
    
    deals.push({
      id: `demo-deal-${i}`,
      campaign_id: `demo-campaign-${i}`,
      brand_id: `demo-brand-${i}`,
      status: statuses[i],
      payment_amount_cents: paymentAmount,
      creator_payout_cents: creatorPayout,
      platform_fee_cents: platformFee,
      deadline: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: date.toISOString(),
      campaign: campaigns[i],
    });
  }
  
  return deals.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export function useDemoEarningsData() {
  const data = useMemo(() => {
    const timeSeriesData = generateTimeSeriesData();
    const earnings = generateDemoEarnings();
    const payoutStats = generateDemoPayoutStats();
    const contentStats = generateDemoContentStats();
    const brandDeals = generateDemoBrandDeals();
    
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
      source_type: source,
      amount: data.amount / 100,
      count: data.count,
      percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
    }));
    
    const sourceBreakdown = Array.from(sourceMap.entries()).map(([source, data]) => ({
      source,
      gross: data.gross / 100,
      fees: data.fees / 100,
      net: data.amount / 100,
      count: data.count,
    }));
    
    const grossEarnings = earnings.reduce((sum, e) => sum + e.amount_cents, 0) / 100;
    const platformFees = earnings.reduce((sum, e) => sum + e.platform_fee_cents, 0) / 100;
    const netEarnings = totalEarnings;

    const stats: DemoStats = {
      totalEarnings,
      pendingEarnings,
      paidOutEarnings,
      totalTransactions: earnings.length,
      projectedMonthly,
      grossEarnings,
      netEarnings,
      platformFees,
      timeSeriesData,
      revenueBySource,
      sourceBreakdown,
    };
    
    return { earnings, stats, payoutStats, contentStats, brandDeals };
  }, []);
  
  return {
    ...data,
    loading: false,
    isDemo: true,
  };
}
