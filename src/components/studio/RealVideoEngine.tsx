import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Film,
  Loader2,
  Zap,
  Sparkles,
  Crown,
  Brain,
  CheckCircle,
  AlertCircle,
  Download,
  Settings,
  Package
} from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { StudioProject } from '@/hooks/useStudioProject';

interface RealVideoEngineProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
  onDownload?: () => void;
  onSaveToLibrary?: () => void;
}

const VIDEO_ENGINES = [
  {
    id: 'bytedance-omni-human',
    name: 'ByteDance Omni-Human',
    description: 'Premium quality lip-sync',
    badge: 'Premium',
    badgeColor: 'bg-gradient-to-r from-purple-500 to-pink-500',
    icon: Crown,
    features: ['Best Quality', 'Natural Motion'],
    realOutput: true
  },
  {
    id: 'synthesys-wav2lip',
    name: 'Synthesys Wav2Lip',
    description: 'High-quality professional sync',
    badge: 'Pro',
    badgeColor: 'bg-blue-500',
    icon: Brain,
    features: ['4K Support', 'Fast Processing'],
    realOutput: true
  },
  {
    id: 'sonic',
    name: 'Sonic Fast',
    description: 'Budget-friendly fast generation',
    badge: 'Budget',
    badgeColor: 'bg-green-500',
    icon: Zap,
    features: ['Low Cost', 'Fast'],
    realOutput: true
  }
];

