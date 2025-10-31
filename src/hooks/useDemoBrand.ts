import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { createDemoBrand, createDemoCollections, createDemoAssets } from '@/lib/demoData';
import { toast } from 'sonner';

export const useDemoBrand = () => {
  const queryClient = useQueryClient();

  const createFullDemoBrand = useMutation({
    mutationFn: async (userId: string) => {
      // 1. Create brand
      const brandData = createDemoBrand(userId);
      const { data: brand, error: brandError } = await supabase
        .from('brands')
        .insert(brandData as any)
        .select()
        .single();

      if (brandError) throw brandError;

      // 2. Create collections
      const collectionsData = createDemoCollections(brand.id, userId);
      const { data: collections, error: collectionsError } = await supabase
        .from('brand_collections')
        .insert(collectionsData as any)
        .select();

      if (collectionsError) throw collectionsError;

      // 3. Create assets for first collection
      if (collections && collections.length > 0) {
        const assetsData = createDemoAssets(brand.id, collections[0].id, userId);
        const { error: assetsError } = await supabase
          .from('brand_assets')
          .insert(assetsData as any);

        if (assetsError) throw assetsError;
      }

      return brand;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['brand_collections'] });
      queryClient.invalidateQueries({ queryKey: ['brand_assets'] });
      toast.success('Demo brand created! Explore to see how Virtura works.');
    },
    onError: (error) => {
      console.error('Demo brand creation error:', error);
      toast.error('Failed to create demo brand');
    },
  });

  return { createFullDemoBrand };
};
