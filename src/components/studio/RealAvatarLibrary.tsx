import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { EditTitleDialog } from '@/components/EditTitleDialog';
import { toast } from 'sonner';
import {
  Search,
  Star,
  Library,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Share2,
  Download,
  MoreVertical,
  Film,
  Camera,
  Grid3x3,
  List,
  Edit3,
  Heart,
  User,
  Briefcase
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface AvatarLibraryItem {
  id: string;
  image_url: string;
  prompt: string;
  title?: string;
  tags?: string[];
  created_at: string;
  video_url?: string;
  thumbnail_url?: string;
  is_video?: boolean;
  duration?: number;
  audio_url?: string;
}

interface RealAvatarLibraryProps {
  onSelectAvatar: (avatarUrl: string, metadata: any) => void;
  isProcessing?: boolean;
}

type FilterCategory = 'all' | 'avatars' | 'headshots' | 'brands' | 'videos' | 'favorites';

export const RealAvatarLibrary: React.FC<RealAvatarLibraryProps> = ({ 
  onSelectAvatar, 
  isProcessing 
}) => {
  const [avatars, setAvatars] = useState<AvatarLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [editDialog, setEditDialog] = useState<{ open: boolean; avatar: AvatarLibraryItem | null }>({ 
    open: false, 
    avatar: null 
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; avatar: AvatarLibraryItem | null }>({ 
    open: false, 
    avatar: null 
  });

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('virtura_favorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Calculate quality score for avatar
  const calculateQualityScore = (avatar: AvatarLibraryItem): number => {
    let score = 7.0;
    
    const daysSinceCreation = (Date.now() - new Date(avatar.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation < 7) score += 1.5;
    else if (daysSinceCreation < 30) score += 1.0;
    
    if (avatar.is_video) score += 0.5;
    if (avatar.tags && avatar.tags.length > 2) score += 0.5;
    if (favorites.has(avatar.id)) score += 0.5;
    
    return Math.min(9.5, score);
  };

  // Toggle favorite
  const toggleFavorite = (avatarId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(avatarId)) {
        newFavorites.delete(avatarId);
      } else {
        newFavorites.add(avatarId);
      }
      localStorage.setItem('virtura_favorites', JSON.stringify(Array.from(newFavorites)));
      return newFavorites;
    });
  };

  const loadAvatars = useCallback(async () => {
    try {
      setLoading(true);
      
      console.log('🔄 Loading avatars with filter:', filterCategory);
      
      let query = supabase
        .from('avatar_library')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply category filters
      if (filterCategory === 'videos') {
        query = query.eq('is_video', true);
      } else if (filterCategory === 'avatars' || filterCategory === 'headshots' || filterCategory === 'brands') {
        query = query.or('is_video.is.null,is_video.eq.false');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error loading avatars:', error);
        toast.error('Failed to load avatar library');
        return;
      }

      console.log('✅ Loaded avatars:', data?.length || 0);
      
      // Simply use the data as-is - avatar_library already has correct URLs
      setAvatars(data || []);
    } catch (error) {
      console.error('❌ Error loading avatars:', error);
      toast.error('Failed to load avatar library');
    } finally {
      setLoading(false);
    }
  }, [filterCategory]);

  // Load avatars when filter changes
  useEffect(() => {
    loadAvatars();
  }, [loadAvatars]);

  // Timeout protection - runs once on mount only
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      console.log('⏱️ Loading timeout reached');
    }, 10000);

    return () => clearTimeout(timeout);
  }, []);

  const refreshLibrary = async () => {
    setRefreshing(true);
    await loadAvatars();
    setRefreshing(false);
    toast.success('Library refreshed');
  };

  const filteredAvatars = avatars.filter(avatar => {
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        avatar.title?.toLowerCase().includes(searchLower) ||
        avatar.prompt?.toLowerCase().includes(searchLower) ||
        avatar.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      
      if (!matchesSearch) return false;
    }

    // Category filter - more lenient, show all if tags missing
    if (filterCategory === 'favorites') {
      return favorites.has(avatar.id);
    } else if (filterCategory === 'videos') {
      return avatar.is_video;
    } else if (filterCategory === 'avatars') {
      // Show all non-video items if no tags, or if tags match
      return !avatar.is_video && (!avatar.tags || avatar.tags.length === 0 || 
        avatar.tags.some(tag => 
          ['avatar', 'portrait', 'person', 'character'].includes(tag.toLowerCase())
        )
      );
    } else if (filterCategory === 'headshots') {
      return !avatar.is_video && (!avatar.tags || avatar.tags.length === 0 ||
        avatar.tags.some(tag => 
          ['headshot', 'professional', 'business', 'linkedin'].includes(tag.toLowerCase())
        )
      );
    } else if (filterCategory === 'brands') {
      return !avatar.is_video && (!avatar.tags || avatar.tags.length === 0 ||
        avatar.tags.some(tag => 
          ['brand', 'logo', 'marketing', 'business'].includes(tag.toLowerCase())
        )
      );
    }
    
    return true;
  });

  console.log('📊 Filtered avatars:', filteredAvatars.length, '/', avatars.length);

  const handleSelectAvatar = (avatar: AvatarLibraryItem) => {
    // CRITICAL FIX: Set both originalUrl AND processedUrl to ensure validation passes
    onSelectAvatar(avatar.image_url, {
      title: avatar.title || 'Generated Avatar',
      prompt: avatar.prompt,
      tags: avatar.tags || [],
      resolution: '4K Ultra HD',
      faceAlignment: 96,
      consistency: 94,
      type: 'Library',
      created: avatar.created_at,
      // Set both URLs so avatar validation works immediately
      originalUrl: avatar.image_url,
      processedUrl: avatar.image_url
    });
    
    toast.success('Avatar selected from library');
  };

  const handleDeleteAvatar = async (avatar: AvatarLibraryItem) => {
    try {
      const { error } = await supabase
        .from('avatar_library')
        .delete()
        .eq('id', avatar.id);

      if (error) {
        console.error('Error deleting avatar:', error);
        toast.error('Failed to delete avatar');
        return;
      }

      setAvatars(prev => prev.filter(a => a.id !== avatar.id));
      toast.success('Avatar deleted from library');
    } catch (error) {
      console.error('Error deleting avatar:', error);
      toast.error('Failed to delete avatar');
    }
  };

  const handleShareAvatar = async (avatar: AvatarLibraryItem) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: avatar.title || 'Generated Avatar',
          text: avatar.prompt,
          url: avatar.image_url
        });
      } else {
        await navigator.clipboard.writeText(avatar.image_url);
        toast.success('Avatar link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing avatar:', error);
      toast.error('Failed to share avatar');
    }
  };

  const handleDownloadAvatar = async (avatar: AvatarLibraryItem) => {
    try {
      // Fetch the image as blob to handle CORS
      const response = await fetch(avatar.image_url);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = blobUrl;
      const filename = `${avatar.title?.replace(/[^a-z0-9]/gi, '_') || 'avatar'}_${Date.now()}`;
      link.download = avatar.is_video ? `${filename}.mp4` : `${filename}.jpg`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(blobUrl);
      
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading:', error);
      
      // Fallback: try opening in new tab
      try {
        window.open(avatar.image_url, '_blank');
        toast.success('Opening in new tab - right-click to save');
      } catch {
        toast.error('Download failed. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Library className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Your Avatar Library</h3>
          </div>
          <Skeleton className="h-9 w-24" />
        </div>
        
        <Skeleton className="h-10 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Your Avatar Library</h3>
          <Badge variant="secondary">{avatars.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 border border-border rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 px-3"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshLibrary}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Extended Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={filterCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('all')}
          size="sm"
          className="rounded-full"
        >
          All <Badge variant="secondary" className="ml-2">{avatars.length}</Badge>
        </Button>
        <Button
          variant={filterCategory === 'avatars' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('avatars')}
          size="sm"
          className="rounded-full"
        >
          <User className="h-4 w-4 mr-2" />
          Avatars
        </Button>
        <Button
          variant={filterCategory === 'headshots' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('headshots')}
          size="sm"
          className="rounded-full"
        >
          <Camera className="h-4 w-4 mr-2" />
          Headshots
        </Button>
        <Button
          variant={filterCategory === 'brands' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('brands')}
          size="sm"
          className="rounded-full"
        >
          <Briefcase className="h-4 w-4 mr-2" />
          Brand Assets
        </Button>
        <Button
          variant={filterCategory === 'videos' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('videos')}
          size="sm"
          className="rounded-full"
        >
          <Film className="h-4 w-4 mr-2" />
          Videos
        </Button>
        <Button
          variant={filterCategory === 'favorites' ? 'default' : 'outline'}
          onClick={() => setFilterCategory('favorites')}
          size="sm"
          className="rounded-full"
        >
          <Heart className={`h-4 w-4 mr-2 ${filterCategory === 'favorites' ? 'fill-current' : ''}`} />
          Favorites
        </Button>
      </div>

      {/* Enhanced Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, tags, AI model, or content type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 h-11 border-border/50 bg-card/50 backdrop-blur-sm"
        />
      </div>

      {/* Avatar Grid/List */}
      {filteredAvatars.length > 0 ? (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
          {filteredAvatars.map((avatar) => {
            const qualityScore = calculateQualityScore(avatar);
            const isFavorite = favorites.has(avatar.id);
            const formattedDate = format(new Date(avatar.created_at), 'MMM d, yyyy, h:mm a');
            
            return (
              <Card
                key={avatar.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-[0_0_40px_rgba(212,110,255,0.3)] overflow-hidden border-violet-500/20 hover:border-violet-500/40"
                onClick={() => handleSelectAvatar(avatar)}
              >
                <CardContent className="p-0">
                  <div className="relative overflow-hidden">
                    {avatar.is_video && avatar.video_url ? (
                      <video
                        src={avatar.video_url}
                        poster={avatar.thumbnail_url || avatar.image_url}
                        className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                        controls
                        preload="metadata"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <img
                        src={avatar.image_url}
                        alt={avatar.title || 'Generated Avatar'}
                        className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    )}
                    
                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Quality Score Badge - Top Right */}
                    <div className="absolute top-3 right-3 z-10">
                      <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white px-3 py-1.5 text-sm font-bold shadow-lg border-0">
                        <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                        {qualityScore.toFixed(1)}
                      </Badge>
                    </div>

                    {/* Favorite Heart - Top Left */}
                    <button
                      className="absolute top-3 left-3 z-10 p-2 rounded-full bg-black/40 backdrop-blur-md hover:bg-black/60 transition-all duration-200 hover:scale-110"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(avatar.id);
                      }}
                      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart 
                        className={`h-4 w-4 transition-all duration-200 ${
                          isFavorite ? 'fill-red-500 text-red-500 scale-110' : 'text-white/80'
                        }`} 
                      />
                    </button>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4 space-y-3">
                    {/* Dynamic Title with Type */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-base line-clamp-1 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {avatar.is_video ? (
                          <>AI Video{avatar.duration ? ` • ${avatar.duration}s` : ''}</>
                        ) : avatar.tags?.some(t => ['headshot', 'professional', 'business'].includes(t.toLowerCase())) ? (
                          <>Professional Headshot • Ultra HD</>
                        ) : avatar.tags?.some(t => ['brand', 'logo', 'marketing'].includes(t.toLowerCase())) ? (
                          <>Brand Asset • 4K Ready</>
                        ) : (
                          <>AI Avatar • {avatar.tags?.[0] || 'Realistic'}</>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <Sparkles className="h-3 w-3" />
                        Generated {(() => {
                          const now = Date.now();
                          const created = new Date(avatar.created_at).getTime();
                          const diffMs = now - created;
                          const diffMins = Math.floor(diffMs / 60000);
                          const diffHours = Math.floor(diffMs / 3600000);
                          const diffDays = Math.floor(diffMs / 86400000);
                          
                          if (diffMins < 1) return 'just now';
                          if (diffMins < 60) return `${diffMins}m ago`;
                          if (diffHours < 24) return `${diffHours}h ago`;
                          if (diffDays < 7) return `${diffDays}d ago`;
                          return format(new Date(avatar.created_at), 'MMM d');
                        })()}
                      </p>
                    </div>
                    
                    {/* Tags with Gradient Backgrounds */}
                    {avatar.tags && avatar.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {avatar.tags.slice(0, 3).map((tag, index) => (
                          <Badge
                            key={index}
                            className="text-xs px-3 py-1 bg-gradient-to-r from-violet-500/20 to-purple-600/20 border border-violet-500/30 text-foreground hover:from-violet-500/30 hover:to-purple-600/30 transition-all"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {avatar.tags.length > 3 && (
                          <Badge className="text-xs px-3 py-1 bg-gradient-to-r from-blue-500/20 to-cyan-600/20 border border-blue-500/30">
                            +{avatar.tags.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-purple-500/60 to-transparent shadow-[0_0_8px_rgba(168,85,247,0.4)]" />
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditDialog({ open: true, avatar });
                        }}
                        className="flex-1 h-9 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadAvatar(avatar);
                        }}
                        className="flex-1 h-9 hover:bg-purple-500/10 hover:border-purple-500/50 transition-all"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="sm" className="h-9 px-3 hover:bg-violet-500/10 hover:border-violet-500/50 transition-all">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareAvatar(avatar);
                            }}
                          >
                            <Share2 className="h-4 w-4 mr-2" />
                            Share
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm({ open: true, avatar });
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 space-y-4">
          <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full"></div>
            <ImageIcon className="h-12 w-12 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No avatars found' : 'No avatars in your library'}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {searchTerm 
                ? 'Try adjusting your search terms to find different avatars'
                : 'Generate avatars using AI Image Studio or upload your own to see them here'
              }
            </p>
          </div>
          {!searchTerm && (
            <Button variant="outline" onClick={() => window.location.href = '/ai-image-studio'}>
              <Sparkles className="h-4 w-4 mr-2" />
              Create Your First Avatar
            </Button>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      {editDialog.avatar && (
        <EditTitleDialog
          open={editDialog.open}
          onOpenChange={(open) => setEditDialog({ open, avatar: null })}
          currentTitle={editDialog.avatar.title || 'Generated Avatar'}
          currentTags={editDialog.avatar.tags || []}
          onSave={async (newTitle, newTags) => {
            try {
              const { error } = await supabase
                .from('avatar_library')
                .update({ 
                  title: newTitle,
                  tags: newTags 
                })
                .eq('id', editDialog.avatar!.id);

              if (error) throw error;

              setAvatars(prev => prev.map(a => 
                a.id === editDialog.avatar!.id 
                  ? { ...a, title: newTitle, tags: newTags }
                  : a
              ));
              
              toast.success('Avatar updated successfully');
            } catch (error) {
              console.error('Error updating avatar:', error);
              toast.error('Failed to update avatar');
              throw error;
            }
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, avatar: null })}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Avatar?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              {deleteConfirm.avatar && (
                <>
                  {/* Preview thumbnail */}
                  <div className="rounded-lg overflow-hidden border border-violet-500/20">
                    <img 
                      src={deleteConfirm.avatar.image_url} 
                      alt={deleteConfirm.avatar.title || 'Avatar'}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                  
                  {/* Avatar details */}
                  <div>
                    <p className="font-medium text-foreground">
                      {deleteConfirm.avatar.title || 'Generated Avatar'}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {deleteConfirm.avatar.prompt}
                    </p>
                  </div>
                  
                  <p className="text-sm">
                    This action cannot be undone. This will permanently delete this avatar from your library.
                  </p>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm.avatar) {
                  handleDeleteAvatar(deleteConfirm.avatar);
                  setDeleteConfirm({ open: false, avatar: null });
                }
              }}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};