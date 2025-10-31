import { supabase } from '@/integrations/supabase/client';

/**
 * Asset synchronization utilities for bidirectional sync between
 * avatar_library and brand_assets tables
 */

export interface LibraryAsset {
  id: string;
  user_id: string;
  image_url: string;
  video_url?: string | null;
  thumbnail_url?: string | null;
  prompt?: string | null;
  title?: string | null;
  tags?: string[] | null;
  is_video: boolean;
}

export interface BrandAsset {
  id: string;
  brand_id: string;
  collection_id?: string | null;
  user_id: string;
  title: string;
  description?: string | null;
  asset_type: string;
  file_url: string;
  thumbnail_url?: string | null;
  generation_prompt?: string | null;
  tags?: string[] | null;
  metadata?: any;
}

/**
 * Sync a library item to brand assets
 * Creates a brand_asset record from an avatar_library item
 */
export const syncToBrandAssets = async (
  libraryItem: LibraryAsset,
  brandId: string,
  collectionId?: string
): Promise<BrandAsset> => {
  const { data, error } = await supabase
    .from('brand_assets')
    .insert({
      brand_id: brandId,
      collection_id: collectionId,
      user_id: libraryItem.user_id,
      title: libraryItem.title || 'Untitled Asset',
      asset_type: libraryItem.is_video ? 'video' : 'image',
      file_url: libraryItem.is_video ? libraryItem.video_url : libraryItem.image_url,
      thumbnail_url: libraryItem.thumbnail_url,
      generation_prompt: libraryItem.prompt,
      tags: libraryItem.tags || [],
      metadata: { library_id: libraryItem.id },
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

/**
 * Sync a brand asset to library
 * Creates an avatar_library record from a brand_asset
 */
export const syncToLibrary = async (brandAsset: BrandAsset): Promise<LibraryAsset> => {
  const { data, error } = await supabase
    .from('avatar_library')
    .insert({
      user_id: brandAsset.user_id,
      image_url: brandAsset.file_url,
      video_url: brandAsset.asset_type === 'video' ? brandAsset.file_url : null,
      thumbnail_url: brandAsset.thumbnail_url,
      prompt: brandAsset.generation_prompt,
      title: brandAsset.title,
      tags: brandAsset.tags,
      is_video: brandAsset.asset_type === 'video',
    })
    .select()
    .single();

  if (error) throw error;

  // Update brand asset with library reference
  await supabase
    .from('brand_assets')
    .update({
      metadata: {
        ...brandAsset.metadata,
        library_id: data.id,
      },
    })
    .eq('id', brandAsset.id);

  return data;
};

/**
 * Check if an asset exists in both tables
 */
export const getSyncStatus = async (
  assetId: string,
  sourceTable: 'avatar_library' | 'brand_assets'
): Promise<{ synced: boolean; linkedId?: string }> => {
  if (sourceTable === 'avatar_library') {
    // Check if this library item is linked to any brand assets
    const { data } = await supabase
      .from('brand_assets')
      .select('id, metadata')
      .contains('metadata', { library_id: assetId })
      .single();

    return {
      synced: !!data,
      linkedId: data?.id,
    };
  } else {
    // Check if this brand asset is linked to a library item
    const { data: brandAsset } = await supabase
      .from('brand_assets')
      .select('metadata')
      .eq('id', assetId)
      .single();

    const metadata = brandAsset?.metadata as any;
    const libraryId = metadata?.library_id;

    return {
      synced: !!libraryId,
      linkedId: libraryId,
    };
  }
};

/**
 * Remove sync link between assets
 * Removes from one table while keeping in the other
 */
export const removeSyncLink = async (
  assetId: string,
  removeFrom: 'avatar_library' | 'brand_assets'
): Promise<void> => {
  if (removeFrom === 'avatar_library') {
    // Delete from library, keep in brand_assets
    const { error } = await supabase
      .from('avatar_library')
      .delete()
      .eq('id', assetId);

    if (error) throw error;
  } else {
    // Delete from brand_assets, keep in library
    const { error } = await supabase
      .from('brand_assets')
      .delete()
      .eq('id', assetId);

    if (error) throw error;
  }
};

