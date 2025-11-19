import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useMarketplaceAccess } from '@/hooks/useMarketplaceAccess';
import { MarketplaceAccessForm } from '@/components/marketplace/MarketplaceAccessForm';
import { MarketplaceBrowser } from '@/components/marketplace/MarketplaceBrowser';
import { CampaignManagement } from '@/components/marketplace/CampaignManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

  // Application approved - show marketplace
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Connect brands with creators for paid campaigns
          </p>
        </div>
        <Badge variant="default" className="text-sm">
          <CheckCircle className="h-3 w-3 mr-1" />
          {access.role_requested === 'creator' ? 'Approved Creator' : 'Approved Brand'}
        </Badge>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="browse">Browse Campaigns</TabsTrigger>
          <TabsTrigger value="manage">My Campaigns</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6">
          <MarketplaceBrowser />
        </TabsContent>

        <TabsContent value="manage" className="mt-6">
          <CampaignManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
