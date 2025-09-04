import { Tile } from './types';

// Import existing assets for mock data
import heroAvatar1 from "@/assets/hero-avatar-1.jpg";
import heroAvatar2 from "@/assets/hero-avatar-2.jpg";
import heroAvatar3 from "@/assets/hero-avatar-3.jpg";
import heroModel1 from "@/assets/hero-model-1.jpg";
import heroModel2 from "@/assets/hero-model-2.jpg";
import heroModel3 from "@/assets/hero-model-3.jpg";
import model1 from "@/assets/model-aria.jpg";
import model2 from "@/assets/model-bella.jpg";
import model3 from "@/assets/model-diana.jpg";
import model4 from "@/assets/model-haley.jpg";
import model5 from "@/assets/model-iris.jpg";
import model6 from "@/assets/model-jade.jpg";
import model7 from "@/assets/model-jenna.jpg";
import model8 from "@/assets/model-lena.jpg";
import model9 from "@/assets/model-luna.jpg";
import model10 from "@/assets/model-maya.jpg";
import model11 from "@/assets/model-nova.jpg";
import model12 from "@/assets/model-raven.jpg";
import model13 from "@/assets/model-sage.jpg";
import model14 from "@/assets/model-sofia.jpg";
import model15 from "@/assets/model-valentina.jpg";
import model16 from "@/assets/model-zara.jpg";
import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";

export const mockTiles: Tile[] = [
  {
    id: '1',
    kind: 'video',
    posterUrl: heroAvatar1,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Corporate Executive',
    tag: 'Professional',
    duration: '0:29',
    views: 12500,
    byline: 'Alex Chen'
  },
  {
    id: '2',
    kind: 'image',
    posterUrl: model1,
    title: 'Creative Portrait',
    tag: 'Artistic',
    views: 23100,
    byline: 'Maya Studios'
  },
  {
    id: '3',
    kind: 'video',
    posterUrl: heroAvatar2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Fashion Campaign',
    tag: 'Fashion',
    duration: '0:44',
    views: 15200,
    byline: 'Style Labs'
  },
  {
    id: '4',
    kind: 'image',
    posterUrl: heroModel1,
    title: 'Business Leader',
    tag: 'Corporate',
    views: 9800,
    byline: 'Pro Studios'
  },
  {
    id: '5',
    kind: 'video',
    posterUrl: model2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Brand Ambassador',
    tag: 'Marketing',
    duration: '0:16',
    views: 18900,
    byline: 'Brand Co'
  },
  {
    id: '6',
    kind: 'image',
    posterUrl: model3,
    title: 'Lifestyle Model',
    tag: 'Lifestyle',
    views: 11200,
    byline: 'Life Media'
  },
  {
    id: '7',
    kind: 'video',
    posterUrl: model4,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Confession Time',
    tag: 'Drama',
    duration: '0:39',
    views: 23100,
    byline: 'Drama Lab'
  },
  {
    id: '8',
    kind: 'image',
    posterUrl: model5,
    title: 'Portrait Study',
    tag: 'Art',
    views: 8600,
    byline: 'Art House'
  },
  {
    id: '9',
    kind: 'video',
    posterUrl: model6,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Love Story',
    tag: 'Romance',
    duration: '0:29',
    views: 18900,
    byline: 'Romance Films'
  },
  {
    id: '10',
    kind: 'image',
    posterUrl: model7,
    title: 'Adventure Spirit',
    tag: 'Adventure',
    views: 7300,
    byline: 'Wild Studios'
  },
  {
    id: '11',
    kind: 'video',
    posterUrl: model8,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Tech Presentation',
    tag: 'Technology',
    duration: '1:05',
    views: 14700,
    byline: 'Tech Vision'
  },
  {
    id: '12',
    kind: 'image',
    posterUrl: model9,
    title: 'Elegant Portrait',
    tag: 'Elegance',
    views: 9100,
    byline: 'Elite Media'
  },
  {
    id: '13',
    kind: 'video',
    posterUrl: model10,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Fashion Forward',
    tag: 'Fashion',
    duration: '0:22',
    views: 16800,
    byline: 'Vogue AI'
  },
  {
    id: '14',
    kind: 'image',
    posterUrl: model11,
    title: 'Cosmic Beauty',
    tag: 'Fantasy',
    views: 12400,
    byline: 'Cosmic Studios'
  },
  {
    id: '15',
    kind: 'video',
    posterUrl: model12,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Dark Elegance',
    tag: 'Gothic',
    duration: '0:55',
    views: 13600,
    byline: 'Dark Arts'
  },
  {
    id: '16',
    kind: 'image',
    posterUrl: model13,
    title: 'Natural Beauty',
    tag: 'Natural',
    views: 10300,
    byline: 'Pure Media'
  },
  {
    id: '17',
    kind: 'video',
    posterUrl: model14,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Luxury Brand',
    tag: 'Luxury',
    duration: '0:33',
    views: 19200,
    byline: 'Lux Studios'
  },
  {
    id: '18',
    kind: 'image',
    posterUrl: model15,
    title: 'Vintage Glamour',
    tag: 'Vintage',
    views: 8900,
    byline: 'Retro Vision'
  },
  {
    id: '19',
    kind: 'video',
    posterUrl: model16,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Modern Icon',
    tag: 'Modern',
    duration: '0:41',
    views: 17500,
    byline: 'Icon Labs'
  },
  {
    id: '20',
    kind: 'image',
    posterUrl: avatar1,
    title: 'Casual Chic',
    tag: 'Casual',
    views: 6700,
    byline: 'Everyday AI'
  },
  {
    id: '21',
    kind: 'video',
    posterUrl: avatar2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Sports Energy',
    tag: 'Sports',
    duration: '0:27',
    views: 14100,
    byline: 'Athletic Studios'
  },
  {
    id: '22',
    kind: 'image',
    posterUrl: avatar3,
    title: 'Artistic Vision',
    tag: 'Artistic',
    views: 11800,
    byline: 'Vision AI'
  },
  {
    id: '23',
    kind: 'video',
    posterUrl: avatar4,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Evening Elegance',
    tag: 'Evening',
    duration: '0:48',
    views: 15900,
    byline: 'Night Studios'
  },
  {
    id: '24',
    kind: 'image',
    posterUrl: heroModel2,
    title: 'Summer Vibes',
    tag: 'Summer',
    views: 9500,
    byline: 'Sunny AI'
  },
  {
    id: '25',
    kind: 'video',
    posterUrl: heroModel3,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Winter Fashion',
    tag: 'Winter',
    duration: '0:35',
    views: 12700,
    byline: 'Season Studios'
  }
];

export const mockTutorials: Tile[] = [
  {
    id: 'tutorial-1',
    kind: 'video',
    posterUrl: heroModel1,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Video Tutorial',
    tag: 'Tutorial',
    duration: '5:23',
    views: 45600,
    byline: 'Explore AI video magic'
  },
  {
    id: 'tutorial-2',
    kind: 'video',
    posterUrl: heroModel2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Avatar Tutorial',
    tag: 'Tutorial',
    duration: '3:47',
    views: 32100,
    byline: 'Master AI avatar creation'
  }
];

// Helper to get mock data for different sections
export const getMockTiles = (section: 'trending' | 'recent' | 'wall', limit?: number): Tile[] => {
  let tiles = [...mockTiles];
  
  if (section === 'trending') {
    // Sort by views for trending
    tiles = tiles.sort((a, b) => (b.views || 0) - (a.views || 0));
  } else if (section === 'recent') {
    // Return tutorials for recent section
    return mockTutorials;
  }
  
  return limit ? tiles.slice(0, limit) : tiles;
};