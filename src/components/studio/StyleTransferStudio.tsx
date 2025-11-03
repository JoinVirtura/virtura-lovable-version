import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Sparkles, 
  Crown, 
  CheckCircle,
  Loader2,
  Heart,
  Film,
  Download,
  ChevronDown,
  Zap,
  TrendingUp,
  Eye
} from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';
import { applyStyleTransfer } from './StyleTransferEdge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';

// Import ALL style assets - 27+ styles
import style90sAnime from '@/assets/style-90s-anime.jpg';
import style90sAnimeNew from '@/assets/style-90s-anime-new.jpg';
import styleAbstractGeo from '@/assets/style-abstract-geo.jpg';
import styleArtNouveau from '@/assets/style-art-nouveau.jpg';
import styleArtNouveauNew from '@/assets/style-art-nouveau-new.jpg';
import styleBiomechanical from '@/assets/style-biomechanical.jpg';
import styleBotanical from '@/assets/style-botanical.jpg';
import styleChildAnimal from '@/assets/style-child-animal.jpg';
import styleChildAnimalNew from '@/assets/style-child-animal-new.jpg';
import styleCyberpunk from '@/assets/style-cyberpunk.jpg';
import styleCyberpunkNew from '@/assets/style-cyberpunk-new.jpg';
import styleDigitalGlitchNew from '@/assets/style-digital-glitch-new.jpg';
import styleFantasyCreature from '@/assets/style-fantasy-creature.jpg';
import styleFantasyCreatureNew from '@/assets/style-fantasy-creature-new.jpg';
import styleFantasyLandscape from '@/assets/style-fantasy-landscape.jpg';
import styleFantasyLandscapeNew from '@/assets/style-fantasy-landscape-new.jpg';
import styleFantasyPortraits from '@/assets/style-fantasy-portraits.jpg';
import styleFantasyPortraitsNew from '@/assets/style-fantasy-portraits-new.jpg';
import styleFilmNoir from '@/assets/style-film-noir.jpg';
import styleFilmNoirNew from '@/assets/style-film-noir-new.jpg';
import styleFluffWorld from '@/assets/style-fluff-world.jpg';
import styleFluffWorldNew from '@/assets/style-fluff-world-new.jpg';
import styleGlitch from '@/assets/style-glitch.jpg';
import styleGothic from '@/assets/style-gothic.jpg';
import styleGothicNew from '@/assets/style-gothic-new.jpg';
import styleHokTech from '@/assets/style-hok-tech.jpg';
import styleHokTechNew from '@/assets/style-hok-tech-new.jpg';
import styleImpressionist from '@/assets/style-impressionist.jpg';
import styleLongExposure from '@/assets/style-long-exposure.jpg';
import styleLongExposureNew from '@/assets/style-long-exposure-new.jpg';
import styleMinimalistArch from '@/assets/style-minimalist-arch.jpg';
import styleMinimalist from '@/assets/style-minimalist-new.jpg';
import styleMoskvichka from '@/assets/style-moskvichka.jpg';
import styleMoskvichkaNew from '@/assets/style-moskvichka-new.jpg';
import styleNighttimeDreams from '@/assets/style-nighttime-dreams.jpg';
import styleNighttimeDreamsNew from '@/assets/style-nighttime-dreams-new.jpg';
import styleOilPainting from '@/assets/style-oil-painting.jpg';
import styleOilPaintingNew from '@/assets/style-oil-painting-new.jpg';
import stylePhotoset from '@/assets/style-photoset.jpg';
import stylePhotosetNew from '@/assets/style-photoset-new.jpg';
import stylePixelArt from '@/assets/style-pixel-art.jpg';
import stylePopArt from '@/assets/style-pop-art.jpg';
import stylePopArtNew from '@/assets/style-pop-art-new.jpg';
import styleSteampunk from '@/assets/style-steampunk.jpg';
import styleSteampunkNew from '@/assets/style-steampunk-new.jpg';
import styleStreetFashion from '@/assets/style-street-fashion.jpg';
import styleStreetFashionNew from '@/assets/style-street-fashion-new.jpg';
import styleSurreal from '@/assets/style-surreal.jpg';
import styleSurrealNew from '@/assets/style-surreal-new.jpg';
import styleSynthwave from '@/assets/style-synthwave.jpg';
import styleWatercolor from '@/assets/style-watercolor.jpg';
import styleWatercolorNew from '@/assets/style-watercolor-new.jpg';

