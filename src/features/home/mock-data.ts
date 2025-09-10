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
    kind: 'video',
    posterUrl: brandLogo,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Brand Logo Suite',
    tag: 'Branding',
    duration: '0:29',
    views: 25400,
    byline: 'Creative Studios'
  },
  {
    id: '2',
    kind: 'image',
    posterUrl: diverseAvatar2,
    title: 'Healthcare Professional',
    tag: 'Medical',
    views: 23100,
    byline: 'Dr. Miguel Rodriguez'
  },
  {
    id: '3',
    kind: 'video',
    posterUrl: brandMarketing,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Marketing Campaign',
    tag: 'Marketing',
    duration: '0:44',
    views: 19800,
    byline: 'Brand Agency'
  },
  {
    id: '4',
    kind: 'image',
    posterUrl: diverseAvatar4,
    title: 'Abstract Art Collection',
    tag: 'Art',
    views: 15600,
    byline: 'Digital Artists'
  },
  {
    id: '5',
    kind: 'video',
    posterUrl: diverseAvatar5,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Creative Director',
    tag: 'Design',
    duration: '0:16',
    views: 18900,
    byline: 'Maya Thompson'
  },
  {
    id: '6',
    kind: 'image',
    posterUrl: brandSocial,
    title: 'Social Media Kit',
    tag: 'Social',
    views: 21300,
    byline: 'Social Studios'
  },
  {
    id: '7',
    kind: 'video',
    posterUrl: diverseAvatar7,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Startup Founder',
    tag: 'Entrepreneurship',
    duration: '0:39',
    views: 23100,
    byline: 'Priya Patel'
  },
  {
    id: '8',
    kind: 'image',
    posterUrl: brandPresentation,
    title: 'Presentation Kit',
    tag: 'Business',
    views: 17800,
    byline: 'Pro Design'
  },
  {
    id: '9',
    kind: 'video',
    posterUrl: diverseAvatar9,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Business Consultant',
    tag: 'Consulting',
    duration: '0:29',
    views: 18900,
    byline: 'Grace Adomaa'
  },
  {
    id: '10',
    kind: 'image',
    posterUrl: diverseAvatar10,
    title: 'Sports Professional',
    tag: 'Athletics',
    views: 7300,
    byline: 'Carlos Mendez'
  },
  {
    id: '11',
    kind: 'video',
    posterUrl: brandSignature,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Signature Brand Kit',
    tag: 'Branding',
    duration: '1:05',
    views: 24700,
    byline: 'Signature Studios'
  },
  {
    id: '12',
    kind: 'image',
    posterUrl: diverseAvatar12,
    title: 'Architecture Vision',
    tag: 'Design',
    views: 9100,
    byline: 'Marcus Williams'
  },
  {
    id: '13',
    kind: 'video',
    posterUrl: model1,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Fashion Forward',
    tag: 'Fashion',
    duration: '0:22',
    views: 16800,
    byline: 'Style Studios'
  },
  {
    id: '14',
    kind: 'image',
    posterUrl: model2,
    title: 'Creative Expression',
    tag: 'Art',
    views: 12400,
    byline: 'Creative Labs'
  },
  {
    id: '15',
    kind: 'video',
    posterUrl: model3,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Professional Portrait',
    tag: 'Corporate',
    duration: '0:55',
    views: 13600,
    byline: 'Pro Media'
  },
  {
    id: '16',
    kind: 'image',
    posterUrl: model4,
    title: 'Lifestyle Brand',
    tag: 'Lifestyle',
    views: 10300,
    byline: 'Brand Vision'
  },
  {
    id: '17',
    kind: 'video',
    posterUrl: model5,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Modern Portrait',
    tag: 'Contemporary',
    duration: '0:33',
    views: 19200,
    byline: 'Modern Studios'
  },
  {
    id: '18',
    kind: 'image',
    posterUrl: model6,
    title: 'Professional Headshot',
    tag: 'Corporate',
    views: 8900,
    byline: 'Executive Media'
  },
  {
    id: '19',
    kind: 'video',
    posterUrl: model7,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Business Leader',
    tag: 'Leadership',
    duration: '0:41',
    views: 17500,
    byline: 'Leadership Labs'
  },
  {
    id: '20',
    kind: 'image',
    posterUrl: model8,
    title: 'Professional Style',
    tag: 'Professional',
    views: 6700,
    byline: 'Style AI'
  },
  {
    id: '21',
    kind: 'video',
    posterUrl: heroModel1,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-2.jpg',
    title: 'Corporate Vision',
    tag: 'Business',
    duration: '0:27',
    views: 14100,
    byline: 'Vision Studios'
  },
  {
    id: '22',
    kind: 'image',
    posterUrl: heroModel2,
    title: 'Executive Portrait',
    tag: 'Executive',
    views: 11800,
    byline: 'Executive AI'
  },
  {
    id: '23',
    kind: 'video',
    posterUrl: heroModel3,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-3.jpg',
    title: 'Professional Brand',
    tag: 'Branding',
    duration: '0:48',
    views: 15900,
    byline: 'Brand Studios'
  },
  {
    id: '24',
    kind: 'image',
    posterUrl: diverseAvatar1,
    title: 'Leadership Excellence',
    tag: 'Leadership',
    views: 9500,
    byline: 'Excellence Media'
  },
  {
    id: '25',
    kind: 'video',
    posterUrl: diverseAvatar2,
    previewVideoUrl: '/lovable-uploads/virtura-video-thumb-1.jpg',
    title: 'Healthcare Innovation',
    tag: 'Medical',
    duration: '0:35',
    views: 12700,
    byline: 'Medical Innovation'
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