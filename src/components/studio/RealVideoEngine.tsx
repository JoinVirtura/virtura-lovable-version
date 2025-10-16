import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Film,
  Play,
  Settings,
  Loader2,
  Zap,
  Eye,
  Sparkles,
  Crown,
  Star,
  Brain,
  MonitorSpeaker,
  Camera,
  CheckCircle,
  AlertCircle,
  Download,
  Palette,
  Layers,
  Volume2
} from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface RealVideoEngineProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
}

const VIDEO_ENGINES = [
  {
    id: 'bytedance-omni-human',
    name: 'ByteDance Omni-Human',
    description: 'Premium quality lip-sync with ByteDance AI',
    badge: 'Premium',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    icon: Crown,
    features: ['Best Quality', 'Natural Motion', 'Ultra-HD', 'Realistic Sync'],
    realOutput: true
  },
  {
    id: 'synthesys-wav2lip',
    name: 'Synthesys Wav2Lip',
    description: 'High-quality professional lip synchronization',
    badge: 'Pro',
    badgeColor: 'bg-blue-500',
    icon: Brain,
    features: ['4K Support', 'Fast Processing', 'Professional', 'Natural Motion'],
    realOutput: true
  },
  {
    id: 'sonic',
    name: 'Sonic Fast',
    description: 'Budget-friendly fast generation',
    badge: 'Budget',
    badgeColor: 'bg-green-500',
    icon: Zap,
    features: ['Low Cost', 'Fast', 'Cost-Effective', 'Reliable'],
    realOutput: true
  }
];

const QUALITY_SETTINGS = [
  { value: '720p', label: '720p HD', description: 'Fast processing', width: 1280, height: 720 },
  { value: '1080p', label: '1080p Full HD', description: 'Standard quality', width: 1920, height: 1080 },
  { value: '4K', label: '4K Ultra HD', description: 'Premium quality', width: 3840, height: 2160 },
  { value: '8K', label: '8K Cinema', description: 'Ultimate quality', width: 7680, height: 4320 }
];

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 Square', description: 'Instagram posts' },
  { value: '9:16', label: '9:16 Portrait', description: 'TikTok, Stories' },
  { value: '16:9', label: '16:9 Landscape', description: 'YouTube, TV' },
  { value: '4:5', label: '4:5 Vertical', description: 'Facebook, LinkedIn' }
];

const BACKGROUND_OPTIONS = [
  { id: 'studio', name: 'Professional Studio', description: 'Clean professional background' },
  { id: 'office', name: 'Modern Office', description: 'Corporate office setting' },
  { id: 'virtual', name: 'Virtual Set', description: 'Custom virtual environment' },
  { id: 'transparent', name: 'Green Screen', description: 'For custom backgrounds' },
  { id: 'custom', name: 'Custom Upload', description: 'Upload your own background' }
];

