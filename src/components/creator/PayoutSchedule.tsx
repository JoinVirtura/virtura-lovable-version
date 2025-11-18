import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCreatorAccount } from '@/hooks/useCreatorAccount';
import { useCreatorEarnings } from '@/hooks/useCreatorEarnings';
import { Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function PayoutSchedule() {
  const { account, getDashboardLink } = useCreatorAccount();
  const { stats, loading } = useCreatorEarnings();

  const handleOpenDashboard = async () => {
    try {
      const url = await getDashboardLink();
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error opening dashboard:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Schedule</CardTitle>
        <CardDescription>
          Your earnings are automatically transferred to your bank account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Pending Balance</span>
            </div>
            <div className="text-2xl font-bold">
              ${stats.pendingEarnings.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Will be paid out in the next cycle
            </p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium">Payout Frequency</span>
            </div>
            <div className="text-2xl font-bold">Weekly</div>
            <p className="text-xs text-muted-foreground mt-1">
              Every Friday, pending minimum threshold
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Payout Information</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Minimum payout threshold: $10.00</li>
              <li>• Platform fee: {account?.platform_fee_percentage || 20}%</li>
              <li>• Processing time: 2-7 business days</li>
              <li>• Payment method configured in Stripe</li>
            </ul>
          </div>

          <Button 
            onClick={handleOpenDashboard}
            variant="outline" 
            className="w-full mt-4"
          >
            Manage Payout Settings
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
