import { supabase } from "@/integrations/supabase/client";

export const createDemoBrandData = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Create demo brand
    const { data: brand, error: brandError } = await supabase
      .from('brands' as any)
      .insert({
        user_id: user.id,
        name: 'Sample Coffee Shop',
        description: 'Artisan coffee roasters and café',
        industry: 'Food & Beverage',
        website_url: 'https://samplecoffeeshop.com',
        tone_of_voice: 'Warm, welcoming, and artisanal. We speak to coffee lovers who appreciate quality craftsmanship.',
        target_audience: 'Coffee enthusiasts aged 25-45 who value quality and sustainability',
        brand_colors: {
          primary: '#6F4E37',
          secondary: '#F5DEB3',
          accent: '#8B4513',
          support: '#D2691E'
        },
        brand_fonts: {
          heading: 'Playfair Display',
          body: 'Inter'
        }
      })
      .select()
      .single();

    if (brandError || !brand) {
      console.error('Error creating demo brand:', brandError);
      return;
    }

    const brandId = (brand as any).id;

    // Create collections
    const collections = [
      { id: 'product-photos', name: 'Product Photos', type: 'custom', smart: false },
      { id: 'social-media', name: 'Social Media', type: 'custom', smart: false },
      { id: 'campaigns', name: 'Campaigns', type: 'custom', smart: false },
      { id: 'videos', name: 'Videos', type: 'custom', smart: true, rules: { rules: [{ field: 'asset_type', operator: 'equals', value: 'video' }], operator: 'AND' } },
      { id: 'recent', name: 'Recent (7 days)', type: 'smart', smart: true, rules: { rules: [{ field: 'created_at', operator: '>', value: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }], operator: 'AND' } }
    ];

    for (const [index, collection] of collections.entries()) {
      await supabase.from('brand_collections' as any).insert({
        id: `${brandId}-${collection.id}`,
        brand_id: brandId,
        user_id: user.id,
        name: collection.name,
        collection_type: collection.type,
        is_smart_folder: collection.smart,
        smart_rules: collection.rules || null,
        sort_order: index
      });
    }

    // Create demo assets with real Unsplash URLs
    const demoAssets = [
      {
        title: 'Iced Latte Hero Shot',
        description: 'Premium iced latte with caramel drizzle',
        file_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-product-photos`,
        tags: ['product', 'iced-latte', 'hero', 'summer'],
        performance_score: 9.2
      },
      {
        title: 'Espresso Close-up',
        description: 'Rich espresso shot with crema',
        file_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-product-photos`,
        tags: ['product', 'espresso', 'coffee', 'close-up'],
        performance_score: 8.7
      },
      {
        title: 'Latte Art - Heart',
        description: 'Perfect heart latte art pour',
        file_url: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-product-photos`,
        tags: ['latte-art', 'cappuccino', 'artistic', 'barista'],
        performance_score: 9.5
      },
      {
        title: 'Coffee Beans Texture',
        description: 'Roasted coffee beans background',
        file_url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-product-photos`,
        tags: ['beans', 'texture', 'roasted', 'background'],
        performance_score: 7.8
      },
      {
        title: 'Pour Over Process',
        description: 'Artisan pour over coffee brewing',
        file_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-social-media`,
        tags: ['pour-over', 'brewing', 'process', 'artisan'],
        performance_score: 8.9
      },
      {
        title: 'Café Interior',
        description: 'Cozy coffee shop ambiance',
        file_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-social-media`,
        tags: ['interior', 'ambiance', 'café', 'lifestyle'],
        performance_score: 8.3
      },
      {
        title: 'Cold Brew with Ice',
        description: 'Refreshing cold brew coffee',
        file_url: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-social-media`,
        tags: ['cold-brew', 'summer', 'refreshing', 'iced'],
        performance_score: 9.1
      },
      {
        title: 'Cappuccino Morning',
        description: 'Perfect morning cappuccino',
        file_url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-campaigns`,
        tags: ['cappuccino', 'morning', 'cozy', 'campaign'],
        performance_score: 8.6
      },
      {
        title: 'Barista at Work',
        description: 'Professional barista crafting coffee',
        file_url: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-campaigns`,
        tags: ['barista', 'professional', 'craftsman', 'people'],
        performance_score: 7.9
      },
      {
        title: 'Coffee Shop Sign',
        description: 'Vintage coffee shop exterior sign',
        file_url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-campaigns`,
        tags: ['exterior', 'sign', 'branding', 'vintage'],
        performance_score: 7.5
      },
      {
        title: 'Flat White Top View',
        description: 'Minimalist flat white from above',
        file_url: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-product-photos`,
        tags: ['flat-white', 'minimalist', 'top-view', 'clean'],
        performance_score: 8.8
      },
      {
        title: 'Coffee to Go',
        description: 'Takeaway coffee cup with logo',
        file_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1024&h=1024&fit=crop',
        collection_id: `${brandId}-social-media`,
        tags: ['takeaway', 'to-go', 'lifestyle', 'mobile'],
        performance_score: 8.4
      }
    ];

    for (const asset of demoAssets) {
      await supabase.from('brand_assets' as any).insert({
        brand_id: brandId,
        user_id: user.id,
        collection_id: asset.collection_id,
        title: asset.title,
        description: asset.description,
        asset_type: 'image',
        file_url: asset.file_url,
        thumbnail_url: asset.file_url,
        tags: asset.tags,
        format: 'jpg',
        dimensions: { width: 1024, height: 1024, aspectRatio: '1:1' },
        performance_score: asset.performance_score,
        metadata: { source: 'demo', generated_at: new Date().toISOString() }
      });
    }

    console.log('Demo brand data created successfully');
  } catch (error) {
    console.error('Error creating demo data:', error);
  }
};
