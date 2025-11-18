import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { DollarSign, TrendingUp, Award, Clock } from 'lucide-react';

export function MarketplaceAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Check if user is creator
      const { data: creatorAccount } = await supabase
        .from('creator_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsCreator(!!creatorAccount);

      if (creatorAccount) {
        // Creator stats
        const { data: applications } = await supabase
          .from('marketplace_applications')
          .select('id, status')
          .eq('creator_id', creatorAccount.id);

        const { data: payments } = await supabase
          .from('marketplace_payments')
          .select('creator_amount_cents')
          .eq('creator_id', creatorAccount.id)
          .eq('status', 'released');

        const { data: campaigns } = await supabase
          .from('marketplace_campaigns')
          .select('id, status')
          .eq('creator_id', creatorAccount.id);

        const totalEarnings = payments?.reduce((sum, p) => sum + p.creator_amount_cents, 0) || 0;
        const acceptedApps = applications?.filter((a) => a.status === 'accepted').length || 0;
        const totalApps = applications?.length || 0;
        const completedCampaigns = campaigns?.filter((c) => c.status === 'completed').length || 0;

        setStats({
          totalApplications: totalApps,
          acceptedApplications: acceptedApps,
          acceptanceRate: totalApps > 0 ? (acceptedApps / totalApps) * 100 : 0,
          totalEarnings: totalEarnings / 100,
          averageProjectValue: payments && payments.length > 0 ? totalEarnings / payments.length / 100 : 0,
          completedCampaigns,
          completionRate: campaigns && campaigns.length > 0 ? (completedCampaigns / campaigns.length) * 100 : 0,
        });
      } else {
        // Brand stats
        const { data: brands } = await supabase
          .from('brands')
          .select('id')
          .eq('user_id', user.id);

        if (brands && brands.length > 0) {
          const brandIds = brands.map((b) => b.id);

          const { data: campaigns } = await supabase
            .from('marketplace_campaigns')
            .select('id, status')
            .in('brand_id', brandIds);

          const { data: payments } = await supabase
            .from('marketplace_payments')
            .select('total_amount_cents')
            .in('brand_id', brandIds)
            .eq('status', 'released');

          const totalSpent = payments?.reduce((sum, p) => sum + p.total_amount_cents, 0) || 0;
          const activeCampaigns = campaigns?.filter((c) => c.status === 'in_progress').length || 0;
          const completedCampaigns = campaigns?.filter((c) => c.status === 'completed').length || 0;
          const totalCampaigns = campaigns?.length || 0;

          setStats({
            totalCampaigns,
            activeCampaigns,
            completedCampaigns,
            totalSpent: totalSpent / 100,
            averageTimeToCompletion: 7, // Placeholder
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No marketplace activity yet</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketplace Analytics</h1>
        <p className="text-muted-foreground mt-2">
          {isCreator ? 'Track your creator performance' : 'Monitor your campaign metrics'}
        </p>
      </div>

      {isCreator ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.acceptanceRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.acceptedApplications}/{stats.totalApplications} applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Project Value</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.averageProjectValue)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedCampaigns} campaigns completed
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedCampaigns}</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
