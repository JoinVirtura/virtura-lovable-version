import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMarketplaceApplications } from '@/hooks/useMarketplaceApplications';
import { useMarketplacePayments } from '@/hooks/useMarketplacePayments';
import { useMarketplaceContracts } from '@/hooks/useMarketplaceContracts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CheckCircle, Clock, XCircle, Plus, MessageSquare, ExternalLink, Users, DollarSign, FileText } from 'lucide-react';
import { BrandCampaignCreator } from './BrandCampaignCreator';
import { CampaignChat } from './CampaignChat';
import { SuggestedCreators } from './SuggestedCreators';
import { ContractViewer } from './ContractViewer';
import { ContractStatusBadge } from './ContractStatusBadge';
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
  const { contracts, generateContract, refetch: refetchContracts, getContractForCampaign } = useMarketplaceContracts();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedCampaignForChat, setSelectedCampaignForChat] = useState<string | null>(null);
  const [selectedContractCampaign, setSelectedContractCampaign] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: campaignsData } = await supabase
        .from('marketplace_campaigns')
        .select(`
          *,
          brands!inner(user_id, name)
        `)
        .eq('brands.user_id', user.id)
        .order('created_at', { ascending: false });

      setCampaigns(campaignsData || []);

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

  const handleAcceptApplication = async (application: Application) => {
    try {
      // First accept the application
      await acceptApplication(application.id);
      
      // Then generate the contract
      await generateContract(
        application.campaign_id,
        application.creator_id,
        application.proposed_rate_cents
      );
      
      toast({
        title: 'Application accepted',
        description: 'Contract has been generated and is ready for signatures',
      });
      
      fetchData();
      refetchContracts();
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

  // Get the first open campaign for AI recommendations
  const firstOpenCampaign = openCampaigns[0];

  // Get selected contract for viewer
  const selectedContract = selectedContractCampaign 
    ? getContractForCampaign(selectedContractCampaign)
    : null;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header with Create Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Your Campaigns</h2>
          <p className="text-muted-foreground text-sm sm:text-base">Manage campaigns and review creator applications</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary-blue w-full sm:w-auto" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
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

      {/* AI Suggested Creators */}
      {firstOpenCampaign && (
        <SuggestedCreators
          campaignId={firstOpenCampaign.id}
          category={firstOpenCampaign.category}
          budgetCents={firstOpenCampaign.budget_cents}
        />
      )}

      {/* Stats Overview */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card className="backdrop-blur-xl bg-gradient-to-br from-violet-900/20 to-purple-900/20 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-primary/20">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{openCampaigns.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Open Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-blue-500/20">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{applications.filter(a => a.status === 'pending').length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Pending Applications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-gradient-to-br from-green-900/20 to-emerald-900/20 border-primary/20">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-green-500/20">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold">{completedCampaigns.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="open" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-xl h-auto">
          <TabsTrigger value="open" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Open ({openCampaigns.length})</TabsTrigger>
          <TabsTrigger value="in_progress" className="text-xs sm:text-sm py-2 px-1 sm:px-3">In Progress ({inProgressCampaigns.length})</TabsTrigger>
          <TabsTrigger value="completed" className="text-xs sm:text-sm py-2 px-1 sm:px-3">Completed ({completedCampaigns.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
          {openCampaigns.map((campaign) => {
            const campaignApps = applications.filter(a => a.campaign_id === campaign.id);
            const pendingApps = campaignApps.filter(a => a.status === 'pending');
            const contract = getContractForCampaign(campaign.id);

            return (
              <Card key={campaign.id} className="backdrop-blur-xl bg-card/50">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-0">
                    <div className="min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">{campaign.title}</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                        {formatBudget(campaign.budget_cents)} • {campaignApps.length} applications
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                      {contract && <ContractStatusBadge status={contract.status} />}
                      {getStatusBadge(campaign.status || 'open')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm">{campaign.description}</p>

                  {/* Contract View Button */}
                  {contract && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedContractCampaign(campaign.id)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Contract
                    </Button>
                  )}

                  {pendingApps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                        <Users className="w-4 h-4" />
                        Pending Applications ({pendingApps.length})
                      </h4>
                      {pendingApps.map((app) => (
                        <div key={app.id} className="p-3 sm:p-4 bg-muted/50 rounded-lg">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <span className="font-medium text-sm">Proposed Rate: {formatBudget(app.proposed_rate_cents)}</span>
                                {getStatusBadge(app.status || 'pending')}
                              </div>
                              <p className="text-xs sm:text-sm text-muted-foreground">{app.pitch}</p>
                            </div>
                            <Button 
                              onClick={() => handleAcceptApplication(app)}
                              size="sm"
                              className="w-full sm:w-auto flex-shrink-0"
                            >
                              Accept & Generate Contract
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
            const contract = getContractForCampaign(campaign.id);

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
                    <div className="flex items-center gap-2">
                      {contract && <ContractStatusBadge status={contract.status} />}
                      {getStatusBadge(campaign.status || 'in_progress')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedCampaignForChat(campaign.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Creator
                    </Button>
                    {contract && (
                      <Button 
                        variant="outline"
                        onClick={() => setSelectedContractCampaign(campaign.id)}
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        View Contract
                      </Button>
                    )}
                  </div>

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
          {completedCampaigns.map((campaign) => {
            const contract = getContractForCampaign(campaign.id);
            
            return (
              <Card key={campaign.id} className="backdrop-blur-xl bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>{campaign.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {contract && <ContractStatusBadge status={contract.status} />}
                      {getStatusBadge(campaign.status || 'completed')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Paid: {formatBudget(campaign.creator_rate_cents || campaign.budget_cents)}
                  </p>
                  {contract && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedContractCampaign(campaign.id)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      View Contract
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}

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

      {/* Contract Viewer Modal */}
      {selectedContract && (
        <ContractViewer
          contract={selectedContract}
          userRole="brand"
          onClose={() => setSelectedContractCampaign(null)}
          onSigned={() => {
            refetchContracts();
            fetchData();
          }}
        />
      )}
    </div>
  );
}
