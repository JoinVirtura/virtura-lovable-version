import { useState } from 'react';
import { CreatorEarningsDashboard } from '@/components/creator/CreatorEarningsDashboard';
import { CreatorRevenueCharts } from '@/components/creator/CreatorRevenueCharts';
import { EarningsProjectionsChart } from '@/components/creator/EarningsProjectionsChart';
import { SubscriptionTiers } from '@/components/creator/SubscriptionTiers';
import { PayoutSchedule } from '@/components/creator/PayoutSchedule';
import { TransactionHistory } from '@/components/creator/TransactionHistory';
import { DashboardTabNavigation } from '@/components/creator/DashboardTabNavigation';
import { EarningsBreakdownCards } from '@/components/creator/EarningsBreakdownCards';
import { PayoutHistory } from '@/components/creator/PayoutHistory';
import { UpcomingPayouts } from '@/components/creator/UpcomingPayouts';
import { ContentPerformanceAnalytics } from '@/components/creator/ContentPerformanceAnalytics';
import { BrandDealsOverview } from '@/components/creator/BrandDealsOverview';
import { DemoModeBanner } from '@/components/creator/DemoModeBanner';
import { useCreatorAccount } from '@/hooks/useCreatorAccount';
import { useCreatorEarnings } from '@/hooks/useCreatorEarnings';
import { useDemoEarningsData } from '@/hooks/useDemoEarningsData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wallet, Receipt, TrendingDown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function CreatorDashboard() {
  const { account, loading, createAccount, getOnboardingLink } = useCreatorAccount();
  const realEarnings = useCreatorEarnings();
  const demoData = useDemoEarningsData();
  const [activeTab, setActiveTab] = useState('overview');
  const [demoMode, setDemoMode] = useState(false);

  const isOnboardingComplete = account?.onboarding_complete && 
    account?.charges_enabled && 
    account?.payouts_enabled;

  // Demo mode only when explicitly toggled ON
  const useDemoData = demoMode;
  
  // Select data based on demo mode
  const stats = useDemoData ? demoData.stats : realEarnings.stats;
  const earnings = useDemoData ? demoData.earnings : realEarnings.earnings;
  const payoutStats = useDemoData ? demoData.payoutStats : undefined;
  const contentStats = useDemoData ? demoData.contentStats : undefined;
  const brandDeals = useDemoData ? demoData.brandDeals : undefined;
  const earningsLoading = useDemoData ? false : realEarnings.loading;
  
  // Calculate daily average for projections
  const timeSeriesArr = stats.timeSeriesData as Array<{ total: number }>;
  const dailyAverage = timeSeriesArr.length > 0
    ? timeSeriesArr.reduce((sum, d) => sum + d.total, 0) / timeSeriesArr.length
    : 0;

  const handleSetupStripe = async () => {
    try {
      // Create account first if it doesn't exist
      if (!account) {
        const newAccount = await createAccount();
        if (!newAccount) {
          toast({
            title: 'Account creation failed',
            description: 'Please try again or contact support.',
            variant: 'destructive',
          });
          return;
        }
      }
      
      // Now get onboarding link
      const url = await getOnboardingLink();
      if (url) window.location.href = url;
    } catch (error: any) {
      toast({
        title: 'Setup failed',
        description: error.message || 'Failed to start Stripe setup.',
        variant: 'destructive',
      });
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Top Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Gross Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.grossEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All-time total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Earnings (90%)</CardTitle>
            <Wallet className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">${stats.netEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">After platform fee</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Fee (10%)</CardTitle>
            <TrendingDown className="w-4 h-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">${stats.platformFees.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Service charge</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <Receipt className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.paidOutEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Transferred to bank</p>
          </CardContent>
        </Card>
      </div>

      {/* Earnings Breakdown */}
      <EarningsBreakdownCards stats={stats} loading={earningsLoading} />

      {/* Charts */}
      <CreatorRevenueCharts stats={stats} />

      {/* Projections */}
      <EarningsProjectionsChart 
        timeSeriesData={stats.timeSeriesData}
        dailyAverage={dailyAverage}
      />

      {/* Bottom Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <UpcomingPayouts stats={stats} loading={earningsLoading} />
        <SubscriptionTiers />
      </div>
    </div>
  );

  const renderEarningsTab = () => (
    <div className="space-y-8">
      <CreatorEarningsDashboard stats={stats} loading={earningsLoading} />
      <EarningsBreakdownCards stats={stats} loading={earningsLoading} />
      <CreatorRevenueCharts stats={stats} />
      <TransactionHistory earnings={earnings} loading={earningsLoading} />
    </div>
  );

  const renderPayoutsTab = () => (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <UpcomingPayouts stats={stats} loading={earningsLoading} />
        <PayoutSchedule />
      </div>
      <PayoutHistory stats={payoutStats} loading={earningsLoading} />
    </div>
  );

  const renderContentTab = () => (
    <ContentPerformanceAnalytics stats={contentStats} loading={earningsLoading} />
  );

  const renderDealsTab = () => (
    <BrandDealsOverview contracts={brandDeals} loading={earningsLoading} />
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'earnings':
        return renderEarningsTab();
      case 'payouts':
        return renderPayoutsTab();
      case 'content':
        return renderContentTab();
      case 'deals':
        return renderDealsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Your complete monetization hub
        </p>
      </div>

      {/* Demo mode banner - shows when demo active OR when setup needed */}
      {(demoMode || !isOnboardingComplete) && (
        <DemoModeBanner
          isDemoMode={demoMode}
          onToggle={setDemoMode}
          onSetupStripe={handleSetupStripe}
          showStripeSetup={!isOnboardingComplete}
        />
      )}

      {/* Always show dashboard content */}
      <DashboardTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  );
}
