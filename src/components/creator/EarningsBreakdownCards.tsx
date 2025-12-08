import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Heart, Unlock, Handshake } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RevenueBySource {
  source_type: string;
  amount: number;
  count: number;
  percentage: number;
}

interface Stats {
  revenueBySource: RevenueBySource[];
}

interface EarningsBreakdownCardsProps {
  stats: Stats;
  loading: boolean;
}

const sourceTypeConfig: Record<string, { label: string; icon: typeof CreditCard; color: string }> = {
  creator_subscription: { label: 'Subscriptions', icon: CreditCard, color: 'text-blue-500' },
  creator_tip: { label: 'Tips', icon: Heart, color: 'text-pink-500' },
  post_unlock: { label: 'Pay-Per-View', icon: Unlock, color: 'text-purple-500' },
  campaign_completion: { label: 'Brand Deals', icon: Handshake, color: 'text-green-500' },
};

export function EarningsBreakdownCards({ stats, loading }: EarningsBreakdownCardsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-3 w-20 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const platformFeeRate = 0.10; // 10% platform fee

  // Build breakdown from revenueBySource
  const breakdownCards = Object.entries(sourceTypeConfig).map(([sourceType, config]) => {
    const sourceData = stats.revenueBySource.find(s => s.source_type === sourceType);
    const gross = sourceData?.amount || 0;
    const fee = gross * platformFeeRate;
    const net = gross - fee;
    const count = sourceData?.count || 0;
    const percentage = sourceData?.percentage || 0;

    return {
      sourceType,
      ...config,
      gross,
      fee,
      net,
      count,
      percentage,
    };
  });

  const totalGross = breakdownCards.reduce((sum, c) => sum + c.gross, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Earnings Breakdown</h3>
        <span className="text-sm text-muted-foreground">10% platform fee applied</span>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {breakdownCards.map((card) => {
          const Icon = card.icon;
          const percentOfTotal = totalGross > 0 ? (card.gross / totalGross) * 100 : 0;
          
          return (
            <Card key={card.sourceType} className="relative overflow-hidden">
              <div 
                className="absolute bottom-0 left-0 h-1 bg-primary/20"
                style={{ width: `${percentOfTotal}%` }}
              />
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                  {card.label}
                </CardTitle>
                <span className="text-xs text-muted-foreground">
                  {percentOfTotal.toFixed(0)}%
                </span>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-2xl font-bold">
                  ${card.net.toFixed(2)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Gross: ${card.gross.toFixed(2)}</span>
                  <span className="text-destructive">-${card.fee.toFixed(2)}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {card.count} transaction{card.count !== 1 ? 's' : ''}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
