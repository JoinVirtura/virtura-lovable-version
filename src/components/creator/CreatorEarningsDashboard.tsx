import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, Clock, Receipt, Target } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreatorEarningsDashboardProps {
  stats?: {
    totalEarnings: number;
    pendingEarnings: number;
    paidOutEarnings: number;
    totalTransactions: number;
    projectedMonthly: number;
    timeSeriesData: any[];
  };
  loading?: boolean;
}

export function CreatorEarningsDashboard({ stats, loading }: CreatorEarningsDashboardProps) {
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendIndicator = () => {
    const last7Days = stats.timeSeriesData.slice(-7);
    const prev7Days = stats.timeSeriesData.slice(-14, -7);
    
    if (last7Days.length === 0 || prev7Days.length === 0) return '→';
    
    const lastWeekAvg = last7Days.reduce((sum, d) => sum + d.total, 0) / last7Days.length;
    const prevWeekAvg = prev7Days.reduce((sum, d) => sum + d.total, 0) / prev7Days.length;
    
    if (lastWeekAvg > prevWeekAvg * 1.05) return '↑';
    if (lastWeekAvg < prevWeekAvg * 0.95) return '↓';
    return '→';
  };

  const statCards = [
    {
      title: 'Total Earnings',
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      description: 'All-time earnings',
    },
    {
      title: 'Pending',
      value: `$${stats.pendingEarnings.toFixed(2)}`,
      icon: Clock,
      description: 'Awaiting payout',
    },
    {
      title: 'Paid Out',
      value: `$${stats.paidOutEarnings.toFixed(2)}`,
      icon: TrendingUp,
      description: 'Successfully transferred',
    },
    {
      title: 'Transactions',
      value: stats.totalTransactions.toString(),
      icon: Receipt,
      description: 'Total transactions',
    },
    {
      title: 'Projected Monthly',
      value: stats.timeSeriesData.length > 7 ? `$${stats.projectedMonthly.toFixed(2)}` : 'N/A',
      icon: Target,
      description: stats.timeSeriesData.length > 7 
        ? `Based on last 30 days ${getTrendIndicator()}` 
        : 'Insufficient data',
      tooltip: 'Projected earnings for current month based on your last 30 days average daily earnings',
    },
  ];

  return (
    <TooltipProvider>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="pt-6">
              <div className="flex flex-row items-center justify-between pb-2">
                {stat.tooltip ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <CardTitle className="text-sm font-medium cursor-help">{stat.title}</CardTitle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                )}
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </TooltipProvider>
  );
}
