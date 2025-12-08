import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMarketplaceApplications } from '@/hooks/useMarketplaceApplications';
import { useMarketplaceContracts } from '@/hooks/useMarketplaceContracts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { CheckCircle, Clock, XCircle, Search, DollarSign, Calendar, MessageSquare, Upload, Briefcase, FileText } from 'lucide-react';
import { DeliverableUpload } from './DeliverableUpload';
import { CampaignChat } from './CampaignChat';
import { CampaignApplicationForm } from './CampaignApplicationForm';
import { CategoryFilter } from './CategoryFilter';
import { ContractViewer } from './ContractViewer';
import { ContractStatusBadge } from './ContractStatusBadge';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  title: string;
  description: string | null;
  budget_cents: number;
  creator_rate_cents: number | null;
  deadline: string | null;
  status: string | null;
  category: string | null;
  brands: {
    name: string;
    logo_url: string | null;
  } | null;
}

interface Application {
  id: string;
  campaign_id: string;
  pitch: string;
  proposed_rate_cents: number;
  status: string | null;
  applied_at: string | null;
  campaign?: Campaign;
}

export function CreatorMarketplaceDashboard() {
  const { user } = useAuth();
  const { contracts, getContractForCampaign, refetch: refetchContracts } = useMarketplaceContracts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [openCampaigns, setOpenCampaigns] = useState<Campaign[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [activeGigs, setActiveGigs] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaignForApplication, setSelectedCampaignForApplication] = useState<string | null>(null);
  const [selectedCampaignForChat, setSelectedCampaignForChat] = useState<string | null>(null);
  const [selectedCampaignForUpload, setSelectedCampaignForUpload] = useState<string | null>(null);
  const [selectedContractCampaign, setSelectedContractCampaign] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const { data: creatorAccount } = await supabase
        .from('creator_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (creatorAccount) {
        setCreatorId(creatorAccount.id);
      }

      const { data: campaignsData } = await supabase
        .from('marketplace_campaigns')
        .select(`
          *,
          brands:brand_id(name, logo_url)
        `)
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      setOpenCampaigns(campaignsData || []);

      if (creatorAccount) {
        const { data: appsData } = await supabase
          .from('marketplace_applications')
          .select(`
            *,
            campaign:campaign_id(
              *,
              brands:brand_id(name, logo_url)
            )
          `)
          .eq('creator_id', creatorAccount.id)
          .order('applied_at', { ascending: false });

        setMyApplications(appsData || []);

        const { data: gigsData } = await supabase
          .from('marketplace_campaigns')
          .select(`
            *,
            brands:brand_id(name, logo_url)
          `)
          .eq('creator_id', creatorAccount.id)
          .in('status', ['in_progress', 'completed'])
          .order('updated_at', { ascending: false });

        setActiveGigs(gigsData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
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

  const filteredCampaigns = openCampaigns.filter(campaign => {
    const matchesSearch = !searchQuery || 
      campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      campaign.brands?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || 
      campaign.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get pending contracts that need creator signature
  const pendingContracts = contracts.filter(c => 
    c.status === 'pending_creator' && !c.creator_signed_at
  );

  // Get selected contract for viewer
  const selectedContract = selectedContractCampaign 
    ? getContractForCampaign(selectedContractCampaign)
    : null;

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Contracts Alert */}
      {pendingContracts.length > 0 && (
        <Card className="backdrop-blur-xl bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-yellow-500/20">
                  <FileText className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-yellow-400">Contracts Awaiting Your Signature</p>
                  <p className="text-sm text-muted-foreground">
                    You have {pendingContracts.length} contract{pendingContracts.length > 1 ? 's' : ''} to review and sign
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                onClick={() => setSelectedContractCampaign(pendingContracts[0].campaign_id)}
              >
                Review Contract
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-xl">
          <TabsTrigger value="browse">Browse Campaigns</TabsTrigger>
          <TabsTrigger value="applications">My Applications ({myApplications.length})</TabsTrigger>
          <TabsTrigger value="active">Active Gigs ({activeGigs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="mt-6 space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-12 h-12 bg-card/50 backdrop-blur-xl border-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Badge className="absolute right-4 top-1/2 -translate-y-1/2">
              {filteredCampaigns.length} campaigns
            </Badge>
          </div>

          <CategoryFilter
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredCampaigns.map((campaign, index) => (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="backdrop-blur-3xl bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-primary/20 h-full">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      {campaign.brands?.logo_url ? (
                        <img 
                          src={campaign.brands.logo_url} 
                          alt={campaign.brands.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Briefcase className="w-5 h-5 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm text-muted-foreground">{campaign.brands?.name}</p>
                        <Badge variant="outline" className="text-xs">{campaign.category}</Badge>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-lg mb-1">{campaign.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-primary" />
                        <span className="font-bold">{formatBudget(campaign.budget_cents)}</span>
                      </div>
                      {campaign.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(campaign.deadline), 'MMM dd')}
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-primary-blue"
                      onClick={() => setSelectedCampaignForApplication(campaign.id)}
                    >
                      Apply Now
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="applications" className="mt-6 space-y-4">
          {myApplications.map((app) => {
            const contract = app.campaign_id ? getContractForCampaign(app.campaign_id) : null;
            const needsSignature = contract?.status === 'pending_creator' && !contract.creator_signed_at;
            
            return (
              <Card key={app.id} className="backdrop-blur-xl bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{app.campaign?.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {app.campaign?.brands?.name} • Applied {app.applied_at && format(new Date(app.applied_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract && <ContractStatusBadge status={contract.status} />}
                      {getStatusBadge(app.status || 'pending')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Proposed Rate:</span>
                      <span className="ml-2 font-bold">{formatBudget(app.proposed_rate_cents)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{app.pitch}</p>
                  
                  {/* Contract action for accepted applications */}
                  {app.status === 'accepted' && contract && (
                    <Button 
                      onClick={() => setSelectedContractCampaign(app.campaign_id)}
                      className={needsSignature ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : ''}
                      variant={needsSignature ? 'default' : 'outline'}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      {needsSignature ? 'Sign Contract' : 'View Contract'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {myApplications.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't applied to any campaigns yet</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => document.querySelector('[value="browse"]')?.dispatchEvent(new Event('click'))}
              >
                Browse Campaigns
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeGigs.map((campaign) => {
            const contract = getContractForCampaign(campaign.id);
            
            return (
              <Card key={campaign.id} className="backdrop-blur-xl bg-card/50">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{campaign.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {campaign.brands?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {contract && <ContractStatusBadge status={contract.status} />}
                      {getStatusBadge(campaign.status || 'open')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Your Rate:</span>
                      <span className="ml-2 font-bold">{formatBudget(campaign.creator_rate_cents || 0)}</span>
                    </div>
                    {campaign.deadline && (
                      <div>
                        <span className="text-sm text-muted-foreground">Deadline:</span>
                        <span className="ml-2">{format(new Date(campaign.deadline), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedCampaignForChat(campaign.id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Chat with Brand
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
                    {campaign.status === 'in_progress' && (
                      <Button 
                        onClick={() => setSelectedCampaignForUpload(campaign.id)}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Deliverable
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {activeGigs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active gigs yet. Apply to campaigns to get started!</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Form Modal */}
      {selectedCampaignForApplication && (
        <CampaignApplicationForm
          campaignId={selectedCampaignForApplication}
          onClose={() => {
            setSelectedCampaignForApplication(null);
            fetchData();
          }}
        />
      )}

      {/* Chat Modal */}
      {selectedCampaignForChat && (
        <CampaignChat
          campaignId={selectedCampaignForChat}
          onClose={() => setSelectedCampaignForChat(null)}
        />
      )}

      {/* Deliverable Upload Modal */}
      {selectedCampaignForUpload && (
        <DeliverableUpload
          campaignId={selectedCampaignForUpload}
          onClose={() => {
            setSelectedCampaignForUpload(null);
            fetchData();
          }}
        />
      )}

      {/* Contract Viewer Modal */}
      {selectedContract && (
        <ContractViewer
          contract={selectedContract}
          userRole="creator"
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