export const RealVideoEngine: React.FC<RealVideoEngineProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing
}) => {
  const [selectedEngine, setSelectedEngine] = useState('sync-labs');
  const [videoPrompt, setVideoPrompt] = useState('Professional presentation with natural head movements, confident eye contact, and subtle facial expressions. Maintain professional posture with engaging body language.');
  const [quality, setQuality] = useState('4K');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [fps, setFps] = useState(30);
  const [duration, setDuration] = useState(30);
  const [selectedBackground, setSelectedBackground] = useState('studio');
  
  const [motionSettings, setMotionSettings] = useState({
    headMovement: 75,
    eyeContact: 85,
    expressions: 60,
    gestures: 40,
    lipSync: 95,
    blinking: 80
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    enableUltraHD: true,
    neuralEnhancement: true,
    cinematicEffects: true,
    realTimeSync: true,
    faceReenactment: true,
    colorGrading: true,
    noiseReduction: true,
    faceRestoration: true,
    upscaling: false
  });

  const [processingPhase, setProcessingPhase] = useState<string>('');
  const [processingProgress, setProcessingProgress] = useState(0);

  const handleGenerateVideo = async () => {
    // Prerequisite checks are now handled in useStudioProject.ts
    // This ensures consistent validation across all components
    
    // Update processing status
    setProcessingPhase('Initializing video synthesis...');
    setProcessingProgress(10);

    const videoConfig = {
      engine: selectedEngine,
      prompt: videoPrompt,
      avatarImageUrl: project.avatar.processedUrl || project.avatar.originalUrl,
      audioUrl: project.voice.audioUrl,
      settings: {
        quality,
        fps,
        ratio: aspectRatio,
        duration,
        background: selectedBackground,
        motionSettings,
        ultraHD: advancedSettings.enableUltraHD,
        neuralEnhancement: advancedSettings.neuralEnhancement,
        cinematicEffects: advancedSettings.cinematicEffects,
        // Engine-specific settings
        ...(selectedEngine === 'liveportrait' && {
          lipSyncStrength: motionSettings.lipSync / 100,
          headPoseStrength: motionSettings.headMovement / 100,
          eyeBlink: advancedSettings.faceReenactment,
          faceRestoration: advancedSettings.faceRestoration
        }),
        ...(selectedEngine === 'sadtalker' && {
          still: false,
          preprocess: 'crop',
          enhancer: advancedSettings.faceRestoration ? 'gfpgan' : 'none',
          expressionScale: motionSettings.expressions / 100
        }),
        ...(selectedEngine === 'virtura-pro' && {
          engine: 'heygen',
          motionSettings,
          ...advancedSettings
        })
      }
    };

    // Update project with video processing status
    onUpdate({
      video: {
        engine: selectedEngine as "virtura-pro" | "runway" | "heygen" | "kling",
        quality: quality as "720p" | "1080p" | "4K" | "8K",
        ratio: aspectRatio as "1:1" | "9:16" | "16:9" | "4:5",
        fps: fps as 60 | 30 | 24,
        duration,
        motionSettings,
        status: 'processing',
        metadata: {
          frames: duration * fps,
          bitrate: quality === '8K' ? '50000k' : quality === '4K' ? '20000k' : '8000k'
        }
      }
    });

    await onGenerate(videoConfig);
  };

  const canGenerate = project.avatar?.status === 'completed' && project.voice?.status === 'completed';
  const selectedEngineData = VIDEO_ENGINES.find(e => e.id === selectedEngine);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <div className="relative">
              <Film className="h-7 w-7 text-primary" />
              <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-500" />
              <Zap className="h-3 w-3 absolute -bottom-1 -left-1 text-purple-500" />
            </div>
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Replicate Video Engine
            </span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Powered by Replicate • No Avatar Limits • Multiple Quality Engines • Unlimited Generation
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
            <CheckCircle className="h-3 w-3 mr-1" />
            Real Output
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            GPU Accelerated
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Star className="h-3 w-3 mr-1" />
            {quality}
          </Badge>
        </div>
      </div>

      {/* Prerequisites Check with Real Integration Status */}
      {!canGenerate && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Prerequisites Required
                </p>
                <div className="text-sm text-orange-600 dark:text-orange-300 space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    {project.avatar?.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    <span>Avatar: {project.avatar?.status === 'completed' ? 'Ready' : 'Missing or processing'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.voice?.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    <span>Voice: {project.voice?.status === 'completed' ? 'Ready' : 'Missing or processing'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Progress Tracking */}
      {project.video?.status === 'processing' && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header with Model Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      {project.video.metadata?.currentStage || 'Generating video with Replicate...'}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Using Replicate AI - This may take 2-5 minutes
                    </p>
                  </div>
                </div>
                
                {/* Model Attempt Badge */}
                {project.video.metadata?.engineAttempt && project.video.metadata?.totalEngines && (
                  <Badge variant="outline" className="text-xs shrink-0 ml-2">
                    Model {project.video.metadata.engineAttempt}/{project.video.metadata.totalEngines}
                  </Badge>
                )}
              </div>
              
              {/* Last Error Alert */}
              {project.video.metadata?.lastError && (
                <Alert className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/30 py-2">
                  <AlertCircle className="h-3 w-3 text-orange-500" />
                  <AlertDescription className="text-xs text-orange-700 dark:text-orange-300">
                    {project.video.metadata.lastError}
                  </AlertDescription>
                </Alert>
              )}
              
              <Progress value={project.video?.metadata?.progress || 0} className="w-full" />
              <div className="text-xs text-right text-blue-600 dark:text-blue-400">
                {project.video?.metadata?.progress || 0}% complete
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {project.video?.status === 'error' && (
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-red-800 dark:text-red-200">
                    Video Generation Failed
                  </p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {project.video.metadata?.errorMessage || 'An error occurred during video generation'}
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleGenerateVideo}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Zap className="h-4 w-4 mr-2" />
                Retry Generation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engine Selection & Settings */}
        <div className="space-y-6">
          {/* Real AI Engine Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Replicate Engine Selection
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Choose your Replicate model - all produce real output with no avatar limits
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3">
                {VIDEO_ENGINES.map((engine) => (
                  <div
                    key={engine.id}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEngine === engine.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedEngine(engine.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <engine.icon className="h-5 w-5 text-primary" />
                        <div>
                          <div className="font-medium">{engine.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {engine.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs text-white ${engine.badgeColor}`}>
                          {engine.badge}
                        </Badge>
                        {engine.realOutput && (
                          <Badge className="text-xs bg-green-500 text-white">
                            Real
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {engine.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Video Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Professional Video Direction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the professional video style, behavior, and presentation approach... (e.g., Confident executive presentation with natural gestures, maintaining eye contact, professional posture, and engaging delivery)"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="min-h-32"
                maxLength={500}
              />
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>{videoPrompt.length}/500 characters</span>
                <span className="text-green-500">Professional direction</span>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Motion Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Motion & Expression Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Head Movement</span>
                    <span>{motionSettings.headMovement}%</span>
                  </div>
                  <Slider
                    value={[motionSettings.headMovement]}
                    onValueChange={([value]) => setMotionSettings(prev => ({ ...prev, headMovement: value }))}
                    max={100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Eye Contact</span>
                    <span>{motionSettings.eyeContact}%</span>
                  </div>
                  <Slider
                    value={[motionSettings.eyeContact]}
                    onValueChange={([value]) => setMotionSettings(prev => ({ ...prev, eyeContact: value }))}
                    max={100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Lip Sync Quality</span>
                    <span>{motionSettings.lipSync}%</span>
                  </div>
                  <Slider
                    value={[motionSettings.lipSync]}
                    onValueChange={([value]) => setMotionSettings(prev => ({ ...prev, lipSync: value }))}
                    max={100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Natural Blinking</span>
                    <span>{motionSettings.blinking}%</span>
                  </div>
                  <Slider
                    value={[motionSettings.blinking]}
                    onValueChange={([value]) => setMotionSettings(prev => ({ ...prev, blinking: value }))}
                    max={100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Expressions</span>
                    <span>{motionSettings.expressions}%</span>
                  </div>
                  <Slider
                    value={[motionSettings.expressions]}
                    onValueChange={([value]) => setMotionSettings(prev => ({ ...prev, expressions: value }))}
                    max={100}
                    className="h-2"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Gestures</span>
                    <span>{motionSettings.gestures}%</span>
                  </div>
                  <Slider
                    value={[motionSettings.gestures]}
                    onValueChange={([value]) => setMotionSettings(prev => ({ ...prev, gestures: value }))}
                    max={100}
                    className="h-2"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality & Export Settings */}
        <div className="space-y-6">
          {/* Professional Quality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Star className="h-5 w-5" />
                Professional Quality & Format
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Video Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUALITY_SETTINGS.map((setting) => (
                        <SelectItem key={setting.value} value={setting.value}>
                          <div>
                            <div className="font-medium">{setting.label}</div>
                            <div className="text-xs text-muted-foreground">{setting.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ASPECT_RATIOS.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          <div>
                            <div className="font-medium">{ratio.label}</div>
                            <div className="text-xs text-muted-foreground">{ratio.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Frame Rate</Label>
                  <Select value={fps.toString()} onValueChange={(value) => setFps(parseInt(value))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="24">24 FPS (Cinema)</SelectItem>
                      <SelectItem value="30">30 FPS (Standard)</SelectItem>
                      <SelectItem value="60">60 FPS (Ultra Smooth)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration</Label>
                  <div className="mt-1">
                    <Slider
                      value={[duration]}
                      onValueChange={([value]) => setDuration(value)}
                      min={5}
                      max={300}
                      step={5}
                      className="h-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">{duration} seconds</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Background */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Professional Background
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-3">
                {BACKGROUND_OPTIONS.map((bg) => (
                  <div
                    key={bg.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedBackground === bg.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedBackground(bg.id)}
                  >
                    <div className="font-medium text-sm">{bg.name}</div>
                    <div className="text-xs text-muted-foreground">{bg.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Enhancement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(advancedSettings).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => 
                      setAdvancedSettings(prev => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <Button
            onClick={handleGenerateVideo}
            disabled={!canGenerate || isProcessing}
            className="w-full h-14 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white font-semibold"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                <span className="flex flex-col items-start">
                  <span>Generating Real Video...</span>
                  <span className="text-xs opacity-90">
                    Combining avatar and voice
                  </span>
                </span>
              </>
            ) : (
              <>
                <Film className="h-5 w-5 mr-3" />
                <span className="flex flex-col items-start">
                  <span>Generate Real Video</span>
                  <span className="text-xs opacity-90">
                    With {selectedEngineData?.name}
                  </span>
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Real Video Result Display */}
      {project.video?.status === 'completed' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent font-bold">
                Real Video Generated
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  Quality: {project.video.quality} • Engine: {selectedEngineData?.name}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Real Output: ✓</span>
                  <span>Avatar Synced: ✓</span>
                  <span>Voice Synced: ✓</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                    Professional Video Ready
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary/40">
                  <Play className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary/40">
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </div>
            
            {project.video.videoUrl && (
              <div className="bg-muted/10 rounded-lg p-2 border border-border/30">
                <video controls className="w-full rounded-lg max-h-96">
                  <source src={project.video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Real generated video combining your avatar with voice and style
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Processing Status */}
      {project.video?.status === 'processing' && (
        <Card className="border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 text-yellow-500 animate-spin" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">
                    Real Video Generation in Progress
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    Processing your avatar and voice...
                  </p>
                </div>
              </div>
              
              <Progress value={50} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};