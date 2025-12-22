import { useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useMarketplaceAccess } from '@/hooks/useMarketplaceAccess';
import { MarketplaceAccessForm } from '@/components/marketplace/MarketplaceAccessForm';
import { MarketplaceVerificationGate } from '@/components/marketplace/MarketplaceVerificationGate';
import { CreatorMarketplaceDashboard } from '@/components/marketplace/CreatorMarketplaceDashboard';
import { BrandMarketplaceDashboard } from '@/components/marketplace/BrandMarketplaceDashboard';

interface MarketplacePageProps {
  onNavigateToVerification?: () => void;
}

export default function MarketplacePage({ onNavigateToVerification }: MarketplacePageProps) {
  const { access, loading } = useMarketplaceAccess();
  const [selectedRole, setSelectedRole] = useState<'creator' | 'brand' | null>(null);
  const [isCreatorVerified, setIsCreatorVerified] = useState(false);

  const handleVerified = useCallback(() => {
    setIsCreatorVerified(true);
  }, []);

  const handleNavigateToVerification = useCallback(() => {
    if (onNavigateToVerification) {
      onNavigateToVerification();
    }
  }, [onNavigateToVerification]);

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // No application yet - show role selection and conditional form
  if (!access) {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Connect brands with creators for paid campaigns
          </p>
        </div>
        <div className="max-w-2xl mx-auto px-0 sm:px-4">
          {/* If Creator is selected and not verified, show verification gate */}
          {selectedRole === 'creator' && !isCreatorVerified ? (
            <div className="space-y-4 sm:space-y-6">
              <MarketplaceVerificationGate 
                onVerified={handleVerified}
                onNavigateToVerification={handleNavigateToVerification}
              />
              <button 
                onClick={() => setSelectedRole(null)}
                className="text-sm text-muted-foreground hover:text-foreground underline mx-auto block"
              >
                ← Choose a different role
              </button>
            </div>
          ) : (
            <MarketplaceAccessForm 
              onRoleSelect={setSelectedRole}
              isCreatorVerified={isCreatorVerified}
            />
          )}
        </div>
      </div>
    );
  }

  // Application pending - show status
  if (access.status === 'pending') {
    return (
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Connect brands with creators for paid campaigns
          </p>
        </div>
        <Card>
          <CardContent className="p-6 sm:p-12 text-center space-y-4">
            <Clock className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary" />
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Application Under Review</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
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
      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Connect brands with creators for paid campaigns
          </p>
        </div>
        <Card>
          <CardContent className="p-6 sm:p-12 text-center space-y-4">
            <XCircle className="h-12 w-12 sm:h-16 sm:w-16 mx-auto text-destructive" />
            <div>
              <h3 className="text-xl sm:text-2xl font-semibold mb-2">Application Not Approved</h3>
              <p className="text-muted-foreground mb-4 text-sm sm:text-base">
                Unfortunately, your marketplace application was not approved at this time.
              </p>
              {access.denial_reason && (
                <div className="bg-muted p-3 sm:p-4 rounded-lg text-left max-w-md mx-auto">
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
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-8">
      {/* Enhanced Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-pink-900/40 border border-primary/20 p-4 sm:p-8 backdrop-blur-xl">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-violet-400 bg-clip-text text-transparent">
              Marketplace
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-lg">
              {isCreator 
                ? 'Browse campaigns and connect with brands'
                : 'Create campaigns and find talented creators'
              }
            </p>
          </div>
          <Badge variant="default" className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-primary to-violet-500 w-fit">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
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
