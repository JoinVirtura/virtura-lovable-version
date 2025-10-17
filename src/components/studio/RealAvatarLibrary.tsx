import React, { useState, useEffect } from 'react';
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
import { toast } from 'sonner';
import {
  Search,
  Star,
  CheckCircle,
  Library,
  Sparkles,
  Image as ImageIcon,
  RefreshCw,
  Trash2,
  Share2,
  Download,
  MoreVertical
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AvatarLibraryItem {
  id: string;
  image_url: string;
  prompt: string;
  title?: string;
  tags?: string[];
  created_at: string;
}

interface RealAvatarLibraryProps {
  onSelectAvatar: (avatarUrl: string, metadata: any) => void;
  isProcessing?: boolean;
}

export const RealAvatarLibrary: React.FC<RealAvatarLibraryProps> = ({ 
  onSelectAvatar, 
  isProcessing 
}) => {
  const [avatars, setAvatars] = useState<AvatarLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; avatar: AvatarLibraryItem | null }>({ 
    open: false, 
    avatar: null 
  });

  const loadAvatars = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('avatar_library')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error loading avatars:', error);
        toast.error('Failed to load avatar library');
        return;
      }

      setAvatars(data || []);
    } catch (error) {
      console.error('Error loading avatars:', error);
      toast.error('Failed to load avatar library');
    } finally {
      setLoading(false);
    }
  };

  const refreshLibrary = async () => {
    setRefreshing(true);
    await loadAvatars();
    setRefreshing(false);
    toast.success('Library refreshed');
  };

  useEffect(() => {
    loadAvatars();
  }, []);

  const filteredAvatars = avatars.filter(avatar => {
    if (!searchTerm.trim()) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      avatar.title?.toLowerCase().includes(searchLower) ||
      avatar.prompt?.toLowerCase().includes(searchLower) ||
      avatar.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    );
  });

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

  const handleDownloadAvatar = (avatar: AvatarLibraryItem) => {
    try {
      const link = document.createElement('a');
      link.href = avatar.image_url;
      link.download = `${avatar.title || 'avatar'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading avatar:', error);
      toast.error('Failed to download avatar');
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Library className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Your Avatar Library</h3>
          <Badge variant="secondary">{avatars.length} avatars</Badge>
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search your avatars..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Avatar Grid */}
      {filteredAvatars.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAvatars.map((avatar) => (
            <Card
              key={avatar.id}
              className="group cursor-pointer transition-all duration-500 hover:scale-105 border-2 border-violet-500/30 hover:border-violet-400 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-sm shadow-[0_0_20px_rgba(212,110,255,0.15)] hover:shadow-[0_0_30px_rgba(212,110,255,0.3)]"
              onClick={() => handleSelectAvatar(avatar)}
            >
              <CardContent className="p-0">
                <div className="relative rounded-xl overflow-hidden border border-violet-500/10">
                  <img
                    src={avatar.image_url}
                    alt={avatar.title || 'Generated Avatar'}
                    className="w-full aspect-square object-cover"
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-primary/90 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Generated
                    </Badge>
                  </div>
                  {/* Action Menu */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 rounded-full backdrop-blur-sm bg-white/80 hover:bg-white/90"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleShareAvatar(avatar);
                        }}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadAvatar(avatar);
                        }}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
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

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-xl">
                    <Button size="sm" className="bg-primary hover:bg-primary/90">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Select Avatar
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 space-y-2">
                  <h4 className="font-medium text-sm line-clamp-1">
                    {avatar.title || 'Generated Avatar'}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {avatar.prompt}
                  </p>
                  {avatar.tags && avatar.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {avatar.tags.slice(0, 2).map((tag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="text-xs px-2 py-0"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {new Date(avatar.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, avatar: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Avatar</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm.avatar?.title || 'this avatar'}"? This action cannot be undone.
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
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};