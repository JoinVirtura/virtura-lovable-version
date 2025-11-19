import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCreatorAccount } from '@/hooks/useCreatorAccount';
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';

export function CreatorOnboarding() {
  const { account, loading, creating, createAccount, getOnboardingLink, getDashboardLink } = useCreatorAccount();
  const [redirecting, setRedirecting] = useState(false);

  const handleCreateAccount = async () => {
    try {
      await createAccount();
    } catch (error: any) {
      // Check for Stripe Connect specific errors
      if (error?.message?.includes('Connect') || error?.message?.includes('signed up for Connect')) {
        console.error('Stripe Connect not enabled:', error);
      }
    }
  };

  const handleStartOnboarding = async () => {
    setRedirecting(true);
    try {
      const url = await getOnboardingLink();
      window.location.href = url;
    } finally {
      setRedirecting(false);
    }
  };

  const handleOpenDashboard = async () => {
    setRedirecting(true);
    try {
      const url = await getDashboardLink();
      window.open(url, '_blank');
    } finally {
      setRedirecting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Become a Creator</CardTitle>
          <CardDescription>
            Start earning from your content by setting up your creator account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">What you can do as a creator:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                <span>Receive tips from your fans</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                <span>Offer subscription tiers with exclusive content</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                <span>Monetize your content with paid unlocks</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5" />
                <span>Track your earnings and get paid automatically</span>
              </li>
            </ul>
          </div>
          <Button onClick={handleCreateAccount} disabled={creating} className="w-full">
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Creator Account'
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isComplete = account.onboarding_complete && account.charges_enabled && account.payouts_enabled;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Creator Account Status</CardTitle>
            <CardDescription>
              Manage your creator account and payment settings
            </CardDescription>
          </div>
          <Badge variant={isComplete ? 'default' : 'secondary'}>
            {isComplete ? 'Active' : 'Setup Required'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {account.onboarding_complete ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
              <span className="text-sm font-medium">Onboarding</span>
            </div>
            <Badge variant={account.onboarding_complete ? 'default' : 'secondary'}>
              {account.onboarding_complete ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {account.charges_enabled ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
              <span className="text-sm font-medium">Accept Payments</span>
            </div>
            <Badge variant={account.charges_enabled ? 'default' : 'secondary'}>
              {account.charges_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {account.payouts_enabled ? (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              ) : (
                <AlertCircle className="w-5 h-5 text-warning" />
              )}
              <span className="text-sm font-medium">Receive Payouts</span>
            </div>
            <Badge variant={account.payouts_enabled ? 'default' : 'secondary'}>
              {account.payouts_enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </div>

        <div className="flex gap-2">
          {!isComplete && (
            <Button onClick={handleStartOnboarding} disabled={redirecting} className="flex-1">
              {redirecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Redirecting...
                </>
              ) : (
                <>
                  Complete Setup
                  <ExternalLink className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          )}
          <Button 
            onClick={handleOpenDashboard} 
            disabled={redirecting}
            variant="outline"
            className="flex-1"
          >
            {redirecting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                Stripe Dashboard
                <ExternalLink className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
