import { useEffect, useState } from 'react';
import { Coins, TrendingUp, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function TokenBalanceDisplay() {
  const { balance, lifetimePurchased, lifetimeUsed, isLoading } = useTokenBalance();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!data);
  };

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
    <Card className={`${isCritical && !isAdmin ? 'border-destructive' : isLow && !isAdmin ? 'border-warning' : ''} ${isAdmin ? 'bg-gradient-primary border-violet-500' : ''}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          Token Balance
          {isAdmin && (
            <Badge variant="default" className="ml-auto bg-white/20 text-white">
              <Shield className="h-3 w-3 mr-1" />
              ADMIN
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          {isAdmin ? 'Unlimited access - No charge for all operations' : 'Your available credits for AI operations'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <div className="text-4xl font-bold">∞</div>
                <div className="text-lg text-muted-foreground">Unlimited</div>
              </div>
            ) : (
              <>
                <div className="text-3xl font-bold">{balance}</div>
                <div className="text-sm text-muted-foreground">tokens available</div>
              </>
            )}
          </div>
          {!isAdmin && (isLow || isCritical) && (
            <Button 
              onClick={() => navigate('/upgrade')} 
              variant={isCritical ? "destructive" : "default"}
            >
              Buy Tokens
            </Button>
          )}
        </div>

        {!isAdmin && (
          <>
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
              <div className="text-sm text-destructive font-medium pt-2 border-t flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Critical: You're running low on tokens!
              </div>
            )}
            {isLow && !isCritical && (
              <div className="text-sm text-warning font-medium pt-2 border-t">
                ⚡ Low Balance: Consider purchasing more tokens soon
              </div>
            )}
          </>
        )}

        <Button
          variant={isAdmin ? "secondary" : "outline"}
          className="w-full"
          onClick={() => navigate("/token-history")}
        >
          View Transaction History
        </Button>
      </CardContent>
    </Card>
  );
}

// Compact version for navigation/header
export function TokenBalanceCompact() {
  const { balance, isLoading } = useTokenBalance();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    setIsAdmin(!!data);
  };

  if (isLoading) {
    return <Skeleton className="h-8 w-24" />;
  }

  if (isAdmin) {
    return (
      <Button
        variant="default"
        size="sm"
        onClick={() => navigate("/token-history")}
        className="gap-2 bg-gradient-primary hover:bg-gradient-secondary"
      >
        <Shield className="h-4 w-4" />
        <span className="hidden md:inline">Admin</span>
        <span className="md:hidden">∞</span>
      </Button>
    );
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
