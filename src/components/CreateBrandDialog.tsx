import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateBrandDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBrandCreated?: (brandId: string) => void;
}

export function CreateBrandDialog({
  open,
  onOpenChange,
  onBrandCreated,
}: CreateBrandDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    website_url: '',
  });

  const industries = [
    'Technology',
    'Fashion',
    'Food & Beverage',
    'Healthcare',
    'Education',
    'Entertainment',
    'Finance',
    'Real Estate',
    'Travel',
    'Sports',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a brand name');
      return;
    }

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create the brand
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .insert({
          user_id: user.id,
          name: formData.name,
          description: formData.description || null,
          industry: formData.industry || null,
          website_url: formData.website_url || null,
        })
        .select()
        .single();

      if (brandError) throw brandError;

      // Create default collections
      const defaultCollections = [
        { name: 'Product Photos', collection_type: 'product', sort_order: 0 },
        { name: 'Social Media', collection_type: 'social', sort_order: 1 },
        { name: 'Campaigns', collection_type: 'campaign', sort_order: 2 },
        { name: 'Brand Assets', collection_type: 'brand', sort_order: 3 },
      ];

      const { error: collectionsError } = await supabase
        .from('brand_collections')
        .insert(
          defaultCollections.map((col) => ({
            ...col,
            brand_id: brand.id,
            user_id: user.id,
          }))
        );

      if (collectionsError) throw collectionsError;

      toast.success('Brand created successfully!');
      setFormData({ name: '', description: '', industry: '', website_url: '' });
      onOpenChange(false);
      
      if (onBrandCreated) {
        onBrandCreated(brand.id);
      }
    } catch (err: any) {
      console.error('Error creating brand:', err);
      toast.error('Failed to create brand: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Brand</DialogTitle>
          <DialogDescription>
            Set up a new brand to organize your assets and campaigns
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Brand Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Acme Corporation"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of your brand..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Select
              value={formData.industry}
              onValueChange={(value) =>
                setFormData({ ...formData, industry: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an industry" />
              </SelectTrigger>
              <SelectContent>
                {industries.map((industry) => (
                  <SelectItem key={industry} value={industry.toLowerCase()}>
                    {industry}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website URL</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website_url}
              onChange={(e) =>
                setFormData({ ...formData, website_url: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Brand
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
