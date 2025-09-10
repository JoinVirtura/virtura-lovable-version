import { Tile } from './types';

// Import diverse, photorealistic avatar assets
import diverseAvatar1 from "@/assets/avatar-diverse-1.jpg";
import diverseAvatar2 from "@/assets/avatar-diverse-2.jpg";
import diverseAvatar3 from "@/assets/avatar-diverse-3.jpg";
import diverseAvatar4 from "@/assets/avatar-diverse-4.jpg";
import diverseAvatar5 from "@/assets/avatar-diverse-5.jpg";
import diverseAvatar6 from "@/assets/avatar-diverse-6.jpg";
import diverseAvatar7 from "@/assets/avatar-diverse-7.jpg";
import diverseAvatar8 from "@/assets/avatar-diverse-8.jpg";
import diverseAvatar9 from "@/assets/avatar-diverse-9.jpg";
import diverseAvatar10 from "@/assets/avatar-diverse-10.jpg";
import diverseAvatar11 from "@/assets/avatar-diverse-11.jpg";
import diverseAvatar12 from "@/assets/avatar-diverse-12.jpg";

// Import existing assets for additional variety
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

// Import brand and product assets
import brandLogo from "@/assets/brand-logo-suite.jpg";
import brandMarketing from "@/assets/brand-marketing-campaign.jpg";
import brandSocial from "@/assets/brand-social-media.jpg";
import brandPresentation from "@/assets/brand-presentation-kit.jpg";
import brandSignature from "@/assets/brand-signature-kit.jpg";

