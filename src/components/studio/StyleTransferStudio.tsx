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

// Import style assets
import style90sAnime from '@/assets/style-90s-anime.jpg';
import styleCyberpunk from '@/assets/style-cyberpunk.jpg';
import styleOilPainting from '@/assets/style-oil-painting.jpg';
import styleWatercolor from '@/assets/style-watercolor.jpg';
import stylePopArt from '@/assets/style-pop-art.jpg';
import styleFilmNoir from '@/assets/style-film-noir.jpg';
import styleSteampunk from '@/assets/style-steampunk.jpg';
import styleMinimalist from '@/assets/style-minimalist-new.jpg';

interface StyleTransferStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  isProcessing: boolean;
}

const STYLE_PRESETS = [
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    description: 'Classical oil painting style',
    image: styleOilPainting,
    type: 'Premium',
    strength: 85,
    category: 'artistic'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft watercolor painting effect',
    image: styleWatercolor,
    type: 'Standard',
    strength: 70,
    category: 'artistic'
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Futuristic neon cyberpunk style',
    image: styleCyberpunk,
    type: 'Premium',
    strength: 90,
    category: 'futuristic'
  },
  {
    id: '90s-anime',
    name: '90s Anime',
    description: 'Classic Japanese animation style',
    image: style90sAnime,
    type: 'Premium',
    strength: 80,
    category: 'animation'
  },
  {
    id: 'pop-art',
    name: 'Pop Art',
    description: 'Bold pop art style',
    image: stylePopArt,
    type: 'Standard',
    strength: 75,
    category: 'modern'
  },
  {
    id: 'film-noir',
    name: 'Film Noir',
    description: 'Classic black and white cinema',
    image: styleFilmNoir,
    type: 'Premium',
    strength: 85,
    category: 'vintage'
  },
  {
    id: 'steampunk',
    name: 'Steampunk',
    description: 'Victorian-era industrial aesthetic',
    image: styleSteampunk,
    type: 'Standard',
    strength: 80,
    category: 'vintage'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, minimal design',
    image: styleMinimalist,
    type: 'Standard',
    strength: 60,
    category: 'modern'
  }
];

const STYLE_CATEGORIES = [
  { id: 'all', name: 'All Styles', icon: Palette },
  { id: 'artistic', name: 'Artistic', icon: Brush },
  { id: 'futuristic', name: 'Futuristic', icon: Sparkles },
  { id: 'animation', name: 'Animation', icon: Star },
  { id: 'modern', name: 'Modern', icon: Wand2 },
  { id: 'vintage', name: 'Vintage', icon: Camera }
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
    if (!selectedStyle || !project.avatar?.processedUrl) return;

    const stylePreset = STYLE_PRESETS.find(s => s.id === selectedStyle);
    if (!stylePreset) return;

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
        imageUrl: project.avatar.processedUrl,
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
              <div className="grid grid-cols-2 gap-2">
                {STYLE_CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className="justify-start h-auto p-3"
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium text-xs">{category.name}</div>
                    </div>
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
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
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
                    <img
                      src={style.image}
                      alt={style.name}
                      className="w-full aspect-square object-cover"
                    />
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
                </div>
                {project.style.resultUrl && (
                  <div className="aspect-square rounded-lg overflow-hidden">
                    <img
                      src={project.style.resultUrl}
                      alt="Styled avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};