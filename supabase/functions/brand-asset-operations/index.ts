import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, ...params } = await req.json();

    let result;

    switch (action) {
      case 'copy_from_library':
        result = await copyFromLibrary(supabaseClient, user.id, params);
        break;
      
      case 'move_assets':
        result = await moveAssets(supabaseClient, user.id, params);
        break;
      
      case 'bulk_delete':
        result = await bulkDelete(supabaseClient, user.id, params);
        break;
      
      case 'bulk_tag':
        result = await bulkTag(supabaseClient, user.id, params);
        break;
      
      default:
        throw new Error('Invalid action');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function copyFromLibrary(supabaseClient: any, userId: string, params: any) {
  const { libraryItemIds, brandId, collectionId } = params;

  // Fetch library items
  const { data: libraryItems, error: fetchError } = await supabaseClient
    .from('avatar_library')
    .select('*')
    .in('id', libraryItemIds)
    .eq('user_id', userId);

  if (fetchError) throw fetchError;

  // Create brand assets
  const brandAssets = libraryItems.map((item: any) => ({
    brand_id: brandId,
    collection_id: collectionId || null,
    user_id: userId,
    title: item.title || 'Imported Asset',
    asset_type: item.is_video ? 'video' : 'image',
    file_url: item.is_video ? item.video_url : item.image_url,
    thumbnail_url: item.thumbnail_url || item.image_url,
    tags: item.tags || [],
    generation_prompt: item.prompt,
    metadata: { imported_from_library: item.id },
  }));

  const { data: newAssets, error: insertError } = await supabaseClient
    .from('brand_assets')
    .insert(brandAssets)
    .select();

  if (insertError) throw insertError;

  return { success: true, count: newAssets.length, assets: newAssets };
}

async function moveAssets(supabaseClient: any, userId: string, params: any) {
  const { assetIds, toCollectionId } = params;

  // Verify ownership
  const { data: assets, error: verifyError } = await supabaseClient
    .from('brand_assets')
    .select('id, user_id')
    .in('id', assetIds);

  if (verifyError) throw verifyError;

  const unauthorized = assets.some((asset: any) => asset.user_id !== userId);
  if (unauthorized) throw new Error('Unauthorized to move these assets');

  // Move assets
  const { error: updateError } = await supabaseClient
    .from('brand_assets')
    .update({ collection_id: toCollectionId })
    .in('id', assetIds);

  if (updateError) throw updateError;

  return { success: true, count: assetIds.length };
}

async function bulkDelete(supabaseClient: any, userId: string, params: any) {
  const { assetIds } = params;

  // Verify ownership
  const { data: assets, error: verifyError } = await supabaseClient
    .from('brand_assets')
    .select('id, user_id')
    .in('id', assetIds);

  if (verifyError) throw verifyError;

  const unauthorized = assets.some((asset: any) => asset.user_id !== userId);
  if (unauthorized) throw new Error('Unauthorized to delete these assets');

  // Delete assets
  const { error: deleteError } = await supabaseClient
    .from('brand_assets')
    .delete()
    .in('id', assetIds);

  if (deleteError) throw deleteError;

  return { success: true, count: assetIds.length };
}

async function bulkTag(supabaseClient: any, userId: string, params: any) {
  const { assetIds, tags } = params;

  // Verify ownership
  const { data: assets, error: verifyError } = await supabaseClient
    .from('brand_assets')
    .select('id, user_id, tags')
    .in('id', assetIds);

  if (verifyError) throw verifyError;

  const unauthorized = assets.some((asset: any) => asset.user_id !== userId);
  if (unauthorized) throw new Error('Unauthorized to tag these assets');

  // Update tags for each asset
  const updates = assets.map((asset: any) => {
    const existingTags = asset.tags || [];
    const newTags = Array.from(new Set([...existingTags, ...tags]));
    return { id: asset.id, tags: newTags };
  });

  // Perform updates
  for (const update of updates) {
    await supabaseClient
      .from('brand_assets')
      .update({ tags: update.tags })
      .eq('id', update.id);
  }

  return { success: true, count: assetIds.length };
}