interface StyleTransferStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  isProcessing: boolean;
  currentStep?: string;
  onStepChange?: (stepId: string) => void;
}

const STYLE_PRESETS = [
  // No Style - Use Original Avatar
  { id: 'none', name: 'No Style (Original)', description: 'Use your avatar as-is without any style modifications', image: null, type: 'Free', strength: 0, category: 'original', badge: 'Default' },
  
  // Artistic Styles
  { id: 'oil-painting', name: 'Oil Painting', description: 'Classical oil painting style', image: styleOilPainting, type: 'Premium', strength: 85, category: 'artistic' },
  { id: 'oil-painting-new', name: 'Modern Oil', description: 'Contemporary oil painting', image: styleOilPaintingNew, type: 'Premium', strength: 82, category: 'artistic' },
  { id: 'watercolor', name: 'Watercolor', description: 'Soft watercolor painting effect', image: styleWatercolor, type: 'Standard', strength: 70, category: 'artistic' },
  { id: 'watercolor-new', name: 'Vibrant Watercolor', description: 'Enhanced watercolor technique', image: styleWatercolorNew, type: 'Premium', strength: 75, category: 'artistic' },
  { id: 'impressionist', name: 'Impressionist', description: 'Impressionist painting style', image: styleImpressionist, type: 'Premium', strength: 78, category: 'artistic' },
  { id: 'art-nouveau', name: 'Art Nouveau', description: 'Decorative Art Nouveau style', image: styleArtNouveau, type: 'Premium', strength: 80, category: 'artistic' },
  { id: 'art-nouveau-new', name: 'Modern Art Nouveau', description: 'Contemporary Art Nouveau', image: styleArtNouveauNew, type: 'Premium', strength: 83, category: 'artistic' },

  // Futuristic & Sci-Fi
  { id: 'cyberpunk', name: 'Cyberpunk', description: 'Futuristic neon cyberpunk style', image: styleCyberpunk, type: 'Premium', strength: 90, category: 'futuristic' },
  { id: 'cyberpunk-new', name: 'Cyberpunk 2077', description: 'Enhanced cyberpunk aesthetic', image: styleCyberpunkNew, type: 'Premium', strength: 92, category: 'futuristic' },
  { id: 'biomechanical', name: 'Biomechanical', description: 'H.R. Giger inspired organic-tech fusion', image: styleBiomechanical, type: 'Premium', strength: 88, category: 'futuristic' },
  { id: 'synthwave', name: 'Synthwave', description: 'Retro-futuristic 80s aesthetic', image: styleSynthwave, type: 'Premium', strength: 85, category: 'futuristic' },
  { id: 'hok-tech', name: 'Hok Tech', description: 'Advanced technological aesthetic', image: styleHokTech, type: 'Premium', strength: 87, category: 'futuristic' },
  { id: 'hok-tech-new', name: 'Neo Tech', description: 'Next-gen technology style', image: styleHokTechNew, type: 'Premium', strength: 89, category: 'futuristic' },
  { id: 'digital-glitch', name: 'Digital Glitch', description: 'Digital corruption and glitch effects', image: styleDigitalGlitchNew, type: 'Premium', strength: 86, category: 'futuristic' },

  // Animation & Cartoon
  { id: '90s-anime', name: '90s Anime', description: 'Classic Japanese animation style', image: style90sAnime, type: 'Premium', strength: 80, category: 'animation' },
  { id: '90s-anime-new', name: 'Modern Anime', description: 'Contemporary anime style', image: style90sAnimeNew, type: 'Premium', strength: 82, category: 'animation' },
  { id: 'child-animal', name: 'Child Animal', description: 'Cute animal character style', image: styleChildAnimal, type: 'Standard', strength: 75, category: 'animation' },
  { id: 'child-animal-new', name: 'Kawaii Animals', description: 'Enhanced cute animal style', image: styleChildAnimalNew, type: 'Premium', strength: 77, category: 'animation' },
  { id: 'pixel-art', name: 'Pixel Art', description: '8-bit retro gaming aesthetic', image: stylePixelArt, type: 'Standard', strength: 78, category: 'animation' },
  { id: 'fluff-world', name: 'Fluff World', description: 'Soft, fluffy cartoon world', image: styleFluffWorld, type: 'Standard', strength: 72, category: 'animation' },
  { id: 'fluff-world-new', name: 'Dreamy Fluff', description: 'Enhanced fluffy dreamscape', image: styleFluffWorldNew, type: 'Premium', strength: 74, category: 'animation' },

  // Modern & Contemporary
  { id: 'pop-art', name: 'Pop Art', description: 'Bold pop art style', image: stylePopArt, type: 'Standard', strength: 75, category: 'modern' },
  { id: 'pop-art-new', name: 'Neo Pop Art', description: 'Contemporary pop art', image: stylePopArtNew, type: 'Premium', strength: 78, category: 'modern' },
  { id: 'minimalist', name: 'Minimalist', description: 'Clean, minimal design', image: styleMinimalist, type: 'Standard', strength: 60, category: 'modern' },
  { id: 'minimalist-arch', name: 'Architectural', description: 'Architectural minimalism', image: styleMinimalistArch, type: 'Premium', strength: 65, category: 'modern' },
  { id: 'street-fashion', name: 'Street Fashion', description: 'Urban street style photography', image: styleStreetFashion, type: 'Premium', strength: 80, category: 'modern' },
  { id: 'street-fashion-new', name: 'Urban Chic', description: 'Enhanced street fashion', image: styleStreetFashionNew, type: 'Premium', strength: 83, category: 'modern' },
  { id: 'abstract-geo', name: 'Abstract Geometric', description: 'Geometric abstract patterns', image: styleAbstractGeo, type: 'Premium', strength: 76, category: 'modern' },
  { id: 'glitch', name: 'Glitch Art', description: 'Digital glitch aesthetic', image: styleGlitch, type: 'Premium', strength: 84, category: 'modern' },

  // Vintage & Classic
  { id: 'film-noir', name: 'Film Noir', description: 'Classic black and white cinema', image: styleFilmNoir, type: 'Premium', strength: 85, category: 'vintage' },
  { id: 'film-noir-new', name: 'Neo Noir', description: 'Modern film noir style', image: styleFilmNoirNew, type: 'Premium', strength: 87, category: 'vintage' },
  { id: 'steampunk', name: 'Steampunk', description: 'Victorian-era industrial aesthetic', image: styleSteampunk, type: 'Standard', strength: 80, category: 'vintage' },
  { id: 'steampunk-new', name: 'Neo Steampunk', description: 'Enhanced steampunk design', image: styleSteampunkNew, type: 'Premium', strength: 83, category: 'vintage' },
  { id: 'gothic', name: 'Gothic', description: 'Dark gothic aesthetic', image: styleGothic, type: 'Premium', strength: 82, category: 'vintage' },
  { id: 'gothic-new', name: 'Modern Gothic', description: 'Contemporary gothic style', image: styleGothicNew, type: 'Premium', strength: 84, category: 'vintage' },
  { id: 'long-exposure', name: 'Long Exposure', description: 'Long exposure photography effect', image: styleLongExposure, type: 'Premium', strength: 78, category: 'vintage' },
  { id: 'long-exposure-new', name: 'Light Trails', description: 'Enhanced light trail effects', image: styleLongExposureNew, type: 'Premium', strength: 81, category: 'vintage' },

  // Fantasy & Surreal
  { id: 'fantasy-creature', name: 'Fantasy Creature', description: 'Mythical creature design', image: styleFantasyCreature, type: 'Premium', strength: 85, category: 'fantasy' },
  { id: 'fantasy-creature-new', name: 'Epic Fantasy', description: 'Enhanced fantasy creatures', image: styleFantasyCreatureNew, type: 'Premium', strength: 88, category: 'fantasy' },
  { id: 'fantasy-landscape', name: 'Fantasy Landscape', description: 'Magical landscape scenes', image: styleFantasyLandscape, type: 'Premium', strength: 83, category: 'fantasy' },
  { id: 'fantasy-landscape-new', name: 'Mystical Realm', description: 'Enhanced fantasy worlds', image: styleFantasyLandscapeNew, type: 'Premium', strength: 86, category: 'fantasy' },
  { id: 'fantasy-portraits', name: 'Fantasy Portrait', description: 'Magical portrait style', image: styleFantasyPortraits, type: 'Premium', strength: 81, category: 'fantasy' },
  { id: 'fantasy-portraits-new', name: 'Heroic Portrait', description: 'Enhanced fantasy portraits', image: styleFantasyPortraitsNew, type: 'Premium', strength: 84, category: 'fantasy' },
  { id: 'surreal', name: 'Surreal', description: 'Surrealistic art style', image: styleSurreal, type: 'Premium', strength: 87, category: 'fantasy' },
  { id: 'surreal-new', name: 'Dreamscape', description: 'Enhanced surreal imagery', image: styleSurrealNew, type: 'Premium', strength: 89, category: 'fantasy' },
  { id: 'nighttime-dreams', name: 'Nighttime Dreams', description: 'Dreamy nighttime scenes', image: styleNighttimeDreams, type: 'Premium', strength: 79, category: 'fantasy' },
  { id: 'nighttime-dreams-new', name: 'Lucid Dreams', description: 'Enhanced dream imagery', image: styleNighttimeDreamsNew, type: 'Premium', strength: 82, category: 'fantasy' },

  // Nature & Organic
  { id: 'botanical', name: 'Botanical', description: 'Natural botanical illustration', image: styleBotanical, type: 'Standard', strength: 73, category: 'nature' },
  { id: 'moskvichka', name: 'Moskvichka', description: 'Russian folk art style', image: styleMoskvichka, type: 'Premium', strength: 77, category: 'nature' },
  { id: 'moskvichka-new', name: 'Neo Folk', description: 'Contemporary folk art', image: styleMoskvichkaNew, type: 'Premium', strength: 79, category: 'nature' },

  // Photography Styles
  { id: 'photoset', name: 'Photoset', description: 'Professional photo series style', image: stylePhotoset, type: 'Standard', strength: 70, category: 'photography' },
  { id: 'photoset-new', name: 'Studio Photoset', description: 'Enhanced photo series', image: stylePhotosetNew, type: 'Premium', strength: 73, category: 'photography' }
];

