import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatorEarnings } from '@/hooks/useCreatorEarnings';
import { DollarSign, TrendingUp, Clock, Receipt } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function CreatorEarningsDashboard() {
  const { stats, loading } = useCreatorEarnings();

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

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
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
