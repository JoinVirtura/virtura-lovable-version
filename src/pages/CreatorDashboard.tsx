import { CreatorOnboarding } from '@/components/creator/CreatorOnboarding';
import { CreatorEarningsDashboard } from '@/components/creator/CreatorEarningsDashboard';
import { SubscriptionTiers } from '@/components/creator/SubscriptionTiers';
import { PayoutSchedule } from '@/components/creator/PayoutSchedule';
import { TransactionHistory } from '@/components/creator/TransactionHistory';
import { useCreatorAccount } from '@/hooks/useCreatorAccount';

export default function CreatorDashboard() {
  const { account, loading } = useCreatorAccount();

  const isOnboardingComplete = account?.onboarding_complete && 
    account?.charges_enabled && 
    account?.payouts_enabled;

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
