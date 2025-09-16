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
import { ProjectStatusPanel } from './ProjectStatusPanel';
import { AvatarStudioNavigation } from './AvatarStudioNavigation';

interface TalkingAvatarStudioProps {
  onViewChange?: (view: string) => void;
}

export const TalkingAvatarStudio: React.FC<TalkingAvatarStudioProps> = ({ onViewChange }) => {
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            AI <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Video</span> Studio
          </h1>
          <p className="text-muted-foreground text-lg">
            Create professional talking avatar videos with AI
          </p>
        </div>
        
        {/* Navigation */}
        <AvatarStudioNavigation
          currentStep={currentStep}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onStepChange={setCurrentStep}
          canProceed={canProceedToNext()}
          isProcessing={isProcessing}
          avatarData={avatarData}
          generatedAudio={generatedAudio}
          generatedVideo={generatedVideo}
        />

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
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      Configure your talking avatar step by step
                    </span>
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
                      className="h-32 flex flex-col items-center gap-3 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                      onClick={() => onViewChange?.('studio')}
                    >
                      <Camera className="h-8 w-8 text-primary" />
                      <span className="font-medium">Generate AI Avatar</span>
                      <span className="text-xs text-muted-foreground text-center">
                        AI-powered creation
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
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      Configure your talking avatar step by step
                    </span>
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
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      Configure your talking avatar step by step
                    </span>
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
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Animation</Label>
                      <Select 
                        value={style.animation} 
                        onValueChange={(value) => updateStyle({ animation: value })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="subtle">Subtle</SelectItem>
                          <SelectItem value="dynamic">Dynamic</SelectItem>
                          <SelectItem value="static">Static</SelectItem>
                        </SelectContent>
                      </Select>
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
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      Configure your talking avatar step by step
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="video-prompt" className="text-base font-medium">Video Prompt</Label>
                    <Textarea
                      id="video-prompt"
                      placeholder="Describe the video style and behavior..."
                      value={videoPrompt}
                      onChange={(e) => setVideoPrompt(e.target.value)}
                      className="mt-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <Label className="text-base font-medium">Aspect Ratio</Label>
                      <Select 
                        value={exports.ratio} 
                        onValueChange={(value) => updateExports({ ratio: value as '9:16' | '1:1' | '16:9' })}
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
                        onValueChange={(value) => updateExports({ quality: parseInt(value) as 720 | 1080 })}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                          <SelectItem value="720p">720p (HD)</SelectItem>
                          <SelectItem value="4K">4K (Ultra HD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-4">
                    <h4 className="font-medium">Advanced Controls</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Burn-in Captions</span>
                          <p className="text-xs text-muted-foreground">Add permanent captions to video</p>
                        </div>
                        <Switch 
                          checked={exports.captions}
                          onCheckedChange={(checked) => updateExports({ captions: checked })}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <span className="font-medium">Transparent Background</span>
                          <p className="text-xs text-muted-foreground">Remove background for overlay</p>
                        </div>
                        <Switch 
                          checked={exports.transparent}
                          onCheckedChange={(checked) => updateExports({ transparent: checked })}
                        />
                      </div>
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
                    disabled={!videoPrompt.trim() || isProcessing || !generatedAudio}
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
                      <Label className="text-base font-medium text-green-800">Generated Video</Label>
                      <div className="mt-3 aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          src={generatedVideo}
                          controls
                          className="w-full h-full"
                          poster={uploadedFile ? URL.createObjectURL(uploadedFile) : undefined}
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
                    <span className="text-sm text-muted-foreground font-normal ml-2">
                      Configure your talking avatar step by step
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {finalVideo || generatedVideo ? (
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          src={finalVideo || generatedVideo || ''}
                          controls
                          className="w-full h-full"
                          poster={uploadedFile ? URL.createObjectURL(uploadedFile) : undefined}
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button onClick={downloadVideo} className="flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Button onClick={shareVideo} variant="outline" className="flex items-center gap-2">
                          <Share className="h-4 w-4" />
                          Share
                        </Button>
                        <Button onClick={saveToLibrary} variant="outline" className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save to Library
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Eye className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">No video generated yet</h3>
                      <p className="text-muted-foreground">
                        Complete the previous steps to generate your video
                      </p>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Button onClick={resetWorkflow} variant="outline" className="w-full">
                      Start New Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Enhanced Project Status */}
          <div className="lg:col-span-1">
            <ProjectStatusPanel
              currentStep={currentStep}
              job={job}
              isProcessing={isProcessing}
              avatarData={avatarData}
              generatedAudio={generatedAudio}
              generatedVideo={generatedVideo}
              voice={voice}
              style={style}
              exports={exports}
              onLibraryOpen={() => setShowLibrary(true)}
              onReset={resetWorkflow}
            />
          </div>
        </div>

        {/* Library Modal */}
        <AvatarLibraryModal
          open={showLibrary}
          onOpenChange={setShowLibrary}
          onSelectAvatar={handleLibrarySelect}
        />
      </div>
    </div>
  );
};