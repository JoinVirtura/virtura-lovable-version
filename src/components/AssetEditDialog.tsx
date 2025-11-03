import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Loader2 } from 'lucide-react';
import type { BrandAsset, BrandCollection } from '@/hooks/useBrandAssets';

interface AssetEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  asset: BrandAsset | null;
  collections: BrandCollection[];
  onSave: (assetId: string, updates: Partial<BrandAsset>) => Promise<void>;
}

export function AssetEditDialog({
  open,
  onOpenChange,
  asset,
  collections,
  onSave,
}: AssetEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    if (asset) {
      setTitle(asset.title);
      setDescription(asset.description || '');
      setCollectionId(asset.collection_id);
      setTags(asset.tags || []);
    }
  }, [asset]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!asset) return;

    try {
      setLoading(true);
      await onSave(asset.id, {
        title,
        description: description || null,
        collection_id: collectionId,
        tags,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving asset:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!asset) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-violet-500/30">
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update asset details, tags, and organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Preview */}
          <div className="border border-violet-500/20 rounded-lg p-3 bg-black/40">
            <img
              src={asset.thumbnail_url || asset.file_url}
              alt={asset.title}
              className="w-full h-32 object-cover rounded"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-black/60 border-violet-500/30"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-black/60 border-violet-500/30 resize-none"
            />
          </div>

          {/* Collection */}
          <div className="space-y-2">
            <Label htmlFor="collection">Folder</Label>
            <Select
              value={collectionId || 'none'}
              onValueChange={(value) => setCollectionId(value === 'none' ? null : value)}
            >
              <SelectTrigger id="collection" className="bg-black/60 border-violet-500/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-violet-500/30">
                <SelectItem value="none">All Assets</SelectItem>
                {collections.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-black/60 border-violet-500/30"
              />
              <Button
                type="button"
                size="icon"
                onClick={handleAddTag}
                variant="outline"
                className="border-violet-500/30"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-violet-500/30"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !title.trim()}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
