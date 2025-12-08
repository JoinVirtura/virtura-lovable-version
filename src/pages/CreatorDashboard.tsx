import { useState } from 'react';
import { CreatorOnboarding } from '@/components/creator/CreatorOnboarding';
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
import { useCreatorAccount } from '@/hooks/useCreatorAccount';
import { useCreatorEarnings } from '@/hooks/useCreatorEarnings';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Wallet, Receipt, TrendingDown } from 'lucide-react';

export default function CreatorDashboard() {
  const { account, loading } = useCreatorAccount();
  const { stats } = useCreatorEarnings();
  const [activeTab, setActiveTab] = useState('overview');

  const isOnboardingComplete = account?.onboarding_complete && 
    account?.charges_enabled && 
    account?.payouts_enabled;
  
  // Calculate daily average for projections
  const dailyAverage = stats.timeSeriesData.length > 0
    ? stats.timeSeriesData.reduce((sum, d) => sum + d.total, 0) / stats.timeSeriesData.length
    : 0;

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
      <EarningsBreakdownCards />

      {/* Charts */}
      <CreatorRevenueCharts />

      {/* Projections */}
      <EarningsProjectionsChart 
        timeSeriesData={stats.timeSeriesData}
        dailyAverage={dailyAverage}
      />

      {/* Bottom Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        <UpcomingPayouts />
        <SubscriptionTiers />
      </div>
    </div>
  );

  const renderEarningsTab = () => (
    <div className="space-y-8">
      <CreatorEarningsDashboard />
      <EarningsBreakdownCards />
      <CreatorRevenueCharts />
      <TransactionHistory />
    </div>
  );

  const renderPayoutsTab = () => (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <UpcomingPayouts />
        <PayoutSchedule />
      </div>
      <PayoutHistory />
    </div>
  );

  const renderContentTab = () => (
    <ContentPerformanceAnalytics />
  );

  const renderDealsTab = () => (
    <BrandDealsOverview />
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
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Your complete monetization hub
        </p>
      </div>

      <CreatorOnboarding />

      {!loading && isOnboardingComplete && (
        <>
          <DashboardTabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
          {renderTabContent()}
        </>
      )}
    </div>
  );
}
