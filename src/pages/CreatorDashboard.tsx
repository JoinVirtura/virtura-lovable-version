import { CreatorOnboarding } from '@/components/creator/CreatorOnboarding';
import { CreatorEarningsDashboard } from '@/components/creator/CreatorEarningsDashboard';
import { CreatorRevenueCharts } from '@/components/creator/CreatorRevenueCharts';
import { EarningsProjectionsChart } from '@/components/creator/EarningsProjectionsChart';
import { SubscriptionTiers } from '@/components/creator/SubscriptionTiers';
import { PayoutSchedule } from '@/components/creator/PayoutSchedule';
import { TransactionHistory } from '@/components/creator/TransactionHistory';
import { useCreatorAccount } from '@/hooks/useCreatorAccount';
import { useCreatorEarnings } from '@/hooks/useCreatorEarnings';

export default function CreatorDashboard() {
  const { account, loading } = useCreatorAccount();
  const { stats } = useCreatorEarnings();

  const isOnboardingComplete = account?.onboarding_complete && 
    account?.charges_enabled && 
    account?.payouts_enabled;
  
  // Calculate daily average for projections
  const dailyAverage = stats.timeSeriesData.length > 0
    ? stats.timeSeriesData.reduce((sum, d) => sum + d.total, 0) / stats.timeSeriesData.length
    : 0;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Manage your creator account and track your earnings
        </p>
      </div>

      <CreatorOnboarding />

      {!loading && isOnboardingComplete && (
        <>
          <CreatorEarningsDashboard />

          <CreatorRevenueCharts />

          <EarningsProjectionsChart 
            timeSeriesData={stats.timeSeriesData}
            dailyAverage={dailyAverage}
          />

          <div className="grid gap-8 lg:grid-cols-2">
            <PayoutSchedule />
            <div>
              <SubscriptionTiers />
            </div>
          </div>

          <TransactionHistory />
        </>
      )}
    </div>
  );
}