export const mockTiles: Tile[] = [
  {
    id: '1',
    kind: 'image',
    posterUrl: brandLogo,
    title: 'Brand Logo Suite',
    tag: 'Logos',
    views: 25400,
    byline: 'Creative Studios'
  },
  {
    id: '2',
    kind: 'video',
    posterUrl: diverseAvatar2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Luxury Brand Identity',
    tag: 'Logos',
    duration: '1:05',
    views: 24700,
    byline: 'Luxury Design'
  },
  {
    id: '3',
    kind: 'image',
    posterUrl: diverseAvatar1,
    title: 'Tech Executive Portrait',
    tag: 'Professional',
    views: 23100,
    byline: 'Dr. Miguel Rodriguez'
  },
  {
    id: '4',
    kind: 'video',
    posterUrl: diverseAvatar7,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Startup Founder Story',
    tag: 'Business',
    duration: '0:39',
    views: 23100,
    byline: 'Entrepreneur Hub'
  },
  {
    id: '5',
    kind: 'image',
    posterUrl: brandSocial,
    title: 'Social Media Kit',
    tag: 'Products',
    views: 21300,
    byline: 'Social Studios'
  },
  {
    id: '6',
    kind: 'image',
    posterUrl: model8,
    title: 'Abstract NFT Collection',
    tag: 'Abstract Art',
    views: 20700,
    byline: 'NFT Collective'
  },
  {
    id: '7',
    kind: 'video',
    posterUrl: brandMarketing,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Marketing Campaign Assets',
    tag: 'Marketing',
    duration: '0:44',
    views: 19800,
    byline: 'Brand Agency'
  },
  {
    id: '8',
    kind: 'video',
    posterUrl: diverseAvatar6,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Food Brand Campaign',
    tag: 'Food & Beverage',
    duration: '0:52',
    views: 19400,
    byline: 'Food Creatives'
  },
  {
    id: '9',
    kind: 'image',
    posterUrl: model5,
    title: 'Minimalist Logo Design',
    tag: 'Logos',
    views: 19200,
    byline: 'Minimal Studios'
  },
  {
    id: '10',
    kind: 'video',
    posterUrl: diverseAvatar5,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Wildlife Documentary',
    tag: 'Animals',
    duration: '0:16',
    views: 18900,
    byline: 'Nature Studios'
  },
  {
    id: '11',
    kind: 'image',
    posterUrl: heroModel2,
    title: 'Tech Product Launch',
    tag: 'Products',
    views: 18800,
    byline: 'Tech Visuals'
  },
  {
    id: '12',
    kind: 'image',
    posterUrl: brandPresentation,
    title: 'Product Showcase',
    tag: 'Products',
    views: 17800,
    byline: 'Product Design Co'
  },
  {
    id: '13',
    kind: 'video',
    posterUrl: model7,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Corporate Training Video',
    tag: 'Business',
    duration: '0:41',
    views: 17500,
    byline: 'Corp Learning'
  },
  {
    id: '14',
    kind: 'image',
    posterUrl: diverseAvatar8,
    title: 'Sci-Fi Character Design',
    tag: 'Characters',
    views: 17300,
    byline: 'Sci-Fi Studios'
  },
  {
    id: '15',
    kind: 'video',
    posterUrl: diverseAvatar2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Healthcare Innovation Ad',
    tag: 'Professional',
    duration: '0:35',
    views: 16700,
    byline: 'Health Media'
  },
  {
    id: '16',
    kind: 'image',
    posterUrl: model1,
    title: 'Fashion Brand Campaign',
    tag: 'Fashion',
    views: 16800,
    byline: 'Fashion Forward'
  },
  {
    id: '17',
    kind: 'image',
    posterUrl: diverseAvatar10,
    title: 'Sports Mascot Design',
    tag: 'Mascots',
    views: 16300,
    byline: 'Sports Branding'
  },
  {
    id: '18',
    kind: 'image',
    posterUrl: model6,
    title: 'Fantasy Character Art',
    tag: 'Characters',
    views: 15900,
    byline: 'Fantasy Forge'
  },
  {
    id: '19',
    kind: 'video',
    posterUrl: heroModel3,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Startup Logo Animation',
    tag: 'Logos',
    duration: '0:48',
    views: 15900,
    byline: 'Motion Graphics Co'
  },
  {
    id: '20',
    kind: 'image',
    posterUrl: diverseAvatar4,
    title: 'Abstract Art Collection',
    tag: 'Abstract Art',
    views: 15600,
    byline: 'Digital Artists'
  },
  {
    id: '21',
    kind: 'video',
    posterUrl: heroModel1,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Wildlife Conservation PSA',
    tag: 'Animals',
    duration: '0:27',
    views: 14100,
    byline: 'Conservation Media'
  },
  {
    id: '22',
    kind: 'image',
    posterUrl: diverseAvatar12,
    title: 'Architectural Visualization',
    tag: 'Architecture',
    views: 14100,
    byline: 'Arch Viz Studio'
  },
  {
    id: '23',
    kind: 'video',
    posterUrl: model3,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Automotive Showcase',
    tag: 'Products',
    duration: '0:55',
    views: 13600,
    byline: 'Auto Design Lab'
  },
  {
    id: '24',
    kind: 'image',
    posterUrl: diverseAvatar3,
    title: 'Geometric Art Series',
    tag: 'Abstract Art',
    views: 13200,
    byline: 'Geometric Arts'
  },
  {
    id: '25',
    kind: 'image',
    posterUrl: diverseAvatar1,
    title: 'Educational Mascot',
    tag: 'Mascots',
    views: 12500,
    byline: 'Edu Design'
  },
  {
    id: '26',
    kind: 'image',
    posterUrl: model2,
    title: 'Pet Portrait Studio',
    tag: 'Animals',
    views: 12400,
    byline: 'Pet Art Studio'
  },
  {
    id: '27',
    kind: 'video',
    posterUrl: brandSignature,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'E-commerce Product Demo',
    tag: 'Products',
    duration: '1:15',
    views: 11900,
    byline: 'Commerce Studios'
  },
  {
    id: '28',
    kind: 'image',
    posterUrl: model4,
    title: 'Restaurant Menu Design',
    tag: 'Food & Beverage',
    views: 10300,
    byline: 'Culinary Visuals'
  },
  {
    id: '29',
    kind: 'video',
    posterUrl: diverseAvatar9,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Gaming Character Design',
    tag: 'Characters',
    duration: '0:29',
    views: 18900,
    byline: 'Game Studios'
  },
  {
    id: '30',
    kind: 'image',
    posterUrl: diverseAvatar11,
    title: 'Marine Research Visualization',
    tag: 'Science',
    views: 14700,
    byline: 'Dr. Leilani Nakamura'
  }
];

export const mockTutorials: Tile[] = [
  {
    id: 'tutorial-1',
    kind: 'video',
    posterUrl: diverseAvatar3,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'AI Video Creation Tutorial',
    tag: 'Tutorial',
    duration: '5:23',
    views: 45600,
    byline: 'Learn professional video creation'
  },
  {
    id: 'tutorial-2',
    kind: 'video',
    posterUrl: diverseAvatar7,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Avatar Studio Mastery',
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