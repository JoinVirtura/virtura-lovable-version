import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BrandAsset } from '@/types/brand';
import { toast } from 'sonner';

export const useBrandAssets = (brandId?: string) => {
  const queryClient = useQueryClient();

  const { data: assets, isLoading } = useQuery({
    queryKey: ['brand-assets', brandId],
    queryFn: async () => {
      let query = supabase
        .from('brand_assets')
        .select('*')
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (brandId) {
        query = query.eq('brand_id', brandId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BrandAsset[];
    },
    enabled: !!brandId,
  });

  const createAsset = useMutation({
    mutationFn: async (assetData: Omit<Partial<BrandAsset>, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('brand_assets')
        .insert(assetData as any)
        .select()
        .single();

      if (error) throw error;
      return data as BrandAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Asset added successfully');
    },
    onError: (error) => {
      toast.error('Failed to add asset');
      console.error('Create asset error:', error);
    },
  });

  const updateAsset = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BrandAsset> }) => {
      const { data, error } = await supabase
        .from('brand_assets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BrandAsset;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Asset updated successfully');
    },
  });

  const toggleFavorite = useMutation({
    mutationFn: async ({ id, isFavorite }: { id: string; isFavorite: boolean }) => {
      const { error } = await supabase
        .from('brand_assets')
        .update({ is_favorite: !isFavorite })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
    },
  });

  const archiveAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brand_assets')
        .update({ is_archived: true })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-assets'] });
      toast.success('Asset archived successfully');
    },
  });

  return {
    assets,
    isLoading,
    createAsset,
    updateAsset,
    toggleFavorite,
    archiveAsset,
  };
};
