import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brand } from '@/types/brand';
import { toast } from 'sonner';

export const useBrands = () => {
  const queryClient = useQueryClient();

  const { data: brands, isLoading } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Brand[];
    },
  });

  const createBrand = useMutation({
    mutationFn: async (brandData: Omit<Partial<Brand>, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('brands')
        .insert(brandData as any)
        .select()
        .single();

      if (error) throw error;

      // Auto-create default smart folder structure
      const defaultCollections = [
        { name: 'All Assets', collection_type: 'custom', is_smart_folder: true, sort_order: 0 },
        { name: 'Favorites', collection_type: 'custom', is_smart_folder: true, smart_rules: { tags: ['favorite'] }, sort_order: 1 },
        { name: 'Campaigns', collection_type: 'campaign', is_smart_folder: false, sort_order: 2 },
        { name: 'Characters', collection_type: 'character', is_smart_folder: false, sort_order: 3 },
        { name: 'Recent', collection_type: 'custom', is_smart_folder: true, smart_rules: { dateRange: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), end: new Date().toISOString() } }, sort_order: 4 },
      ];

      await supabase.from('brand_collections').insert(
        defaultCollections.map(col => ({
          brand_id: data.id,
          user_id: user.id,
          ...col,
        }))
      );

      return data as Brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand_collections'] });
      toast.success('Brand created successfully with smart folders!');
    },
    onError: (error) => {
      toast.error('Failed to create brand');
      console.error('Create brand error:', error);
    },
  });

  const updateBrand = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Brand> }) => {
      const { data, error } = await supabase
        .from('brands')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update brand');
      console.error('Update brand error:', error);
    },
  });

  const deleteBrand = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      toast.success('Brand archived successfully');
    },
    onError: (error) => {
      toast.error('Failed to archive brand');
      console.error('Archive brand error:', error);
    },
  });

  return {
    brands,
    isLoading,
    createBrand,
    updateBrand,
    deleteBrand,
  };
};
