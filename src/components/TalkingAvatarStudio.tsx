import React, { useState } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Library
} from 'lucide-react';
import { useTalkingAvatar } from '@/hooks/useTalkingAvatar';
import { initialVoice, initialStyle, initialExports } from '@/features/talking-avatar/store';
import { AvatarLibraryModal } from './AvatarLibraryModal';
import { AudioPlayerWithControls } from './AudioPlayerWithControls';
import { TalkingAvatarWorkflow } from './TalkingAvatarWorkflow';

export const TalkingAvatarStudio = () => {
  const [script, setScript] = useState('');
  const [videoPrompt, setVideoPrompt] = useState('Create a natural talking video with professional presentation style');
  const [showLibrary, setShowLibrary] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const {
    uploadedFile,
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

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return !!uploadedFile;
      case 2: return !!generatedAudio;
      case 3: return true; // Style step always allows proceeding
      case 4: return !!generatedVideo;
      case 5: return true; // Final step
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
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Talking Avatar Studio
        </h1>
        <p className="text-muted-foreground mt-2">
          Create professional talking avatar videos with AI
        </p>
      </div>

      {/* Workflow Component */}
      <TalkingAvatarWorkflow
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        job={job}
        isProcessing={isProcessing}
        onNext={handleNext}
        onPrevious={handlePrevious}
        canProceed={canProceedToNext()}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step-based Content */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Avatar Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center gap-2"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="h-6 w-6" />
                    Upload Image
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center gap-2"
                    onClick={() => setShowLibrary(true)}
                  >
                    <Library className="h-6 w-6" />
                    From Library
                  </Button>
                  <Button
                    variant="outline"
                    className="h-24 flex flex-col items-center gap-2"
                    disabled
                  >
                    <Camera className="h-6 w-6" />
                    Generate AI Avatar
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
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm">{uploadedFile.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLibrary(true)}
                    >
                      Replace
                    </Button>
                  </div>
                )}

                {uploadedFile && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={URL.createObjectURL(uploadedFile)} 
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  Voice Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="script">Script</Label>
                  <Textarea
                    id="script"
                    placeholder="Enter your script here..."
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="min-h-24"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Voice</Label>
                    <Select value={voice.voiceId} onValueChange={(value) => updateVoice({ voiceId: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9BWtsMINqrJLrRacOk9x">Aria (Expressive)</SelectItem>
                        <SelectItem value="IKne3meq5aSn9XLyUdCD">Freya (Conversational)</SelectItem>
                        <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Professional)</SelectItem>
                        <SelectItem value="pNInz6obpgDQGcFmaJgB">Adam (Confident)</SelectItem>
                        <SelectItem value="TxGEqnHWrfWFTfGW9XjX">Josh (Deep)</SelectItem>
                        <SelectItem value="VR6AewLTigWG4xSOukaG">Arnold (Authoritative)</SelectItem>
                        <SelectItem value="21m00Tcm4TlvDq8ikWAM">Rachel (Warm)</SelectItem>
                        <SelectItem value="AZnzlk1XvdvUeBnXmlld">Domi (Professional)</SelectItem>
                        <SelectItem value="ErXwobaYiN019PkySvjV">Antoni (Narrative)</SelectItem>
                        <SelectItem value="MF3mGyEYCl7XYWbV9V6O">Elli (Energetic)</SelectItem>
                        <SelectItem value="XrExE9yKIg1WjnnlVkGX">Matilda (Friendly)</SelectItem>
                        <SelectItem value="jsCqWAovK2LkecY7zXl4">Freya (Clear)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Language</Label>
                    <Select value={voice.language} onValueChange={(value) => updateVoice({ language: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="it">Italian</SelectItem>
                        <SelectItem value="pt">Portuguese</SelectItem>
                        <SelectItem value="pl">Polish</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="ko">Korean</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Emotion ({voice.emotion}%)</Label>
                    <Slider
                      value={[voice.emotion]}
                      onValueChange={(value) => updateVoice({ emotion: value[0] })}
                      max={100}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Speed ({voice.speed}x)</Label>
                    <Slider
                      value={[voice.speed]}
                      onValueChange={(value) => updateVoice({ speed: value[0] })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Pitch ({voice.pitch}x)</Label>
                    <Slider
                      value={[voice.pitch]}
                      onValueChange={(value) => updateVoice({ pitch: value[0] })}
                      min={0.5}
                      max={2}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => generateAudio(script)}
                    disabled={!script.trim() || isProcessing}
                    className="flex-1"
                  >
                    <Mic className="h-4 w-4 mr-2" />
                    Generate Voice
                  </Button>
                </div>

                {generatedAudio && (
                  <div className="mt-4">
                    <Label>Generated Audio</Label>
                    <AudioPlayerWithControls audioUrl={generatedAudio} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Style & Effects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Style Preset</Label>
                    <Select value={style.preset} onValueChange={(value) => updateStyle({ preset: value })}>
                      <SelectTrigger>
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
                    <Label>Look Mode</Label>
                    <Select value={style.lookMode} onValueChange={(value) => updateStyle({ lookMode: value as any })}>
                      <SelectTrigger>
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
                  <Label>Background</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {['blur', 'solid', 'upload', 'green'].map((bg) => (
                      <Button
                        key={bg}
                        variant={style.bg === bg ? 'default' : 'outline'}
                        onClick={() => updateStyle({ bg: bg as any })}
                        className="h-16 capitalize"
                      >
                        {bg}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label>Key Lighting ({style.lighting.key}%)</Label>
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
                    <Label>Fill Lighting ({style.lighting.fill}%)</Label>
                    <Slider
                      value={[style.lighting.fill]}
                      onValueChange={(value) => updateStyle({ 
                        lighting: { ...style.lighting, fill: value[0] } 
                      })}
                      max={100}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Camera FOV ({style.camera.fov}°)</Label>
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

          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Video Generation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="videoPrompt">Video Prompt</Label>
                  <Textarea
                    id="videoPrompt"
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe the style and mood for your video..."
                    className="min-h-20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Aspect Ratio</Label>
                    <Select value={exports.ratio} onValueChange={(value) => updateExports({ ratio: value as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                        <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Quality</Label>
                    <Select value={exports.quality.toString()} onValueChange={(value) => updateExports({ quality: Number(value) as any })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="720">720p</SelectItem>
                        <SelectItem value="1080">1080p</SelectItem>
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

                <Button
                  onClick={() => generateVideo(videoPrompt)}
                  disabled={!uploadedFile || !generatedAudio || isProcessing}
                  className="w-full h-12"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Generate Video
                </Button>
              </CardContent>
            </Card>
          )}

          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Preview & Export
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedVideo && (
                  <div>
                    <Label>Generated Video</Label>
                    <div className="mt-2 aspect-video bg-muted rounded-lg flex items-center justify-center">
                      <video 
                        src={generatedVideo} 
                        controls 
                        className="w-full h-full rounded-lg"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={downloadVideo} disabled={!generatedVideo} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={shareVideo} disabled={!generatedVideo} variant="outline" className="flex-1">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={saveToLibrary} disabled={!generatedVideo} variant="outline" className="flex-1">
                    <Save className="h-4 w-4 mr-2" />
                    Save to Library
                  </Button>
                </div>

                <Button onClick={resetWorkflow} variant="outline" className="w-full">
                  Start New Project
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Avatar</span>
                {uploadedFile ? (
                  <Badge variant="default">Ready</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Audio</span>
                {generatedAudio ? (
                  <Badge variant="default">Generated</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Video</span>
                {generatedVideo ? (
                  <Badge variant="default">Generated</Badge>
                ) : (
                  <Badge variant="secondary">Pending</Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {(generatedVideo || finalVideo) && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <video 
                    src={finalVideo || generatedVideo} 
                    controls 
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Avatar Library Modal */}
      <AvatarLibraryModal 
        open={showLibrary}
        onOpenChange={setShowLibrary}
        onSelectAvatar={handleLibrarySelect}
      />
    </div>
  );
};