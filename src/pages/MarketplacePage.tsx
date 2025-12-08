import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useMarketplaceAccess } from '@/hooks/useMarketplaceAccess';
import { MarketplaceAccessForm } from '@/components/marketplace/MarketplaceAccessForm';
import { CreatorMarketplaceDashboard } from '@/components/marketplace/CreatorMarketplaceDashboard';
import { BrandMarketplaceDashboard } from '@/components/marketplace/BrandMarketplaceDashboard';

export default function MarketplacePage() {
  const { access, loading } = useMarketplaceAccess();

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No application yet - show application form
  if (!access) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Connect brands with creators for paid campaigns
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <MarketplaceAccessForm />
        </div>
      </div>
    );
  }

  // Application pending - show status
  if (access.status === 'pending') {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Connect brands with creators for paid campaigns
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <Clock className="h-16 w-16 mx-auto text-primary" />
            <div>
              <h3 className="text-2xl font-semibold mb-2">Application Under Review</h3>
              <p className="text-muted-foreground">
                Your application is being reviewed by our team. You'll receive a notification
                once a decision has been made (typically within 24-48 hours).
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              <Clock className="h-3 w-3 mr-1" />
              Pending Review
            </Badge>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application denied - show denial reason
  if (access.status === 'denied') {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Connect brands with creators for paid campaigns
          </p>
        </div>
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <XCircle className="h-16 w-16 mx-auto text-destructive" />
            <div>
              <h3 className="text-2xl font-semibold mb-2">Application Not Approved</h3>
              <p className="text-muted-foreground mb-4">
                Unfortunately, your marketplace application was not approved at this time.
              </p>
              {access.denial_reason && (
                <div className="bg-muted p-4 rounded-lg text-left max-w-md mx-auto">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm mb-1">Reason</div>
                      <p className="text-sm text-muted-foreground">{access.denial_reason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Application approved - show role-specific dashboard
  const isCreator = access.role_requested === 'creator';

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 border border-primary/20 p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              {isCreator 
                ? 'Browse campaigns and connect with brands'
                : 'Create campaigns and find talented creators'
              }
            </p>
          </div>
          <Badge variant="default" className="text-sm px-4 py-2 bg-gradient-to-r from-primary to-primary-blue">
            <CheckCircle className="h-4 w-4 mr-2" />
            {isCreator ? 'Approved Creator' : 'Approved Brand'}
          </Badge>
        </div>
      </div>

      {/* Role-specific Dashboard */}
      {isCreator ? (
        <CreatorMarketplaceDashboard />
      ) : (
        <BrandMarketplaceDashboard />
      )}
    </div>
  );
}
