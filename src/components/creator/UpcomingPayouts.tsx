import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Calendar, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, nextFriday, addDays } from 'date-fns';

const MINIMUM_THRESHOLD = 10; // $10 minimum payout
const PLATFORM_FEE_RATE = 0.10; // 10%

interface UpcomingPayoutsProps {
  stats?: {
    pendingEarnings: number;
    totalEarnings: number;
    revenueBySource: { source_type: string; amount: number }[];
  };
  loading?: boolean;
}

export function UpcomingPayouts({ stats, loading }: UpcomingPayoutsProps) {
  if (loading || !stats) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-56 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  const pendingAmount = stats.pendingEarnings;
  const netPending = pendingAmount * (1 - PLATFORM_FEE_RATE);
  const progressToThreshold = Math.min((netPending / MINIMUM_THRESHOLD) * 100, 100);
  const meetsThreshold = netPending >= MINIMUM_THRESHOLD;
  
  // Next Friday payout date
  const nextPayoutDate = nextFriday(new Date());
  const estimatedArrival = addDays(nextPayoutDate, 3); // 2-3 business days

  // Breakdown by source from pending earnings
  const pendingBySource = stats.revenueBySource.map(source => ({
    type: source.source_type,
    amount: source.amount * (stats.pendingEarnings / stats.totalEarnings || 0),
  })).filter(s => s.amount > 0);

  const sourceLabels: Record<string, string> = {
    creator_subscription: 'Subscriptions',
    creator_tip: 'Tips',
    post_unlock: 'Pay-Per-View',
    campaign_completion: 'Brand Deals',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Upcoming Payout
        </CardTitle>
        <CardDescription>
          Next payout scheduled for {format(nextPayoutDate, 'EEEE, MMMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main payout amount */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Estimated Payout</div>
              <div className="text-3xl font-bold mt-1">${netPending.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                After 10% platform fee (Gross: ${pendingAmount.toFixed(2)})
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Arrives by</div>
              <div className="text-lg font-semibold">{format(estimatedArrival, 'MMM d')}</div>
            </div>
          </div>
        </div>

        {/* Threshold progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress to minimum (${MINIMUM_THRESHOLD})</span>
            <span className={meetsThreshold ? 'text-green-500 font-medium' : 'text-muted-foreground'}>
              {meetsThreshold ? 'Ready for payout!' : `${progressToThreshold.toFixed(0)}%`}
            </span>
          </div>
          <Progress value={progressToThreshold} className="h-2" />
          {!meetsThreshold && (
            <p className="text-xs text-muted-foreground">
              ${(MINIMUM_THRESHOLD - netPending).toFixed(2)} more needed to reach minimum threshold
            </p>
          )}
        </div>

        {/* Sources breakdown */}
        {pendingBySource.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Included in this payout</div>
            <div className="space-y-1">
              {pendingBySource.map((source) => (
                <div 
                  key={source.type}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="text-muted-foreground">
                    {sourceLabels[source.type] || source.type}
                  </span>
                  <span className="font-medium">${source.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Timeline */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Payout</span>
            <ArrowRight className="w-4 h-4" />
            <span>Processing (1-2 days)</span>
            <ArrowRight className="w-4 h-4" />
            <span>Bank (1-3 days)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
