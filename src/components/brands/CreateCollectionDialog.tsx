import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBrandCollections } from '@/hooks/useBrandCollections';

const collectionSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  collection_type: z.enum(['campaign', 'product', 'character', 'seasonal', 'custom']),
  color_label: z.string().optional(),
});

type CollectionFormData = z.infer<typeof collectionSchema>;

interface CreateCollectionDialogProps {
  brandId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCollectionDialog({ brandId, open, onOpenChange }: CreateCollectionDialogProps) {
  const { createCollection } = useBrandCollections(brandId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<CollectionFormData>({
    resolver: zodResolver(collectionSchema),
    defaultValues: {
      collection_type: 'custom',
    },
  });

  const onSubmit = async (data: CollectionFormData) => {
    setIsSubmitting(true);
    try {
      await createCollection.mutateAsync({
        brand_id: brandId,
        name: data.name,
        description: data.description,
        collection_type: data.collection_type,
        color_label: data.color_label,
        is_smart_folder: false,
        sort_order: 0,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Collection creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Collection</DialogTitle>
          <DialogDescription>
            Organize your brand assets into collections
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name">Collection Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Summer Campaign 2025"
            />
            {errors.name && (
              <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe this collection..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="collection_type">Type</Label>
            <Select
              onValueChange={(value) => setValue('collection_type', value as any)}
              defaultValue="custom"
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="campaign">Campaign</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="character">Character</SelectItem>
                <SelectItem value="seasonal">Seasonal</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="color_label">Color Label (optional)</Label>
            <Input
              id="color_label"
              type="color"
              {...register('color_label')}
              className="h-10"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Collection'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
