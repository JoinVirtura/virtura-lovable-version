import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Upload,
  Camera,
  Sparkles,
  Wand2,
  Image as ImageIcon,
  Library,
  Zap,
  Settings,
  Loader2,
  RefreshCw,
  Crown,
  Star,
  Heart
} from 'lucide-react';
import { AvatarLibrary } from './AvatarLibrary';
import { RealAvatarLibrary } from './RealAvatarLibrary';
import type { StudioProject } from '@/hooks/useStudioProject';

interface AvatarGenerationStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
}

const STYLE_PRESETS = [
  { id: 'realistic', name: 'Hyper Realistic', icon: Camera, description: 'Photo-realistic quality' },
  { id: 'pixar', name: 'Pixar Style', icon: Sparkles, description: '3D animated look' },
  { id: 'cinematic', name: 'Cinematic', icon: Star, description: 'Film-grade quality' },
  { id: 'anime', name: 'Anime Style', icon: Wand2, description: 'Japanese animation' },
  { id: 'vintage', name: 'Vintage', icon: Crown, description: 'Classic portrait style' }
];

const QUALITY_SETTINGS = [
  { value: 'HD', label: 'HD (1080p)', description: 'High Definition' },
  { value: '4K', label: '4K Ultra', description: 'Ultra High Definition' },
  { value: '8K', label: '8K Cinema', description: 'Cinema Grade Quality' }
];

