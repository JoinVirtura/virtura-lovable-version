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
import { StudioBackground } from '@/components/StudioBackground';
import { CreateBrandDialog } from '@/components/CreateBrandDialog';
import { LibrarySelectionModal } from '@/components/LibrarySelectionModal';
import { useBrandAssets, type Brand } from '@/hooks/useBrandAssets';
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
  Sparkles,
  Library,
  Calendar,
  Grid3X3,
  List,
  MoreVertical,
  Download,
  Share2,
  Edit3,
  Trash2,
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
  } = useBrandAssets();

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

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Load collections and assets when brand changes
  useEffect(() => {
    if (selectedBrand) {
      loadCollections(selectedBrand);
      loadAssets(selectedBrand, currentFolder === 'all' ? undefined : currentFolder);
      getBrandStats(selectedBrand).then(setBrandStats);
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

  // Set first brand as selected when brands load
  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0].id);
    }
  }, [brands]);

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

  return (
    <StudioBackground>
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-64 border-r border-violet-500/20 bg-black/40 backdrop-blur-xl p-6 space-y-6 overflow-y-auto overflow-x-hidden">
          {/* Brand Selector */}
          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">Active Brand</Label>
            <Select value={selectedBrand || undefined} onValueChange={handleBrandChange}>
              <SelectTrigger className="w-full bg-black/60 border-violet-500/30">
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
          </div>


          {/* Smart Collections */}
          {selectedBrand && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Smart Collections</h3>
              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                  onClick={() => handleSmartCollection('favorites')}
                >
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="flex-1 text-left text-sm">Favorites</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                  onClick={() => handleSmartCollection('recent')}
                >
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="flex-1 text-left text-sm">Recent</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                  onClick={() => handleSmartCollection('images')}
                >
                  <Image className="w-4 h-4 text-green-400" />
                  <span className="flex-1 text-left text-sm">Images</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                  onClick={() => handleSmartCollection('videos')}
                >
                  <Video className="w-4 h-4 text-purple-400" />
                  <span className="flex-1 text-left text-sm">Videos</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 pl-2 hover:bg-violet-500/10"
                  onClick={() => handleSmartCollection('documents')}
                >
                  <FileText className="w-4 h-4 text-orange-400" />
                  <span className="flex-1 text-left text-sm">Documents</span>
                </Button>
              </div>
            </div>
          )}

          <Separator className="my-4 bg-violet-500/20" />

          {/* Folders Section */}
          {selectedBrand && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Folders</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-violet-400 hover:text-violet-300">
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

              <div className="space-y-1">
                <Button
                  variant="ghost"
                  className={`w-full justify-start gap-2 pl-2 ${
                    currentFolder === 'all' ? 'bg-violet-500/20 text-violet-300' : 'hover:bg-violet-500/10'
                  }`}
                  onClick={() => setCurrentFolder('all')}
                >
                  <Home className="w-4 h-4" />
                  <span className="flex-1 text-left">All Assets</span>
                  <span className="text-xs text-muted-foreground">{assets.length}</span>
                </Button>

                {rootCollections.map(folder => renderFolderTree(folder))}
              </div>
            </div>
          )}

          <Separator className="my-4 bg-violet-500/20" />

          {/* Action Buttons */}
          {selectedBrand && (
            <div className="space-y-3 pt-4 border-t border-violet-500/20">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
                onClick={() => navigate('/upload')}
              >
                <Upload className="w-4 h-4" />
                Upload
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
                onClick={() => setLibraryModalOpen(true)}
              >
                <Library className="w-4 h-4" />
                Choose from Library
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start gap-3 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
              >
                <Plus className="w-4 h-4" />
                New Campaign
              </Button>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-display font-bold text-white mb-6">Brand Manager</h1>
              
              {/* Stats Row - Horizontal */}
              {selectedBrand && (
                <div className="grid grid-cols-3 gap-4 mb-6">
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
                </div>
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">

              <div className="flex-1 max-w-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-10 bg-black/40 backdrop-blur-md border border-violet-500/30"
                  />
                </div>
              </div>

              <p className="text-sm text-violet-200 whitespace-nowrap">{assets.length} assets</p>

              <div className="flex gap-2 flex-shrink-0">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32 h-10 bg-black/40 border-violet-500/30">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-violet-500/30">
                    <SelectItem value="created_at">Date</SelectItem>
                    <SelectItem value="title">Name</SelectItem>
                    <SelectItem value="file_size">Size</SelectItem>
                    <SelectItem value="asset_type">Type</SelectItem>
                  </SelectContent>
                </Select>

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

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-violet-200 mb-6">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-3 h-3 text-muted-foreground" />
              <span>{getFolderName()}</span>
            </div>

            {/* Content */}
            {!selectedBrand ? (
              <div className="flex flex-col items-center justify-center h-96 text-center">
                <Sparkles className="w-16 h-16 text-violet-400 mb-4" />
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
                <p className="text-muted-foreground mb-6">Upload or generate content to get started</p>
                <div className="flex gap-3">
                  <Button onClick={() => navigate('/upload')}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Files
                  </Button>
                  <Button variant="outline" onClick={() => setLibraryModalOpen(true)}>
                    <Library className="w-4 h-4 mr-2" />
                    Choose from Library
                  </Button>
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {assets.map(asset => (
                  <Card
                    key={asset.id}
                    className="group bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20 overflow-hidden hover:border-violet-500/50 transition-all"
                  >
                    <div className="relative aspect-square">
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
                          onClick={() => toggleFavorite(asset.id)}
                        >
                          <Star
                            className={`w-4 h-4 ${
                              asset.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''
                            }`}
                          />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="secondary" className="h-8 w-8 bg-black/60">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 border-violet-500/30">
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Share2 className="w-4 h-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit3 className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-400"
                              onClick={() => deleteAsset(asset.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Badge className="absolute top-2 left-2 bg-black/60">
                        {asset.asset_type}
                      </Badge>
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
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-violet-500/20 hover:border-violet-500/50 transition-all"
                  >
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
                      <Button size="icon" variant="ghost" onClick={() => toggleFavorite(asset.id)}>
                        <Star className={`w-4 h-4 ${asset.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-gray-900 border-violet-500/30">
                          <DropdownMenuItem>Download</DropdownMenuItem>
                          <DropdownMenuItem>Share</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400" onClick={() => deleteAsset(asset.id)}>
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
    </StudioBackground>
  );
}
