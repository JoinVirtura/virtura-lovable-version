import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Search, Image, Video, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LibraryItem {
  id: string;
  url: string;
  title?: string;
  type: 'image' | 'video';
  source: 'avatar_library' | 'brand_assets';
  thumbnail?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (items: LibraryItem[]) => void;
  contentType?: 'image' | 'video' | 'all';
}

type FilterType = 'all' | 'images' | 'videos';

export function MediaLibraryModal({ isOpen, onClose, onSelect, contentType = 'all' }: MediaLibraryModalProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    if (isOpen && user) {
      loadLibraryItems();
    }
  }, [isOpen, user]);

  const loadLibraryItems = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const libraryItems: LibraryItem[] = [];

      // Fetch from avatar_library
      const { data: avatarData } = await supabase
        .from('avatar_library')
        .select('id, image_url, video_url, title, is_video, thumbnail_url')
        .eq('user_id', user.id);

      if (avatarData) {
        avatarData.forEach(item => {
          if (item.is_video && item.video_url) {
            libraryItems.push({
              id: item.id,
              url: item.video_url,
              title: item.title || 'Untitled Video',
              type: 'video',
              source: 'avatar_library',
              thumbnail: item.thumbnail_url || item.image_url,
            });
          } else if (item.image_url) {
            libraryItems.push({
              id: item.id,
              url: item.image_url,
              title: item.title || 'Untitled Image',
              type: 'image',
              source: 'avatar_library',
            });
          }
        });
      }

      // Fetch from brand_assets
      const { data: assetData } = await supabase
        .from('brand_assets')
        .select('id, file_url, title, asset_type, thumbnail_url')
        .eq('user_id', user.id);

      if (assetData) {
        assetData.forEach(item => {
          const isVideo = item.asset_type === 'video';
          libraryItems.push({
            id: item.id,
            url: item.file_url,
            title: item.title || 'Untitled Asset',
            type: isVideo ? 'video' : 'image',
            source: 'brand_assets',
            thumbnail: item.thumbnail_url,
          });
        });
      }

      setItems(libraryItems);
    } catch (error) {
      console.error('Error loading library items:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchTerm || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
      (filter === 'images' && item.type === 'image') ||
      (filter === 'videos' && item.type === 'video');

    const matchesContentType = contentType === 'all' ||
      (contentType === 'image' && item.type === 'image') ||
      (contentType === 'video' && item.type === 'video');

    return matchesSearch && matchesFilter && matchesContentType;
  });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const handleConfirm = () => {
    const selected = items.filter(item => selectedItems.has(item.id));
    onSelect(selected);
    setSelectedItems(new Set());
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Choose from Library
            {selectedItems.size > 0 && (
              <Badge variant="secondary">{selectedItems.size} selected</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* Search and Filters */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search library..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filter === 'images' ? 'default' : 'outline'}
              onClick={() => setFilter('images')}
            >
              <Image className="h-4 w-4 mr-1" />
              Images
            </Button>
            <Button
              size="sm"
              variant={filter === 'videos' ? 'default' : 'outline'}
              onClick={() => setFilter('videos')}
            >
              <Video className="h-4 w-4 mr-1" />
              Videos
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        <ScrollArea className="flex-1 -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {items.length === 0 
                ? "Your library is empty. Create some content first!"
                : "No items match your search."}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <AnimatePresence>
                {filteredItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="relative aspect-square group cursor-pointer"
                    onClick={() => toggleSelection(item.id)}
                  >
                    <div className={`absolute inset-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedItems.has(item.id) 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-transparent hover:border-white/20'
                    }`}>
                      {item.type === 'video' ? (
                        <video
                          src={item.url}
                          poster={item.thumbnail}
                          className="w-full h-full object-cover"
                          muted
                        />
                      ) : (
                        <img
                          src={item.thumbnail || item.url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      )}

                      {/* Overlay */}
                      <div className={`absolute inset-0 transition-all ${
                        selectedItems.has(item.id) 
                          ? 'bg-primary/20' 
                          : 'bg-black/0 group-hover:bg-black/30'
                      }`} />

                      {/* Type Badge */}
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-black/50">
                          {item.type === 'video' ? <Video className="h-3 w-3 mr-1" /> : <Image className="h-3 w-3 mr-1" />}
                          {item.type}
                        </Badge>
                      </div>

                      {/* Selection Indicator */}
                      <div className={`absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                        selectedItems.has(item.id)
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-black/50 border border-white/30 opacity-0 group-hover:opacity-100'
                      }`}>
                        {selectedItems.has(item.id) && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedItems.size === 0}
            className="bg-gradient-to-r from-primary to-secondary"
          >
            Add {selectedItems.size > 0 ? `(${selectedItems.size})` : ''} to Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}