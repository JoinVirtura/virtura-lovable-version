import { useState } from 'react';
import { useMarketplaceCampaigns } from '@/hooks/useMarketplaceCampaigns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Calendar, DollarSign, Briefcase } from 'lucide-react';
import { CampaignApplicationForm } from './CampaignApplicationForm';
import { Skeleton } from '@/components/ui/skeleton';

export function MarketplaceBrowser() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    minBudget: undefined as number | undefined,
    maxBudget: undefined as number | undefined,
    sortBy: 'newest' as 'newest' | 'budget_high' | 'budget_low' | 'deadline',
  });
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  const { campaigns, loading } = useMarketplaceCampaigns(filters);

  const formatBudget = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const formatDeadline = (deadline: string | null) => {
    if (!deadline) return 'No deadline';
    const date = new Date(deadline);
    const now = new Date();
    const days = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return 'Expired';
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days left`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-full" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Creator Marketplace</h1>
        <p className="text-muted-foreground mt-2">
          Find brand campaigns and get paid for your content
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>

            <Select
              value={filters.category}
              onValueChange={(value) => setFilters({ ...filters, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="video">Video</SelectItem>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="animation">Animation</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sortBy}
              onValueChange={(value: any) => setFilters({ ...filters, sortBy: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="budget_high">Highest Budget</SelectItem>
                <SelectItem value="budget_low">Lowest Budget</SelectItem>
                <SelectItem value="deadline">Deadline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No campaigns found</p>
            <p className="text-muted-foreground">Try adjusting your filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {campaign.brands?.name}
                    </CardDescription>
                  </div>
                  {campaign.category && (
                    <Badge variant="secondary">{campaign.category}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {campaign.description}
                </p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                    <span className="font-semibold">{formatBudget(campaign.budget_cents)}</span>
                  </div>
                  {campaign.deadline && (
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span>{formatDeadline(campaign.deadline)}</span>
                    </div>
                  )}
                </div>

                {campaign.deliverables && (
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(campaign.deliverables).map(([key, value]: [string, any]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {value}x {key}
                      </Badge>
                    ))}
                  </div>
                )}

                <Button
                  className="w-full"
                  onClick={() => setSelectedCampaign(campaign.id)}
                >
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedCampaign && (
        <CampaignApplicationForm
          campaignId={selectedCampaign}
          onClose={() => setSelectedCampaign(null)}
        />
      )}
    </div>
  );
}
