import React, { useState } from 'react';
import { useBrands } from '@/hooks/useBrands';
import { useBrandAssets } from '@/hooks/useBrandAssets';
import { BrandSelector } from './BrandSelector';
import { CollectionsTree } from './CollectionsTree';
import { AssetGrid } from './AssetGrid';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, Sparkles, Calendar, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const BrandManager: React.FC = () => {
  const navigate = useNavigate();
  const { brands, isLoading: brandsLoading } = useBrands();
  const [selectedBrandId, setSelectedBrandId] = useState<string | undefined>();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | undefined>();
  
  const { assets, isLoading: assetsLoading, toggleFavorite, archiveAsset } = useBrandAssets(selectedBrandId);

  const selectedBrand = brands?.find(b => b.id === selectedBrandId);

  const stats = {
    totalAssets: assets?.length || 0,
    activeCampaigns: 3, // TODO: Get from campaigns query
    avgPerformance: 8.5, // TODO: Calculate from analytics
  };

  if (brandsLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!brands?.length) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Brand Manager</h1>
        <p className="text-muted-foreground mb-8">
          Create your first brand to start managing your content
        </p>
        <Button onClick={() => navigate('/brands/create')}>
          <Sparkles className="w-4 h-4 mr-2" />
          Create Your First Brand
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <CollectionsTree
        collections={[]} // TODO: Load from brand_collections
        selectedCollectionId={selectedCollectionId}
        onSelectCollection={setSelectedCollectionId}
        onCreateCollection={() => console.log('Create collection')}
      />

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <div className="px-8 py-4">
            <div className="flex items-center justify-between mb-4">
              <BrandSelector
                brands={brands}
                selectedBrand={selectedBrand}
                onSelectBrand={setSelectedBrandId}
                onCreateBrand={() => navigate('/brands/create')}
              />

              <div className="flex gap-2">
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
                <Button variant="outline">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload
                </Button>
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Content
                </Button>
              </div>
            </div>

            {/* Stats */}
            {selectedBrand && (
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Assets</p>
                      <p className="text-2xl font-bold">{stats.totalAssets}</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-primary" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Campaigns</p>
                      <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Performance</p>
                      <p className="text-2xl font-bold">{stats.avgPerformance}</p>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      +12%
                    </Badge>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Assets Grid */}
        <div className="p-8">
          {selectedBrand ? (
            <AssetGrid
              assets={assets || []}
              onToggleFavorite={(id, isFavorite) => toggleFavorite.mutate({ id, isFavorite })}
              onArchive={(id) => archiveAsset.mutate(id)}
              onEdit={(asset) => console.log('Edit asset:', asset)}
            />
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>Select a brand to view assets</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
