import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreatorEarnings } from '@/hooks/useCreatorEarnings';
import { Download, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export function TransactionHistory() {
  const { earnings, loading } = useCreatorEarnings();
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const filteredEarnings = earnings.filter((earning) => {
    if (filter === 'all') return true;
    return earning.status === filter;
  });

  const handleExport = () => {
    const csv = [
      ['Date', 'Type', 'Amount', 'Fee', 'Net', 'Status'].join(','),
      ...filteredEarnings.map((e) =>
        [
          format(new Date(e.created_at!), 'yyyy-MM-dd'),
          e.source_type,
          (e.amount_cents / 100).toFixed(2),
          (e.platform_fee_cents / 100).toFixed(2),
          (e.creator_amount_cents / 100).toFixed(2),
          e.status,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              View all your earnings and transactions
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="space-y-3">
            {filteredEarnings.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              filteredEarnings.map((earning) => (
                <div
                  key={earning.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium capitalize">
                        {earning.source_type.replace('_', ' ')}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(earning.created_at!), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold">
                      ${(earning.creator_amount_cents / 100).toFixed(2)}
                    </div>
                    <Badge
                      variant={earning.status === 'paid' ? 'default' : 'secondary'}
                    >
                      {earning.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
