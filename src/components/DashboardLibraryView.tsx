import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { EditTitleDialog } from "@/components/EditTitleDialog";
import { FolderSelector } from "@/components/library/FolderSelector";
import { CreateFolderDialog } from "@/components/library/CreateFolderDialog";
import { MoveToFolderDialog } from "@/components/library/MoveToFolderDialog";
import { useLibraryFolders } from "@/hooks/useLibraryFolders";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Download, 
  Trash2,
  Grid3X3,
  List,
  Calendar,
  Clock,
  Sparkles,
  Star,
  Edit,
  Play,
  Loader2,
  FolderInput,
  X
} from "lucide-react";

interface DashboardLibraryViewProps {
  onSelectAvatar?: (avatarUrl: string, metadata?: any) => void;
  isModal?: boolean;
  hideVideoCategory?: boolean;
  onEdit?: (asset: any) => void;
}

export function DashboardLibraryView({ onSelectAvatar, isModal = false, hideVideoCategory = false, onEdit }: DashboardLibraryViewProps) {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [libraryAssets, setLibraryAssets] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [editTitleDialog, setEditTitleDialog] = useState<{ open: boolean; asset: any } | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<Set<number>>(new Set());
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  
  // Folder state
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [moveToFolderDialog, setMoveToFolderDialog] = useState<{ open: boolean; asset: any } | null>(null);
  const { folders, createFolder, moveToFolder } = useLibraryFolders();

  // Helper to format video duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const fetchSavedAvatars = async () => {
    try {
      setLibraryLoading(true);
      setLibraryError(null);
      
      let query = supabase
        .from('avatar_library')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Filter by folder
      if (selectedFolder === "uncategorized") {
        query = query.is('folder_id', null);
      } else if (selectedFolder) {
        query = query.eq('folder_id', selectedFolder);
      }
      
      const { data, error: fetchError } = await query;
      
      if (fetchError) {
        console.error('Error fetching avatars:', fetchError);
        setLibraryError('Failed to load library items');
        return;
      }

      const formattedAssets = data?.map((item) => ({
        id: item.id,
        dbId: item.id,
        type: item.is_video ? "video" : "Avatar",
        title: item.title || `Generated ${item.is_video ? 'Video' : 'Avatar'} ${new Date(item.created_at).toLocaleDateString()}`,
        date: new Date(item.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        format: item.is_video ? "MP4" : "PNG",
        tags: item.tags || ["ai-generated"],
        thumbnail: item.thumbnail_url || item.image_url,
        imageUrl: item.image_url,
        video_url: item.video_url,
        is_video: item.is_video,
        audio_url: item.audio_url,
        duration: item.duration,
        prompt: item.prompt,
        isFavorite: item.tags?.includes("favorite") || false,
        quality: Math.floor(Math.random() * 10 + 90),
        generationTime: `${(Math.random() * 2 + 1.5).toFixed(1)}s`,
        fileSize: `${(Math.random() * 1.5 + 1.5).toFixed(1)} MB`,
        category: item.is_video ? "Videos" : "Avatars",
        folder_id: item.folder_id
      })) || [];

      setLibraryAssets(formattedAssets);
    } catch (err) {
      console.error('Error in fetchSavedAvatars:', err);
      setLibraryError('Failed to load library items');
    } finally {
      setLibraryLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedAvatars();
  }, [selectedFolder]);

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-library-view-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'avatar_library'
        },
        () => {
          fetchSavedAvatars();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredAssets = libraryAssets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesCategory = false;
    if (selectedCategory === "All") {
      matchesCategory = true;
    } else if (selectedCategory === "Favorites") {
      matchesCategory = asset.isFavorite;
    } else if (selectedCategory === "Characters") {
      matchesCategory = !asset.video_url && asset.type !== "video";
    } else if (selectedCategory === "Videos") {
      matchesCategory = asset.video_url || asset.type === "video";
    }
    
    return matchesSearch && matchesCategory;
  });

  const handleAvatarSelect = (asset: any) => {
    if (onSelectAvatar) {
      // Use video_url for videos, image_url for images (snake_case from DB)
      const urlToPass = asset.is_video && asset.video_url ? asset.video_url : asset.imageUrl;
      onSelectAvatar(urlToPass, asset);
    } else {
      setSelectedAvatarIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(asset.id)) {
          newSet.delete(asset.id);
        } else {
          newSet.add(asset.id);
        }
        return newSet;
      });
    }
  };

  const handleFavorite = async (asset: any) => {
    try {
      const newTags = asset.isFavorite 
        ? asset.tags.filter((tag: string) => tag !== "favorite")
        : [...asset.tags, "favorite"];

      const { error } = await supabase
        .from('avatar_library')
        .update({ tags: newTags })
        .eq('id', asset.dbId);

      if (error) throw error;

      await fetchSavedAvatars();
      
      toast({
        title: asset.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: asset.title
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (asset: any) => {
    setDeletingAssetId(asset.dbId);
    try {
      const { error: dbError } = await supabase
        .from('avatar_library')
        .delete()
        .eq('id', asset.dbId);

      if (dbError) throw dbError;

      await fetchSavedAvatars();
      
      toast({
        title: "Avatar Deleted",
        description: `"${asset.title}" has been removed from your library.`
      });
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast({
        title: "Delete Failed",
        description: "Unable to delete the avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingAssetId(null);
    }
  };

  const handleDownload = async (asset: any) => {
    try {
      // Use video_url for videos, imageUrl for images
      const downloadUrl = asset.is_video && asset.video_url 
        ? asset.video_url 
        : asset.imageUrl;
      
      const fileExtension = asset.is_video ? 'mp4' : 'png';
      
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Failed to fetch file');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${asset.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading "${asset.title}" (${asset.is_video ? 'video' : 'image'})`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: `Unable to download the ${asset.is_video ? 'video' : 'image'}. Please try again.`,
        variant: "destructive"
      });
    }
  };

  const handleEditTitle = async (asset: any) => {
    setEditTitleDialog({ open: true, asset });
  };

  const handleSaveTitle = async (newTitle: string, newTags: string[]) => {
    if (!editTitleDialog?.asset) return;

    try {
      const { error } = await supabase
        .from('avatar_library')
        .update({ 
          title: newTitle,
          tags: newTags
        })
        .eq('id', editTitleDialog.asset.dbId);

      if (error) throw error;

      await fetchSavedAvatars();
      setEditTitleDialog(null);
      
      toast({
        title: "Title Updated",
        description: `Avatar renamed to "${newTitle}"`
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Error",
        description: "Failed to update title. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className={`space-y-6 ${!isModal ? 'min-h-screen' : ''}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-4">
          <Card className="p-6 border-2 hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, tags, AI model, or content type..."
                  className="pl-12 pr-4 h-14 text-base bg-muted/30 border-0 focus:bg-background transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 mb-8 flex-wrap">
              <div className="flex flex-wrap items-center gap-3">
                <FolderSelector
                  folders={folders}
                  selectedFolder={selectedFolder}
                  onSelectFolder={setSelectedFolder}
                  onCreateFolder={() => setCreateFolderOpen(true)}
                  itemCount={filteredAssets.length}
                />
                <div className="w-px h-6 bg-border" />
                {["Characters", "Videos", "Favorites"].filter(cat => !(hideVideoCategory && cat === "Videos")).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="h-9 px-4 text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                    onClick={() => setSelectedCategory(category === selectedCategory ? "All" : category)}
                  >
                    {category === "Favorites" && <Star className="w-4 h-4 mr-2" />}
                    {category}
                  </Button>
                ))}
              </div>
              
              <div className="flex border-2 border-violet-500/50 rounded-xl overflow-hidden bg-muted/20 shrink-0">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-none border-0 px-3 h-9"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-none border-0 px-3 h-9"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {libraryLoading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    <p className="text-muted-foreground">Loading your library...</p>
                  </div>
                </div>
              ) : libraryError ? (
                <div className="text-center py-20">
                  <div className="space-y-4">
                    <p className="text-destructive">{libraryError}</p>
                    <Button onClick={fetchSavedAvatars} variant="outline">
                      Try Again
                    </Button>
                  </div>
                </div>
              ) : libraryAssets.length === 0 ? (
                <div className="text-center py-20">
                  <div className="space-y-4">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                      <Sparkles className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold">No avatars saved yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Generate some avatars and save your favorites to see them here.
                    </p>
                  </div>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-20">
                  <div className="space-y-4">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto" />
                    <h3 className="text-xl font-semibold">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {filteredAssets.map((asset) => (
                    <Card 
                      key={asset.id} 
                      className={`group overflow-hidden transition-all duration-500 hover:-translate-y-3 border-2 bg-gradient-to-br from-card to-card/95 hover:scale-[1.02] cursor-pointer ${
                        selectedAvatarIds.has(asset.id) 
                          ? 'border-primary shadow-2xl shadow-primary/20 ring-2 ring-primary/30' 
                          : 'hover:shadow-2xl hover:border-primary/30'
                      }`}
                      onClick={() => handleAvatarSelect(asset)}
                    >
                      <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
                        {/* Show video when clicked for video assets */}
                        {asset.is_video && asset.video_url && playingVideoId === asset.id ? (
                          <div className="relative w-full h-full">
                            <video
                              src={asset.video_url}
                              className="w-full h-full object-cover"
                              autoPlay
                              controls
                              loop
                              playsInline
                            />
                            {/* X button to close video */}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 text-white rounded-full z-10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPlayingVideoId(null);
                              }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <img 
                              src={asset.thumbnail} 
                              alt={asset.title}
                              className="w-full h-full object-cover transition-all duration-700 hover:scale-110 hover:brightness-125 hover:rotate-1"
                              onError={(e) => {
                                e.currentTarget.src = "/api/placeholder/300/300";
                              }}
                            />
                            
                      {/* Play icon overlay - clickable for videos */}
                      {asset.is_video && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer z-20"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (asset.video_url) {
                                    setPlayingVideoId(asset.id);
                                  }
                                }}
                              >
                                <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm hover:bg-black/50 hover:scale-110 transition-all">
                                  <Play className="w-8 h-8 text-white ml-1" />
                                </div>
                              </div>
                            )}

                            {/* Video duration badge */}
                            {asset.is_video && asset.duration && (
                              <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
                                {formatDuration(asset.duration)}
                              </div>
                            )}
                          </>
                        )}
                        
                    {/* Action buttons overlay - only show when video NOT playing */}
                    {playingVideoId !== asset.id && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2 py-4 z-10">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className={`h-9 w-9 p-0 bg-black/40 backdrop-blur-md hover:bg-violet-500/10 hover:border-violet-500/50 transition-all ${asset.isFavorite ? 'text-violet-500 border-violet-500/50' : 'border-white/20'}`}
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleFavorite(asset); 
                              }}
                              title={asset.isFavorite ? "Remove from favorites" : "Add to favorites"}
                            >
                              <Star className={`w-4 h-4 ${asset.isFavorite ? 'fill-current' : ''}`} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-9 w-9 p-0 bg-black/40 backdrop-blur-md hover:bg-blue-500/10 hover:border-blue-500/50 transition-all border-white/20"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                setMoveToFolderDialog({ open: true, asset });
                              }}
                              title="Move to folder"
                            >
                              <FolderInput className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-9 w-9 p-0 bg-black/40 backdrop-blur-md hover:bg-red-500/30 hover:border-red-500 transition-all border-red-500/50 text-red-400 hover:text-red-300"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleDelete(asset); 
                              }}
                              disabled={deletingAssetId === asset.dbId}
                              title="Delete"
                            >
                              {deletingAssetId === asset.dbId ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <h3 className="font-semibold text-lg line-clamp-1">{asset.title}</h3>
                          <p className="text-sm text-muted-foreground font-medium flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3" />
                            {new Date(asset.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })} at {new Date(asset.date).toLocaleTimeString('en-US', { 
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </p>
                        </div>

                        <div className="mt-4 mb-4">
                          <div className="h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-60 shadow-[0_0_12px_rgba(168,85,247,0.6)]" />
                        </div>

                        <div className="flex items-center gap-2 mt-4 pt-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-3 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all 2xl:w-8 2xl:p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onEdit) {
                                onEdit(asset);
                              } else {
                                handleEditTitle(asset);
                              }
                            }}
                            title={onEdit ? "Edit in Copilot" : "Edit title"}
                          >
                            <Edit className="w-3 h-3 mr-1 2xl:w-4 2xl:h-4 2xl:mr-0" />
                            <span className="2xl:hidden">Edit</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-3 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all 2xl:w-8 2xl:p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(asset);
                            }}
                            title={`Download ${asset.is_video ? 'Video' : 'Image'}`}
                          >
                            <Download className="w-3 h-3 mr-1 2xl:w-4 2xl:h-4 2xl:mr-0" />
                            <span className="2xl:hidden">{asset.is_video ? 'Video' : 'Download'}</span>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAssets.map((asset) => (
                    <Card key={asset.id} className="p-3 sm:p-5 hover:shadow-lg transition-all duration-200 hover:bg-muted/20 border-2 hover:border-primary/20">
                      <div className="flex items-center gap-3 sm:gap-6">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex-shrink-0 overflow-hidden">
                          <img 
                            src={asset.thumbnail} 
                            alt={asset.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "/api/placeholder/64/64";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 sm:gap-4">
                            <div className="space-y-1 sm:space-y-2 min-w-0 w-full sm:w-auto">
                              <h3 className="font-semibold text-base sm:text-lg line-clamp-1">{asset.title}</h3>
                              <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                <span className="font-medium">{asset.date}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                              <Button 
                                size="sm" 
                                variant="ghost"
                                className={`hover:bg-yellow-500/10 h-8 w-8 p-0 ${asset.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}`}
                                onClick={() => handleFavorite(asset)}
                              >
                                <Star className={`w-3 h-3 sm:w-4 sm:h-4 ${asset.isFavorite ? 'fill-current' : ''}`} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="hover:bg-secondary/10 h-8 w-8 p-0"
                                onClick={() => handleEditTitle(asset)}
                              >
                                <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="hover:bg-secondary/10 h-8 w-8 p-0"
                                onClick={() => handleDownload(asset)}
                              >
                                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="hover:bg-destructive/10 text-destructive h-8 w-8 p-0"
                                    disabled={deletingAssetId === asset.dbId}
                                  >
                                    {deletingAssetId === asset.dbId ? (
                                      <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{asset.title}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(asset)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <EditTitleDialog
        open={editTitleDialog?.open || false}
        currentTitle={editTitleDialog?.asset?.title || ""}
        currentTags={editTitleDialog?.asset?.tags || []}
        onOpenChange={(open) => {
          if (!open) setEditTitleDialog(null);
        }}
        onSave={handleSaveTitle}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        onCreateFolder={createFolder}
      />

      <MoveToFolderDialog
        open={moveToFolderDialog?.open || false}
        onOpenChange={(open) => {
          if (!open) setMoveToFolderDialog(null);
        }}
        folders={folders}
        currentFolderId={moveToFolderDialog?.asset?.folder_id || null}
        onMoveToFolder={async (folderId) => {
          if (!moveToFolderDialog?.asset) return false;
          const success = await moveToFolder(moveToFolderDialog.asset.dbId, folderId);
          if (success) fetchSavedAvatars();
          return success;
        }}
        assetTitle={moveToFolderDialog?.asset?.title || ""}
      />
    </div>
  );
}
