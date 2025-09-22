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
  AlertCircle
} from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface VideoEngineStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
}

const VIDEO_ENGINES = [
  {
    id: 'virtura-pro',
    name: 'Virtura Pro Engine',
    description: 'Our proprietary ultra-HD engine',
    badge: 'Premium',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    icon: Crown,
    features: ['8K Support', 'Neural Enhancement', 'Cinematic Effects']
  },
  {
    id: 'kling',
    name: 'KlingAI Engine',
    description: 'Motion diffusion for natural gestures',
    badge: 'Pro',
    badgeColor: 'bg-blue-500',
    icon: Brain,
    features: ['4K Support', 'Natural Motion', 'Face Reenactment']
  },
  {
    id: 'heygen',
    name: 'HeyGen Engine',
    description: 'Professional talking photo generation',
    badge: 'Standard',
    badgeColor: 'bg-green-500',
    icon: MonitorSpeaker,
    features: ['HD Support', 'Lip Sync', 'Fast Processing']
  },
  {
    id: 'runway',
    name: 'Runway Gen-3',
    description: 'Creative video generation with Gen-3 Alpha',
    badge: 'Creative',
    badgeColor: 'bg-orange-500',
    icon: Sparkles,
    features: ['4K Support', 'Creative Effects', 'Style Transfer']
  }
];

const QUALITY_SETTINGS = [
  { value: '720p', label: '720p HD', description: 'Fast processing' },
  { value: '1080p', label: '1080p Full HD', description: 'Standard quality' },
  { value: '4K', label: '4K Ultra HD', description: 'Premium quality' },
  { value: '8K', label: '8K Cinema', description: 'Ultimate quality' }
];

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1 Square', description: 'Instagram posts' },
  { value: '9:16', label: '9:16 Portrait', description: 'TikTok, Stories' },
  { value: '16:9', label: '16:9 Landscape', description: 'YouTube, TV' },
  { value: '4:5', label: '4:5 Vertical', description: 'Facebook, LinkedIn' }
];

const BACKGROUND_OPTIONS = [
  { id: 'studio', name: 'Professional Studio', preview: '/bg-studio.jpg' },
  { id: 'office', name: 'Modern Office', preview: '/bg-office.jpg' },
  { id: 'virtual', name: 'Virtual Set', preview: '/bg-virtual.jpg' },
  { id: 'transparent', name: 'Transparent/Green', preview: '/bg-transparent.jpg' },
  { id: 'custom', name: 'Custom Upload', preview: '/bg-custom.jpg' }
];

export const VideoEngineStudio: React.FC<VideoEngineStudioProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing
}) => {
  const [selectedEngine, setSelectedEngine] = useState('virtura-pro');
  const [videoPrompt, setVideoPrompt] = useState('Professional presentation with natural head movements and eye contact');
  const [quality, setQuality] = useState('4K');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [fps, setFps] = useState(30);
  const [duration, setDuration] = useState(30);
  const [selectedBackground, setSelectedBackground] = useState('studio');
  
  const [motionSettings, setMotionSettings] = useState({
    headMovement: 75,
    eyeContact: 85,
    expressions: 60,
    gestures: 40
  });

  const [advancedSettings, setAdvancedSettings] = useState({
    enableUltraHD: true,
    neuralEnhancement: true,
    cinematicEffects: true,
    realTimeSync: true,
    faceReenactment: true,
    colorGrading: true
  });

  const handleGenerateVideo = async () => {
    if (!project.avatar || !project.voice) {
      return;
    }

    await onGenerate({
      engine: selectedEngine,
      prompt: videoPrompt,
      quality,
      fps,
      ratio: aspectRatio,
      duration,
      background: selectedBackground,
      motionSettings,
      advancedSettings
    });
  };

  const canGenerate = project.avatar?.status === 'completed' && project.voice?.status === 'completed';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="relative">
              <Film className="h-6 w-6 text-primary" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-500" />
            </div>
            Video Engine
          </h2>
          <p className="text-muted-foreground">
            Ultra-HD video generation • Motion diffusion • Cinematic quality
          </p>
        </div>
        
        <div className="flex items-center gap-2">
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

      {/* Prerequisites Check */}
      {!canGenerate && (
        <Card className="border-orange-200 bg-orange-50/50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0" />
              <div>
                <p className="font-medium text-orange-800 dark:text-orange-200">
                  Prerequisites Required
                </p>
                <p className="text-sm text-orange-600 dark:text-orange-300">
                  {!project.avatar && 'Upload an avatar image. '}
                  {!project.voice && 'Generate voice audio. '}
                  Complete these steps to enable video generation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engine Selection & Settings */}
        <div className="space-y-6">
          {/* AI Engine Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">AI Engine Selection</CardTitle>
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
                      <Badge className={`text-xs text-white ${engine.badgeColor}`}>
                        {engine.badge}
                      </Badge>
                    </div>
                    <div className="flex gap-1 mt-2">
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

          {/* Video Prompt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Describe the video style and behavior... (e.g., Professional presentation with confident eye contact and subtle head movements)"
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                className="min-h-24"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {videoPrompt.length}/300 characters
              </p>
            </CardContent>
          </Card>

          {/* Motion & Expression Controls */}
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
          {/* Quality Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quality & Format</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quality</Label>
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
                      <SelectItem value="60">60 FPS (Smooth)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Duration (seconds)</Label>
                  <div className="mt-1">
                    <Slider
                      value={[duration]}
                      onValueChange={([value]) => setDuration(value)}
                      min={5}
                      max={120}
                      step={5}
                      className="h-2"
                    />
                    <div className="text-sm text-muted-foreground mt-1">{duration}s</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Background Scene</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
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
                    <div className="text-sm font-medium">{bg.name}</div>
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
                Advanced Settings
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

          <Button
            onClick={handleGenerateVideo}
            disabled={!canGenerate || isProcessing}
            className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                <span className="flex flex-col items-start">
                  <span>Generating Ultra-HD Video...</span>
                  <span className="text-xs opacity-90">Combining avatar and voice</span>
                </span>
              </>
            ) : (
              <>
                <Film className="h-4 w-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Video Generation Result */}
      {project.video?.status === 'completed' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold">
                Video Generated
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium text-foreground">Quality: {project.video.quality}</p>
                <p className="text-sm text-muted-foreground">
                  Engine: {VIDEO_ENGINES.find(e => e.id === project.video?.engine)?.name}
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">Video Ready</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary/40">
                  <Play className="h-4 w-4 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary/40">
                  <Settings className="h-4 w-4 mr-1" />
                  Adjust
                </Button>
              </div>
            </div>
            {project.video.videoUrl && (
              <div className="bg-muted/10 rounded-lg p-2 border border-border/30">
                <video controls className="w-full rounded-lg">
                  <source src={project.video.videoUrl} type="video/mp4" />
                </video>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};