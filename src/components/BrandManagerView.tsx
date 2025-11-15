import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { StudioBackground } from '@/components/StudioBackground';
import { CreateBrandDialog } from '@/components/CreateBrandDialog';
import { LibrarySelectionModal } from '@/components/LibrarySelectionModal';
import { GenerateAssetDialog } from '@/components/GenerateAssetDialog';
import { BrandKitDialog } from '@/components/BrandKitDialog';
import { CampaignCreator } from '@/components/CampaignCreator';
import { AssetEditDialog } from '@/components/AssetEditDialog';
import { BrandAnalyticsDashboard } from '@/components/BrandAnalyticsDashboard';
import { useBrandAssets, type Brand } from '@/hooks/useBrandAssets';
import { useCampaigns } from '@/hooks/useCampaigns';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import {
  ChevronRight,
  Folder,
  FolderOpen,
  Image,
  Video,
  FileText,
  Home,
  Plus,
  Search,
  Star,
  Clock,
  Upload,
  Library,
  Calendar,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Share2,
  Edit3,
  Trash2,
  CheckSquare,
  Square,
  BarChart3,
  Menu,
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function BrandManagerView() {
  const navigate = useNavigate();
  const {
    brands,
    collections,
    assets,
    loading,
    loadBrands,
    loadCollections,
    loadAssets,
    createCollection,
    deleteAsset,
    updateAssetMetadata,
    toggleFavorite,
    deleteCollection,
    updateCollection,
    getBrandStats,
    saveGeneratedAsset,
  } = useBrandAssets();

  const {
    campaigns,
    loading: campaignsLoading,
    loadCampaigns,
    createCampaign,
  } = useCampaigns();

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [filterType, setFilterType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createBrandOpen, setCreateBrandOpen] = useState(false);
  const [brandStats, setBrandStats] = useState({ totalAssets: 0, activeCampaigns: 0, avgPerformance: 0 });
  const [newFolderName, setNewFolderName] = useState('');
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [brandKitOpen, setBrandKitOpen] = useState(false);
  const [campaignCreatorOpen, setCampaignCreatorOpen] = useState(false);
  const [editAssetDialogOpen, setEditAssetDialogOpen] = useState(false);
  const [selectedAssetForEdit, setSelectedAssetForEdit] = useState<typeof assets[0] | null>(null);
  const [batchMode, setBatchMode] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set());
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Load collections, assets, and campaigns when brand changes
  useEffect(() => {
    if (selectedBrand) {
      loadCollections(selectedBrand);
      loadAssets(selectedBrand, currentFolder === 'all' ? undefined : currentFolder);
      getBrandStats(selectedBrand).then(setBrandStats);
      loadCampaigns(selectedBrand);
    }
  }, [selectedBrand]);

  // Load assets when folder changes
  useEffect(() => {
    if (selectedBrand) {
      const filters = {
        searchQuery,
        assetType: filterType,
        sortBy,
      };
      loadAssets(selectedBrand, currentFolder === 'all' ? undefined : currentFolder, filters);
    }
  }, [currentFolder, searchQuery, filterType, sortBy]);

  // Don't auto-select brands - let user choose their brand

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedBrand) return;
    
    try {
      await createCollection(selectedBrand, newFolderName, 'custom');
      setNewFolderName('');
      if (selectedBrand) {
        loadCollections(selectedBrand);
      }
    } catch (error) {
      console.error('Failed to create folder:', error);
    }
  };

  const handleBrandChange = (brandId: string) => {
    if (brandId === 'new-brand') {
      setCreateBrandOpen(true);
    } else {
      setSelectedBrand(brandId);
      setCurrentFolder('all');
    }
  };

  const handleBrandCreated = (brandId: string) => {
    loadBrands().then(() => {
      setSelectedBrand(brandId);
    });
  };

  const handleSmartCollection = (type: string) => {
    if (!selectedBrand) return;
    
    let filters: any = { sortBy };
    
    switch (type) {
      case 'favorites':
        filters.isFavorite = true;
        break;
      case 'recent':
        filters.days = 7;
        break;
      case 'images':
        filters.assetType = 'image';
        break;
      case 'videos':
        filters.assetType = 'video';
        break;
      case 'documents':
        filters.assetType = 'document';
        break;
    }
    
    loadAssets(selectedBrand, undefined, filters);
    setCurrentFolder('smart-' + type);
  };

  const handleDeleteFolder = async (folderId: string, folderName: string, assetCount: number) => {
    if (assetCount > 0) {
      const confirmed = window.confirm(
        `"${folderName}" contains ${assetCount} asset(s). Deleting this folder will move them to "All Assets". Continue?`
      );
      if (!confirmed) return;
    }

    try {
      await deleteCollection(folderId);
      
      if (selectedBrand) {
        loadCollections(selectedBrand);
        if (currentFolder === folderId) {
          setCurrentFolder('all');
        }
      }
    } catch (error) {
      console.error('Delete folder error:', error);
    }
  };

  const handleRenameFolder = async (folderId: string, currentName: string) => {
    const newName = window.prompt(`Rename folder:`, currentName);
    if (!newName || newName === currentName) return;

    try {
      await updateCollection(folderId, { name: newName });
      
      if (selectedBrand) {
        loadCollections(selectedBrand);
      }
    } catch (error) {
      console.error('Rename folder error:', error);
    }
  };

  // Build nested folder tree
  const rootCollections = collections.filter(c => !c.parent_collection_id);
  const getChildren = (parentId: string) => collections.filter(c => c.parent_collection_id === parentId);

  const renderFolderTree = (folder: typeof collections[0], depth = 0) => {
    const children = getChildren(folder.id);
    const isExpanded = expandedFolders.has(folder.id);
    const assetCount = assets.filter(a => a.collection_id === folder.id).length;

    return (
      <div key={folder.id}>
        <div className="flex items-center group">
          <Button
            variant="ghost"
            className={`flex-1 justify-start gap-2 pl-2 relative ${
              currentFolder === folder.id ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-violet-500/10'
            }`}
            onClick={() => {
              setCurrentFolder(folder.id);
              if (children.length > 0) toggleFolder(folder.id);
            }}
          >
            {children.length > 0 && (
              <ChevronRight className={`w-3 h-3 transition-transform absolute left-2 ${isExpanded ? 'rotate-90' : ''}`} />
            )}
            {isExpanded ? (
              <FolderOpen className={`w-4 h-4 flex-shrink-0 ${children.length > 0 ? 'ml-4' : ''}`} />
            ) : (
              <Folder className={`w-4 h-4 flex-shrink-0 ${children.length > 0 ? 'ml-4' : ''}`} />
            )}
            <span className="flex-1 text-left text-sm truncate min-w-0 max-w-[180px]">{folder.name}</span>
            <span className="text-xs text-muted-foreground flex-shrink-0">{assetCount}</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-900 border-violet-500/30">
              <DropdownMenuItem onClick={() => handleRenameFolder(folder.id, folder.name)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-400"
                onClick={() => handleDeleteFolder(folder.id, folder.name, assetCount)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {isExpanded && children.map(child => renderFolderTree(child, depth + 1))}
      </div>
    );
  };

  const getFolderName = () => {
    if (currentFolder === 'all') return 'All Assets';
    if (currentFolder.startsWith('smart-')) {
      const type = currentFolder.replace('smart-', '');
      return type.charAt(0).toUpperCase() + type.slice(1);
    }
    return collections.find(c => c.id === currentFolder)?.name || 'Unknown';
  };

  // Asset Actions Handlers
  const handleDownload = async (asset: typeof assets[0]) => {
    try {
      const response = await fetch(asset.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = asset.file_url.split('.').pop() || 'png';
      a.download = `${asset.title}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      // Track analytics - increment download count
      const currentDownloads = asset.metadata?.downloads || 0;
      const currentShares = asset.metadata?.shares || 0;
      const newScore = calculatePerformanceScore(currentDownloads + 1, currentShares, asset.usage_count);
      
      await updateAssetMetadata(asset.id, { 
        usage_count: asset.usage_count + 1,
        metadata: { ...asset.metadata, downloads: currentDownloads + 1 },
        performance_score: newScore,
      });
      
      toast.success('Asset downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download asset');
    }
  };

  const handleShare = async (asset: typeof assets[0]) => {
    try {
      // Generate shareable link (7 days expiry)
      const path = asset.file_url.split('/').slice(-2).join('/');
      const { data, error } = await supabase.storage
        .from('virtura-media')
        .createSignedUrl(path, 604800); // 7 days

      if (error) throw error;

      if (data?.signedUrl) {
        await navigator.clipboard.writeText(data.signedUrl);
        toast.success('Share link copied to clipboard!');
      } else {
        // Fallback to public URL
        await navigator.clipboard.writeText(asset.file_url);
        toast.success('Asset link copied to clipboard!');
      }
      
      // Track analytics - increment share count
      const currentDownloads = asset.metadata?.downloads || 0;
      const currentShares = asset.metadata?.shares || 0;
      const newScore = calculatePerformanceScore(currentDownloads, currentShares + 1, asset.usage_count);
      
      await updateAssetMetadata(asset.id, {
        metadata: { ...asset.metadata, shares: currentShares + 1 },
        performance_score: newScore,
      });
    } catch (error) {
      console.error('Share error:', error);
      // Fallback: copy public URL
      try {
        await navigator.clipboard.writeText(asset.file_url);
        toast.success('Asset link copied to clipboard!');
      } catch {
        toast.error('Failed to copy share link');
      }
    }
  };

  const calculatePerformanceScore = (downloads: number, shares: number, usageCount: number): number => {
    // Weighted formula: downloads (40%), shares (40%), usage (20%)
    return (downloads * 0.4) + (shares * 0.4) + (usageCount * 0.2);
  };

  const handleEdit = (asset: typeof assets[0]) => {
    setSelectedAssetForEdit(asset);
    setEditAssetDialogOpen(true);
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assetId)) {
        newSet.delete(assetId);
      } else {
        newSet.add(assetId);
      }
      return newSet;
    });
  };

  const handleBatchDelete = async () => {
    if (selectedAssets.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedAssets.size} asset(s)?`
    );
    if (!confirmed) return;

    try {
      await Promise.all(
        Array.from(selectedAssets).map(assetId => deleteAsset(assetId))
      );
      setSelectedAssets(new Set());
      setBatchMode(false);
      toast.success(`${selectedAssets.size} asset(s) deleted successfully`);
    } catch (error) {
      console.error('Batch delete error:', error);
      toast.error('Failed to delete some assets');
    }
  };

  const handleBatchDownload = async () => {
    if (selectedAssets.size === 0) return;
    
    const assetsToDownload = assets.filter(a => selectedAssets.has(a.id));
    for (const asset of assetsToDownload) {
      await handleDownload(asset);
    }
    toast.success(`Downloaded ${selectedAssets.size} asset(s)`);
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;
    
    const brand = brands.find(b => b.id === selectedBrand);
    const confirmed = window.confirm(
      `Are you sure you want to delete "${brand?.name}"? This will permanently delete all assets, campaigns, and collections associated with this brand.`
    );
    
    if (!confirmed) return;
    
    try {
      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', selectedBrand);
      
      if (error) throw error;
      
      toast.success('Brand deleted successfully');
      setSelectedBrand(null);
      await loadBrands();
    } catch (error) {
      console.error('Delete brand error:', error);
      toast.error('Failed to delete brand');
    }
  };

  const SidebarContent = () => (
    <div className="w-full h-full space-y-6 overflow-y-auto overflow-x-hidden p-6">
          {/* New Campaign Button - Primary Action */}
          <Button
            variant="default"
            disabled={!selectedBrand}
            className="w-full justify-start gap-3 bg-violet-600 hover:bg-violet-700 text-white"
            onClick={() => {
              if (!selectedBrand) {
                toast.error('Select a brand first to create a campaign');
                return;
              }
              setCampaignCreatorOpen(true);
            }}
          >
            <Calendar className="w-4 h-4" />
            New Campaign
          </Button>

          <Separator className="my-4 bg-violet-500/20" />

          {/* Brand Selector */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Active Brand</Label>
            <div className="flex gap-2 items-center">
              <Select value={selectedBrand || undefined} onValueChange={handleBrandChange}>
                <SelectTrigger className="flex-1 bg-black/60 border-violet-500/30">
                  <SelectValue placeholder="Select a brand" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-violet-500/30">
                  {brands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new-brand">+ New Brand</SelectItem>
                </SelectContent>
              </Select>
              {selectedBrand && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 w-9 p-0 border-violet-500/30 hover:border-violet-500/50">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-violet-500/30">
                    <DropdownMenuItem onClick={handleDeleteBrand} className="text-red-400">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Brand
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>


          {/* Smart Collections */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Smart Collections</h3>
            <div className={`space-y-1 ${!selectedBrand ? 'opacity-50' : ''}`}>
              <Button
                variant="ghost"
                disabled={!selectedBrand}
                className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                onClick={() => {
                  if (!selectedBrand) {
                    toast.error('Create a brand first to use Smart Collections');
                    return;
                  }
                  handleSmartCollection('favorites');
                }}
              >
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="flex-1 text-left text-sm">Favorites</span>
              </Button>
              <Button
                variant="ghost"
                disabled={!selectedBrand}
                className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                onClick={() => {
                  if (!selectedBrand) {
                    toast.error('Create a brand first to use Smart Collections');
                    return;
                  }
                  handleSmartCollection('recent');
                }}
              >
                <Clock className="w-4 h-4 text-blue-400" />
                <span className="flex-1 text-left text-sm">Recent</span>
              </Button>
              <Button
                variant="ghost"
                disabled={!selectedBrand}
                className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                onClick={() => {
                  if (!selectedBrand) {
                    toast.error('Create a brand first to use Smart Collections');
                    return;
                  }
                  handleSmartCollection('images');
                }}
              >
                <Image className="w-4 h-4 text-green-400" />
                <span className="flex-1 text-left text-sm">Images</span>
              </Button>
              <Button
                variant="ghost"
                disabled={!selectedBrand}
                className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                onClick={() => {
                  if (!selectedBrand) {
                    toast.error('Create a brand first to use Smart Collections');
                    return;
                  }
                  handleSmartCollection('videos');
                }}
              >
                <Video className="w-4 h-4 text-purple-400" />
                <span className="flex-1 text-left text-sm">Videos</span>
              </Button>
              <Button
                variant="ghost"
                disabled={!selectedBrand}
                className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                onClick={() => {
                  if (!selectedBrand) {
                    toast.error('Create a brand first to use Smart Collections');
                    return;
                  }
                  handleSmartCollection('documents');
                }}
              >
                <FileText className="w-4 h-4 text-orange-400" />
                <span className="flex-1 text-left text-sm">Documents</span>
              </Button>
            </div>
          </div>

          <Separator className="my-4 bg-violet-500/20" />

          {/* Brand Kit Section */}
          {selectedBrand && brands.find(b => b.id === selectedBrand) && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Brand Kit</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-violet-400 hover:text-violet-300"
                  onClick={() => setBrandKitOpen(true)}
                >
                  Edit
                </Button>
              </div>

              <div className="space-y-3">
                {/* Logo Preview */}
                <div className="border border-violet-500/20 rounded-lg p-3 bg-black/40">
                  <Label className="text-xs text-muted-foreground mb-2 block">Logo</Label>
                  {brands.find(b => b.id === selectedBrand)?.logo_url ? (
                    <div className="bg-white/5 rounded p-2 flex items-center justify-center h-16">
                      <img
                        src={brands.find(b => b.id === selectedBrand)?.logo_url!}
                        alt="Brand logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-violet-500/30"
                      onClick={() => setBrandKitOpen(true)}
                    >
                      <Upload className="w-3 h-3 mr-2" />
                      Upload Logo
                    </Button>
                  )}
                </div>

                {/* Colors */}
                <div className="border border-violet-500/20 rounded-lg p-3 bg-black/40">
                  <Label className="text-xs text-muted-foreground mb-2 block">Colors</Label>
                  <div className="flex gap-2">
                    {(() => {
                      const brand = brands.find(b => b.id === selectedBrand);
                      const colors = brand?.brand_colors || { primary: '#000000', secondary: '#666666', accent: '#FF0000' };
                      return Object.entries(colors).slice(0, 3).map(([key, value]: [string, any]) => (
                        <div
                          key={key}
                          className="flex-1 rounded border border-violet-500/20 overflow-hidden cursor-pointer hover:border-violet-500/40 transition-colors"
                          style={{ backgroundColor: value }}
                          onClick={() => setBrandKitOpen(true)}
                          title={`${key}: ${value}`}
                        >
                          <div className="h-8" />
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Fonts */}
                <div className="border border-violet-500/20 rounded-lg p-3 bg-black/40">
                  <Label className="text-xs text-muted-foreground mb-2 block">Fonts</Label>
                  <div className="space-y-1">
                    <div className="text-xs">
                      <span className="text-muted-foreground">Heading:</span>{' '}
                      <span className="text-white">{brands.find(b => b.id === selectedBrand)?.brand_fonts?.heading || 'Inter'}</span>
                    </div>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Body:</span>{' '}
                      <span className="text-white">{brands.find(b => b.id === selectedBrand)?.brand_fonts?.body || 'Inter'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Separator className="my-4 bg-violet-500/20" />

          {/* Folders Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-muted-foreground">Folders</h3>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    disabled={!selectedBrand}
                    className="h-7 px-2 text-violet-400 hover:text-violet-300"
                    onClick={(e) => {
                      if (!selectedBrand) {
                        e.preventDefault();
                        toast.error('Create a brand first to add folders');
                      }
                    }}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    New
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-violet-500/30 w-56">
                  <div className="p-2">
                    <Input
                      placeholder="Folder name..."
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateFolder();
                      }}
                      className="mb-2"
                    />
                    <Button size="sm" className="w-full" onClick={handleCreateFolder}>
                      Create
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className={`space-y-1 ${!selectedBrand ? 'opacity-50' : ''}`}>
              <Button
                variant="ghost"
                disabled={!selectedBrand}
                className={`w-full justify-start gap-2 pl-2 ${
                  currentFolder === 'all' && selectedBrand ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-violet-500/10'
                }`}
                onClick={() => {
                  if (!selectedBrand) {
                    toast.error('Create a brand first to view assets');
                    return;
                  }
                  setCurrentFolder('all');
                }}
              >
                <Home className="w-4 h-4" />
                <span className="flex-1 text-left">All Assets</span>
                <span className="text-xs text-muted-foreground">{selectedBrand ? assets.length : 0}</span>
              </Button>

              {selectedBrand && rootCollections.map(folder => renderFolderTree(folder))}
            </div>
          </div>

          <Separator className="my-4 bg-violet-500/20" />

          {/* Campaigns Section */}
          {selectedBrand && campaigns.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Campaigns</h3>
                <Badge variant="secondary" className="text-xs">
                  {campaigns.length}
                </Badge>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {campaigns.slice(0, 10).map((campaign) => (
                  <Button
                    key={campaign.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10 text-left"
                    onClick={() => navigate(`/campaigns?id=${campaign.id}`)}
                  >
                    <Calendar className="w-4 h-4 flex-shrink-0 text-violet-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{campaign.status}</p>
                    </div>
                  </Button>
                ))}
              </div>

              {campaigns.length > 10 && (
                <Button
                  variant="ghost"
                  className="w-full text-xs text-violet-400 hover:text-violet-300 mt-2"
                  onClick={() => navigate('/campaigns')}
                >
                  View all campaigns →
                </Button>
              )}
            </div>
          )}
    </div>
  );

  return (
    <StudioBackground>
      <div className="flex h-screen">
        {/* Mobile Sidebar Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0 bg-black/95 backdrop-blur-xl border-violet-500/20">
            <SidebarContent />
          </SheetContent>
        </Sheet>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 border-r border-violet-500/20 bg-black/40 backdrop-blur-xl">
          <SidebarContent />
        </div>
        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Brand Manager</h1>
                
                {/* Mobile Menu Button */}
                <Button 
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden bg-violet-600 hover:bg-violet-700"
                  size="icon"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Stats Row - Horizontal */}
              {selectedBrand && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20 p-6">
                    <h3 className="text-sm text-muted-foreground mb-2">Total Assets</h3>
                    <p className="text-4xl font-bold text-white">{brandStats.totalAssets}</p>
                  </Card>
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20 p-6">
                    <h3 className="text-sm text-muted-foreground mb-2">Active Campaigns</h3>
                    <p className="text-4xl font-bold text-white">{brandStats.activeCampaigns}</p>
                  </Card>
                  <Card className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20 p-6">
                    <h3 className="text-sm text-muted-foreground mb-2">Avg Performance</h3>
                    <p className="text-4xl font-bold text-white">{brandStats.avgPerformance}</p>
                  </Card>
                  <Card 
                    className="bg-gradient-to-br from-violet-900/40 to-violet-800/40 border-violet-500/40 p-6 cursor-pointer hover:border-violet-500/60 transition-all"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                  >
                    <h3 className="text-sm text-violet-300 mb-2">Analytics</h3>
                    <div className="flex items-center justify-between">
                      <BarChart3 className="w-8 h-8 text-violet-400" />
                      <span className="text-sm text-violet-300">{showAnalytics ? 'Hide' : 'View'}</span>
                    </div>
                  </Card>
                </div>
              )}

              {/* Analytics Dashboard */}
              {selectedBrand && showAnalytics && (
                <div className="mb-6">
                  <BrandAnalyticsDashboard brandId={selectedBrand} assets={assets} />
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              {/* Batch Mode Toggle */}
              {assets.length > 0 && (
                <Button
                  variant={batchMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setBatchMode(!batchMode);
                    setSelectedAssets(new Set());
                  }}
                  className={`${batchMode ? 'bg-violet-600' : 'border-violet-500/30'} w-full sm:w-auto`}
                >
                  {batchMode ? <CheckSquare className="w-4 h-4 mr-2" /> : <Square className="w-4 h-4 mr-2" />}
                  {batchMode ? 'Batch Mode' : 'Select Multiple'}
                </Button>
              )}

              <div className="flex-1 w-full sm:max-w-xl">
                <div className="relative">
                  <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 sm:pl-10 h-10 bg-black/40 backdrop-blur-md border border-violet-500/30"
                  />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-violet-200 text-center sm:whitespace-nowrap">{assets.length} assets</p>

              <div className="flex flex-wrap gap-2 flex-shrink-0">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-32 h-10 bg-black/40 border-violet-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-violet-500/30">
                    <SelectItem value="created_at">Date</SelectItem>
                    <SelectItem value="title">Name</SelectItem>
                    <SelectItem value="file_size">Size</SelectItem>
                    <SelectItem value="asset_type">Type</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 ${
                      viewMode === 'grid'
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/50'
                        : 'border-violet-500/30'
                    }`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className={`h-10 w-10 ${
                      viewMode === 'list'
                        ? 'bg-violet-500/20 text-violet-300 border-violet-500/50'
                        : 'border-violet-500/30'
                    }`}
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Batch Actions Toolbar */}
            {batchMode && selectedAssets.size > 0 && (
              <div className="mb-4 p-3 sm:p-4 bg-violet-600/20 border border-violet-500/30 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                  <span className="text-xs sm:text-sm font-medium text-white">
                    {selectedAssets.size} asset(s) selected
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedAssets(new Set())}
                    className="text-violet-300 hover:text-white"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchDownload}
                    className="border-violet-500/30 flex-1 sm:flex-none"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download All
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleBatchDelete}
                    className="border-red-500/30 text-red-400 hover:text-red-300 flex-1 sm:flex-none"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All
                  </Button>
                </div>
              </div>
            )}

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-violet-200 mb-6">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span>{getFolderName()}</span>
            </div>

            {/* Content */}
            {!selectedBrand ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Folder className="w-16 h-16 text-violet-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Welcome to Brand Manager</h3>
                <p className="text-muted-foreground mb-6">Create your first brand to get started</p>
                <Button onClick={() => setCreateBrandOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Brand
                </Button>
              </div>
            ) : loading ? (
              <div className="text-center py-12 text-muted-foreground">Loading...</div>
            ) : assets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Folder className="w-16 h-16 text-violet-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No assets yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start building your brand by uploading or importing assets
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => navigate('/upload')} className="border-violet-500/30">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button variant="outline" onClick={() => setLibraryModalOpen(true)} className="border-violet-500/30">
                    <Library className="w-4 h-4 mr-2" />
                    Import from Library
                  </Button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assets.map(asset => (
                  <Card
                    key={asset.id}
                    className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20 overflow-hidden hover:border-violet-500/50 transition-all cursor-pointer"
                    onClick={() => {
                      if (batchMode) {
                        toggleAssetSelection(asset.id);
                      }
                    }}
                  >
                    <div className="relative aspect-square">
                      {/* Batch Mode Checkbox */}
                      {batchMode && (
                        <div
                          className="absolute top-2 left-2 z-10"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAssetSelection(asset.id);
                          }}
                        >
                          {selectedAssets.has(asset.id) ? (
                            <CheckSquare className="w-6 h-6 text-violet-400" />
                          ) : (
                            <Square className="w-6 h-6 text-white/60 hover:text-white" />
                          )}
                        </div>
                      )}

                      <img
                        src={asset.thumbnail_url || asset.file_url || '/placeholder.svg'}
                        alt={asset.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-black/60"
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.id); }}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              asset.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''
                            }`}
                          />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/60">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 border-violet-500/30">
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(asset); }}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(asset); }}>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(asset); }}>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {!batchMode && (
                        <Badge className="absolute top-2 left-2 bg-black/60">
                          {asset.asset_type}
                        </Badge>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-white truncate">{asset.title}</h4>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {asset.file_size ? `${(asset.file_size / 1024).toFixed(1)} KB` : 'N/A'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(asset.created_at), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {assets.map(asset => (
                  <Card
                    key={asset.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-violet-500/20 hover:border-violet-500/50 transition-all cursor-pointer"
                    onClick={() => {
                      if (batchMode) {
                        toggleAssetSelection(asset.id);
                      }
                    }}
                  >
                    {/* Batch Mode Checkbox */}
                    {batchMode && (
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleAssetSelection(asset.id);
                        }}
                      >
                        {selectedAssets.has(asset.id) ? (
                          <CheckSquare className="w-6 h-6 text-violet-400" />
                        ) : (
                          <Square className="w-6 h-6 text-white/60 hover:text-white" />
                        )}
                      </div>
                    )}

                    <img
                      src={asset.thumbnail_url || asset.file_url}
                      alt={asset.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-white">{asset.title}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <Badge variant="secondary">{asset.asset_type}</Badge>
                        <span>{asset.file_size ? `${(asset.file_size / 1024).toFixed(1)} KB` : 'N/A'}</span>
                        <span>{format(new Date(asset.created_at), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); toggleFavorite(asset.id); }}>
                        <Star className={`w-4 h-4 ${asset.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-violet-500/30">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(asset); }}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(asset); }}>
                            <Share2 className="w-4 h-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(asset); }}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400" onClick={(e) => { e.stopPropagation(); deleteAsset(asset.id); }}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}

      <CreateBrandDialog
        open={createBrandOpen}
        onOpenChange={setCreateBrandOpen}
        onBrandCreated={handleBrandCreated}
      />

      <LibrarySelectionModal
        open={libraryModalOpen}
        onClose={() => setLibraryModalOpen(false)}
        selectedBrandId={selectedBrand || ''}
        currentCollectionId={currentFolder !== 'all' ? currentFolder : undefined}
        onImportComplete={() => {
          setLibraryModalOpen(false);
          if (selectedBrand) {
            loadAssets(selectedBrand, currentFolder === 'all' ? undefined : currentFolder);
            getBrandStats(selectedBrand).then(setBrandStats);
          }
        }}
      />

      {selectedBrand && (
        <GenerateAssetDialog
          open={generateDialogOpen}
          onOpenChange={setGenerateDialogOpen}
          brandId={selectedBrand}
          collectionId={currentFolder === 'all' ? null : currentFolder}
          collections={collections}
          onAssetGenerated={() => {
            if (selectedBrand) {
              loadAssets(selectedBrand, currentFolder === 'all' ? undefined : currentFolder);
              getBrandStats(selectedBrand).then(setBrandStats);
            }
          }}
          saveGeneratedAsset={saveGeneratedAsset}
        />
      )}

      {selectedBrand && (
        <BrandKitDialog
          open={brandKitOpen}
          onOpenChange={setBrandKitOpen}
          brand={brands.find(b => b.id === selectedBrand) || null}
          onBrandUpdated={() => {
            loadBrands().then(() => {
              if (selectedBrand) {
                getBrandStats(selectedBrand).then(setBrandStats);
              }
            });
          }}
        />
      )}

      {selectedBrand && (
        <CampaignCreator
          open={campaignCreatorOpen}
          onOpenChange={setCampaignCreatorOpen}
          brandId={selectedBrand}
          onCampaignCreated={(campaign) => {
            setCampaignCreatorOpen(false);
            loadCampaigns(selectedBrand);
            getBrandStats(selectedBrand).then(setBrandStats);
            toast.success(`Campaign "${campaign.name}" created successfully!`);
          }}
          onSubmit={createCampaign}
        />
      )}

      {selectedAssetForEdit && (
        <AssetEditDialog
          open={editAssetDialogOpen}
          onOpenChange={setEditAssetDialogOpen}
          asset={selectedAssetForEdit}
          collections={collections}
          onSave={async (assetId, updates) => {
            await updateAssetMetadata(assetId, updates);
            if (selectedBrand) {
              loadAssets(selectedBrand, currentFolder === 'all' ? undefined : currentFolder);
            }
          }}
        />
      )}
    </StudioBackground>
  );
}
