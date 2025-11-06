import { Coins, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

export function TokenBalanceDisplay() {
  const { balance, lifetimePurchased, lifetimeUsed, isLoading } = useTokenBalance();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  const usagePercentage = lifetimePurchased > 0 
    ? Math.min(100, (lifetimeUsed / lifetimePurchased) * 100)
    : 0;

  const isLow = balance < 10;
  const isCritical = balance < 5;

  return (
    <Card className={isCritical ? 'border-destructive' : isLow ? 'border-warning' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Token Balance
        </CardTitle>
        <CardDescription>
          Your available credits for AI operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl font-bold">{balance}</div>
            <div className="text-sm text-muted-foreground">tokens available</div>
          </div>
          {(isLow || isCritical) && (
            <Button 
              onClick={() => navigate('/upgrade')} 
              variant={isCritical ? "destructive" : "default"}
            >
              Buy Tokens
            </Button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lifetime Usage</span>
            <span className="font-medium">{usagePercentage.toFixed(1)}%</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <TrendingUp className="h-3 w-3" />
              Purchased
            </div>
            <div className="text-lg font-semibold">{lifetimePurchased}</div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <Clock className="h-3 w-3" />
              Used
            </div>
            <div className="text-lg font-semibold">{lifetimeUsed}</div>
          </div>
        </div>

        {isCritical && (
          <div className="text-sm text-destructive font-medium pt-2 border-t">
            ⚠️ Critical: You're running low on tokens!
          </div>
        )}
        {isLow && !isCritical && (
          <div className="text-sm text-warning font-medium pt-2 border-t">
            ⚡ Low Balance: Consider purchasing more tokens soon
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact version for navigation/header
export function TokenBalanceCompact() {
  const { balance, isLoading } = useTokenBalance();
  const navigate = useNavigate();

  if (isLoading) {
    return <Skeleton className="h-8 w-24" />;
  }

  const isLow = balance < 10;
  const isCritical = balance < 5;

  return (
    <Button
      variant={isCritical ? "destructive" : isLow ? "secondary" : "outline"}
      size="sm"
      onClick={() => navigate('/upgrade')}
      className="gap-2"
    >
      <Coins className="h-4 w-4" />
      <span className="font-semibold">{balance}</span>
      <span className="text-xs opacity-75">tokens</span>
    </Button>
  );
}
