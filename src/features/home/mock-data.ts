import { Tile } from './types';

// Ultra-diverse content for Pinterest-style gallery
export const mockTiles: Tile[] = [
  // ARCHITECTURE & DESIGN
  {
    id: 'arch-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1495433824815-65ab0d6e4f8a?w=800&h=600&fit=crop&crop=center',
    title: 'Futuristic Glass House',
    tag: 'ARCHITECTURE',
    views: 4847291,
    byline: 'Urban Vision Studio'
  },
  {
    id: 'arch-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=600&fit=crop&crop=center',
    title: 'Minimalist Interior',
    tag: 'INTERIOR',
    views: 3729384,
    byline: 'Clean Design Co'
  },
  {
    id: 'arch-3',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop&crop=center',
    title: 'Art Deco Staircase',
    tag: 'DESIGN',
    views: 2847391,
    byline: 'Heritage Architecture'
  },

  // CHARACTERS & 3D ART
  {
    id: 'char-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
    title: 'Cyberpunk Character',
    tag: '3D ART',
    views: 5827391,
    byline: 'Future Studios'
  },
  {
    id: 'char-2',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Sci-Fi Warrior',
    tag: 'CHARACTER',
    duration: '2:30',
    views: 4729384,
    byline: 'Combat Arts'
  },
  {
    id: 'char-3',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=600&fit=crop&crop=center',
    title: 'Fantasy Dragon',
    tag: 'FANTASY',
    views: 3847291,
    byline: 'Mythical Creations'
  },

  // FOOD & CULINARY ART
  {
    id: 'food-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop&crop=center',
    title: 'Molecular Gastronomy',
    tag: 'CULINARY',
    views: 3928374,
    byline: 'Chef Artistry'
  },
  {
    id: 'food-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop&crop=center',
    title: 'Artisan Sushi Dragon',
    tag: 'SUSHI ART',
    views: 4847391,
    byline: 'Sushi Masters'
  },
  {
    id: 'food-3',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop&crop=center',
    title: 'Gourmet Burger Stack',
    tag: 'FOOD STYLING',
    views: 2847392,
    byline: 'Food Photographers'
  },
  {
    id: 'food-4',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Coffee Art Creation',
    tag: 'BEVERAGE',
    duration: '1:45',
    views: 1847291,
    byline: 'Barista Arts'
  },

  // ABSTRACT & DIGITAL ART
  {
    id: 'abstract-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop&crop=center',
    title: 'Fluid Dynamics',
    tag: 'ABSTRACT',
    views: 4749281,
    byline: 'Digital Dreamscape'
  },
  {
    id: 'abstract-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1558051815-0f081e2e9cc2?w=800&h=600&fit=crop&crop=center',
    title: 'Geometric Synthesis',
    tag: 'DIGITAL ART',
    views: 3847391,
    byline: 'Fractal Studios'
  },
  {
    id: 'abstract-3',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Color Explosion',
    tag: 'MOTION',
    duration: '3:15',
    views: 5827391,
    byline: 'Color Theory Co'
  },

  // PORTRAITS & FASHION
  {
    id: 'portrait-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop&crop=center',
    title: 'High Fashion Portrait',
    tag: 'FASHION',
    views: 3847391,
    byline: 'Vogue Digital'
  },
  {
    id: 'portrait-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=600&fit=crop&crop=center',
    title: 'Ethereal Beauty',
    tag: 'PORTRAIT',
    views: 2847392,
    byline: 'Beauty Studios'
  },
  {
    id: 'portrait-3',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Model in Motion',
    tag: 'LIFESTYLE',
    duration: '2:20',
    views: 1947392,
    byline: 'Motion Studios'
  },

  // LUXURY & PRODUCTS
  {
    id: 'luxury-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=600&fit=crop&crop=center',
    title: 'Swiss Luxury Watch',
    tag: 'LUXURY',
    views: 3847391,
    byline: 'Timeless Craft'
  },
  {
    id: 'luxury-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=600&fit=crop&crop=center',
    title: 'Designer Perfume',
    tag: 'FRAGRANCE',
    views: 2847291,
    byline: 'Scent Studios'
  },
  {
    id: 'luxury-3',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1493238792000-8113da705763?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Hypercar Showcase',
    tag: 'AUTOMOTIVE',
    duration: '2:45',
    views: 4728394,
    byline: 'Speed Vision'
  },

  // NATURE & WILDLIFE
  {
    id: 'nature-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=600&fit=crop&crop=center',
    title: 'Majestic Tiger',
    tag: 'WILDLIFE',
    views: 5728394,
    byline: 'Wild Photography'
  },
  {
    id: 'nature-2',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Ocean Dolphins',
    tag: 'MARINE',
    duration: '3:45',
    views: 4847291,
    byline: 'Deep Blue'
  },
  {
    id: 'nature-3',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop&crop=center',
    title: 'Aurora Borealis',
    tag: 'LANDSCAPE',
    views: 5729384,
    byline: 'Northern Lights'
  },

  // TECH & SCI-FI
  {
    id: 'tech-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    title: 'Neural Network',
    tag: 'AI TECH',
    views: 4827391,
    byline: 'Future Labs'
  },
  {
    id: 'tech-2',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Holographic Interface',
    tag: 'SCI-FI',
    duration: '2:15',
    views: 3923847,
    byline: 'Hologram Studios'
  },
  {
    id: 'tech-3',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1614064745857-20beee48827b?w=800&h=600&fit=crop&crop=center',
    title: 'Space Station',
    tag: 'SPACE',
    views: 6847291,
    byline: 'Cosmic Renders'
  },

  // URBAN & STREET ART
  {
    id: 'urban-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&crop=center',
    title: 'Street Art Mural',
    tag: 'STREET ART',
    views: 2847391,
    byline: 'Urban Canvas'
  },
  {
    id: 'urban-2',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'City Night Life',
    tag: 'URBAN',
    duration: '1:55',
    views: 3729384,
    byline: 'Night Photographers'
  },

  // SPORTS & ACTION
  {
    id: 'sport-1',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Extreme Skateboarding',
    tag: 'ACTION',
    duration: '2:20',
    views: 4847291,
    byline: 'X-Sport Media'
  },
  {
    id: 'sport-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop&crop=center',
    title: 'Marathon Runner',
    tag: 'ATHLETICS',
    views: 3847391,
    byline: 'Sport Focus'
  },

  // MUSIC & PERFORMANCE
  {
    id: 'music-1',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Electronic Concert',
    tag: 'MUSIC',
    duration: '4:15',
    views: 5827391,
    byline: 'Sound Wave'
  },
  {
    id: 'music-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop&crop=center',
    title: 'Live Performance',
    tag: 'CONCERT',
    views: 4847291,
    byline: 'Stage Lights'
  },

  // TRAVEL & ADVENTURE
  {
    id: 'travel-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=600&fit=crop&crop=center',
    title: 'Desert Adventure',
    tag: 'ADVENTURE',
    views: 3729384,
    byline: 'Desert Explorers'
  },
  {
    id: 'travel-2',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Mountain Expedition',
    tag: 'HIKING',
    duration: '3:30',
    views: 4827391,
    byline: 'Peak Adventures'
  },

  // Additional diverse content for full gallery
  {
    id: 'misc-1',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=600&fit=crop&crop=center',
    title: 'Designer Sunglasses',
    tag: 'ACCESSORIES',
    views: 1928374,
    byline: 'Style Vision'
  },
  {
    id: 'misc-2',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=600&fit=crop&crop=center',
    title: 'Premium Headphones',
    tag: 'AUDIO',
    views: 2847392,
    byline: 'Sound Design'
  },
  {
    id: 'misc-3',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Safari Wildlife',
    tag: 'SAFARI',
    duration: '4:20',
    views: 4729384,
    byline: 'Wildlife Films'
  },
  {
    id: 'misc-4',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=800&h=600&fit=crop&crop=center',
    title: 'Mountain Peak',
    tag: 'NATURE',
    views: 3729384,
    byline: 'Peak Photography'
  },
  {
    id: 'misc-5',
    kind: 'image',
    posterUrl: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=800&h=600&fit=crop&crop=center',
    title: 'Arctic Wolves',
    tag: 'WILDLIFE',
    views: 3938475,
    byline: 'Arctic Focus'
  }
];

