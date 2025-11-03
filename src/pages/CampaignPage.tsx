import { useState, useEffect } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { MotionBackground } from "@/components/MotionBackground";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Calendar,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  PlayCircle,
  Pause,
  Trash2,
} from "lucide-react";
import { useBrandAssets } from "@/hooks/useBrandAssets";
import { useCampaigns } from "@/hooks/useCampaigns";
import { CreateBrandDialog } from "@/components/CreateBrandDialog";
import { CampaignCreator } from "@/components/CampaignCreator";
import { CampaignScheduler } from "@/components/CampaignScheduler";
import { toast } from "sonner";
import { format } from "date-fns";

export default function CampaignPage() {
  const { brands, assets, loadBrands, loadAssets } = useBrandAssets();
  const {
    campaigns,
    campaignContent,
    loadCampaigns,
    loadCampaignContent,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    addContentToCampaign,
    updateCampaignContent,
  } = useCampaigns();

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [showCreateCampaign, setShowCreateCampaign] = useState(false);

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Auto-select first brand
  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0].id);
    }
  }, [brands]);

  // Load campaigns and assets when brand changes
  useEffect(() => {
    if (selectedBrand) {
      loadCampaigns(selectedBrand);
      loadAssets(selectedBrand);
    }
  }, [selectedBrand]);

  // Load campaign content when campaign is selected
  useEffect(() => {
    if (selectedCampaign) {
      loadCampaignContent(selectedCampaign);
    }
  }, [selectedCampaign]);

  const handleStatusChange = async (campaignId: string, newStatus: string) => {
    try {
      await updateCampaign(campaignId, { status: newStatus });
    } catch (err) {
      console.error("Error updating campaign status:", err);
    }
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteCampaign(campaignId);
      if (selectedCampaign === campaignId) {
        setSelectedCampaign(null);
      }
    } catch (err) {
      console.error("Error deleting campaign:", err);
    }
  };

  const activeCampaign = campaigns.find((c) => c.id === selectedCampaign);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MotionBackground />
      <VirturaNavigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Campaign Manager</h1>
          <p className="text-muted-foreground">
            Create, schedule, and track your marketing campaigns
          </p>
        </div>

        {/* Brand Selector */}
        {brands.length === 0 ? (
          <Card className="mb-6 p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">No Brands Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first brand to start managing campaigns
            </p>
            <Button onClick={() => setShowCreateBrand(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Brand
            </Button>
          </Card>
        ) : (
          <Card className="mb-6 p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Brand</label>
                <Select value={selectedBrand || undefined} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a brand..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6">
                <Button
                  onClick={() => setShowCreateCampaign(true)}
                  disabled={!selectedBrand}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>
            </div>
          </Card>
        )}

        {selectedBrand && (
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="schedule" disabled={!selectedCampaign}>
                Schedule Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Campaign Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Target className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{campaigns.length}</p>
                      <p className="text-xs text-muted-foreground">Total Campaigns</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <PlayCircle className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {campaigns.filter((c) => c.status === "active").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{campaignContent.length}</p>
                      <p className="text-xs text-muted-foreground">Scheduled Posts</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {campaigns.filter((c) => c.status === "completed").length}
                      </p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Campaigns List */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Your Campaigns</h3>

                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground mb-4">
                      No campaigns yet. Create your first campaign to get started!
                    </p>
                    <Button onClick={() => setShowCreateCampaign(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Campaign
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <Card
                        key={campaign.id}
                        className={`p-4 cursor-pointer transition-colors ${
                          selectedCampaign === campaign.id
                            ? "border-primary bg-primary/5"
                            : "hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedCampaign(campaign.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold text-lg">{campaign.name}</h4>
                              <Badge
                                variant={
                                  campaign.status === "active"
                                    ? "default"
                                    : campaign.status === "completed"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {campaign.status}
                              </Badge>
                            </div>

                            {campaign.description && (
                              <p className="text-sm text-muted-foreground mb-3">
                                {campaign.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-4 text-sm">
                              {campaign.start_date && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {format(new Date(campaign.start_date), "MMM d, yyyy")}
                                  </span>
                                </div>
                              )}

                              {campaign.budget && (
                                <div className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                                  <span>${campaign.budget.toLocaleString()}</span>
                                </div>
                              )}

                              {campaign.target_platforms &&
                                campaign.target_platforms.length > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-muted-foreground" />
                                    <span>{campaign.target_platforms.length} platforms</span>
                                  </div>
                                )}
                            </div>

                            {campaign.target_platforms &&
                              campaign.target_platforms.length > 0 && (
                                <div className="flex gap-1 mt-3 flex-wrap">
                                  {campaign.target_platforms.map((platform) => (
                                    <Badge key={platform} variant="secondary">
                                      {platform}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                          </div>

                          <div className="flex gap-2 ml-4">
                            {campaign.status === "planning" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(campaign.id, "active");
                                }}
                              >
                                <PlayCircle className="w-4 h-4 mr-1" />
                                Start
                              </Button>
                            )}

                            {campaign.status === "active" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(campaign.id, "paused");
                                }}
                              >
                                <Pause className="w-4 h-4 mr-1" />
                                Pause
                              </Button>
                            )}

                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteCampaign(campaign.id);
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="schedule">
              {activeCampaign && (
                <div className="space-y-6">
                  <Card className="p-6">
                    <h3 className="text-xl font-semibold mb-2">
                      {activeCampaign.name}
                    </h3>
                    <p className="text-muted-foreground">
                      Schedule and manage content for this campaign
                    </p>
                  </Card>

                  <CampaignScheduler
                    campaignContent={campaignContent}
                    assets={assets}
                    brandId={selectedBrand}
                    onScheduleContent={async (data) => {
                      const result = await addContentToCampaign({
                        ...data,
                        campaign_id: selectedCampaign!,
                      });
                      await loadCampaignContent(selectedCampaign!);
                      return result;
                    }}
                    onUpdateContent={async (id, data) => {
                      await updateCampaignContent(id, data);
                      await loadCampaignContent(selectedCampaign!);
                    }}
                  />
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>

      <CreateBrandDialog
        open={showCreateBrand}
        onOpenChange={setShowCreateBrand}
        onBrandCreated={(brandId) => {
          loadBrands();
          setSelectedBrand(brandId);
          setShowCreateBrand(false);
        }}
      />

      <CampaignCreator
        open={showCreateCampaign}
        onOpenChange={setShowCreateCampaign}
        brandId={selectedBrand || ""}
        onCampaignCreated={(campaign) => {
          setSelectedCampaign(campaign.id);
        }}
        onSubmit={createCampaign}
      />
    </div>
  );
}
