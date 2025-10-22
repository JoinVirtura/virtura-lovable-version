import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CircularProgress } from '@/components/ui/circular-progress';
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
  Heart,
  ChevronDown,
  Send,
  Mic,
  ImagePlus,
  X
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
  const [contentType, setContentType] = useState<'portrait' | 'landscape' | 'object' | 'abstract' | 'scene' | 'auto'>('auto');
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '4:3'>('1:1');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [savedAvatars, setSavedAvatars] = useState<Set<string>>(new Set());
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

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

  const handleVoiceInput = async () => {
    // If already recording, stop it
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    // Check if MediaRecorder is supported (works in all modern browsers)
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Not Supported",
        description: "Voice input is not supported in this browser. Please use a modern browser.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
        
        // Create blob from recorded chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Show processing toast
        toast({
          title: "Processing",
          description: "Transcribing your voice input...",
        });

        try {
          // Convert blob to base64
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            // Call Supabase Edge Function
            const { data, error } = await supabase.functions.invoke('voice-transcribe-whisper', {
              body: { audio: base64Audio }
            });

            if (error) {
              throw error;
            }

            if (data?.text) {
              // Append transcript to existing prompt
              setGenerationPrompt(prev => {
                const newPrompt = prev ? `${prev} ${data.text}` : data.text;
                return newPrompt.trim();
              });
              
              toast({
                title: "Voice Input Received",
                description: `Added: "${data.text}"`,
              });
            }
          };
        } catch (error) {
          console.error('Transcription error:', error);
          toast({
            title: "Transcription Failed",
            description: "Failed to transcribe audio. Please try again.",
            variant: "destructive"
          });
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        toast({
          title: "Recording Error",
          description: "Failed to record audio. Please try again.",
          variant: "destructive"
        });
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording",
        description: "Speak now... Click the mic again to stop.",
      });

    } catch (error: any) {
      console.error('Failed to start voice recording:', error);
      setIsRecording(false);
      
      let errorMessage = "Failed to access microphone";
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No microphone found. Please connect a microphone.";
      }
      
      toast({
        title: "Microphone Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setImagePreview(imageUrl);
        
        // Update the live preview on the right side
        onUpdate({
          avatar: {
            type: 'upload',
            originalUrl: imageUrl,
            status: 'completed',
            quality: quality as any,
            metadata: {
              resolution: `Reference Image`,
              faceAlignment: 95,
              consistency: faceConsistency
            }
          }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
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
          <Card className="w-full">
            <CardContent className="pt-6 space-y-6">
              {/* Chat-style Input with Action Buttons */}
              <div className="space-y-3">
                <div className="relative flex items-center gap-2">
                  {/* Input field - takes remaining space */}
                  <Input
                    id="prompt"
                    placeholder="Describe the image you want to create..."
                    value={generationPrompt}
                    onChange={(e) => setGenerationPrompt(e.target.value)}
                    className="flex-1 h-14 text-base pl-4 pr-4"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && generationPrompt.trim()) {
                        e.preventDefault();
                        handleGeneratePerfectAvatar();
                      }
                    }}
                  />
                  
                  {/* Image Upload Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => imageInputRef.current?.click()}
                    className="h-14 w-14 rounded-full border-violet-500/40 hover:border-violet-400 hover:bg-violet-500/10 transition-all duration-300"
                    title="Upload reference image"
                  >
                    <ImagePlus className="h-5 w-5 text-violet-400" />
                  </Button>
                  
                  {/* Hidden file input */}
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  
                  {/* Microphone Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleVoiceInput}
                    className={`h-14 w-14 rounded-full border-violet-500/40 transition-all duration-300 ${
                      isRecording 
                        ? 'bg-red-500/20 border-red-400 hover:bg-red-500/30' 
                        : 'hover:border-violet-400 hover:bg-violet-500/10'
                    }`}
                    title={isRecording ? "Stop recording" : "Voice input"}
                  >
                    <Mic className={`h-5 w-5 ${isRecording ? 'text-red-400 animate-pulse' : 'text-violet-400'}`} />
                  </Button>
                  
                  {/* Send/Generate Button with Progress */}
                  <div className="relative flex-shrink-0">
                    {(isProcessing || processingStage !== '') && (
                      <CircularProgress 
                        value={processingProgress} 
                        size={56}
                        strokeWidth={3}
                        className="absolute inset-0"
                      />
                    )}
                    
                    <Button
                      onClick={handleGeneratePerfectAvatar}
                      disabled={!generationPrompt.trim() || isProcessing || processingStage !== ''}
                      size="icon"
                      className="h-14 w-14 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      title="Generate Avatar (Enter)"
                    >
                      {isProcessing || processingStage !== '' ? (
                        <Loader2 className="h-5 w-5 animate-spin text-white" />
                      ) : (
                        <Send className="h-5 w-5 text-white" />
                      )}
                    </Button>
                  </div>
                </div>

              </div>

              {/* Collapsible Advanced Settings */}
              <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced} className="mt-4">
                <CollapsibleTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-4 w-4" />
                    Advanced Settings
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`} />
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-6 pt-6">
                  {/* Quality Indicators */}
                  <div className="flex items-center justify-between pb-4 border-b border-violet-500/20">
                    <span className="text-sm text-muted-foreground">Quality Settings</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs bg-violet-500/10 border-violet-500/20">
                        Neural Enhanced
                      </Badge>
                      <Badge variant="secondary" className="text-xs bg-violet-500/10 border-violet-500/20">
                        {quality}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Content Type Selection */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Content Type</Label>
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
                    <Label className="text-sm font-medium mb-3 block">Aspect Ratio</Label>
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

                  {/* Style Preset */}
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Style Preset</Label>
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

                  {/* Quality Settings */}
                  <div>
                    <Label className="text-sm font-medium">Quality Settings</Label>
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
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
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