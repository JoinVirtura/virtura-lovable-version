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
  Eye,
  Settings,
  CheckCircle,
  Loader2,
  RefreshCw,
  Crown,
  Star
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
  { id: 'realistic', name: 'Hyper Realistic', icon: Eye, description: 'Photo-realistic quality' },
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

  const handleGenerateAvatar = async () => {
    if (!generationPrompt.trim()) return;

    try {
      // Use ImageGenerationService to mirror AI Image Studio functionality
      const { ImageGenerationService } = await import('@/services/imageGenerationService');
      
      const params = {
        prompt: generationPrompt,
        contentType: 'portrait' as const,
        style: selectedStyle === 'realistic' ? 'photorealistic' : selectedStyle,
        aspectRatio: '1:1' as const,
        resolution: quality === '4K' ? '1024x1024' as const : '512x512' as const,
        quality: 'ultra' as const,
        enhance: true
      };

      const result = await ImageGenerationService.generateImage(params);
      
      if (result.success && result.image) {
        // Save to avatar library
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          await supabase.from('avatar_library').insert({
            image_url: result.image,
            prompt: generationPrompt,
            title: `${selectedStyle} Avatar`,
            tags: [selectedStyle, quality, 'AI Generated']
          });
        } catch (error) {
          console.warn('Failed to save to library:', error);
        }

        onUpdate({
          avatar: {
            type: 'generate',
            originalUrl: result.image,
            status: 'completed',
            quality: quality as any,
            metadata: {
              resolution: `${quality} (Generated)`,
              faceAlignment: 95,
              consistency: faceConsistency
            }
          }
        });
      } else {
        console.error('Generation failed:', result.error);
      }
    } catch (error) {
      console.error('Avatar generation failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="relative">
              <Camera className="h-6 w-6 text-primary" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
            </div>
            Avatar Generation
          </h2>
          <p className="text-muted-foreground">
            Create ultra-realistic avatars with AI • Stable Diffusion XL • KlingAI quality
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Neural Enhanced
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
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
            className={`h-64 relative cursor-pointer transition-all duration-300 ${
              isDragOver ? 'border-primary/50 bg-primary/5' : 'border-dashed border-muted-foreground/30'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className={`p-4 rounded-full border-2 border-dashed transition-all ${
                  isDragOver ? 'border-primary bg-primary/10 scale-110' : 'border-muted-foreground/30'
                }`}>
                  <Upload className="h-8 w-8 text-muted-foreground" />
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
                  className="bg-primary h-2 rounded-full transition-all duration-300"
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
                  placeholder="Describe your avatar... (e.g., Professional business woman, 30s, confident smile, studio lighting)"
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  className="min-h-24 mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {generationPrompt.length}/500 characters
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
                      className="justify-start h-auto p-3"
                    >
                      <style.icon className="h-4 w-4 mr-2" />
                      <div className="text-left">
                        <div className="font-medium text-xs">{style.name}</div>
                        <div className="text-xs text-muted-foreground">{style.description}</div>
                      </div>
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
                        <div className="flex items-center gap-2">
                          <span>{setting.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {setting.description}
                          </Badge>
                        </div>
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
                <p className="text-xs text-muted-foreground mt-1">
                  Higher values ensure better likeness across multiple videos
                </p>
              </div>

              <Button
                onClick={handleGenerateAvatar}
                disabled={!generationPrompt.trim() || isProcessing}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="flex flex-col items-start">
                      <span>Generating Ultra-HD Avatar...</span>
                      <span className="text-xs opacity-90">Neural processing in progress</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Avatar
                  </>
                )}
              </Button>
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

      {/* Live Preview */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-background/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold">
              Live Preview
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {project.avatar?.originalUrl ? (
            <div className="space-y-4">
              <div className="relative aspect-square max-w-md mx-auto rounded-lg overflow-hidden border-2 border-primary/20">
                <img 
                  src={project.avatar.originalUrl} 
                  alt="Avatar Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Processing Complete
                  </Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="aspect-square max-w-md mx-auto rounded-lg border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Eye className="h-12 w-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">Avatar preview will appear here</p>
                <p className="text-xs text-muted-foreground">Upload, generate, or select from library</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};