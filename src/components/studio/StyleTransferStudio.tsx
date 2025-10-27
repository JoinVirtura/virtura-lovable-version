import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Sparkles, 
  Crown, 
  CheckCircle,
  Loader2,
  Heart,
  Library,
  Film,
  Download,
  ChevronDown,
  Zap,
  TrendingUp
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

export const StyleTransferStudio: React.FC<StyleTransferStudioProps> = ({ 
  project, 
  onUpdate, 
  isProcessing 
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter styles based on search
  const filteredStyles = STYLE_PRESETS.filter(style => 
    style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    style.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto-open settings when style is selected
  React.useEffect(() => {
    if (selectedStyle && selectedStyle !== 'none') {
      setSettingsOpen(true);
    }
  }, [selectedStyle]);

  const handleApplyStyle = async () => {
    const avatarUrl = project.avatar?.processedUrl || project.avatar?.originalUrl;
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
      // Apply real style transfer
      const result = await applyStyleTransfer({
        imageUrl: avatarUrl,
        stylePreset: selectedStyle,
        strength: styleStrength,
        preserveOriginal,
        enhanceDetails
      });

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
        variant: "destructive"
      });
    } finally {
      setIsApplying(false);
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
      sonnerToast.success('Avatar saved to library!');
      toast({
        title: "Saved Successfully",
        description: "Your styled avatar has been saved to your library",
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Style Transfer Studio
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Transform your avatar with 50+ AI-powered artistic styles
          </p>
        </div>
        
        <Badge className="bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
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

      {/* Search Bar */}
      <div className="max-w-md">
        <Input
          type="search"
          placeholder="Search styles... (e.g., cyberpunk, watercolor)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-12 bg-black/40 border-violet-500/30 focus:border-violet-400 transition-colors"
        />
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

      {/* Collapsible Settings Panel */}
      {selectedStyle && selectedStyle !== 'none' && (
        <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="mt-8">
          <Card className="border-violet-500/30 bg-gradient-to-br from-violet-950/20 to-purple-950/20 backdrop-blur-xl">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-violet-500/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-left">
                      <CardTitle className="text-xl">Style Settings</CardTitle>
                      <CardDescription>Fine-tune your style transfer parameters</CardDescription>
                    </div>
                  </div>
                  <ChevronDown 
                    className={`h-6 w-6 text-violet-400 transition-transform duration-300 ${
                      settingsOpen ? 'rotate-180' : ''
                    }`} 
                  />
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="space-y-8 px-6 pb-6">
                {/* Style Strength */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Style Strength</Label>
                    <Badge variant="outline" className="text-base font-mono">
                      {styleStrength}%
                    </Badge>
                  </div>
                  <Slider
                    value={[styleStrength]}
                    onValueChange={([value]) => setStyleStrength(value)}
                    max={100}
                    min={10}
                    step={5}
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Controls how intensely the artistic style is applied to your avatar
                  </p>
                </div>

                {/* Preserve Original */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Preserve Original</Label>
                    <Badge variant="outline" className="text-base font-mono">
                      {preserveOriginal}%
                    </Badge>
                  </div>
                  <Slider
                    value={[preserveOriginal]}
                    onValueChange={([value]) => setPreserveOriginal(value)}
                    max={50}
                    min={0}
                    step={5}
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    Maintains more of your original avatar features at higher values
                  </p>
                </div>

                {/* Enhance Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-base font-semibold">Enhance Details</Label>
                    <Badge variant="outline" className="text-base font-mono">
                      {enhanceDetails}%
                    </Badge>
                  </div>
                  <Slider
                    value={[enhanceDetails]}
                    onValueChange={([value]) => setEnhanceDetails(value)}
                    max={100}
                    min={0}
                    step={10}
                    className="h-3"
                  />
                  <p className="text-sm text-muted-foreground">
                    AI-powered enhancement of fine details and textures
                  </p>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

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

      {/* Save to Library */}
      {(project.style?.resultUrl || project.avatar?.processedUrl) && (
        <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-teal-950/20 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-emerald-400" />
              Save Styled Avatar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input 
                placeholder="Enter avatar title (optional)" 
                value={avatarTitle}
                onChange={(e) => setAvatarTitle(e.target.value)}
                disabled={savedToLibrary}
                className="h-12 bg-black/40 border-emerald-500/30"
              />
              <Button 
                onClick={handleSaveToLibrary}
                disabled={savedToLibrary || isSaving}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : savedToLibrary ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved to Library
                  </>
                ) : (
                  <>
                    <Heart className="h-4 w-4 mr-2" />
                    Save to Library
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps - Use in Video */}
      {savedToLibrary && (
        <Card className="border-purple-500/30 bg-gradient-to-br from-purple-950/20 to-pink-950/20 backdrop-blur-xl animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              ✨ Avatar Saved Successfully!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-gray-300">
              Your styled avatar is now in your library. What's next?
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline"
                onClick={() => navigate('/dashboard/library')}
                className="w-full h-12"
              >
                <Library className="h-4 w-4 mr-2" />
                View Library
              </Button>
              <Button 
                onClick={handleUseInVideo}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Film className="h-4 w-4 mr-2" />
                Create Video
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button 
                variant="outline"
                onClick={handleDownload}
                size="sm"
                className="w-full h-10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className="w-full h-10"
                onClick={() => sonnerToast.info('Share feature coming soon!')}
              >
                <Download className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Floating Apply Button - Fixed at bottom */}
      {selectedStyle && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <Button 
            onClick={handleApplyStyle}
            disabled={!canApplyStyle || isProcessing || isApplying}
            size="xl"
            className={`px-10 py-6 text-lg rounded-full shadow-[0_0_50px_rgba(139,92,246,0.6)] hover:shadow-[0_0_70px_rgba(139,92,246,0.8)] transition-all duration-300 ${
              (isProcessing || isApplying || project.style?.status === 'processing')
                ? 'animate-pulse'
                : 'hover:scale-110'
            }`}
          >
            {isProcessing || isApplying || project.style?.status === 'processing' ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Applying Style Transfer...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                ✨ Apply Style Transfer
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};