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
  const [quality, setQuality] = useState('4K');
  const [faceConsistency, setFaceConsistency] = useState(85);
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
      // Reset states
      setGeneratedResult(null);
      setProcessingProgress(0);
      setProcessingStage('Generating Perfect Avatar...');
      setEstimatedTime(30);

      const { ImageGenerationService } = await import('@/services/imageGenerationService');
      
      const baseParams = {
        prompt: generationPrompt,
        contentType: 'portrait' as const,
        style: selectedStyle === 'realistic' ? 'photorealistic' : selectedStyle,
        aspectRatio: '1:1' as const,
        resolution: quality === '8K' ? '1536x1536' as const : 
                   quality === '4K' ? '1024x1024' as const : '512x512' as const,
        quality: 'ultra' as const,
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

      // Generate single perfect avatar
      const result = await ImageGenerationService.generateImage(baseParams);
      
      clearInterval(progressInterval);
      setProcessingProgress(100);
      setGeneratedResult(result);
      
      // Save successful generation to library
      if (result.success && result.image) {
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.from('avatar_library').insert({
            image_url: result.image,
            prompt: generationPrompt,
            title: `Perfect ${selectedStyle} Avatar - ${quality}`,
            tags: [selectedStyle, quality, 'AI Generated', 'Perfect', 'Single']
          });
        } catch (error) {
          console.warn('Failed to save to library:', error);
        }
        
        // Automatically display in Live Preview after successful generation
        setTimeout(() => {
          selectGeneratedAvatar();
        }, 500);
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
      await supabase.from('avatar_library').insert({
        image_url: imageUrl,
        prompt: generationPrompt,
        title: `${selectedStyle} Avatar - ${quality}`,
        tags: [selectedStyle, quality, 'AI Generated', 'Saved']
      });
      
      setSavedAvatars(prev => new Set([...prev, imageUrl]));
      
      // Show success feedback
      console.log('Avatar saved to library successfully');
    } catch (error) {
      console.error('Failed to save to library:', error);
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
                  Avatar Description
                </Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe one specific avatar... (e.g., Professional business woman, 30s, confident smile, wearing navy blazer, studio lighting)"
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  className="min-h-24 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {generationPrompt.length}/500
                </p>
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
                <Select value={quality} onValueChange={setQuality}>
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

              <Button
                onClick={handleGeneratePerfectAvatar}
                disabled={!generationPrompt.trim() || isProcessing || processingStage !== ''}
                className="w-full h-12"
                size="lg"
              >
                {isProcessing || processingStage !== '' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating {quality} Avatar...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate {quality} Avatar
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

              {/* Generated Avatar Display */}
              {generatedResult && (
                <div className="space-y-4 mt-6">
                  <div className="text-sm font-medium">Generated Avatar:</div>
                  <div className="max-w-md mx-auto">
                    <Card className="p-0 overflow-hidden group">
                      {generatedResult.success && generatedResult.image ? (
                        <div 
                          className="aspect-square relative cursor-pointer transition-all duration-300 hover:scale-105"
                          onClick={selectGeneratedAvatar}
                        >
                          <img
                            src={generatedResult.image}
                            alt="Generated Avatar"
                            className="w-full h-full object-cover"
                          />
                          {/* Click to use overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-white font-medium bg-black/50 px-4 py-2 rounded-lg backdrop-blur-sm">
                              Click to use this avatar
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-square flex items-center justify-center bg-muted rounded">
                          <span className="text-sm text-muted-foreground">Generation Failed</span>
                        </div>
                      )}
                    </Card>
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