export const AvatarGenerationStudio: React.FC<AvatarGenerationStudioProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generationPrompt, setGenerationPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('realistic');
  const [quality, setQuality] = useState<'HD' | '4K' | '8K'>('4K');
  const [faceConsistency, setFaceConsistency] = useState(85);
  const [contentType, setContentType] = useState<'portrait' | 'landscape' | 'object' | 'abstract' | 'scene' | 'auto'>('portrait');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [savedAvatars, setSavedAvatars] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      return;
    }

    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Create object URL for preview
    const imageUrl = URL.createObjectURL(file);
    
    onUpdate({
      avatar: {
        type: 'upload',
        originalUrl: imageUrl,
        status: 'completed',
        quality: quality as any,
        metadata: {
          resolution: `${quality} (${file.size} bytes)`,
          faceAlignment: 95,
          consistency: faceConsistency
        }
      }
    });
  }, [quality, faceConsistency, onUpdate]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload]);

  const handleGeneratePerfectAvatar = async () => {
    if (!generationPrompt.trim()) return;

    try {
      console.log('🎯 Generation Request:', {
        userPrompt: generationPrompt,
        selectedContentType: contentType,
        selectedQuality: quality,
        selectedAspectRatio: aspectRatio,
        selectedStyle: selectedStyle
      });
      
      // Reset states
      setGeneratedResult(null);
      setProcessingProgress(0);
      setProcessingStage('Generating Perfect Avatar...');
      setEstimatedTime(30);

      const { ImageGenerationService } = await import('@/services/imageGenerationService');
      
      const baseParams = {
        prompt: generationPrompt,
        contentType: contentType,
        style: selectedStyle === 'realistic' ? 'photorealistic' : selectedStyle,
        aspectRatio: aspectRatio,
        resolution: quality === '8K' ? '1536x1536' as const : 
                   quality === '4K' ? '1024x1024' as const : '512x512' as const,
        quality: quality === '8K' ? 'ultra' as const : 
                 quality === '4K' ? 'balanced' as const : 'speed' as const,
        enhance: true,
        steps: quality === '8K' ? 50 : quality === '4K' ? 35 : 20,
        adherence: quality === '8K' ? 12.0 : quality === '4K' ? 10.0 : 7.5
      };

      // Simulate progress during generation
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 10;
        });
      }, 800);

      // Generate single perfect avatar with Replicate
      const result = await ImageGenerationService.generateImage({
        ...baseParams,
        contentType: contentType,
        aspectRatio: aspectRatio,
        provider: 'replicate'
      });
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setGeneratedResult(result);
      
      console.log('✅ Image generated successfully:', result.image);
      
      // Save successful generation to library and update preview immediately
      if (result.success && result.image) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            await supabase.from('avatar_library').insert({
              user_id: user.id,
              image_url: result.image,
              prompt: generationPrompt,
              title: `Perfect ${selectedStyle} Avatar - ${quality}`,
              tags: [selectedStyle, quality, 'AI Generated', 'Perfect', 'Single']
            });
            console.log('💾 Saved to library successfully');
          }
        } catch (error) {
          console.warn('⚠️ Failed to save to library:', error);
        }
        
        // ✅ Immediately update the Live Preview with the generated avatar
        console.log('🎨 Updating Live Preview with generated image');
        onUpdate({
          avatar: {
            type: 'generate',
            originalUrl: result.image,
            status: 'completed',
            quality: quality as any,
            metadata: {
              resolution: result.metadata?.resolution || `${quality} (Generated)`,
              faceAlignment: 98,
              consistency: faceConsistency,
              processingTime: result.metadata?.processingTime || '30s'
            }
          }
        });
      }

      setProcessingStage(result.success ? 'Perfect Avatar Generated!' : 'Generation Failed');
      setTimeout(() => {
        setProcessingStage('');
        setEstimatedTime(0);
      }, 2000);

    } catch (error) {
      console.error('Avatar generation failed:', error);
      setProcessingStage('Generation failed');
      setTimeout(() => {
        setProcessingStage('');
        setEstimatedTime(0);
      }, 3000);
    }
  };

  const selectGeneratedAvatar = () => {
    if (generatedResult?.success && generatedResult?.image) {
      onUpdate({
        avatar: {
          type: 'generate',
          originalUrl: generatedResult.image,
          status: 'completed',
          quality: quality as any,
          metadata: {
            resolution: generatedResult.metadata?.resolution || `${quality} (Generated)`,
            faceAlignment: 98,
            consistency: faceConsistency,
            processingTime: generatedResult.metadata?.processingTime || '30s'
          }
        }
      });
    }
  };

  const handleSaveToLibrary = async (imageUrl: string) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ No user found, cannot save to library');
        return;
      }
      
      await supabase.from('avatar_library').insert({
        user_id: user.id,
        image_url: imageUrl,
        prompt: generationPrompt,
        title: `${selectedStyle} Avatar - ${quality}`,
        tags: [selectedStyle, quality, 'AI Generated', 'Saved']
      });
      
      setSavedAvatars(prev => new Set([...prev, imageUrl]));
      
      console.log('✅ Avatar saved to library successfully');
    } catch (error) {
      console.error('❌ Failed to save to library:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="relative">
            <Camera className="h-6 w-6 text-primary" />
            <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-violet-400" />
          </div>
          Avatar Generation
        </h2>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            Neural Enhanced
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {quality}
          </Badge>
        </div>
      </div>

      {/* Main Generation Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Image
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            AI Generate
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Library className="h-4 w-4" />
            Avatar Library
          </TabsTrigger>
        </TabsList>

        {/* Upload Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card 
            className={`h-64 relative cursor-pointer transition-all duration-300 border-2 ${
              isDragOver ? 'border-violet-400 bg-violet-500/10 scale-[1.02] shadow-[0_0_25px_rgba(212,110,255,0.25)]' : 'border-dashed border-violet-500/40 hover:border-violet-400 hover:shadow-[0_0_25px_rgba(212,110,255,0.25)]'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className={`p-4 rounded-full border-2 border-dashed transition-all ${
                  isDragOver ? 'border-violet-400 bg-violet-500/10 scale-110' : 'border-violet-500/40'
                }`}>
                  <Upload className="h-8 w-8 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Upload Avatar Image</h3>
                  <p className="text-sm text-muted-foreground">
                    Drop image here or click to upload • PNG, JPG, WebP up to 10MB
                  </p>
                </div>
              </div>
            </CardContent>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />
          </Card>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing image...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(212,110,255,0.5)]"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* AI Generation Tab */}
        <TabsContent value="generate" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt" className="text-base font-medium">
                  {contentType === 'portrait' ? 'Avatar Description' : 'Image Description'}
                </Label>
                <Textarea
                  id="prompt"
                  placeholder={
                    contentType === 'portrait' 
                      ? "Describe one specific person... (e.g., Professional business woman, 30s, confident smile, wearing navy blazer, studio lighting)"
                      : contentType === 'landscape'
                      ? "Describe a scenic view... (e.g., Sunset over mountain range, golden hour lighting, misty valleys)"
                      : contentType === 'object'
                      ? "Describe a product... (e.g., Modern wireless headphones, matte black finish, floating on white background)"
                      : contentType === 'abstract'
                      ? "Describe artistic concept... (e.g., Geometric patterns in blue and gold, flowing liquid metal texture)"
                      : "Describe any image you want to create..."
                  }
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  className="min-h-24 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {generationPrompt.length}/500
                </p>
              </div>

              {/* Content Type Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Content Type</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'portrait' as const, name: 'Portrait', icon: Camera, description: 'People & avatars' },
                    { id: 'landscape' as const, name: 'Landscape', icon: Sparkles, description: 'Scenic views' },
                    { id: 'object' as const, name: 'Object', icon: Star, description: 'Products & items' },
                    { id: 'abstract' as const, name: 'Abstract', icon: Wand2, description: 'Artistic concepts' },
                    { id: 'scene' as const, name: 'Scene', icon: Crown, description: 'Environmental shots' },
                    { id: 'auto' as const, name: 'Auto', icon: Zap, description: 'Smart detection' }
                  ].map((type) => (
                    <Button
                      key={type.id}
                      variant={contentType === type.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setContentType(type.id)}
                      className="justify-start h-10 px-3"
                      title={type.description}
                    >
                      <type.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{type.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Aspect Ratio Selection */}
              <div>
                <Label className="text-base font-medium mb-3 block">Aspect Ratio</Label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: '1:1' as const, label: 'Square', emoji: '□' },
                    { value: '16:9' as const, label: 'Wide', emoji: '▭' },
                    { value: '9:16' as const, label: 'Tall', emoji: '▯' },
                    { value: '4:3' as const, label: 'Classic', emoji: '▬' }
                  ].map((ratio) => (
                    <Button
                      key={ratio.value}
                      variant={aspectRatio === ratio.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAspectRatio(ratio.value)}
                      className="h-10"
                    >
                      <span className="text-lg mr-1">{ratio.emoji}</span>
                      <span className="text-xs">{ratio.label}</span>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Style Preset</Label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_PRESETS.map((style) => (
                    <Button
                      key={style.id}
                      variant={selectedStyle === style.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedStyle(style.id)}
                      className="justify-start h-10 px-3"
                    >
                      <style.icon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{style.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Quality Settings</Label>
                <Select value={quality} onValueChange={(value) => setQuality(value as 'HD' | '4K' | '8K')}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QUALITY_SETTINGS.map((setting) => (
                      <SelectItem key={setting.value} value={setting.value}>
                        {setting.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Face Consistency - only show for portrait mode */}
              {contentType === 'portrait' && (
                <div>
                  <Label className="text-sm font-medium">
                    Face Consistency: {faceConsistency}%
                  </Label>
                  <Slider
                    value={[faceConsistency]}
                    onValueChange={([value]) => setFaceConsistency(value)}
                    max={100}
                    min={50}
                    step={5}
                    className="mt-2"
                  />
                </div>
              )}

              <Button
                onClick={handleGeneratePerfectAvatar}
                disabled={!generationPrompt.trim() || isProcessing || processingStage !== ''}
                className="w-full h-12"
                size="lg"
              >
                {isProcessing || processingStage !== '' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating {quality} {contentType === 'portrait' ? 'Avatar' : 'Image'}...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {quality} {contentType === 'portrait' ? 'Avatar' : 'Image'}
                  </>
                )}
              </Button>

              {/* Generation Progress */}
              {processingProgress > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="text-sm font-medium text-center">{processingStage}</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Perfect Avatar Generation</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary/80 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${processingProgress}%` }}
                      />
                    </div>
                    {estimatedTime > 0 && (
                      <div className="text-xs text-muted-foreground text-center">
                        ~{estimatedTime}s remaining
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          <RealAvatarLibrary
            onSelectAvatar={(avatarUrl, metadata) => {
              onUpdate({
                avatar: {
                  type: 'library',
                  originalUrl: avatarUrl,
                  status: 'completed',
                  quality: '4K' as any,
                  metadata
                }
              });
            }}
            isProcessing={isProcessing}
          />
        </TabsContent>
      </Tabs>

    </div>
  );
};