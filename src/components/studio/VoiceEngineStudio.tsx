import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import {
  Mic,
  Upload,
  Volume2,
  Play,
  Pause,
  Loader2,
  Wand2,
  Heart,
  Smile,
  Frown,
  Zap,
  Brain,
  Languages,
  Settings,
  CheckCircle,
  X
} from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import type { StudioProject } from '@/hooks/useStudioProject';
import { useToast } from '@/hooks/use-toast';

interface VoiceEngineStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
}

const PREMIUM_VOICES = [
  {
    id: '9BWtsMINqrJLrRacOk9x',
    name: 'Aria',
    type: 'Professional Female',
    accent: 'American',
    description: 'Expressive, confident, perfect for business presentations',
    preview: '/voice-previews/aria.mp3'
  },
  {
    id: 'CwhRBWXzGAHq8TQ4Fs17',
    name: 'Roger',
    type: 'Executive Male',
    accent: 'British',
    description: 'Authoritative, mature, ideal for corporate content',
    preview: '/voice-previews/roger.mp3'
  },
  {
    id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Sarah',
    type: 'Young Professional',
    accent: 'American',
    description: 'Friendly, clear, great for tutorials and explainers',
    preview: '/voice-previews/sarah.mp3'
  }
];

const EMOTION_PRESETS = [
  { id: 'neutral', name: 'Neutral', icon: '😐', values: { joy: 0, sadness: 0, anger: 0, fear: 0, surprise: 0 } },
  { id: 'happy', name: 'Happy', icon: '😊', values: { joy: 80, sadness: 0, anger: 0, fear: 0, surprise: 20 } },
  { id: 'excited', name: 'Excited', icon: '🤩', values: { joy: 90, sadness: 0, anger: 0, fear: 0, surprise: 60 } },
  { id: 'professional', name: 'Professional', icon: '💼', values: { joy: 20, sadness: 0, anger: 0, fear: 0, surprise: 10 } },
  { id: 'persuasive', name: 'Persuasive', icon: '🎯', values: { joy: 40, sadness: 0, anger: 10, fear: 0, surprise: 30 } }
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' }
];