// Mock tutorials data for recent section
export const mockTutorials: Tile[] = [
  {
    id: 'tutorial-1',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Master Neural Logo Design',
    tag: 'AI TUTORIAL',
    duration: '12:30',
    views: 2847293,
    byline: 'Design Academy'
  },
  {
    id: 'tutorial-2',
    kind: 'video',
    posterUrl: 'https://images.unsplash.com/photo-1561736778-92e52a7769ef?w=800&h=600&fit=crop&crop=center',
    previewVideoUrl: 'https://player.vimeo.com/external/397335718.sd.mp4?s=c23e87ae6d8e0e3e6c24c0f39c7de2c8b9e78e9b',
    title: 'Wildlife Photography Secrets',
    tag: 'PHOTOGRAPHY',
    duration: '8:45',
    views: 3847391,
    byline: 'Lens Masters'
  }
];

// Helper to get mock data for different sections
export const getMockTiles = (section: 'trending' | 'recent' | 'wall', limit?: number): Tile[] => {
  let tiles: Tile[] = [];
  
  if (section === 'trending') {
    // Create unique tiles by filtering out duplicates based on posterUrl
    const uniqueTiles = mockTiles.filter((tile, index, self) => 
      index === self.findIndex(t => t.posterUrl === tile.posterUrl)
    );
    
    // Sort by views for trending
    tiles = uniqueTiles.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (section === 'recent') {
    return limit ? mockTutorials.slice(0, limit) : mockTutorials;
  } else {
    tiles = [...mockTiles];
  }
  
  return limit ? tiles.slice(0, limit) : tiles;
};