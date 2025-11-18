import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMarketplaceApplications } from '@/hooks/useMarketplaceApplications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, Clock, XCircle, ExternalLink } from 'lucide-react';
import { DeliverableUpload } from './DeliverableUpload';

export function CampaignManagement() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [isCreator, setIsCreator] = useState(false);
  const { acceptApplication } = useMarketplaceApplications();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Check if user is creator
      const { data: creatorAccount } = await supabase
        .from('creator_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      setIsCreator(!!creatorAccount);

      // Fetch campaigns
      const { data: campaignsData } = await supabase
        .from('marketplace_campaigns')
        .select(`
          *,
          brands!inner(name, user_id)
        `)
        .or(`brands.user_id.eq.${user.id},creator_id.eq.${creatorAccount?.id}`)
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);

      // Fetch applications for brand's campaigns
      if (campaignsData && campaignsData.length > 0) {
        const campaignIds = campaignsData
          .filter((c) => c.brands.user_id === user.id)
          .map((c) => c.id);

        if (campaignIds.length > 0) {
          const { data: appsData } = await supabase
            .from('marketplace_applications')
            .select(`
              *,
              creator:creator_accounts!inner(id, user_id)
            `)
            .in('campaign_id', campaignIds)
            .order('applied_at', { ascending: false });

          setApplications(appsData || []);
        }
      }

      // Fetch deliverables
      const campaignIds = campaignsData?.map((c) => c.id) || [];
      if (campaignIds.length > 0) {
        const { data: deliverablesData } = await supabase
          .from('marketplace_deliverables')
          .select(`
            *,
            asset:brand_assets(title, file_url, thumbnail_url)
          `)
          .in('campaign_id', campaignIds)
          .order('submitted_at', { ascending: false });

        setDeliverables(deliverablesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    await acceptApplication(applicationId);
    fetchData();
  };

  const formatBudget = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      open: { variant: 'default', icon: Clock },
      in_progress: { variant: 'secondary', icon: Clock },
      completed: { variant: 'default', icon: CheckCircle },
      pending: { variant: 'secondary', icon: Clock },
      accepted: { variant: 'default', icon: CheckCircle },
      rejected: { variant: 'destructive', icon: XCircle },
      submitted: { variant: 'secondary', icon: Clock },
      approved: { variant: 'default', icon: CheckCircle },
    };

    const config = variants[status] || { variant: 'default', icon: Clock };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const ownedCampaigns = campaigns.filter((c) => c.brands?.user_id === user?.id);
  const openCampaigns = ownedCampaigns.filter((c) => c.status === 'open');
  const inProgressCampaigns = ownedCampaigns.filter((c) => c.status === 'in_progress');
  const completedCampaigns = ownedCampaigns.filter((c) => c.status === 'completed');

  const creatorCampaigns = campaigns.filter((c) => c.creator_id);
  const activeCampaigns = creatorCampaigns.filter((c) => c.status === 'in_progress');
  const completedCreatorCampaigns = creatorCampaigns.filter((c) => c.status === 'completed');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Campaign Management</h1>
        <p className="text-muted-foreground mt-2">
          {isCreator ? 'Manage your active campaigns and deliverables' : 'Manage your campaigns and review applications'}
        </p>
      </div>

      <Tabs defaultValue={isCreator ? 'active' : 'open'}>
        <TabsList>
          {!isCreator && (
            <>
              <TabsTrigger value="open">Open ({openCampaigns.length})</TabsTrigger>
              <TabsTrigger value="in_progress">In Progress ({inProgressCampaigns.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCampaigns.length})</TabsTrigger>
            </>
          )}
          {isCreator && (
            <>
              <TabsTrigger value="active">Active ({activeCampaigns.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedCreatorCampaigns.length})</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Brand View */}
        {!isCreator && (
          <>
            <TabsContent value="open" className="space-y-4">
              {openCampaigns.map((campaign) => {
                const campaignApps = applications.filter((a) => a.campaign_id === campaign.id);
                return (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle>{campaign.title}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatBudget(campaign.budget_cents)} • {campaignApps.length} applications
                          </p>
                        </div>
                        {getStatusBadge(campaign.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm">{campaign.description}</p>
                      
                      {campaignApps.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Applications</h4>
                          {campaignApps.map((app) => (
                            <div key={app.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium">Proposed: {formatBudget(app.proposed_rate_cents)}</p>
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{app.pitch}</p>
                              </div>
                              {app.status === 'pending' && (
                                <Button onClick={() => handleAcceptApplication(app.id)}>
                                  Accept
                                </Button>
                              )}
                              {app.status !== 'pending' && getStatusBadge(app.status)}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="in_progress" className="space-y-4">
              {inProgressCampaigns.map((campaign) => {
                const campaignDeliverables = deliverables.filter((d) => d.campaign_id === campaign.id);
                return (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle>{campaign.title}</CardTitle>
                        {getStatusBadge(campaign.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-sm">
                        <span className="font-medium">Budget: </span>
                        {formatBudget(campaign.creator_rate_cents || campaign.budget_cents)}
                      </div>

                      {campaignDeliverables.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Deliverables</h4>
                          {campaignDeliverables.map((deliverable) => (
                            <div key={deliverable.id} className="p-3 bg-muted rounded-lg flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {deliverable.asset?.thumbnail_url && (
                                  <img
                                    src={deliverable.asset.thumbnail_url}
                                    alt=""
                                    className="w-16 h-16 object-cover rounded"
                                  />
                                )}
                                <div>
                                  <p className="font-medium">{deliverable.deliverable_type}</p>
                                  <p className="text-sm text-muted-foreground">{deliverable.asset?.title}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {getStatusBadge(deliverable.status)}
                                {deliverable.asset?.file_url && (
                                  <Button size="sm" variant="ghost" asChild>
                                    <a href={deliverable.asset.file_url} target="_blank" rel="noopener noreferrer">
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{campaign.title}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Paid: {formatBudget(campaign.creator_rate_cents || campaign.budget_cents)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </>
        )}

        {/* Creator View */}
        {isCreator && (
          <>
            <TabsContent value="active" className="space-y-4">
              {activeCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{campaign.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {campaign.brands?.name}
                        </p>
                      </div>
                      {getStatusBadge(campaign.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={() => setSelectedCampaign(campaign.id)}>
                      Upload Deliverable
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="completed" className="space-y-4">
              {completedCreatorCampaigns.map((campaign) => (
                <Card key={campaign.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle>{campaign.title}</CardTitle>
                      {getStatusBadge(campaign.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Earned: {formatBudget(campaign.creator_rate_cents || 0)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </>
        )}
      </Tabs>

      {selectedCampaign && (
        <DeliverableUpload
          campaignId={selectedCampaign}
          onClose={() => {
            setSelectedCampaign(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
