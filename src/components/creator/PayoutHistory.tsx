import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePayoutHistory } from '@/hooks/usePayoutHistory';
import { Download, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export function PayoutHistory() {
  const { stats, loading } = usePayoutHistory();

  const handleExport = () => {
    const csv = [
      'Date,Amount,Status,Transactions,Stripe ID',
      ...stats.payouts.map(p => 
        `${p.date},${p.amount.toFixed(2)},${p.status},${p.transactionCount},${p.stripePayoutId || 'N/A'}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payout-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            {stats.payouts.length} total payouts • Avg: ${stats.averagePayoutAmount.toFixed(2)}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={stats.payouts.length === 0}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        {stats.payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No payouts yet. Keep earning and your first payout will appear here!
          </div>
        ) : (
          <div className="space-y-3">
            {stats.payouts.slice(0, 10).map((payout) => (
              <div 
                key={payout.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="font-medium">
                      {payout.date ? format(new Date(payout.date), 'MMM d, yyyy') : 'Unknown date'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {payout.transactionCount} transaction{payout.transactionCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {getStatusBadge(payout.status)}
                  <div className="text-right">
                    <div className="font-bold text-lg">${payout.amount.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
            {stats.payouts.length > 10 && (
              <div className="text-center text-sm text-muted-foreground pt-2">
                Showing 10 of {stats.payouts.length} payouts
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
