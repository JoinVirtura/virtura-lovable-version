import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Sparkles, Calendar, Plus, Search, Grid3x3, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { applySmartRules } from "@/lib/smartRules";
import { createDemoBrandData } from "@/lib/demoData";

interface BrandAsset {
  id: string;
  brand_id: string;
  collection_id: string | null;
  title: string;
  description: string | null;
  asset_type: string;
  file_url: string;
  thumbnail_url: string | null;
  tags: string[];
  created_at: string;
  performance_score: number | null;
}

interface Brand {
  id: string;
  name: string;
  brand_colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

interface Collection {
  id: string;
  name: string;
  collection_type: string;
  is_smart_folder: boolean;
  smart_rules: any;
}

export default function BrandManager() {
  const [selectedBrandId, setSelectedBrandId] = useState<string>("demo-brand");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch brands
  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data: existingBrand } = await supabase
        .from('brands' as any)
        .select('id')
        .eq('name', 'Sample Coffee Shop')
        .single();

      if (!existingBrand) {
        await createDemoBrandData();
      }

      const { data } = await supabase
        .from('brands' as any)
        .select('*')
        .order('created_at', { ascending: false });
      return data as unknown as Brand[];
    },
  });

  // Fetch collections
  const { data: collections } = useQuery({
    queryKey: ['brand-collections', selectedBrandId],
    queryFn: async () => {
      const { data } = await supabase
        .from('brand_collections' as any)
        .select('*')
        .eq('brand_id', selectedBrandId)
        .order('sort_order', { ascending: true });
      return data as unknown as Collection[];
    },
    enabled: !!selectedBrandId,
  });

  // Fetch assets
  const { data: assets, isLoading } = useQuery({
    queryKey: ['brand-assets', selectedBrandId],
    queryFn: async () => {
      const { data } = await supabase
        .from('brand_assets' as any)
        .select('*')
        .eq('brand_id', selectedBrandId)
        .order('created_at', { ascending: false });
      return data as unknown as BrandAsset[];
    },
    enabled: !!selectedBrandId,
  });

  // Filter assets by collection and search
  const filteredAssets = useMemo(() => {
    if (!assets) return [];

    let filtered = assets;

    // Apply collection filter
    if (selectedCollectionId !== 'all') {
      const selectedCollection = collections?.find(c => c.id === selectedCollectionId);
      if (selectedCollection?.is_smart_folder && selectedCollection.smart_rules) {
        filtered = applySmartRules(assets, selectedCollection.smart_rules);
      } else {
        filtered = assets.filter(a => a.collection_id === selectedCollectionId);
      }
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.description?.toLowerCase().includes(query) ||
        a.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [assets, collections, selectedCollectionId, searchQuery]);

  // Calculate stats
  const stats = useMemo(() => {
    const avgPerformance = assets?.length
      ? (assets.reduce((sum, a) => sum + (a.performance_score || 0), 0) / assets.length).toFixed(1)
      : '0.0';

    return {
      totalAssets: assets?.length || 0,
      activeCampaigns: 3, // Will be dynamic once campaigns are implemented
      avgPerformance,
    };
  }, [assets]);

  const selectedBrand = brands?.find(b => b.id === selectedBrandId);

  return (
    <div className="flex h-full gap-6">
      {/* Left Sidebar */}
      <div className="w-80 flex-shrink-0 space-y-6">
        {/* Brand Selector */}
        <Card className="p-4 bg-card/50 backdrop-blur border-primary/10">
          <label className="text-sm text-muted-foreground mb-2 block">Active Brand</label>
          <Select value={selectedBrandId} onValueChange={setSelectedBrandId}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {brands?.map(brand => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Stats */}
        <Card className="p-4 bg-card/50 backdrop-blur border-primary/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Assets</span>
            <span className="text-2xl font-bold">{stats.totalAssets}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Active Campaigns</span>
            <span className="text-2xl font-bold">{stats.activeCampaigns}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Avg Performance</span>
            <span className="text-2xl font-bold">{stats.avgPerformance}</span>
          </div>
        </Card>

        {/* Collections */}
        <Card className="p-4 bg-card/50 backdrop-blur border-primary/10">
          <h3 className="text-sm font-semibold mb-3">Collections</h3>
          <div className="space-y-1">
            <button
              onClick={() => setSelectedCollectionId('all')}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedCollectionId === 'all'
                  ? 'bg-primary/20 text-primary'
                  : 'hover:bg-accent/10'
              }`}
            >
              All Assets
            </button>
            {collections?.map(collection => (
              <button
                key={collection.id}
                onClick={() => setSelectedCollectionId(collection.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedCollectionId === collection.id
                    ? 'bg-primary/20 text-primary'
                    : 'hover:bg-accent/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{collection.name}</span>
                  {collection.is_smart_folder && (
                    <Badge variant="outline" className="text-xs">Smart</Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button className="w-full justify-start gap-2" variant="outline">
            <Upload className="w-4 h-4" />
            Upload
          </Button>
          <Button className="w-full justify-start gap-2" variant="outline">
            <Sparkles className="w-4 h-4" />
            Generate AI Content
          </Button>
          <Button className="w-full justify-start gap-2" variant="outline">
            <Calendar className="w-4 h-4" />
            Schedule Post
          </Button>
          <Button className="w-full justify-start gap-2" variant="outline">
            <Plus className="w-4 h-4" />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{selectedBrand?.name || 'Brand Manager'}</h1>
            <p className="text-muted-foreground">
              {filteredAssets.length} {filteredAssets.length === 1 ? 'asset' : 'assets'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Asset Grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="aspect-square animate-pulse bg-accent/10" />
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <Card className="p-12 text-center bg-card/50 backdrop-blur border-primary/10">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No assets yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your first asset or generate content with AI
            </p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate
              </Button>
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-3 gap-4' : 'space-y-4'}>
            {filteredAssets.map(asset => (
              <Card
                key={asset.id}
                className="overflow-hidden group hover:border-primary/50 transition-all cursor-pointer bg-card/50 backdrop-blur"
              >
                <div className="aspect-square relative overflow-hidden bg-accent/5">
                  <img
                    src={asset.file_url}
                    alt={asset.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {asset.asset_type === 'video' && (
                    <Badge className="absolute top-2 right-2">Video</Badge>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold truncate">{asset.title}</h3>
                  {asset.description && (
                    <p className="text-sm text-muted-foreground truncate">{asset.description}</p>
                  )}
                  {asset.tags && asset.tags.length > 0 && (
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {asset.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
