import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Brand {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  industry: string | null;
  brand_colors: any;
  brand_fonts: any;
  created_at: string;
}

export interface BrandCollection {
  id: string;
  brand_id: string;
  name: string;
  description: string | null;
  collection_type: string;
  color_label: string | null;
  parent_collection_id: string | null;
  sort_order: number;
  is_smart_folder: boolean;
  smart_rules: any;
  created_at: string;
  updated_at: string;
}

export interface BrandAsset {
  id: string;
  brand_id: string;
  collection_id: string | null;
  user_id: string;
  title: string;
  description: string | null;
  asset_type: string;
  file_url: string;
  thumbnail_url: string | null;
  file_size: number | null;
  dimensions: any;
  tags: string[];
  is_favorite: boolean;
  is_archived: boolean;
  performance_score: number | null;
  usage_count: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export const useBrandAssets = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [collections, setCollections] = useState<BrandCollection[]>([]);
  const [assets, setAssets] = useState<BrandAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's brands
  const loadBrands = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBrands(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Error loading brands:', err);
      setError(err.message);
      toast.error('Failed to load brands');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load collections for a brand
  const loadCollections = async (brandId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_collections')
        .select('*')
        .eq('brand_id', brandId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCollections(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Error loading collections:', err);
      setError(err.message);
      toast.error('Failed to load folders');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load assets for a brand (optionally filtered by collection)
  const loadAssets = async (
    brandId: string,
    collectionId?: string | null,
    filters?: {
      searchQuery?: string;
      assetType?: string;
      isFavorite?: boolean;
      sortBy?: string;
      days?: number;
    }
  ) => {
    try {
      setLoading(true);
      let query = supabase
        .from('brand_assets')
        .select('*')
        .eq('brand_id', brandId)
        .eq('is_archived', false);

      if (collectionId) {
        query = query.eq('collection_id', collectionId);
      } else if (collectionId === null) {
        query = query.is('collection_id', null);
      }

      if (filters?.searchQuery) {
        query = query.or(
          `title.ilike.%${filters.searchQuery}%,description.ilike.%${filters.searchQuery}%,tags.cs.{${filters.searchQuery}}`
        );
      }

      if (filters?.assetType && filters.assetType !== 'all') {
        query = query.eq('asset_type', filters.assetType);
      }

      if (filters?.isFavorite) {
        query = query.eq('is_favorite', true);
      }

      if (filters?.days) {
        const dateThreshold = new Date();
        dateThreshold.setDate(dateThreshold.getDate() - filters.days);
        query = query.gte('created_at', dateThreshold.toISOString());
      }

      // Sorting
      const sortBy = filters?.sortBy || 'created_at';
      query = query.order(sortBy, { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setAssets(data || []);
      return data || [];
    } catch (err: any) {
      console.error('Error loading assets:', err);
      setError(err.message);
      toast.error('Failed to load assets');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new collection
  const createCollection = async (
    brandId: string,
    name: string,
    collectionType: string = 'custom',
    parentId?: string | null
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_collections')
        .insert({
          brand_id: brandId,
          user_id: user.id,
          name,
          collection_type: collectionType,
          parent_collection_id: parentId,
          sort_order: collections.length,
        })
        .select()
        .single();

      if (error) throw error;
      setCollections([...collections, data]);
      toast.success('Folder created successfully');
      return data;
    } catch (err: any) {
      console.error('Error creating collection:', err);
      toast.error('Failed to create folder');
      throw err;
    }
  };

  // Move asset to different collection
  const moveAsset = async (assetId: string, toCollectionId: string | null) => {
    try {
      const { error } = await supabase
        .from('brand_assets')
        .update({ collection_id: toCollectionId })
        .eq('id', assetId);

      if (error) throw error;

      setAssets(
        assets.map((asset) =>
          asset.id === assetId ? { ...asset, collection_id: toCollectionId } : asset
        )
      );
      toast.success('Asset moved successfully');
    } catch (err: any) {
      console.error('Error moving asset:', err);
      toast.error('Failed to move asset');
      throw err;
    }
  };

  // Delete an asset
  const deleteAsset = async (assetId: string) => {
    try {
      const { error } = await supabase
        .from('brand_assets')
        .delete()
        .eq('id', assetId);

      if (error) throw error;

      setAssets(assets.filter((asset) => asset.id !== assetId));
      toast.success('Asset deleted successfully');
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      toast.error('Failed to delete asset');
      throw err;
    }
  };

  // Update asset metadata
  const updateAssetMetadata = async (
    assetId: string,
    updates: Partial<BrandAsset>
  ) => {
    try {
      const { error } = await supabase
        .from('brand_assets')
        .update(updates)
        .eq('id', assetId);

      if (error) throw error;

      setAssets(
        assets.map((asset) =>
          asset.id === assetId ? { ...asset, ...updates } : asset
        )
      );
      toast.success('Asset updated successfully');
    } catch (err: any) {
      console.error('Error updating asset:', err);
      toast.error('Failed to update asset');
      throw err;
    }
  };

  // Import asset from avatar_library to brand
  const importFromLibrary = async (
    libraryItemId: string,
    brandId: string,
    collectionId?: string | null
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Fetch the library item
      const { data: libraryItem, error: fetchError } = await supabase
        .from('avatar_library')
        .select('*')
        .eq('id', libraryItemId)
        .single();

      if (fetchError) throw fetchError;

      // Create brand asset
      const { data: newAsset, error: insertError } = await supabase
        .from('brand_assets')
        .insert({
          brand_id: brandId,
          user_id: user.id,
          collection_id: collectionId,
          title: libraryItem.title || 'Imported Asset',
          asset_type: libraryItem.is_video ? 'video' : 'image',
          file_url: libraryItem.is_video ? libraryItem.video_url : libraryItem.image_url,
          thumbnail_url: libraryItem.thumbnail_url || libraryItem.image_url,
          tags: libraryItem.tags || [],
          generation_prompt: libraryItem.prompt,
          metadata: { imported_from_library: libraryItemId },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setAssets([...assets, newAsset]);
      toast.success('Asset imported to brand');
      return newAsset;
    } catch (err: any) {
      console.error('Error importing asset:', err);
      toast.error('Failed to import asset');
      throw err;
    }
  };

  // Toggle favorite
  const toggleFavorite = async (assetId: string) => {
    const asset = assets.find((a) => a.id === assetId);
    if (!asset) return;

    await updateAssetMetadata(assetId, { is_favorite: !asset.is_favorite });
  };

  // Update collection
  const updateCollection = async (
    collectionId: string,
    updates: Partial<BrandCollection>
  ) => {
    try {
      const { error } = await supabase
        .from('brand_collections')
        .update(updates)
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(
        collections.map((c) =>
          c.id === collectionId ? { ...c, ...updates } : c
        )
      );
      toast.success('Folder updated successfully');
    } catch (err: any) {
      console.error('Error updating collection:', err);
      toast.error('Failed to update folder');
      throw err;
    }
  };

  // Delete collection
  const deleteCollection = async (collectionId: string) => {
    try {
      const { error } = await supabase
        .from('brand_collections')
        .delete()
        .eq('id', collectionId);

      if (error) throw error;

      setCollections(collections.filter((c) => c.id !== collectionId));
      toast.success('Folder deleted successfully');
    } catch (err: any) {
      console.error('Error deleting collection:', err);
      toast.error('Failed to delete folder');
      throw err;
    }
  };

  // Save a generated image as a brand asset
  const saveGeneratedAsset = async (
    brandId: string,
    imageDataUrl: string,
    prompt: string,
    collectionId?: string | null,
    metadata?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert base64 to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `brand-assets/${brandId}/${timestamp}-${Math.random().toString(36).substring(7)}.png`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('virtura-media')
        .upload(filename, blob, {
          contentType: 'image/png',
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('virtura-media')
        .getPublicUrl(filename);

      // Create brand asset record
      const { data: newAsset, error: insertError } = await supabase
        .from('brand_assets')
        .insert({
          brand_id: brandId,
          user_id: user.id,
          collection_id: collectionId,
          title: `Generated: ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`,
          asset_type: 'image',
          file_url: publicUrl,
          thumbnail_url: publicUrl,
          generation_prompt: prompt,
          ai_model_used: 'replicate',
          dimensions: { width: 1024, height: 1024, aspectRatio: '1:1' },
          tags: ['ai-generated'],
          metadata: {
            ...metadata,
            generated_at: new Date().toISOString(),
          },
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setAssets([newAsset, ...assets]);
      return newAsset;
    } catch (err: any) {
      console.error('Error saving generated asset:', err);
      toast.error('Failed to save generated asset');
      throw err;
    }
  };

  // Get stats for a brand
  const getBrandStats = async (brandId: string) => {
    try {
      const { count: assetCount } = await supabase
        .from('brand_assets')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId)
        .eq('is_archived', false);

      const { count: campaignCount } = await supabase
        .from('brand_campaigns')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brandId);

      const { data: perfData } = await supabase
        .from('brand_assets')
        .select('performance_score')
        .eq('brand_id', brandId)
        .not('performance_score', 'is', null);

      const avgPerformance =
        perfData && perfData.length > 0
          ? perfData.reduce((sum, item) => sum + (item.performance_score || 0), 0) /
            perfData.length
          : 0;

      return {
        totalAssets: assetCount || 0,
        activeCampaigns: campaignCount || 0,
        avgPerformance: Math.round(avgPerformance * 10) / 10,
      };
    } catch (err: any) {
      console.error('Error getting brand stats:', err);
      return { totalAssets: 0, activeCampaigns: 0, avgPerformance: 0 };
    }
  };

  return {
    brands,
    collections,
    assets,
    loading,
    error,
    loadBrands,
    loadCollections,
    loadAssets,
    createCollection,
    moveAsset,
    deleteAsset,
    updateAssetMetadata,
    importFromLibrary,
    toggleFavorite,
    updateCollection,
    deleteCollection,
    getBrandStats,
    saveGeneratedAsset,
  };
};
