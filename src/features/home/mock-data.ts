import { Tile } from './types';

// Import high-quality AI-generated trending images
import trending90sAnime from '../../assets/trending-90s-anime.jpg';
import trendingMinimalistArch from '../../assets/trending-minimalist-arch.jpg';
import trendingFantasyCreature from '../../assets/trending-fantasy-creature.jpg';
import trendingCyberpunkCity from '../../assets/trending-cyberpunk-city.jpg';
import trendingWatercolorLandscape from '../../assets/trending-watercolor-landscape.jpg';
import trendingSteampunkMech from '../../assets/trending-steampunk-mech.jpg';
import trendingPopArtPortrait from '../../assets/trending-pop-art-portrait.jpg';
import trendingGothicCathedral from '../../assets/trending-gothic-cathedral.jpg';
import trendingSurrealDream from '../../assets/trending-surreal-dream.jpg';
import trendingFilmNoir from '../../assets/trending-film-noir.jpg';
import trendingFashionPortrait from '../../assets/trending-fashion-portrait.jpg';
import trendingWildlifeLeopard from '../../assets/trending-wildlife-leopard.jpg';
import trendingAbstractDigital from '../../assets/trending-abstract-digital.jpg';
import trendingSpaceStation from '../../assets/trending-space-station.jpg';
import trendingCulinaryArt from '../../assets/trending-culinary-art.jpg';
import trendingFantasyLandscape from '../../assets/trending-fantasy-landscape.jpg';

// Import legacy style images
import style90sAnime from '../../assets/style-90s-anime-new.jpg';
import styleMinimalist from '../../assets/style-minimalist-new.jpg';
import styleFantasyCreature from '../../assets/style-fantasy-creature-new.jpg';
import styleChildAnimal from '../../assets/style-child-animal-new.jpg';
import styleLongExposure from '../../assets/style-long-exposure-new.jpg';
import styleStreetFashion from '../../assets/style-street-fashion-new.jpg';
import styleMoskvichka from '../../assets/style-moskvichka-new.jpg';
import styleFantasyPortraits from '../../assets/style-fantasy-portraits-new.jpg';
import styleHokTech from '../../assets/style-hok-tech-new.jpg';
import stylePhotoset from '../../assets/style-photoset-new.jpg';
import styleFluffWorld from '../../assets/style-fluff-world-new.jpg';
import styleFantasyLandscape from '../../assets/style-fantasy-landscape-new.jpg';
import styleArtNouveau from '../../assets/style-art-nouveau-new.jpg';
import styleNighttimeDreams from '../../assets/style-nighttime-dreams-new.jpg';
import styleCyberpunk from '../../assets/style-cyberpunk-new.jpg';
import styleWatercolor from '../../assets/style-watercolor-new.jpg';
import styleFilmNoir from '../../assets/style-film-noir-new.jpg';
import styleSteampunk from '../../assets/style-steampunk-new.jpg';
import stylePopArt from '../../assets/style-pop-art-new.jpg';
import styleGothic from '../../assets/style-gothic-new.jpg';
import styleSurreal from '../../assets/style-surreal-new.jpg';
import styleDigitalGlitch from '../../assets/style-digital-glitch-new.jpg';
import styleOilPainting from '../../assets/style-oil-painting-new.jpg';

