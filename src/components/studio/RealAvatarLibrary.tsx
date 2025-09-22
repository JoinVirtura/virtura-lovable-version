import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Search,
  Star,
  CheckCircle,
  Library,
  Sparkles,
  Image as ImageIcon,
  RefreshCw
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
    onSelectAvatar(avatar.image_url, {
      title: avatar.title || 'Generated Avatar',
      prompt: avatar.prompt,
      tags: avatar.tags || [],
      resolution: '4K Ultra HD',
      faceAlignment: 96,
      consistency: 94,
      type: 'Library',
      created: avatar.created_at
    });
    
    toast.success('Avatar selected from library');
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
              className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-border/50 hover:border-primary/50"
              onClick={() => handleSelectAvatar(avatar)}
            >
              <CardContent className="p-0">
                <div className="relative">
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
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
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
    </div>
  );
};