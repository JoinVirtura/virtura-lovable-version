import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  Play, 
  Pause, 
  Download, 
  Share, 
  Save,
  User,
  Mic,
  Palette,
  Video,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Camera,
  Library,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Settings,
  Loader2
} from 'lucide-react';
import { useTalkingAvatar } from '@/hooks/useTalkingAvatar';
import { initialVoice, initialStyle, initialExports } from '@/features/talking-avatar/store';
import { AvatarLibraryModal } from './AvatarLibraryModal';
import { AudioPlayerWithControls } from './AudioPlayerWithControls';

export const TalkingAvatarStudio = () => {
  const [script, setScript] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('Create a natural talking video with professional presentation style');
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [voiceProgress, setVoiceProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);

  const {
    uploadedFile,
    avatarData,
    voice,
    style,
    exports,
    generatedAudio,
    generatedVideo,
    finalVideo,
    job,
    isProcessing,
    handleFileUpload,
    updateVoice,
    updateStyle,
    updateExports,
    generateAudio,
    generateVideo,
    syncAudioVideo,
    downloadVideo,
    shareVideo,
    saveToLibrary,
    resetWorkflow,
  } = useTalkingAvatar(initialVoice, initialStyle, initialExports);

  // Voice generation progress simulation
  useEffect(() => {
    if (isProcessing && currentStep === 2) {
      const interval = setInterval(() => {
        setVoiceProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      return () => clearInterval(interval);
    } else if (!isProcessing) {
      setVoiceProgress(generatedAudio ? 100 : 0);
    }
  }, [isProcessing, currentStep, generatedAudio]);

  // Video generation progress simulation
  useEffect(() => {
    if (isProcessing && currentStep === 4) {
      const interval = setInterval(() => {
        setVideoProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 8;
        });
      }, 700);

      return () => clearInterval(interval);
    } else if (!isProcessing) {
      setVideoProgress(generatedVideo ? 100 : 0);
    }
  }, [isProcessing, currentStep, generatedVideo]);

  const WORKFLOW_STEPS = [
    { id: 1, title: 'Avatar Selection', description: 'Choose or upload your avatar image', icon: User },
    { id: 2, title: 'Voice Configuration', description: 'Select voice and generate audio', icon: Mic },
    { id: 3, title: 'Style & Effects', description: 'Configure visual style and effects', icon: Palette },
    { id: 4, title: 'Video Generation', description: 'Generate your talking avatar video', icon: Video },
    { id: 5, title: 'Preview & Export', description: 'Review and export your video', icon: Eye },
  ];

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return !!(uploadedFile || avatarData);
      case 2: return !!script.trim();
      case 3: return true;
      case 4: return !!videoPrompt.trim();
      case 5: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleLibrarySelect = (avatarUrl: string) => {
    fetch(avatarUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
        handleFileUpload(file);
      });
    setShowLibrary(false);
  };

  const getStepIcon = (stepId: number) => {
    if (stepId < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepId === currentStep) {
      return <Clock className="h-5 w-5 text-primary animate-pulse" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />;
    }
  };

  const currentStepInfo = WORKFLOW_STEPS[currentStep - 1];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
          Avatar Studio
        </h1>
        <p className="text-muted-foreground text-lg">
          Create professional talking avatar videos with AI
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="border-primary/20 bg-gradient-to-r from-background to-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-6">
            {WORKFLOW_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 ${
                    step.id <= currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => step.id <= currentStep && setCurrentStep(step.id)}
                >
                  <div className={`p-3 rounded-full mb-2 transition-all duration-300 ${
                    step.id === currentStep 
                      ? 'bg-primary text-primary-foreground shadow-lg' 
                      : step.id < currentStep 
                        ? 'bg-green-500 text-white' 
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-center max-w-20 leading-tight">
                    {step.title}
                  </span>
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    step.id < currentStep ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="text-center">
            <h2 className="text-xl font-semibold text-primary mb-1">
              {currentStepInfo?.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentStepInfo?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {/* Step 1: Avatar Selection */}
          {currentStep === 1 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-6 w-6 text-primary" />
                  Avatar Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="h-8 w-8 text-primary" />
                    <span className="font-medium">Upload Image</span>
                    <span className="text-xs text-muted-foreground text-center">
                      JPG, PNG up to 10MB
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    onClick={() => setShowLibrary(true)}
                  >
                    <Library className="h-8 w-8 text-primary" />
                    <span className="font-medium">From Library</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Pre-made avatars
                    </span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="h-32 flex flex-col items-center gap-3 opacity-50"
                    disabled
                  >
                    <Camera className="h-8 w-8" />
                    <span className="font-medium">Generate AI Avatar</span>
                    <span className="text-xs text-muted-foreground text-center">
                      Coming soon
                    </span>
                  </Button>
                </div>
                
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                />

                {uploadedFile && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <div className="flex-1">
                        <span className="font-medium text-green-800">{uploadedFile.name}</span>
                        <p className="text-sm text-green-600">Avatar ready for video generation</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowLibrary(true)}
                        className="border-green-300 text-green-700 hover:bg-green-100"
                      >
                        Replace
                      </Button>
                    </div>

                    <div className="aspect-video bg-muted rounded-lg overflow-hidden border">
                      <img 
                        src={URL.createObjectURL(uploadedFile)} 
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Voice Configuration */}
          {currentStep === 2 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mic className="h-6 w-6 text-primary" />
                  Voice Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="script" className="text-base font-medium">Script</Label>
                  <Textarea
                    id="script"
                    placeholder="Enter your script here... (e.g., Hello! Welcome to my presentation.)"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="min-h-24 mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {script.length}/1000 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Voice Selection</Label>
                    <Select 
                      value={voice.voiceId} 
                      onValueChange={(value) => updateVoice({ voiceId: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9BWtsMINqrJLrRacOk9x">Aria (Expressive Female)</SelectItem>
                        <SelectItem value="IKne3meq5aSn9XLyUdCD">Freya (Conversational Female)</SelectItem>
                        <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Professional Female)</SelectItem>
                        <SelectItem value="pNInz6obpgDQGcFmaJgB">Adam (Confident Male)</SelectItem>
                        <SelectItem value="TxGEqnHWrfWFTfGW9XjX">Josh (Deep Male)</SelectItem>
                        <SelectItem value="VR6AewLTigWG4xSOukaG">Arnold (Authoritative Male)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Language</Label>
                    <Select 
                      value={voice.language} 
                      onValueChange={(value) => updateVoice({ language: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Emotion: {voice.emotion}%</Label>
                    <Slider
                      value={[voice.emotion]}
                      onValueChange={(value) => updateVoice({ emotion: value[0] })}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Speed: {voice.speed}x</Label>
                    <Slider
                      value={[voice.speed]}
                      onValueChange={(value) => updateVoice({ speed: value[0] })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>

                {/* Voice Generation Progress */}
                {isProcessing && currentStep === 2 && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Generating voice...</span>
                      <span>{Math.round(voiceProgress)}%</span>
                    </div>
                    <Progress value={voiceProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={() => generateAudio(script)}
                  disabled={!script.trim() || isProcessing}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Voice...
                    </>
                  ) : (
                    <>
                      <Mic className="h-5 w-5 mr-2" />
                      Generate Voice
                    </>
                  )}
                </Button>

                {generatedAudio && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Label className="text-base font-medium text-green-800">Generated Audio</Label>
                    <div className="mt-2">
                      <AudioPlayerWithControls audioUrl={generatedAudio} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Style & Effects */}
          {currentStep === 3 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Palette className="h-6 w-6 text-primary" />
                  Style & Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Style Preset</Label>
                    <Select 
                      value={style.preset} 
                      onValueChange={(value) => updateStyle({ preset: value })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="casual">Casual</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="corporate">Corporate</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Look Mode</Label>
                    <Select 
                      value={style.lookMode} 
                      onValueChange={(value) => updateStyle({ lookMode: value as any })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realistic">Realistic</SelectItem>
                        <SelectItem value="pixar">Pixar Style</SelectItem>
                        <SelectItem value="vintage">Vintage</SelectItem>
                        <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                        <SelectItem value="anime">Anime</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label className="text-base font-medium">Background</Label>
                  <div className="grid grid-cols-4 gap-3 mt-3">
                    {[
                      { key: 'blur', label: 'Blur', desc: 'Blurred background' },
                      { key: 'solid', label: 'Solid', desc: 'Solid color' },
                      { key: 'upload', label: 'Custom', desc: 'Upload your own' },
                      { key: 'green', label: 'Green Screen', desc: 'Transparent' }
                    ].map((bg) => (
                      <Button
                        key={bg.key}
                        variant={style.bg === bg.key ? 'default' : 'outline'}
                        onClick={() => updateStyle({ bg: bg.key as any })}
                        className="h-20 flex flex-col gap-1 p-2"
                      >
                        <span className="font-medium">{bg.label}</span>
                        <span className="text-xs opacity-70">{bg.desc}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Key Lighting: {style.lighting.key}%</Label>
                    <Slider
                      value={[style.lighting.key]}
                      onValueChange={(value) => updateStyle({ 
                        lighting: { ...style.lighting, key: value[0] } 
                      })}
                      max={100}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Camera FOV: {style.camera.fov}°</Label>
                    <Slider
                      value={[style.camera.fov]}
                      onValueChange={(value) => updateStyle({ 
                        camera: { ...style.camera, fov: value[0] } 
                      })}
                      min={20}
                      max={80}
                      className="mt-2"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Video Generation */}
          {currentStep === 4 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Video className="h-6 w-6 text-primary" />
                  Video Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="videoPrompt" className="text-base font-medium">Video Prompt</Label>
                  <Textarea
                    id="videoPrompt"
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe the style and mood for your video..."
                    className="min-h-20 mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-medium">Aspect Ratio</Label>
                    <Select 
                      value={exports.ratio} 
                      onValueChange={(value) => updateExports({ ratio: value as any })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium">Quality</Label>
                    <Select 
                      value={exports.quality.toString()} 
                      onValueChange={(value) => updateExports({ quality: parseInt(value) as any })}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720">720p (HD)</SelectItem>
                        <SelectItem value="1080">1080p (Full HD)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="captions" 
                      checked={exports.captions}
                      onCheckedChange={(checked) => updateExports({ captions: checked })}
                    />
                    <Label htmlFor="captions">Burn-in captions</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="transparent" 
                      checked={exports.transparent}
                      onCheckedChange={(checked) => updateExports({ transparent: checked })}
                    />
                    <Label htmlFor="transparent">Transparent background</Label>
                  </div>
                </div>

                {/* Video Generation Progress */}
                {isProcessing && currentStep === 4 && (
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Generating video...</span>
                      <span>{Math.round(videoProgress)}%</span>
                    </div>
                    <Progress value={videoProgress} className="h-2" />
                  </div>
                )}

                <Button
                  onClick={() => generateVideo(videoPrompt)}
                  disabled={!videoPrompt.trim() || !avatarData || isProcessing}
                  className="w-full h-12 text-lg"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video className="h-5 w-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>

                {generatedVideo && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <Label className="text-base font-medium text-green-800">Video Preview</Label>
                    <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden">
                      <video 
                        src={generatedVideo} 
                        controls 
                        className="w-full h-full"
                        poster={avatarData?.original_image_url}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 5: Preview & Export */}
          {currentStep === 5 && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-primary" />
                  Preview & Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {(generatedVideo || finalVideo) ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video 
                        src={finalVideo || generatedVideo} 
                        controls 
                        className="w-full h-full"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button onClick={downloadVideo} className="h-12">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button onClick={shareVideo} variant="outline" className="h-12">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button onClick={saveToLibrary} variant="outline" className="h-12">
                        <Save className="h-4 w-4 mr-2" />
                        Save to Library
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Video className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground">
                      Complete the previous steps to see your video preview
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <Button 
                    onClick={resetWorkflow} 
                    variant="outline" 
                    className="w-full"
                  >
                    Start New Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar - Project Status */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Project Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avatar</span>
                  <Badge variant={avatarData ? 'default' : 'secondary'}>
                    {avatarData ? 'Ready' : 'Pending'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Audio</span>
                  <Badge variant={generatedAudio ? 'default' : 'secondary'}>
                    {generatedAudio ? 'Generated' : 'Pending'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Video</span>
                  <Badge variant={generatedVideo ? 'default' : 'secondary'}>
                    {generatedVideo ? 'Generated' : 'Pending'}
                  </Badge>
                </div>
              </div>

              {/* Current Settings Summary */}
              <div className="border-t pt-4 space-y-2">
                <h4 className="text-sm font-medium">Current Settings</h4>
                <div className="text-xs space-y-1">
                  <div>Voice: {voice.voiceId === '9BWtsMINqrJLrRacOk9x' ? 'Aria' : 'Custom'}</div>
                  <div>Style: {style.preset}</div>
                  <div>Quality: {exports.quality}p</div>
                  <div>Ratio: {exports.ratio}</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="border-t pt-4 space-y-2">
                <h4 className="text-sm font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => setShowLibrary(true)}
                  >
                    <Library className="h-4 w-4 mr-2" />
                    Browse Library
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={resetWorkflow}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reset Project
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1 || isProcessing}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Step {currentStep} of {WORKFLOW_STEPS.length}
            </div>
            
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext() || isProcessing || currentStep === 5}
              className="flex items-center gap-2"
            >
              {currentStep === WORKFLOW_STEPS.length ? 'Complete' : 'Next'}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Library Modal */}
      <AvatarLibraryModal
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelectAvatar={handleLibrarySelect}
      />
    </div>
  );
};