// Ultra-diverse trending showcase across all creative categories
export const mockTiles: Tile[] = [
  // HIGH-QUALITY AI-GENERATED TRENDING IMAGES
  {
    id: 'trending-90s-anime',
    kind: 'image',
    posterUrl: trending90sAnime,
    title: "90's Anime Portrait",
    tag: 'ANIME',
    views: 9847291,
    byline: 'Retro Animation Studio'
  },
  {
    id: 'trending-minimalist-arch',
    kind: 'image',
    posterUrl: trendingMinimalistArch,
    title: 'Minimalist Architecture',
    tag: 'ARCHITECTURE',
    views: 8629384,
    byline: 'Clean Design Co'
  },
  {
    id: 'trending-fantasy-creature',
    kind: 'image',
    posterUrl: trendingFantasyCreature,
    title: 'Epic Fantasy Dragon',
    tag: 'FANTASY',
    views: 10847391,
    byline: 'Mythical Studios'
  },
  {
    id: 'trending-cyberpunk-city',
    kind: 'image',
    posterUrl: trendingCyberpunkCity,
    title: 'Cyberpunk Cityscape',
    tag: 'CYBERPUNK',
    views: 11647291,
    byline: 'Neon Future Labs'
  },
  {
    id: 'trending-watercolor-landscape',
    kind: 'image',
    posterUrl: trendingWatercolorLandscape,
    title: 'Watercolor Dreams',
    tag: 'WATERCOLOR',
    views: 7947291,
    byline: 'Aqua Art Studio'
  },
  {
    id: 'trending-steampunk-mech',
    kind: 'image',
    posterUrl: trendingSteampunkMech,
    title: 'Steampunk Machinery',
    tag: 'STEAMPUNK',
    views: 8647291,
    byline: 'Brass Gear Studios'
  },
  {
    id: 'trending-pop-art-portrait',
    kind: 'image',
    posterUrl: trendingPopArtPortrait,
    title: 'Pop Art Icon',
    tag: 'POP ART',
    views: 9747291,
    byline: 'Pop Culture Arts'
  },
  {
    id: 'trending-gothic-cathedral',
    kind: 'image',
    posterUrl: trendingGothicCathedral,
    title: 'Gothic Cathedral Light',
    tag: 'GOTHIC',
    views: 8347291,
    byline: 'Dark Cathedral Co'
  },
  {
    id: 'trending-surreal-dream',
    kind: 'image',
    posterUrl: trendingSurrealDream,
    title: 'Surreal Dreamscape',
    tag: 'SURREAL',
    views: 10247291,
    byline: 'Dream Logic Studio'
  },
  {
    id: 'trending-film-noir',
    kind: 'image',
    posterUrl: trendingFilmNoir,
    title: 'Film Noir Mystery',
    tag: 'NOIR',
    views: 8147291,
    byline: 'Classic Cinema Co'
  },
  {
    id: 'trending-fashion-portrait',
    kind: 'image',
    posterUrl: trendingFashionPortrait,
    title: 'High Fashion Editorial',
    tag: 'FASHION',
    views: 9347391,
    byline: 'Vogue Studios'
  },
  {
    id: 'trending-wildlife-leopard',
    kind: 'image',
    posterUrl: trendingWildlifeLeopard,
    title: 'Majestic Snow Leopard',
    tag: 'WILDLIFE',
    views: 8728394,
    byline: 'Wild Photography'
  },
  {
    id: 'trending-abstract-digital',
    kind: 'image',
    posterUrl: trendingAbstractDigital,
    title: 'Abstract Digital Flow',
    tag: 'ABSTRACT',
    views: 7749281,
    byline: 'Digital Dreamscape'
  },
  {
    id: 'trending-space-station',
    kind: 'image',
    posterUrl: trendingSpaceStation,
    title: 'Orbital Space Station',
    tag: 'SCI-FI',
    views: 9847291,
    byline: 'Cosmic Renders'
  },
  {
    id: 'trending-culinary-art',
    kind: 'image',
    posterUrl: trendingCulinaryArt,
    title: 'Molecular Gastronomy',
    tag: 'CULINARY',
    views: 6928374,
    byline: 'Chef Artistry'
  },
  {
    id: 'trending-fantasy-landscape',
    kind: 'image',
    posterUrl: trendingFantasyLandscape,
    title: 'Floating Castle Isle',
    tag: 'LANDSCAPE',
    views: 11527391,
    byline: 'Epic Worlds Studio'
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
  },
  
  // Adding 50+ more reliable images for variety
  {
    id: 'reliable-1',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=1',
    title: 'Abstract Patterns',
    tag: 'ABSTRACT',
    views: 2847291,
    byline: 'Digital Arts'
  },
  {
    id: 'reliable-2',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=2',
    title: 'Urban Photography',
    tag: 'URBAN',
    views: 3847291,
    byline: 'City Lens'
  },
  {
    id: 'reliable-3',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=3',
    title: 'Nature Landscapes',
    tag: 'NATURE',
    views: 4847291,
    byline: 'Earth Vision'
  },
  {
    id: 'reliable-4',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=4',
    title: 'Tech Innovation',
    tag: 'TECHNOLOGY',
    views: 5847291,
    byline: 'Future Labs'
  },
  {
    id: 'reliable-5',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=5',
    title: 'Fashion Forward',
    tag: 'FASHION',
    views: 2947291,
    byline: 'Style Studio'
  },
  {
    id: 'reliable-6',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=6',
    title: 'Architectural Marvel',
    tag: 'ARCHITECTURE',
    views: 3947291,
    byline: 'Design Works'
  },
  {
    id: 'reliable-7',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=7',
    title: 'Food Artistry',
    tag: 'CULINARY',
    views: 2747291,
    byline: 'Chef Studios'
  },
  {
    id: 'reliable-8',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=8',
    title: 'Sports Action',
    tag: 'SPORTS',
    views: 4747291,
    byline: 'Action Sports'
  },
  {
    id: 'reliable-9',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=9',
    title: 'Music Vibes',
    tag: 'MUSIC',
    views: 3647291,
    byline: 'Sound Wave'
  },
  {
    id: 'reliable-10',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=10',
    title: 'Travel Adventure',
    tag: 'TRAVEL',
    views: 5647291,
    byline: 'Wanderlust'
  },
  // Continue with more reliable images...
  {
    id: 'reliable-11',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=11',
    title: 'Cosmic Wonder',
    tag: 'SPACE',
    views: 6847291,
    byline: 'Cosmic Renders'
  },
  {
    id: 'reliable-12',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=12',
    title: 'Digital Dreams',
    tag: 'DIGITAL ART',
    views: 4247291,
    byline: 'Pixel Perfect'
  },
  {
    id: 'reliable-13',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=13',
    title: 'Ocean Depths',
    tag: 'MARINE',
    views: 3547291,
    byline: 'Deep Blue'
  },
  {
    id: 'reliable-14',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=14',
    title: 'Mountain Peaks',
    tag: 'LANDSCAPE',
    views: 4347291,
    byline: 'Peak Photos'
  },
  {
    id: 'reliable-15',
    kind: 'image',
    posterUrl: 'https://picsum.photos/800/600?random=15',
    title: 'City Nights',
    tag: 'URBAN',
    views: 2847291,
    byline: 'Night Vision'
  },
  // More diverse content for full grid
  ...Array.from({ length: 30 }, (_, i) => ({
    id: `auto-${i + 16}`,
    kind: 'image' as const,
    posterUrl: `https://picsum.photos/800/600?random=${i + 16}`,
    title: `Creative Vision ${i + 1}`,
    tag: ['ABSTRACT', 'NATURE', 'TECH', 'ART', 'DESIGN', 'PHOTO'][i % 6],
    views: Math.floor(Math.random() * 5000000) + 1000000,
    byline: ['Studio Alpha', 'Creative Labs', 'Vision Works', 'Art House', 'Design Co'][i % 5]
  }))
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