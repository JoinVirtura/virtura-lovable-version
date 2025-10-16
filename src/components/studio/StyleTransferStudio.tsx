import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Palette, 
  Sparkles, 
  Crown, 
  Star, 
  Wand2, 
  Camera,
  Brush,
  ImageIcon,
  CheckCircle,
  Loader2
} from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';
import { applyStyleTransfer } from './StyleTransferEdge';
import { useToast } from '@/components/ui/use-toast';

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

const STYLE_CATEGORIES = [
  { id: 'all', name: 'All Styles', icon: Palette },
  { id: 'original', name: 'Original', icon: CheckCircle },
  { id: 'artistic', name: 'Artistic', icon: Brush },
  { id: 'futuristic', name: 'Futuristic', icon: Sparkles },
  { id: 'animation', name: 'Animation', icon: Star },
  { id: 'modern', name: 'Modern', icon: Wand2 },
  { id: 'vintage', name: 'Vintage', icon: Camera },
  { id: 'fantasy', name: 'Fantasy', icon: Crown },
  { id: 'nature', name: 'Nature', icon: ImageIcon },
  { id: 'photography', name: 'Photography', icon: CheckCircle }
];

export const StyleTransferStudio: React.FC<StyleTransferStudioProps> = ({ 
  project, 
  onUpdate, 
  isProcessing 
}) => {
  const { toast } = useToast();
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [styleStrength, setStyleStrength] = useState(75);
  const [preserveOriginal, setPreserveOriginal] = useState(25);
  const [enhanceDetails, setEnhanceDetails] = useState(80);
  const [isApplying, setIsApplying] = useState(false);

  const filteredStyles = STYLE_PRESETS.filter(style => 
    selectedCategory === 'all' || style.category === selectedCategory
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="relative">
              <Palette className="h-6 w-6 text-primary" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-purple-500" />
            </div>
            Style Transfer Studio
          </h2>
          <p className="text-muted-foreground">
            Transform your avatar with AI-powered artistic styles
          </p>
        </div>
        
        <Badge variant="secondary" className="text-xs">
          <Wand2 className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      {/* Prerequisites Check */}
      {!project.avatar && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ImageIcon className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Avatar Required
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  Upload or generate an avatar first to apply style transfer
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Style Selection */}
        <div className="space-y-6">
          {/* Category Filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Style Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-1">
                {STYLE_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="h-8 text-xs"
                  >
                    <category.icon className="h-3 w-3 mr-1" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Style Presets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Style Presets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                {filteredStyles.map((style) => (
                  <div
                    key={style.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                      selectedStyle === style.id
                        ? 'ring-2 ring-primary transform scale-105'
                        : 'hover:scale-102'
                    }`}
                    onClick={() => setSelectedStyle(style.id)}
                  >
                    {style.image ? (
                      <img
                        src={style.image}
                        alt={style.name}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      // Show avatar preview for "No Style" option
                      <div className="w-full aspect-square bg-muted flex items-center justify-center">
                        {project.avatar?.processedUrl || project.avatar?.originalUrl ? (
                          <img
                            src={project.avatar.processedUrl || project.avatar.originalUrl}
                            alt="Your Avatar"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <CheckCircle className="h-12 w-12 text-primary" />
                        )}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="text-white text-xs font-medium">{style.name}</div>
                      <div className="text-white/80 text-xs">{style.description}</div>
                    </div>
                    <div className="absolute top-2 right-2">
                      {style.type === 'Premium' && (
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
                          <Crown className="h-3 w-3 mr-1" />
                          Premium
                        </Badge>
                      )}
                      {style.type === 'Free' && (
                        <Badge className="bg-green-500 text-white text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Free
                        </Badge>
                      )}
                    </div>
                    {selectedStyle === style.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Style Settings */}
        <div className="space-y-6">
          {/* Style Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Style Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <Label>Style Strength</Label>
                  <span>{styleStrength}%</span>
                </div>
                <Slider
                  value={[styleStrength]}
                  onValueChange={([value]) => setStyleStrength(value)}
                  max={100}
                  min={10}
                  step={5}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How strongly to apply the style transfer
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <Label>Preserve Original</Label>
                  <span>{preserveOriginal}%</span>
                </div>
                <Slider
                  value={[preserveOriginal]}
                  onValueChange={([value]) => setPreserveOriginal(value)}
                  max={50}
                  min={0}
                  step={5}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  How much of the original image to preserve
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <Label>Enhance Details</Label>
                  <span>{enhanceDetails}%</span>
                </div>
                <Slider
                  value={[enhanceDetails]}
                  onValueChange={([value]) => setEnhanceDetails(value)}
                  max={100}
                  min={0}
                  step={10}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  AI enhancement of fine details
                </p>
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleApplyStyle}
            disabled={!canApplyStyle || isProcessing || isApplying}
            className="w-full h-12"
            size="lg"
          >
            {isProcessing || isApplying || project.style?.status === 'processing' ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Applying Style Transfer...
              </>
            ) : (
              <>
                <Palette className="h-4 w-4 mr-2" />
                Apply Style Transfer
              </>
            )}
          </Button>

          {/* Style Result */}
          {project.style?.status === 'completed' && (
            <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  Style Applied
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-primary">Style: {project.style.metadata?.styleName}</p>
                  <p className="text-sm text-muted-foreground">
                    Processing Time: {project.style.metadata?.processingTime}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    ✨ Styled avatar visible in Live Preview (right panel)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};