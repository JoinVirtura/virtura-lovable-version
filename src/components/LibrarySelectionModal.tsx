import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, X, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LibraryItem {
  id: string;
  image_url: string;
  video_url?: string;
  thumbnail_url?: string;
  title?: string;
  prompt: string;
  tags?: string[];
  is_video: boolean;
  created_at: string;
}

interface LibrarySelectionModalProps {
  open: boolean;
  onClose: () => void;
  selectedBrandId: string;
  currentCollectionId?: string;
  onImportComplete: () => void;
}

type FilterCategory = 'all' | 'avatars' | 'videos' | 'favorites';

export function LibrarySelectionModal({
  open,
  onClose,
  selectedBrandId,
  currentCollectionId,
  onImportComplete
}: LibrarySelectionModalProps) {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [existingAssets, setExistingAssets] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadLibraryItems();
      checkExistingAssets();
    }
  }, [open, filterCategory]);

  const loadLibraryItems = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('avatar_library')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (filterCategory === 'videos') {
        query = query.eq('is_video', true);
      } else if (filterCategory === 'avatars') {
        query = query.eq('is_video', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error loading library:', error);
      toast({
        title: 'Error',
        description: 'Failed to load library items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const checkExistingAssets = async () => {
    try {
      const { data } = await supabase
        .from('brand_assets')
        .select('metadata')
        .eq('brand_id', selectedBrandId);

      const existingIds = new Set(
        data?.map(a => {
          const metadata = a.metadata as any;
          return metadata?.imported_from_library;
        }).filter(Boolean) || []
      );
      setExistingAssets(existingIds);
    } catch (error) {
      console.error('Error checking existing assets:', error);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.prompt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesSearch;
  });

  const toggleSelection = (itemId: string) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setSelectedItems(newSelection);
  };

  const handleImport = async () => {
    if (selectedItems.size === 0) return;

    try {
      setImporting(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let successCount = 0;
      let errorCount = 0;

      for (const itemId of selectedItems) {
        try {
          const response = await supabase.functions.invoke('brand-asset-operations', {
            body: {
              operation: 'copy_from_library',
              library_item_id: itemId,
              brand_id: selectedBrandId,
              collection_id: currentCollectionId
            }
          });

          if (response.error) {
            console.error('Import error:', response.error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error('Failed to import item:', error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        toast({
          title: 'Success',
          description: `Imported ${successCount} item${successCount > 1 ? 's' : ''} to brand`,
        });
        setSelectedItems(new Set());
        onImportComplete();
      }

      if (errorCount > 0) {
        toast({
          title: 'Partial Success',
          description: `${errorCount} item${errorCount > 1 ? 's' : ''} failed to import`,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: 'Error',
        description: 'Failed to import items',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const selectAll = () => {
    const newSelection = new Set(filteredItems.map(item => item.id));
    setSelectedItems(newSelection);
  };

  const deselectAll = () => {
    setSelectedItems(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Choose from Library</DialogTitle>
        </DialogHeader>

        {/* Filters and Search */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory('all')}
            >
              All
            </Button>
            <Button
              variant={filterCategory === 'avatars' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory('avatars')}
            >
              Avatars
            </Button>
            <Button
              variant={filterCategory === 'videos' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterCategory('videos')}
            >
              Videos
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={selectAll}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Deselect All
            </Button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground">No items found</p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-1">
              {filteredItems.map((item) => {
                const isSelected = selectedItems.has(item.id);
                const alreadyInBrand = existingAssets.has(item.id);
                const displayUrl = item.is_video 
                  ? (item.thumbnail_url || item.video_url) 
                  : item.image_url;

                return (
                  <Card
                    key={item.id}
                    className={`relative cursor-pointer transition-all hover:ring-2 hover:ring-primary ${
                      isSelected ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => toggleSelection(item.id)}
                  >
                    <div className="aspect-square relative overflow-hidden rounded-t-lg">
                      <img
                        src={displayUrl}
                        alt={item.title || 'Library item'}
                        className="w-full h-full object-cover"
                      />
                      {alreadyInBrand && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm"
                        >
                          In Brand
                        </Badge>
                      )}
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(item.id)}
                          className="bg-background/80 backdrop-blur-sm"
                        />
                      </div>
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-6 w-6 text-primary-foreground" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium truncate">
                        {item.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.is_video ? 'Video' : 'Image'}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          <div className="flex items-center justify-between w-full">
            <p className="text-sm text-muted-foreground">
              {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={selectedItems.size === 0 || importing}
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  `Import Selected (${selectedItems.size})`
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