export const RealVideoEngine: React.FC<RealVideoEngineProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing,
  onDownload,
  onSaveToLibrary
}) => {
  const [selectedEngine, setSelectedEngine] = useState('bytedance-omni-human');
  const [videoPrompt, setVideoPrompt] = useState('Professional presentation with natural head movements and engaging body language.');
  const [quality, setQuality] = useState('4K');
  const [fps, setFps] = useState(30);
  const [duration, setDuration] = useState(30);
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState<string | undefined>(undefined);
  const [selectedExportPack, setSelectedExportPack] = useState<'social' | 'professional' | 'ad'>(
    (project?.export?.pack as 'social' | 'professional' | 'ad') || 'social'
  );
  const [primaryRatio, setPrimaryRatio] = useState<'1:1' | '9:16' | '16:9' | '4:5'>(
    (project?.video?.ratio as '1:1' | '9:16' | '16:9' | '4:5') || '9:16'
  );
  
  const [motionSettings, setMotionSettings] = useState({
    headMovement: 75,
    eyeContact: 85,
    expressions: 60,
    gestures: 40,
    lipSync: 95
  });

  const exportPacks = {
    social: {
      name: "Social Pack",
      icon: "📱",
      primaryRatio: "9:16" as const,
      formats: ["1:1", "9:16", "4:5"],
      features: ["Instagram Stories", "TikTok Ready", "Facebook Posts"],
      description: "Perfect for social media platforms"
    },
    professional: {
      name: "Professional Pack",
      icon: "💼",
      primaryRatio: "16:9" as const,
      formats: ["16:9", "4:5", "1:1"],
      features: ["LinkedIn Posts", "Presentations", "Website Headers"],
      description: "Ideal for business and professional content"
    },
    ad: {
      name: "Ad Pack",
      icon: "🎯",
      primaryRatio: "16:9" as const,
      formats: ["16:9", "9:16", "1:1", "4:5"],
      features: ["Google Ads", "Facebook Ads", "YouTube Covers"],
      description: "All formats for advertising campaigns"
    }
  };

  const PACK_PRIMARY_RATIOS: Record<string, '1:1' | '9:16' | '16:9' | '4:5'> = {
    social: '9:16',
    professional: '16:9',
    ad: '16:9'
  };

  useEffect(() => {
    if (selectedExportPack !== 'ad') {
      setPrimaryRatio(PACK_PRIMARY_RATIOS[selectedExportPack]);
    }
  }, [selectedExportPack]);

  const getRatioDimensions = (ratio: string): string => {
    const dims: Record<string, string> = {
      '1:1': '1080×1080',
      '9:16': '1080×1920',
      '16:9': '1920×1080',
      '4:5': '1080×1350'
    };
    return dims[ratio] || '1920×1080';
  };

  const handleGenerateVideo = async () => {
    const videoConfig = {
      engine: selectedEngine,
      prompt: videoPrompt,
      avatarImageUrl: project.avatar?.processedUrl || project.avatar?.originalUrl,
      audioUrl: project.voice?.audioUrl,
      backgroundMusic: project.voice?.backgroundMusic,
      ratio: primaryRatio,
      exportPack: selectedExportPack,
      settings: {
        quality,
        fps,
        duration,
        motionSettings
      }
    };

    onUpdate({
      video: {
        engine: selectedEngine as "virtura-pro" | "runway" | "heygen" | "kling",
        quality: quality as "720p" | "1080p" | "4K" | "8K",
        ratio: primaryRatio,
        fps: fps as 60 | 30 | 24,
        duration,
        motionSettings,
        status: 'processing',
        metadata: {
          frames: duration * fps,
          bitrate: quality === '8K' ? '50000k' : quality === '4K' ? '20000k' : '8000k'
        }
      },
      export: {
        ...project.export,
        pack: selectedExportPack,
        primaryRatio: primaryRatio
      } as any
    });

    await onGenerate(videoConfig);
  };

  const canGenerate = project.avatar?.status === 'completed' && 
    (project.voice?.status === 'completed' || project.voice?.status === 'skipped');
  const selectedEngineData = VIDEO_ENGINES.find(e => e.id === selectedEngine);

  return (
    <div className="space-y-4">
      {/* Prerequisites Check */}
      {!canGenerate && (
        <Card className="border-violet-500/20 bg-violet-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-violet-400" />
              <div>
                <p className="font-medium text-violet-200">Prerequisites Required</p>
                <div className="text-sm text-violet-300 space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    {project.avatar?.status === 'completed' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    <span>Avatar: {project.avatar?.status === 'completed' ? 'Ready' : 'Missing'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.voice?.status === 'completed' || project.voice?.status === 'skipped' ? (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    ) : (
                      <AlertCircle className="h-3 w-3" />
                    )}
                    <span>
                      Voice: {project.voice?.status === 'completed' 
                        ? 'Ready' 
                        : project.voice?.status === 'skipped' 
                        ? 'Skipped (Silent)' 
                        : 'Missing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Progress */}
      {project.video?.status === 'processing' && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                  <div>
                    <p className="font-medium text-blue-800 dark:text-blue-200">
                      {project.video.metadata?.currentStage || 'Generating video with Replicate...'}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-300">
                      Using Replicate AI - This may take 2-5 minutes
                    </p>
                  </div>
                </div>
                {project.video.metadata?.engineAttempt && project.video.metadata?.totalEngines && (
                  <Badge variant="outline" className="text-xs">
                    Model {project.video.metadata.engineAttempt}/{project.video.metadata.totalEngines}
                  </Badge>
                )}
              </div>
              {project.video.metadata?.lastError && (
                <Alert className="border-violet-500/20 bg-violet-950/30 py-2">
                  <AlertCircle className="h-3 w-3 text-violet-400" />
                  <AlertDescription className="text-xs text-violet-300">
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
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Video Generation Failed</p>
                  <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                    {project.video.metadata?.errorMessage || 'An error occurred'}
                  </p>
                </div>
              </div>
              <Button onClick={handleGenerateVideo} variant="outline" size="sm" className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Retry Generation
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Video Result - Prominent Success Display */}
      {project.video?.status === 'completed' && project.video?.videoUrl && (
        <Card className="border-green-500/30 bg-gradient-to-br from-green-500/10 to-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-500/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <div className="text-lg">Video Generated Successfully!</div>
                <div className="text-sm font-normal text-muted-foreground">Your video is ready to download or save</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <video 
              controls 
              className="w-full rounded-lg border border-green-500/20"
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            >
              <source src={project.video.videoUrl} type="video/mp4" />
            </video>
            
            {/* Primary Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                onClick={onDownload} 
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Video
              </Button>
              <Button 
                onClick={onSaveToLibrary} 
                size="lg"
                variant="outline"
                className="border-green-500/30 hover:bg-green-500/10"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Save to Library
              </Button>
            </div>

            {/* Next Steps Info */}
            <Alert className="border-green-500/30 bg-green-500/5">
              <Sparkles className="h-4 w-4 text-green-500" />
              <AlertDescription className="text-sm">
                <div className="font-medium mb-1">What's Next?</div>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Access your video anytime from the Library</li>
                  <li>• Need multiple formats? Use the Export page for multi-platform versions</li>
                  <li>• Share directly or integrate into your workflow</li>
                </ul>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}

      {/* Professional Video Direction */}
      <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-blue-900/5 border-blue-500/20">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Professional Video Direction</h3>
          <Textarea
            placeholder="Professional presentation with natural head movements and engaging body language."
            value={videoPrompt}
            onChange={(e) => setVideoPrompt(e.target.value)}
            className="min-h-32 bg-black/40 border-border"
            maxLength={500}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{videoPrompt.length}/500</span>
            <span className="text-green-500">Professional direction</span>
          </div>
        </div>
      </Card>

      {/* Export Pack Selection */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-purple-900/5 border-purple-500/20">
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold">Target Export Pack</h3>
          <Badge variant="outline" className="ml-auto">Determines Video Dimensions</Badge>
        </div>
        
        <div className="grid sm:grid-cols-3 gap-3 mb-4">
          {Object.entries(exportPacks).map(([key, pack]) => {
            const currentPrimaryRatio = key === 'ad' ? primaryRatio : pack.primaryRatio;
            
            return (
              <Card 
                key={key}
                className={`p-4 cursor-pointer transition-all ${
                  selectedExportPack === key 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'hover:border-purple-500/50'
                }`}
                onClick={() => setSelectedExportPack(key as any)}
              >
                <div className="font-medium mb-1 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{pack.name}</div>
                <div className="space-y-0.5 mb-3">
                  {pack.features.map((feature, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">{feature}</p>
                  ))}
                </div>

                {/* Available Formats */}
                <div className="pt-2 border-t border-purple-500/30">
                  <Label className="text-xs text-muted-foreground mb-2 block">Available Formats:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {pack.formats.map((format) => (
                  <Badge 
                    key={format}
                    variant="outline"
                    className="text-xs bg-purple-500/20 border-purple-500 text-purple-300"
                  >
                    {format}
                  </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {selectedExportPack === 'ad' && (
          <div className="mt-4 p-4 bg-background/50 rounded-lg">
            <Label className="text-sm mb-2 block">Primary Aspect Ratio (Native Generation)</Label>
            <Select value={primaryRatio} onValueChange={(v) => setPrimaryRatio(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="16:9">16:9 - Landscape (YouTube)</SelectItem>
                <SelectItem value="9:16">9:16 - Vertical (TikTok Ads)</SelectItem>
                <SelectItem value="1:1">1:1 - Square (Instagram Ads)</SelectItem>
                <SelectItem value="4:5">4:5 - Portrait (Facebook Ads)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-2">
              Choose which format to generate natively. Other formats will be smart-cropped at export.
            </p>
          </div>
        )}

      </Card>

      {/* Advanced Settings Accordion */}
      <Accordion 
        type="single" 
        collapsible 
        value={advancedSettingsOpen}
        onValueChange={setAdvancedSettingsOpen}
      >
        <AccordionItem value="advanced" className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline py-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="font-semibold">Advanced Settings</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pb-4">
            {/* Select Engine */}
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Select Engine
              </h3>
              <div className="space-y-2">
                {VIDEO_ENGINES.map((engine) => (
                  <div
                    key={engine.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedEngine === engine.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedEngine(engine.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <engine.icon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-sm">{engine.name}</span>
                      </div>
                      <Badge className={`text-xs text-white ${engine.badgeColor}`}>
                        {engine.badge}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Motion & Expression Controls */}
            <div className="space-y-3">
              <h3 className="font-semibold">Motion & Expression Controls</h3>
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500"
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500"
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
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Lip Sync</span>
                    <span>{motionSettings.lipSync}%</span>
                  </div>
                  <Slider
                    value={[motionSettings.lipSync]}
                    onValueChange={([value]) => setMotionSettings(prev => ({ ...prev, lipSync: value }))}
                    max={100}
                    className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500"
                  />
                </div>
              </div>
            </div>

            {/* Quality & Format */}
            <div className="space-y-3">
              <h3 className="font-semibold">Quality & Format</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs mb-2 block">Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger className="bg-black/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="720p">720p HD</SelectItem>
                      <SelectItem value="1080p">1080p Full HD</SelectItem>
                      <SelectItem value="4K">4K Ultra HD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs mb-2 block">FPS</Label>
                  <Select value={fps.toString()} onValueChange={(v) => setFps(parseInt(v))}>
                    <SelectTrigger className="bg-black/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border-border">
                      <SelectItem value="24">24 FPS</SelectItem>
                      <SelectItem value="30">30 FPS</SelectItem>
                      <SelectItem value="60">60 FPS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Generate Button */}
      <Button
        onClick={handleGenerateVideo}
        disabled={!canGenerate || isProcessing}
        className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating Video...
          </>
        ) : (
          <>
            <Film className="h-4 w-4 mr-2" />
            Generate Real Video
          </>
        )}
      </Button>
    </div>
  );
};