// Style badges for visual indicators
const getStyleBadge = (style: typeof STYLE_PRESETS[0]) => {
  // Popular styles
  if (['cyberpunk-new', 'oil-painting', 'fantasy-portraits-new', 'pop-art-new'].includes(style.id)) {
    return { label: 'Popular', icon: Zap, color: 'from-amber-500 to-orange-500' };
  }
  // Trending styles
  if (['surreal-new', '90s-anime-new', 'street-fashion-new', 'gothic-new'].includes(style.id)) {
    return { label: 'Trending', icon: TrendingUp, color: 'from-pink-500 to-rose-500' };
  }
  // New styles
  if (style.id.endsWith('-new') && !['cyberpunk-new', 'fantasy-portraits-new', 'pop-art-new', 'surreal-new', '90s-anime-new', 'street-fashion-new', 'gothic-new'].includes(style.id)) {
    return { label: 'New', icon: Sparkles, color: 'from-emerald-500 to-teal-500' };
  }
  return null;
};

interface StyleTransferStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  isProcessing: boolean;
  currentStep?: string;
  onStepChange?: (step: string) => void;
}

export const StyleTransferStudio: React.FC<StyleTransferStudioProps> = ({ 
  project, 
  onUpdate, 
  isProcessing,
  currentStep = 'style',
  onStepChange
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [styleStrength, setStyleStrength] = useState(75);
  const [preserveOriginal, setPreserveOriginal] = useState(25);
  const [enhanceDetails, setEnhanceDetails] = useState(80);
  const [isApplying, setIsApplying] = useState(false);
  const [avatarTitle, setAvatarTitle] = useState('');
  const [savedToLibrary, setSavedToLibrary] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'free' | 'premium'>('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBadge, setSelectedBadge] = useState<'all' | 'popular' | 'trending' | 'new'>('all');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [progressPhase, setProgressPhase] = useState('');

  const steps = [
    { id: 'avatar', label: 'Avatar', completed: !!project.avatar?.processedUrl },
    { id: 'style', label: 'Style', completed: !!project.style?.resultUrl },
    { id: 'export', label: 'Export', completed: false }
  ];


  // Filter styles based on search, type, category, and badge
  const filteredStyles = STYLE_PRESETS.filter(style => {
    // Search filter
    const matchesSearch = style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Type filter (Free/Premium)
    const matchesType = selectedType === 'all' || 
      (selectedType === 'free' && (style.type === 'Free' || style.type === 'Standard')) ||
      (selectedType === 'premium' && style.type === 'Premium');
    
    // Category filter
    const matchesCategory = selectedCategory === 'all' || style.category === selectedCategory;
    
    // Badge filter (Popular/Trending/New)
    const styleBadge = getStyleBadge(style);
    const matchesBadge = selectedBadge === 'all' || 
      (selectedBadge === 'popular' && styleBadge?.label === 'Popular') ||
      (selectedBadge === 'trending' && styleBadge?.label === 'Trending') ||
      (selectedBadge === 'new' && styleBadge?.label === 'New');
    
    return matchesSearch && matchesType && matchesCategory && matchesBadge;
  });

  // Helper function to upload blob URL to Supabase Storage
  const ensurePublicUrl = async (imageUrl: string): Promise<string> => {
    console.log('🔄 [StyleTransfer] Ensuring image is publicly accessible...', imageUrl);
    
    try {
      // Fetch the image data (works for both blob: and https: URLs)
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Generate unique filename
      const filename = `style-transfer-${Date.now()}.png`;
      
      console.log('📤 [StyleTransfer] Uploading to storage as:', filename);
      
      // Upload to Supabase Storage with public access
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filename, blob, {
          contentType: 'image/png',
          upsert: false
        });
      
      if (error) {
        console.error('❌ [StyleTransfer] Upload error:', error);
        throw error;
      }
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filename);
      
      console.log('✅ [StyleTransfer] Public URL created:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('❌ [StyleTransfer] Failed to ensure public URL:', error);
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: "Failed to prepare image for style transfer. Please try again.",
      });
      throw new Error('Failed to prepare image for style transfer');
    }
  };

  const handleApplyStyle = async () => {
    let avatarUrl = project.avatar?.processedUrl || project.avatar?.originalUrl;
    if (!selectedStyle || !avatarUrl) return;

    const stylePreset = STYLE_PRESETS.find(s => s.id === selectedStyle);
    if (!stylePreset) return;

    // SPECIAL HANDLING: "No Style" option - skip API call and use original avatar
    if (selectedStyle === 'none') {
      onUpdate({
        style: {
          preset: 'none',
          strength: 0,
          preserveOriginal: 100,
          enhanceDetails: 0,
          resultUrl: avatarUrl,
          lookMode: 'realistic',
          background: 'studio',
          lighting: { key: 80, fill: 60, rim: 40, ambient: 20 },
          camera: { angle: 0, distance: 100, focus: 50 },
          effects: {},
          status: 'completed',
          metadata: {
            styleName: 'No Style (Original)',
            styleType: 'Free',
            category: 'original',
            processingTime: 'Instant'
          }
        }
      });

      toast({
        title: "Original Avatar Selected",
        description: "Using your avatar without any style modifications",
      });
      return;
    }

    setIsApplying(true);
    setProgressPercentage(0);
    setProgressPhase("Analyzing image...");

    // Simulate smooth progress
    const progressInterval = setInterval(() => {
      setProgressPercentage(prev => {
        if (prev < 20) {
          setProgressPhase("Analyzing image...");
          return prev + 2;
        } else if (prev < 50) {
          setProgressPhase("Applying style...");
          return prev + 1.5;
        } else if (prev < 90) {
          setProgressPhase("Enhancing details...");
          return prev + 1;
        } else if (prev < 95) {
          setProgressPhase("Finalizing...");
          return prev + 0.5;
        }
        return prev;
      });
    }, 100);

    // Update project with style transfer processing status
    onUpdate({
      style: {
        preset: selectedStyle,
        strength: styleStrength,
        preserveOriginal,
        enhanceDetails,
        lookMode: 'realistic',
        background: 'studio',
        lighting: { key: 80, fill: 60, rim: 40, ambient: 20 },
        camera: { angle: 0, distance: 100, focus: 50 },
        effects: {},
        status: 'processing',
        metadata: {
          styleName: stylePreset.name,
          styleType: stylePreset.type,
          category: stylePreset.category,
          processingTime: 'Processing...'
        }
      }
    });

    try {
      // If blob URL or Supabase Storage URL, ensure it's publicly accessible to Replicate
      if (avatarUrl.startsWith('blob:') || avatarUrl.includes('.supabase.co/storage')) {
        console.log('🔄 [StyleTransfer] Re-uploading image for external API access...');
        avatarUrl = await ensurePublicUrl(avatarUrl);
      }

      // Apply real style transfer with public URL
      const result = await applyStyleTransfer({
        imageUrl: avatarUrl,
        stylePreset: selectedStyle,
        strength: styleStrength,
        preserveOriginal,
        enhanceDetails
      });

      // Complete progress
      clearInterval(progressInterval);
      setProgressPercentage(100);
      setProgressPhase("Complete!");

      await new Promise(resolve => setTimeout(resolve, 500));

      if (result.success && result.imageUrl) {
        onUpdate({
          style: {
            preset: selectedStyle,
            strength: styleStrength,
            preserveOriginal,
            enhanceDetails,
            resultUrl: result.imageUrl,
            lookMode: 'realistic',
            background: 'studio',
            lighting: { key: 80, fill: 60, rim: 40, ambient: 20 },
            camera: { angle: 0, distance: 100, focus: 50 },
            effects: {},
            status: 'completed',
            metadata: {
              styleName: stylePreset.name,
              styleType: stylePreset.type,
              category: stylePreset.category,
              processingTime: result.metadata?.processingTime || '3.2s'
            }
          }
        });

        toast({
          title: "Style Applied",
          description: `${stylePreset.name} style applied successfully`,
        });
      } else {
        throw new Error(result.error || 'Style transfer failed');
      }
    } catch (error: any) {
      clearInterval(progressInterval);
      setProgressPercentage(0);
      setProgressPhase("");
      
      onUpdate({
        style: {
          preset: selectedStyle,
          strength: styleStrength,
          preserveOriginal,
          enhanceDetails,
          lookMode: 'realistic',
          background: 'studio',
          lighting: { key: 80, fill: 60, rim: 40, ambient: 20 },
          camera: { angle: 0, distance: 100, focus: 50 },
          effects: {},
          status: 'error',
          metadata: {
            styleName: stylePreset.name,
            styleType: stylePreset.type,
            category: stylePreset.category,
            processingTime: 'Failed'
          }
        }
      });

      toast({
        title: "Style Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
      setTimeout(() => {
        setProgressPercentage(0);
        setProgressPhase("");
      }, 1000);
    }
  };

  const canApplyStyle = project.avatar?.status === 'completed' && selectedStyle;

  const handleSaveToLibrary = async () => {
    const styledImageUrl = project.style?.resultUrl || project.avatar?.processedUrl || project.avatar?.originalUrl;
    if (!styledImageUrl) {
      toast({
        title: "No Image to Save",
        description: "Please apply a style transfer first or generate an avatar.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save avatars to your library",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('avatar_library')
        .insert({
          user_id: user.id,
          image_url: styledImageUrl,
          prompt: avatarTitle || `Styled Avatar - ${project.style?.metadata?.styleName || 'Custom'}`,
          title: avatarTitle || `Styled Avatar - ${project.style?.metadata?.styleName || 'Custom'}`,
          tags: [
            'style-transfer',
            project.style?.preset || 'custom',
            project.style?.metadata?.category || 'general'
          ]
        });

      if (error) throw error;

      setSavedToLibrary(true);
      
      // Show rich toast notification with action buttons
      sonnerToast.success('Avatar Saved Successfully!', {
        description: 'Your styled avatar is now in your library',
        duration: 5000,
        action: {
          label: 'View Library',
          onClick: () => navigate('/dashboard/library')
        }
      });
    } catch (error: any) {
      console.error('Error saving to library:', error);
      toast({
        title: "Save Failed",
        description: error.message || 'Failed to save avatar to library',
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseInVideo = () => {
    const styledImageUrl = project.style?.resultUrl || project.avatar?.processedUrl || project.avatar?.originalUrl;
    if (!styledImageUrl) return;

    // Store avatar data in sessionStorage
    sessionStorage.setItem('selectedAvatar', JSON.stringify({
      avatarUrl: styledImageUrl,
      metadata: {
        source: 'style-transfer-studio',
        styleName: project.style?.metadata?.styleName,
        stylePreset: project.style?.preset,
        category: project.style?.metadata?.category
      }
    }));

    // Navigate to Video Pro page
    navigate('/dashboard/video-pro');
    sonnerToast.success('Opening Video Pro with your styled avatar...');
  };

  const handleDownload = () => {
    const styledImageUrl = project.style?.resultUrl || project.avatar?.processedUrl || project.avatar?.originalUrl;
    if (!styledImageUrl) return;

    const link = document.createElement('a');
    link.href = styledImageUrl;
    link.download = `styled-avatar-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    sonnerToast.success('Download started!');
  };

  return (
    <div className="pb-32 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Style Transfer Studio
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Transform your avatar with 50+ AI-powered artistic styles
            </p>
          </div>
        </div>
      </div>

      {/* Prerequisites Check */}
      {!project.avatar && (
        <Card className="border-violet-500/30 bg-violet-950/20 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-violet-400" />
              </div>
              <div>
                <p className="font-semibold text-violet-200">
                  Avatar Required
                </p>
                <p className="text-sm text-violet-300/80">
                  Upload or generate an avatar first to apply style transfer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Bar with Apply Button */}
      <div className="flex items-center gap-3 max-w-2xl">
        <Input
          type="search"
          placeholder="Search styles... (e.g., cyberpunk, watercolor)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 bg-black/40 border-violet-500/30 focus:border-violet-400 transition-colors"
        />

        <Button
          onClick={handleApplyStyle}
          disabled={!canApplyStyle || isProcessing || isApplying}
          size="sm"
          className={`px-6 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap min-w-[140px] ${
            (isProcessing || isApplying || project.style?.status === 'processing')
              ? 'bg-gradient-to-r from-primary via-purple-500 to-pink-500'
              : ''
          }`}
        >
          {isProcessing || isApplying || project.style?.status === 'processing' ? (
            <div className="flex items-center justify-center gap-2">
              <div className="relative flex items-center">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
              <div className="flex flex-col items-start leading-tight">
                <span className="text-xs font-medium">{progressPhase}</span>
                <span className="text-[10px] text-white/70">{Math.round(progressPercentage)}%</span>
              </div>
            </div>
          ) : (
            'Apply'
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      <div className="mb-6 space-y-3">
        {/* Filter Chips Row */}
        <div className="flex flex-wrap gap-2">
          {/* Type Filters */}
          <Button
            size="sm"
            variant={selectedType === 'all' ? 'default' : 'outline'}
            onClick={() => setSelectedType('all')}
            className="h-8"
          >
            All
          </Button>
          <Button
            size="sm"
            variant={selectedBadge === 'popular' ? 'default' : 'outline'}
            onClick={() => setSelectedBadge(selectedBadge === 'popular' ? 'all' : 'popular')}
            className="h-8"
          >
            Popular
          </Button>
          <Button
            size="sm"
            variant={selectedBadge === 'trending' ? 'default' : 'outline'}
            onClick={() => setSelectedBadge(selectedBadge === 'trending' ? 'all' : 'trending')}
            className="h-8"
          >
            Trending
          </Button>
          <Button
            size="sm"
            variant={selectedBadge === 'new' ? 'default' : 'outline'}
            onClick={() => setSelectedBadge(selectedBadge === 'new' ? 'all' : 'new')}
            className="h-8"
          >
            New
          </Button>
          <Button
            size="sm"
            variant={selectedType === 'free' ? 'default' : 'outline'}
            onClick={() => setSelectedType(selectedType === 'free' ? 'all' : 'free')}
            className="h-8"
          >
            Free
          </Button>
          <Button
            size="sm"
            variant={selectedType === 'premium' ? 'default' : 'outline'}
            onClick={() => setSelectedType(selectedType === 'premium' ? 'all' : 'premium')}
            className="h-8"
          >
            Premium
          </Button>

          {/* Category Dropdown - Using DropdownMenu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-8"
              >
                {selectedCategory === 'all' ? 'All Categories' : 
                 selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                <ChevronDown className="ml-1 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-violet-950/95 border-violet-500/30 backdrop-blur-xl z-50">
              <DropdownMenuItem onClick={() => setSelectedCategory('all')} className="cursor-pointer">
                All Categories
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('original')} className="cursor-pointer">
                Original
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('artistic')} className="cursor-pointer">
                Artistic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('futuristic')} className="cursor-pointer">
                Futuristic
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('animation')} className="cursor-pointer">
                Animation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('modern')} className="cursor-pointer">
                Modern
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('vintage')} className="cursor-pointer">
                Vintage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('fantasy')} className="cursor-pointer">
                Fantasy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('nature')} className="cursor-pointer">
                Nature
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('photography')} className="cursor-pointer">
                Photography
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Large Style Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStyles.map((style, index) => {
          const styleBadge = getStyleBadge(style);
          const isSelected = selectedStyle === style.id;
          
          return (
            <div
              key={style.id}
              className={`group relative overflow-hidden rounded-2xl bg-black/40 border-2 transition-all duration-300 cursor-pointer animate-fade-in ${
                isSelected
                  ? 'border-violet-400 shadow-[0_0_40px_rgba(139,92,246,0.5)] scale-[1.02]'
                  : 'border-violet-500/20 hover:border-violet-400 hover:shadow-[0_0_25px_rgba(139,92,246,0.3)] hover:scale-[1.01]'
              }`}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => setSelectedStyle(style.id)}
            >
              {/* Large Image */}
              <div className="relative h-80 overflow-hidden">
                {style.image ? (
                  <img
                    src={style.image}
                    alt={style.name}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-violet-950/50 to-purple-950/50 flex items-center justify-center">
                    {project.avatar?.processedUrl || project.avatar?.originalUrl ? (
                      <img
                        src={project.avatar.processedUrl || project.avatar.originalUrl}
                        alt="Your Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <CheckCircle className="h-20 w-20 text-violet-400/50" />
                    )}
                  </div>
                )}
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                
                {/* Badges - Top */}
                <div className="absolute top-3 left-3 right-3 flex items-start justify-between gap-2">
                  {styleBadge && (
                    <Badge className={`bg-gradient-to-r ${styleBadge.color} text-white border-0 shadow-lg`}>
                      <styleBadge.icon className="h-3 w-3 mr-1" />
                      {styleBadge.label}
                    </Badge>
                  )}
                  
                  {style.type === 'Premium' && (
                    <Badge className="bg-gradient-to-r from-violet-500 to-purple-600 text-white border-0 shadow-lg ml-auto">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                  {style.type === 'Free' && (
                    <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg ml-auto">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Free
                    </Badge>
                  )}
                </div>
                
                {/* Select Button on Hover */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white border-0 shadow-xl"
                  >
                    {isSelected ? 'Selected ✓' : 'Select Style'}
                  </Button>
                </div>
                
                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center pointer-events-none">
                    <div className="bg-violet-500 rounded-full p-3 shadow-[0_0_30px_rgba(139,92,246,0.8)]">
                      <CheckCircle className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Card Footer */}
              <div className="p-5 bg-gradient-to-b from-transparent to-black/40">
                <h3 className="text-lg font-bold text-white mb-1">{style.name}</h3>
                <p className="text-sm text-gray-300/80 line-clamp-2">{style.description}</p>
              </div>
            </div>
          );
        })}
      </div>


      {/* Style Result */}
      {project.style?.status === 'completed' && (
        <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-purple-950/20 backdrop-blur-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              Style Applied Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-violet-300">
                Style: {project.style.metadata?.styleName}
              </p>
              <p className="text-sm text-muted-foreground">
                Processing Time: {project.style.metadata?.processingTime}
              </p>
              <p className="text-xs text-violet-300/80 mt-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Styled avatar visible in Live Preview (right panel)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
};