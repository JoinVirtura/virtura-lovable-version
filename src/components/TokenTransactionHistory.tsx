import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Coins, TrendingUp, TrendingDown, DollarSign, Download } from "lucide-react";
import { format } from "date-fns";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  resource_type: string;
  resource_id: string;
  cost_usd: number;
  metadata: any;
  created_at: string;
}

interface TokenTransactionHistoryProps {
  isDialog?: boolean;
}

export function TokenTransactionHistory({ isDialog = false }: TokenTransactionHistoryProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'usage'>('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      fetchTransactions();
    }
  }, [user, filter]);

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

  const fetchTransactions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Filter by type if not 'all'
      if (filter !== 'all') {
        query = query.eq('transaction_type', filter);
      }

      // Admin sees all transactions, regular users see only their own
      if (!isAdmin) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'bonus':
      case 'refund':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'usage':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    const variants: Record<string, any> = {
      purchase: 'default',
      usage: 'secondary',
      bonus: 'outline',
      refund: 'outline',
    };
    
    return (
      <Badge variant={variants[type] || 'outline'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Amount', 'Resource Type', 'Cost USD'];
    const rows = transactions.map(t => [
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
      t.transaction_type,
      t.amount.toString(),
      t.resource_type || 'N/A',
      t.cost_usd?.toFixed(2) || '0.00',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `token-history-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const totalPurchased = transactions
    .filter(t => ['purchase', 'bonus', 'refund'].includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUsed = transactions
    .filter(t => t.transaction_type === 'usage')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCost = transactions
    .filter(t => t.transaction_type === 'usage')
    .reduce((sum, t) => sum + (t.cost_usd || 0), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={isDialog ? "space-y-4" : "space-y-6"}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Total Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPurchased.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Total Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              API Costs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">total spent</p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {isAdmin ? 'All user transactions' : 'Your token transaction history'}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="purchase">Purchases</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No transactions found
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div>{getTransactionIcon(transaction.transaction_type)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {getTransactionBadge(transaction.transaction_type)}
                            {transaction.resource_type && (
                              <Badge variant="outline" className="text-xs">
                                {transaction.resource_type}
                              </Badge>
                            )}
                            {isAdmin && transaction.user_id && (
                              <Badge variant="secondary" className="text-xs">
                                {transaction.user_id.slice(0, 8)}...
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {format(new Date(transaction.created_at), 'PPp')}
                          </p>
                          {transaction.metadata?.stripe_session_id && (
                            <p className="text-xs text-muted-foreground">
                              Stripe: {transaction.metadata.stripe_session_id.slice(0, 20)}...
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-semibold ${
                          transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                        </div>
                        {transaction.cost_usd !== undefined && transaction.cost_usd > 0 && (
                          <div className="text-sm text-muted-foreground">
                            ${transaction.cost_usd.toFixed(4)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
