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

export const mockTiles: Tile[] = [
  {
    id: '1',
    kind: 'video',
    posterUrl: heroAvatar1,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg', // Would be actual video URL
    title: 'Corporate Executive',
    tag: 'Professional',
    duration: '0:29',
    views: 12500,
    byline: 'Alex Chen'
  },
  {
    id: '2',
    kind: 'image',
    posterUrl: heroAvatar2,
    title: 'Creative Portrait',
    tag: 'Artistic',
    views: 8700,
    byline: 'Maya Studios'
  },
  {
    id: '3',
    kind: 'video',
    posterUrl: heroAvatar3,
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
    posterUrl: heroModel2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Brand Ambassador',
    tag: 'Marketing',
    duration: '0:16',
    views: 6400,
    byline: 'Brand Co'
  },
  {
    id: '6',
    kind: 'image',
    posterUrl: heroModel3,
    title: 'Lifestyle Model',
    tag: 'Lifestyle',
    views: 11200,
    byline: 'Life Media'
  },
  {
    id: '7',
    kind: 'video',
    posterUrl: model1,
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
    posterUrl: model2,
    title: 'Portrait Study',
    tag: 'Art',
    views: 5600,
    byline: 'Art House'
  },
  {
    id: '9',
    kind: 'video',
    posterUrl: model3,
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
    posterUrl: model4,
    title: 'Adventure Spirit',
    tag: 'Adventure',
    views: 7300,
    byline: 'Wild Studios'
  },
  {
    id: '11',
    kind: 'video',
    posterUrl: model5,
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
    posterUrl: model6,
    title: 'Elegant Portrait',
    tag: 'Elegance',
    views: 9100,
    byline: 'Elite Media'
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