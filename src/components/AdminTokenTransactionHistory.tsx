import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Coins, TrendingUp, TrendingDown, DollarSign, Download, Search, User, Radio } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  resource_type: string | null;
  resource_id: string | null;
  cost_usd: number | null;
  metadata: any;
  created_at: string;
}

interface UserProfile {
  id: string;
  display_name: string | null;
}

export function AdminTokenTransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [profiles, setProfiles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'usage' | 'bonus'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState(false);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('token_transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (filter !== 'all') {
        query = query.eq('transaction_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTransactions(data || []);

      // Fetch user profiles for all unique user IDs
      const userIds = [...new Set(data?.map(t => t.user_id) || [])];
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('id, display_name')
          .in('id', userIds);

        const profileMap = new Map<string, string>();
        profileData?.forEach(p => {
          profileMap.set(p.id, p.display_name || p.id.slice(0, 8));
        });
        setProfiles(profileMap);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  }, [filter]);

  useEffect(() => {
    fetchTransactions();

    // Set up real-time subscription for token transactions
    const channel = supabase
      .channel('admin-token-txns-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'token_transactions'
        },
        (payload) => {
          console.log('Token transaction update received:', payload);
          fetchTransactions();
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTransactions]);

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
    const headers = ['Date', 'User ID', 'User Name', 'Type', 'Amount', 'Resource Type', 'Cost USD'];
    const rows = filteredTransactions.map(t => [
      format(new Date(t.created_at), 'yyyy-MM-dd HH:mm:ss'),
      t.user_id,
      profiles.get(t.user_id) || 'Unknown',
      t.transaction_type,
      t.amount.toString(),
      t.resource_type || 'N/A',
      t.cost_usd?.toFixed(4) || '0.0000',
    ]);

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `all-token-transactions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const filteredTransactions = transactions.filter(t => {
    if (!searchQuery) return true;
    const userName = profiles.get(t.user_id) || '';
    const searchLower = searchQuery.toLowerCase();
    return (
      userName.toLowerCase().includes(searchLower) ||
      t.user_id.toLowerCase().includes(searchLower) ||
      t.transaction_type.toLowerCase().includes(searchLower) ||
      (t.resource_type && t.resource_type.toLowerCase().includes(searchLower))
    );
  });

  const totalPurchased = transactions
    .filter(t => ['purchase', 'bonus', 'refund'].includes(t.transaction_type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUsed = transactions
    .filter(t => t.transaction_type === 'usage')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCost = transactions
    .filter(t => t.transaction_type === 'usage')
    .reduce((sum, t) => sum + (t.cost_usd || 0), 0);

  const totalRevenue = totalPurchased * 0.01; // Assuming $0.01 per token

  // Top users by tokens purchased
  const userPurchaseMap = new Map<string, number>();
  transactions
    .filter(t => ['purchase', 'bonus'].includes(t.transaction_type))
    .forEach(t => {
      const current = userPurchaseMap.get(t.user_id) || 0;
      userPurchaseMap.set(t.user_id, current + t.amount);
    });

  const topUsers = Array.from(userPurchaseMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, amount]) => ({
      userId,
      name: profiles.get(userId) || 'Unknown',
      amount,
    }));

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
    <div className="space-y-6">
      {/* Live Status Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Token Transaction History</h2>
        <div className="flex items-center gap-3">
          {isLive && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Radio className="w-3 h-3 mr-2 animate-pulse" />
              Live
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            Updated {formatDistanceToNow(lastUpdated)} ago
          </span>
        </div>
      </div>

      {/* Token-Specific Summary Cards - No redundancy with Financial/API Costs tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              Total Purchased
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{totalPurchased.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">tokens credited</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{totalUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">tokens consumed</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-violet-500" />
              Net Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-400">{(totalPurchased - totalUsed).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">available platform-wide</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-amber-500" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{topUsers.length}</div>
            <p className="text-xs text-muted-foreground">with token activity</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Users */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Token Purchase</CardTitle>
          <CardDescription>Users who have purchased the most tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topUsers.map((user, idx) => (
              <div key={user.userId} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.userId.slice(0, 8)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{user.amount.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">tokens</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All User Transactions</CardTitle>
              <CardDescription>
                Complete transaction history across all users
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user name, user ID, type, or resource..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-md"
              />
            </div>

            {/* Filter Tabs */}
            <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All ({transactions.length})</TabsTrigger>
                <TabsTrigger value="purchase">Purchases</TabsTrigger>
                <TabsTrigger value="usage">Usage</TabsTrigger>
                <TabsTrigger value="bonus">Bonuses</TabsTrigger>
              </TabsList>

              <TabsContent value={filter} className="space-y-3 mt-4">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div>{getTransactionIcon(transaction.transaction_type)}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {getTransactionBadge(transaction.transaction_type)}
                              {transaction.resource_type && (
                                <Badge variant="outline" className="text-xs">
                                  {transaction.resource_type}
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                <User className="h-3 w-3 mr-1" />
                                {profiles.get(transaction.user_id) || transaction.user_id.slice(0, 8)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {format(new Date(transaction.created_at), 'PPp')}
                            </p>
                            {transaction.metadata?.reason && (
                              <p className="text-xs text-muted-foreground">
                                {transaction.metadata.reason}
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
                          {transaction.cost_usd !== undefined && transaction.cost_usd !== null && transaction.cost_usd > 0 && (
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
