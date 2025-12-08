import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMarketplaceApplications } from '@/hooks/useMarketplaceApplications';
import { useMarketplacePayments } from '@/hooks/useMarketplacePayments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Clock, XCircle, Plus, MessageSquare, ExternalLink, Users, DollarSign } from 'lucide-react';
import { BrandCampaignCreator } from './BrandCampaignCreator';
import { CampaignChat } from './CampaignChat';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  budget_cents: number;
  creator_rate_cents: number | null;
  deadline: string | null;
  status: string | null;
  category: string | null;
  creator_id: string | null;
}

interface Application {
  id: string;
  campaign_id: string;
  creator_id: string;
  pitch: string;
  proposed_rate_cents: number;
  status: string | null;
  applied_at: string | null;
  creator?: {
    id: string;
    user_id: string;
  };
}

interface Deliverable {
  id: string;
  campaign_id: string;
  deliverable_type: string;
  status: string | null;
  submitted_at: string | null;
  asset?: {
    title: string;
    file_url: string;
    thumbnail_url: string | null;
  } | null;
}

export function BrandMarketplaceDashboard() {
  const { user } = useAuth();
  const { acceptApplication } = useMarketplaceApplications();
  const { approveDeliverable } = useMarketplacePayments();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaignForChat, setSelectedCampaignForChat] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch my brands' campaigns
      const { data: campaignsData } = await supabase
        .from('marketplace_campaigns')
        .select(`
          *,
          brands!inner(user_id, name)
        `)
        .eq('brands.user_id', user.id)
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);

      // Fetch applications for my campaigns
      const campaignIds = campaignsData?.map(c => c.id) || [];
      if (campaignIds.length > 0) {
        const { data: appsData } = await supabase
          .from('marketplace_applications')
          .select(`
            *,
            creator:creator_id(id, user_id)
          `)
          .in('campaign_id', campaignIds)
          .order('applied_at', { ascending: false });

        setApplications(appsData || []);

        // Fetch deliverables
        const { data: deliverablesData } = await supabase
          .from('marketplace_deliverables')
          .select(`
            *,
            asset:asset_id(title, file_url, thumbnail_url)
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
    try {
      await acceptApplication(applicationId);
      toast({
        title: 'Application accepted',
        description: 'The creator has been assigned to this campaign',
      });
      fetchData();
    } catch (error) {
      console.error('Error accepting application:', error);
    }
  };

  const handleApproveDeliverable = async (deliverableId: string) => {
    try {
      await approveDeliverable(deliverableId);
      toast({
        title: 'Deliverable approved',
        description: 'Payment has been released to the creator',
      });
      fetchData();
    } catch (error) {
      console.error('Error approving deliverable:', error);
    }
  };

  const formatBudget = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cents / 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; icon: any }> = {
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
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const openCampaigns = campaigns.filter(c => c.status === 'open');
  const inProgressCampaigns = campaigns.filter(c => c.status === 'in_progress');
  const completedCampaigns = campaigns.filter(c => c.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Campaigns</h2>
          <p className="text-muted-foreground">Manage campaigns and review creator applications</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-blue">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <BrandCampaignCreator 
              onSuccess={() => {
                setShowCreateDialog(false);
                fetchData();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/20">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openCampaigns.length}</p>
                <p className="text-sm text-muted-foreground">Open Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/20">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Pending Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/20">
                <DollarSign className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedCampaigns.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-xl">
          <TabsTrigger value="open">Open ({openCampaigns.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressCampaigns.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCampaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6 space-y-4">
          {openCampaigns.map((campaign) => {
            const campaignApps = applications.filter(a => a.campaign_id === campaign.id);
            const pendingApps = campaignApps.filter(a => a.status === 'pending');

            return (
              <Card key={campaign.id} className="backdrop-blur-xl bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{campaign.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatBudget(campaign.budget_cents)} • {campaignApps.length} applications
                      </p>
                    </div>
                    {getStatusBadge(campaign.status || 'open')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">{campaign.description}</p>

                  {pendingApps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Pending Applications ({pendingApps.length})
                      </h4>
                      {pendingApps.map((app) => (
                        <div key={app.id} className="p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-medium">Proposed Rate: {formatBudget(app.proposed_rate_cents)}</span>
                                {getStatusBadge(app.status || 'pending')}
                              </div>
                              <p className="text-sm text-muted-foreground">{app.pitch}</p>
                            </div>
                            <Button onClick={() => handleAcceptApplication(app.id)}>
                              Accept
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {openCampaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No open campaigns yet</p>
              <Button 
                className="mt-4"
                onClick={() => setShowCreateDialog(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Campaign
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6 space-y-4">
          {inProgressCampaigns.map((campaign) => {
            const campaignDeliverables = deliverables.filter(d => d.campaign_id === campaign.id);
            const pendingDeliverables = campaignDeliverables.filter(d => d.status === 'submitted');

            return (
              <Card key={campaign.id} className="backdrop-blur-xl bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{campaign.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Creator Rate: {formatBudget(campaign.creator_rate_cents || 0)}
                      </p>
                    </div>
                    {getStatusBadge(campaign.status || 'in_progress')}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    variant="outline"
                    onClick={() => setSelectedCampaignForChat(campaign.id)}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Chat with Creator
                  </Button>

                  {pendingDeliverables.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Deliverables to Review</h4>
                      {pendingDeliverables.map((deliverable) => (
                        <div key={deliverable.id} className="p-4 bg-muted/50 rounded-lg flex items-center justify-between">
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
                            {deliverable.asset?.file_url && (
                              <Button size="sm" variant="ghost" asChild>
                                <a href={deliverable.asset.file_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </Button>
                            )}
                            <Button onClick={() => handleApproveDeliverable(deliverable.id)}>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve & Pay
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {campaignDeliverables.length === 0 && (
                    <p className="text-sm text-muted-foreground">Waiting for creator to submit deliverables...</p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {inProgressCampaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No campaigns in progress</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedCampaigns.map((campaign) => (
            <Card key={campaign.id} className="backdrop-blur-xl bg-card/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle>{campaign.title}</CardTitle>
                  {getStatusBadge(campaign.status || 'completed')}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Paid: {formatBudget(campaign.creator_rate_cents || campaign.budget_cents)}
                </p>
              </CardContent>
            </Card>
          ))}

          {completedCampaigns.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed campaigns yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Chat Modal */}
      {selectedCampaignForChat && (
        <CampaignChat
          campaignId={selectedCampaignForChat}
          onClose={() => setSelectedCampaignForChat(null)}
        />
      )}
    </div>
  );
}
