import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { BrandCollection } from '@/types/brand';
import { toast } from 'sonner';

export const useBrandCollections = (brandId?: string) => {
  const queryClient = useQueryClient();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['brand-collections', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      
      const { data, error } = await supabase
        .from('brand_collections')
        .select('*')
        .eq('brand_id', brandId)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as BrandCollection[];
    },
    enabled: !!brandId,
  });

  const createCollection = useMutation({
    mutationFn: async (collectionData: Omit<Partial<BrandCollection>, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('brand_collections')
        .insert({
          ...collectionData,
          user_id: user.id,
        } as any)
        .select()
        .single();

      if (error) throw error;
      return data as BrandCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-collections'] });
      toast.success('Collection created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create collection');
      console.error('Create collection error:', error);
    },
  });

  const updateCollection = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<BrandCollection> }) => {
      const { data, error } = await supabase
        .from('brand_collections')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as BrandCollection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-collections'] });
      toast.success('Collection updated successfully');
    },
    onError: (error) => {
      toast.error('Failed to update collection');
      console.error('Update collection error:', error);
    },
  });

  const deleteCollection = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('brand_collections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brand-collections'] });
      toast.success('Collection deleted successfully');
    },
    onError: (error) => {
      toast.error('Failed to delete collection');
      console.error('Delete collection error:', error);
    },
  });

  return {
    collections,
    isLoading,
    createCollection,
    updateCollection,
    deleteCollection,
  };
};