export const VoiceEngineStudio: React.FC<VoiceEngineStudioProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tts');
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('9BWtsMINqrJLrRacOk9x');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [selectedEmotion, setSelectedEmotion] = useState('professional');
  const [emotions, setEmotions] = useState({ joy: 20, sadness: 0, anger: 0, fear: 0, surprise: 10 });
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 75,
    clarity: 80,
    speed: 100,
    pitch: 100
  });
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [cloneFile, setCloneFile] = useState<File | null>(null);
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cloneInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleGenerateVoice = async () => {
    if (!script.trim()) return;

    await onGenerate({
      script,
      voiceId: selectedVoice,
      language: selectedLanguage,
      emotions,
      voiceSettings: {
        stability: voiceSettings.stability / 100,
        similarity_boost: voiceSettings.clarity / 100,
        style: emotions.joy / 100,
        use_speaker_boost: true
      }
    });
  };

  const handleEmotionPreset = (preset: any) => {
    setSelectedEmotion(preset.id);
    setEmotions(preset.values);
  };

  const togglePlayPreview = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setPreviewLoading(true);
      const { data, error } = await supabase.functions.invoke('voice-preview', {
        body: {
          voiceId: selectedVoice,
          text: `Hello, I'm ${PREMIUM_VOICES.find(v => v.id === selectedVoice)?.name}. This is a preview of my voice.`
        }
      });

      if (error) throw error;

      if (audioRef.current && data.audioData) {
        audioRef.current.src = data.audioData;
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Preview failed:', error);
      toast({
        title: "Preview unavailable",
        description: "Could not load voice preview",
        variant: "destructive"
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleCloneFileUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, M4A)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio file must be under 10MB",
        variant: "destructive"
      });
      return;
    }

    const audio = new Audio(URL.createObjectURL(file));
    audio.addEventListener('loadedmetadata', () => {
      if (audio.duration < 5 || audio.duration > 30) {
        toast({
          title: "Invalid duration",
          description: "Voice sample must be between 5-30 seconds",
          variant: "destructive"
        });
        return;
      }
      
      setCloneFile(file);
      toast({
        title: "Voice sample uploaded",
        description: "Voice cloning will be available in the next update"
      });
    });
  };

  const handleAudioUpload = async (file: File) => {
    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, M4A)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Audio file must be under 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadedAudio(file);
    const audioUrl = URL.createObjectURL(file);
    
    const audio = new Audio(audioUrl);
    audio.addEventListener('loadedmetadata', () => {
      onUpdate({
        voice: {
          type: 'upload',
          audioUrl: audioUrl,
          status: 'completed',
          metadata: {
            duration: Math.round(audio.duration)
          }
        }
      });
      
      toast({
        title: "Audio uploaded successfully",
        description: `${file.name} (${Math.round(audio.duration)}s)`
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <div className="relative">
              <Mic className="h-6 w-6 text-primary" />
              <Brain className="h-3 w-3 absolute -top-1 -right-1 text-purple-500" />
            </div>
            Voice Engine
          </h2>
          <p className="text-muted-foreground">
            Ultra-realistic AI voices • ElevenLabs • Multi-lingual • Emotional range
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Neural TTS
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Languages className="h-3 w-3 mr-1" />
            Multi-lingual
          </Badge>
        </div>
      </div>

      {/* Voice Generation Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tts" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Text-to-Speech
          </TabsTrigger>
          <TabsTrigger value="clone" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Voice Cloning
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload Audio
          </TabsTrigger>
        </TabsList>

        {/* Text-to-Speech Tab */}
        <TabsContent value="tts" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Script Editor */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Script Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Textarea
                      id="script"
                      placeholder="Enter your script here... The AI will generate ultra-realistic speech with emotional nuance."
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="min-h-32"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{script.length}/1000 characters</span>
                      <span className="text-green-500">Auto-saved</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Voice Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Language</Label>
                      <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {LANGUAGES.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              <div className="flex items-center gap-2">
                                <span>{lang.flag}</span>
                                <span>{lang.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Voice Model</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PREMIUM_VOICES.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div>
                                <div className="font-medium">{voice.name}</div>
                                <div className="text-xs text-muted-foreground">{voice.type}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Voice Preview */}
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Volume2 className="h-4 w-4" />
                      <span className="font-medium text-sm">Voice Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={togglePlayPreview} disabled={previewLoading}>
                        {previewLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <div className="flex-1 text-sm text-muted-foreground">
                        Sample: "Hello, I'm {PREMIUM_VOICES.find(v => v.id === selectedVoice)?.name}..."
                      </div>
                    </div>
                    <audio 
                      ref={audioRef} 
                      className="hidden"
                      onEnded={() => setIsPlaying(false)}
                      onError={() => setIsPlaying(false)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Emotional Range Controls */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    Emotional Range
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Emotion Presets</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {EMOTION_PRESETS.map((preset) => (
                        <Button
                          key={preset.id}
                          variant={selectedEmotion === preset.id ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleEmotionPreset(preset)}
                          className="h-auto p-2"
                        >
                          <div className="text-center">
                            <div className="text-lg mb-1">{preset.icon}</div>
                            <div className="text-xs">{preset.name}</div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Joy</span>
                        <span>{emotions.joy}%</span>
                      </div>
                      <Slider
                        value={[emotions.joy]}
                        onValueChange={([value]) => setEmotions(prev => ({ ...prev, joy: value }))}
                        max={100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Surprise</span>
                        <span>{emotions.surprise}%</span>
                      </div>
                      <Slider
                        value={[emotions.surprise]}
                        onValueChange={([value]) => setEmotions(prev => ({ ...prev, surprise: value }))}
                        max={100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Voice Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Stability</span>
                        <span>{voiceSettings.stability}%</span>
                      </div>
                      <Slider
                        value={[voiceSettings.stability]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, stability: value }))}
                        max={100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Clarity</span>
                        <span>{voiceSettings.clarity}%</span>
                      </div>
                      <Slider
                        value={[voiceSettings.clarity]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, clarity: value }))}
                        max={100}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Speed</span>
                        <span>{voiceSettings.speed}%</span>
                      </div>
                      <Slider
                        value={[voiceSettings.speed]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, speed: value }))}
                        min={50}
                        max={150}
                        className="h-2"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Pitch</span>
                        <span>{voiceSettings.pitch}%</span>
                      </div>
                      <Slider
                        value={[voiceSettings.pitch]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, pitch: value }))}
                        min={75}
                        max={125}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleGenerateVoice}
                disabled={!script.trim() || isProcessing}
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    <span className="flex flex-col items-start">
                      <span>Generating Ultra-HD Voice...</span>
                      <span className="text-xs opacity-90">AI speech synthesis in progress</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Generate Voice
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Voice Cloning Tab */}
        <TabsContent value="clone" className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Voice Cloning
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Clone any voice with 5-30 seconds of clear audio
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!cloneFile ? (
                <div 
                  className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => cloneInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <p className="font-medium mb-1">Upload Voice Sample</p>
                  <p className="text-sm text-muted-foreground">
                    MP3, WAV, or M4A • 5-30 seconds • Clear speech
                  </p>
                </div>
              ) : (
                <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{cloneFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(cloneFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCloneFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              <input
                ref={cloneInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCloneFileUpload(file);
                }}
                className="hidden"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Audio Tab */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-green/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Audio
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload your own pre-recorded audio file
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {!uploadedAudio ? (
                <div 
                  className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => uploadInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <p className="font-medium mb-1">Choose Audio File</p>
                  <p className="text-sm text-muted-foreground">
                    MP3, WAV, M4A • Up to 10MB • Any duration
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border border-primary/30 rounded-lg p-4 bg-primary/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Volume2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{uploadedAudio.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(uploadedAudio.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setUploadedAudio(null);
                          onUpdate({
                            voice: {
                              type: 'upload',
                              audioUrl: undefined,
                              status: 'pending'
                            }
                          });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {project.voice?.audioUrl && (
                    <div className="border border-primary/20 rounded-lg p-4">
                      <audio controls className="w-full">
                        <source src={project.voice.audioUrl} type={uploadedAudio.type} />
                      </audio>
                    </div>
                  )}
                </div>
              )}
              
              <input
                ref={uploadInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleAudioUpload(file);
                }}
                className="hidden"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Voice Generation Result */}
      {project.voice?.status === 'completed' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Voice Generated
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Voice</Label>
                <p className="font-medium">{PREMIUM_VOICES.find(v => v.id === selectedVoice)?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Language</Label>
                <p className="font-medium">{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <p className="font-medium">{typeof project.voice.metadata?.duration === 'number' ? `${project.voice.metadata.duration}s` : 'Unknown'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Quality</Label>
                <p className="font-medium">Ultra-HD</p>
              </div>
            </div>
            
            <div className="mt-2 p-3 bg-muted/30 rounded-lg border border-primary/20">
              <p className="text-xs text-muted-foreground text-center">
                🎵 Full audio player with waveform available in Voice Preview (right panel)
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};