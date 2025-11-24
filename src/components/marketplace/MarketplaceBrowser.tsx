import { useState } from 'react';
import { useMarketplaceCampaigns } from '@/hooks/useMarketplaceCampaigns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, DollarSign, TrendingUp, Briefcase } from 'lucide-react';
import { CampaignApplicationForm } from './CampaignApplicationForm';
import { CategoryFilter } from './CategoryFilter';
import { FeaturedCampaigns } from './FeaturedCampaigns';
import { CampaignPreviewModal } from './CampaignPreviewModal';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export function MarketplaceBrowser() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  const [applicationCampaignId, setApplicationCampaignId] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const filters = {
    search: searchQuery,
    category: selectedCategory || 'all',
    sortBy: 'newest' as const
  };

  const { campaigns, loading } = useMarketplaceCampaigns(filters);

  const handleViewCampaign = (campaign: any) => {
    setSelectedCampaign(campaign);
    setPreviewModalOpen(true);
  };

  const handleApplyCampaign = (campaignId: string) => {
    setApplicationCampaignId(campaignId);
    setPreviewModalOpen(false);
  };

  const formatBudget = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cents / 100);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search campaigns by keyword, brand, or category..."
          className="pl-12 h-14 text-lg bg-gradient-to-r from-card/50 to-card/30 backdrop-blur-xl border-primary/20"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Badge className="absolute right-4 top-1/2 -translate-y-1/2">
          {campaigns.length} campaigns
        </Badge>
      </div>

      {/* Category Filter - Moved above Featured Campaigns */}
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Featured Campaigns Carousel */}
      <FeaturedCampaigns 
        campaigns={campaigns.filter(c => c.status === 'open')}
        onViewCampaign={handleViewCampaign}
      />

      {/* Campaign Grid - 3 columns on large screens */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -8, scale: 1.02 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-3xl bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-primary/20 shadow-2xl hover:shadow-violet-500/20 transition-all duration-300 h-full group">
              {/* Animated gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Trending Badge */}
              {index < 3 && (
                <Badge className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 z-10">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Trending
                </Badge>
              )}

              <CardContent className="relative z-10 p-6 space-y-4">
                {/* Brand Logo/Name */}
                <div className="flex items-center gap-3">
                  {campaign.brands?.logo_url ? (
                    <img 
                      src={campaign.brands.logo_url} 
                      alt={campaign.brands.name}
                      className="w-12 h-12 rounded-lg object-cover border border-border"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{campaign.brands?.name}</p>
                    <Badge variant="outline" className="mt-1">{campaign.category}</Badge>
                  </div>
                </div>

                {/* Campaign Info */}
                <div>
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{campaign.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.description}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
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

                {/* View Details Button */}
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-primary-blue"
                  onClick={() => handleViewCampaign(campaign)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {campaigns.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No campaigns found matching your criteria</p>
        </div>
      )}

      {/* Campaign Preview Modal */}
      <CampaignPreviewModal
        campaign={selectedCampaign}
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        onApply={handleApplyCampaign}
      />

      {/* Application Form */}
      {applicationCampaignId && (
        <CampaignApplicationForm
          campaignId={applicationCampaignId}
          onClose={() => setApplicationCampaignId(null)}
        />
      )}
    </div>
  );
}
