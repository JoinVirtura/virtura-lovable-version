import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Trash2, Save, Loader2, Image as ImageIcon } from "lucide-react";

interface GalleryItem {
  id: string;
  image_url: string;
  title: string;
  prompt: string;
  tags: string[];
}

export function GalleryShowcaseManager() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    loadGalleryItems();
  }, []);

  const loadGalleryItems = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-showcase-gallery', {
        body: { operation: 'list' }
      });

      if (error) throw error;
      setItems(data.data || []);
    } catch (error) {
      console.error('Error loading gallery items:', error);
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (itemId: string, file: File) => {
    try {
      setUploading(itemId);
      
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `showcase-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('virtura-media')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('virtura-media')
        .getPublicUrl(fileName);

      // Update database
      const { error: updateError } = await supabase.functions.invoke('manage-showcase-gallery', {
        body: {
          operation: 'update',
          id: itemId,
          data: { image_url: publicUrl }
        }
      });

      if (updateError) throw updateError;

      toast.success('Image uploaded successfully');
      loadGalleryItems();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(null);
    }
  };

  const handleUpdateItem = async (itemId: string, field: string, value: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-showcase-gallery', {
        body: {
          operation: 'update',
          id: itemId,
          data: { [field]: value }
        }
      });

      if (error) throw error;

      setItems(items.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      ));
      toast.success('Updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Failed to update');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this showcase item?')) return;

    try {
      const { error } = await supabase.functions.invoke('manage-showcase-gallery', {
        body: { operation: 'delete', id: itemId }
      });

      if (error) throw error;

      toast.success('Item deleted successfully');
      loadGalleryItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gallery Showcase Manager</h2>
          <p className="text-muted-foreground">Manage the 12 showcase images displayed on the landing page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span className="truncate">{item.title}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Image Preview */}
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(item.id, file);
                      }}
                    />
                    {uploading === item.id ? (
                      <Loader2 className="w-8 h-8 animate-spin text-white" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-white">
                        <Upload className="w-8 h-8" />
                        <span className="text-sm">Replace Image</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <Label>Title</Label>
                <Input
                  value={item.title}
                  onChange={(e) => setItems(items.map(i => 
                    i.id === item.id ? { ...i, title: e.target.value } : i
                  ))}
                  onBlur={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                />
              </div>

              {/* Prompt */}
              <div>
                <Label>Prompt</Label>
                <Textarea
                  value={item.prompt}
                  onChange={(e) => setItems(items.map(i => 
                    i.id === item.id ? { ...i, prompt: e.target.value } : i
                  ))}
                  onBlur={(e) => handleUpdateItem(item.id, 'prompt', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}