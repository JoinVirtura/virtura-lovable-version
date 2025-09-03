import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Download, 
  Upload, 
  Settings, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Mic,
  Video,
  Zap,
  Volume2,
  User,
  FileAudio,
  FileVideo,
  Scissors,
  Loader2
} from 'lucide-react';

interface VoiceConfig {
  mode: 'clone' | 'synthetic';
  voiceId: string;
  language: string;
  accent: string;
  gender: string;
  age: string;
  model: string;
  stability: number;
  similarity: number;
  style: number;
  script: string;
}

interface VideoConfig {
  engine: 'kling' | 'veo3';
  duration: number;
  prompt: string;
  avatarImage: string;
}

interface SyncConfig {
  engine: 'pixverse' | 'wav2lip';
  trimEnabled: boolean;
  trimStart: number;
  trimEnd: number;
}

export function TalkingAvatarWorkflow() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('voice');
  const [isProcessing, setIsProcessing] = useState(false);

  // Voice Configuration
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    mode: 'synthetic',
    voiceId: '9BWtsMINqrJLrRacOk9x', // Aria voice
    language: 'en',
    accent: 'american',
    gender: 'female',
    age: 'young_adult',
    model: 'eleven_multilingual_v2',
    stability: 0.5,
    similarity: 0.5,
    style: 0.0,
    script: 'Hello, this is a Virtura test. I\'m demonstrating our talking avatar technology with realistic lip-sync and natural voice synthesis.'
  });

  // Video Configuration
  const [videoConfig, setVideoConfig] = useState<VideoConfig>({
    engine: 'kling',
    duration: 10,
    prompt: 'Professional headshot style, good lighting, neutral background',
    avatarImage: ''
  });

  // Sync Configuration
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    engine: 'pixverse',
    trimEnabled: false,
    trimStart: 0,
    trimEnd: 10
  });

  // Generated assets
  const [generatedAudio, setGeneratedAudio] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [finalVideo, setFinalVideo] = useState<string>('');

  // Voice generation function
  const generateVoice = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-generate', {
        body: {
          script: voiceConfig.script,
          voiceId: voiceConfig.voiceId,
          model: voiceConfig.model,
          voiceSettings: {
            stability: voiceConfig.stability,
            similarity_boost: voiceConfig.similarity,
            style: voiceConfig.style,
            use_speaker_boost: true
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedAudio(data.audioData);
        toast({
          title: "Voice Generated",
          description: "Your voice has been successfully generated!",
        });
        setActiveTab('video');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Voice generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate voice",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Video generation function
  const generateVideo = async () => {
    if (!videoConfig.avatarImage) {
      toast({
        title: "Avatar Required",
        description: "Please select an avatar image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('video-generate', {
        body: {
          avatarImage: videoConfig.avatarImage,
          engine: videoConfig.engine,
          duration: videoConfig.duration,
          prompt: videoConfig.prompt
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedVideo(data.videoUrl);
        toast({
          title: "Video Generated",
          description: "Your video has been successfully generated!",
        });
        setActiveTab('sync');
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Video generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Sync function
  const syncAudioVideo = async () => {
    if (!generatedAudio || !generatedVideo) {
      toast({
        title: "Assets Required",
        description: "Please generate both audio and video first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('video-sync', {
        body: {
          audioUrl: generatedAudio,
          videoUrl: generatedVideo,
          engine: syncConfig.engine,
          trimSettings: syncConfig.trimEnabled ? {
            start: syncConfig.trimStart,
            end: syncConfig.trimEnd
          } : null
        }
      });

      if (error) throw error;

      if (data.success) {
        setFinalVideo(data.finalVideoUrl);
        toast({
          title: "Video Synced",
          description: "Your final video has been successfully created!",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync audio and video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const availableVoices = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'female', accent: 'american' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'male', accent: 'american' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'female', accent: 'american' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'female', accent: 'american' },
    { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', gender: 'male', accent: 'british' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'male', accent: 'american' }
  ];

  const downloadAudio = () => {
    if (generatedAudio) {
      const link = document.createElement('a');
      link.href = generatedAudio;
      link.download = 'generated-voice.mp3';
      link.click();
    }
  };

  const playAudio = () => {
    if (generatedAudio) {
      const audio = new Audio(generatedAudio);
      audio.play();
    }
  };

  const handleAvatarImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoConfig(prev => ({ ...prev, avatarImage: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Talking Avatar Pipeline</h1>
            <p className="text-muted-foreground">Voice → Video → Lip-sync workflow</p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${generatedAudio ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Voice Complete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${generatedVideo ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Video Ready</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${finalVideo ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span className="text-sm">Pipeline Finished</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="voice" className="flex items-center space-x-2">
            <Mic className="w-4 h-4" />
            <span>Voice Creation</span>
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center space-x-2">
            <Video className="w-4 h-4" />
            <span>Video Creation</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Sync & Export</span>
          </TabsTrigger>
        </TabsList>

        {/* Voice Creation Tab */}
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="w-5 h-5 mr-2" />
                Voice Configuration
              </CardTitle>
              <CardDescription>Configure and generate voice using ElevenLabs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Voice Mode</Label>
                  <Select value={voiceConfig.mode} onValueChange={(value: 'clone' | 'synthetic') => 
                    setVoiceConfig(prev => ({ ...prev, mode: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="synthetic">Synthetic Voice</SelectItem>
                      <SelectItem value="clone">Voice Clone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Voice Selection</Label>
                  <Select value={voiceConfig.voiceId} onValueChange={(value) => 
                    setVoiceConfig(prev => ({ ...prev, voiceId: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name} ({voice.gender}, {voice.accent})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select value={voiceConfig.model} onValueChange={(value) => 
                    setVoiceConfig(prev => ({ ...prev, model: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eleven_multilingual_v2">Multilingual v2</SelectItem>
                      <SelectItem value="eleven_turbo_v2_5">Turbo v2.5</SelectItem>
                      <SelectItem value="eleven_turbo_v2">Turbo v2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Stability: {voiceConfig.stability}</Label>
                  <Slider
                    value={[voiceConfig.stability]}
                    onValueChange={([value]) => setVoiceConfig(prev => ({ ...prev, stability: value }))}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Similarity: {voiceConfig.similarity}</Label>
                  <Slider
                    value={[voiceConfig.similarity]}
                    onValueChange={([value]) => setVoiceConfig(prev => ({ ...prev, similarity: value }))}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Style: {voiceConfig.style}</Label>
                  <Slider
                    value={[voiceConfig.style]}
                    onValueChange={([value]) => setVoiceConfig(prev => ({ ...prev, style: value }))}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>TTS Script</Label>
                <Textarea
                  value={voiceConfig.script}
                  onChange={(e) => setVoiceConfig(prev => ({ ...prev, script: e.target.value }))}
                  placeholder="Enter the text you want to convert to speech..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={generateVoice} 
                  disabled={isProcessing || !voiceConfig.script}
                  className="flex-1"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Voice'
                  )}
                </Button>
                {generatedAudio && (
                  <>
                    <Button variant="outline" onClick={playAudio}>
                      <Play className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" onClick={downloadAudio}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>

              {generatedAudio && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">Voice generated successfully!</span>
                  </div>
                  <audio controls className="w-full mt-2">
                    <source src={generatedAudio} type="audio/mpeg" />
                  </audio>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Creation Tab */}
        <TabsContent value="video" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="w-5 h-5 mr-2" />
                Video Configuration
              </CardTitle>
              <CardDescription>Select avatar and configure video generation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Video Engine</Label>
                  <Select value={videoConfig.engine} onValueChange={(value: 'kling' | 'veo3') => 
                    setVideoConfig(prev => ({ ...prev, engine: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kling">Kling AI</SelectItem>
                      <SelectItem value="veo3">Veo3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Duration (seconds)</Label>
                  <Input
                    type="number"
                    value={videoConfig.duration}
                    onChange={(e) => setVideoConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min={5}
                    max={30}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Avatar Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {videoConfig.avatarImage ? (
                    <div className="space-y-2">
                      <img 
                        src={videoConfig.avatarImage} 
                        alt="Selected avatar" 
                        className="w-32 h-32 object-cover rounded-lg mx-auto"
                      />
                      <p className="text-sm text-green-600">Avatar image selected</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Upload avatar image or select from library
                      </p>
                    </>
                  )}
                  <div className="flex space-x-2 mt-2 justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarImageUpload}
                      className="hidden"
                      id="avatar-upload"
                    />
                    <Button variant="outline" size="sm" asChild>
                      <label htmlFor="avatar-upload" className="cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Image
                      </label>
                    </Button>
                    <Button variant="outline" size="sm">
                      <User className="w-4 h-4 mr-2" />
                      Select from Library
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Video Prompt</Label>
                <Textarea
                  value={videoConfig.prompt}
                  onChange={(e) => setVideoConfig(prev => ({ ...prev, prompt: e.target.value }))}
                  placeholder="Describe the video style and setting..."
                  className="min-h-[100px]"
                />
              </div>

              <Button 
                onClick={generateVideo} 
                disabled={isProcessing || !videoConfig.avatarImage}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  'Generate Video'
                )}
              </Button>

              {generatedVideo && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">Video generated successfully!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">Video URL: {generatedVideo}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sync & Export Tab */}
        <TabsContent value="sync" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Sync Configuration
              </CardTitle>
              <CardDescription>Combine audio and video with lip-sync</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sync Engine</Label>
                  <Select value={syncConfig.engine} onValueChange={(value: 'pixverse' | 'wav2lip') => 
                    setSyncConfig(prev => ({ ...prev, engine: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pixverse">Pixverse</SelectItem>
                      <SelectItem value="wav2lip">Wav2Lip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="trim-enabled"
                    checked={syncConfig.trimEnabled}
                    onCheckedChange={(checked) => setSyncConfig(prev => ({ ...prev, trimEnabled: checked }))}
                  />
                  <Label htmlFor="trim-enabled">Enable Trimming</Label>
                </div>
              </div>

              {syncConfig.trimEnabled && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Trim Start (seconds)</Label>
                    <Input
                      type="number"
                      value={syncConfig.trimStart}
                      onChange={(e) => setSyncConfig(prev => ({ ...prev, trimStart: parseInt(e.target.value) }))}
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Trim End (seconds)</Label>
                    <Input
                      type="number"
                      value={syncConfig.trimEnd}
                      onChange={(e) => setSyncConfig(prev => ({ ...prev, trimEnd: parseInt(e.target.value) }))}
                      min={0}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileAudio className="w-4 h-4" />
                      <span className="font-medium">Audio Asset</span>
                    </div>
                    {generatedAudio ? (
                      <div className="text-sm text-green-600">✓ Audio ready</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Generate audio first</div>
                    )}
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileVideo className="w-4 h-4" />
                      <span className="font-medium">Video Asset</span>
                    </div>
                    {generatedVideo ? (
                      <div className="text-sm text-green-600">✓ Video ready</div>
                    ) : (
                      <div className="text-sm text-muted-foreground">Generate video first</div>
                    )}
                  </div>
                </div>
              </div>

              <Button 
                onClick={syncAudioVideo} 
                disabled={isProcessing || !generatedAudio || !generatedVideo}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  'Create Final Video'
                )}
              </Button>

              {finalVideo && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-green-700 font-medium">Final video created successfully!</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">Final Video URL: {finalVideo}</p>
                  <div className="flex space-x-2 mt-3">
                    <Button size="sm" variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}