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
  CheckCircle
} from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import type { StudioProject } from '@/hooks/useStudioProject';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const togglePlayPreview = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
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
            {/* Script Editor */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Script Editor</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="script">Script Content</Label>
                    <Textarea
                      id="script"
                      placeholder="Enter your script here... The AI will generate ultra-realistic speech with emotional nuance."
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="min-h-32 mt-2"
                      maxLength={1000}
                    />
                    <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                      <span>{script.length}/1000 characters</span>
                      <span className="text-green-500">Auto-saved</span>
                    </div>
                  </div>

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

            {/* Voice Settings & Preview */}
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

                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-3">
                      <Volume2 className="h-4 w-4" />
                      <span className="font-medium">Voice Preview</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={togglePlayPreview}>
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                      <div className="flex-1 text-sm text-muted-foreground">
                        Sample: "Hello, I'm {PREMIUM_VOICES.find(v => v.id === selectedVoice)?.name}..."
                      </div>
                    </div>
                    <audio ref={audioRef} className="hidden">
                      <source src={PREMIUM_VOICES.find(v => v.id === selectedVoice)?.preview} type="audio/mpeg" />
                    </audio>
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
          <div className="text-center py-12">
            <Wand2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Voice Cloning</h3>
            <p className="text-muted-foreground mb-4">
              Upload 2-3 minutes of clear audio to clone your voice
            </p>
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Upload Voice Sample
            </Button>
          </div>
        </TabsContent>

        {/* Upload Audio Tab */}
        <TabsContent value="upload" className="space-y-6">
          <div className="text-center py-12">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Upload Audio</h3>
            <p className="text-muted-foreground mb-4">
              Upload your own recorded audio file
            </p>
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Choose Audio File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              className="hidden"
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Voice Generation Result */}
      {project.voice?.status === 'completed' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-primary/3 to-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold">
                Voice Generated
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              {/* Voice Details */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Voice Model: {PREMIUM_VOICES.find(v => v.id === selectedVoice)?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Language: {LANGUAGES.find(l => l.code === selectedLanguage)?.name}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">Generation Complete</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary/40">
                    <Play className="h-4 w-4 mr-1" />
                    Play
                  </Button>
                  <Button size="sm" variant="outline" className="border-primary/20 hover:bg-primary/10 hover:border-primary/40">
                    <Settings className="h-4 w-4 mr-1" />
                    Adjust
                  </Button>
                </div>
              </div>

              {/* Waveform Visualization */}
              <div className="bg-muted/20 rounded-lg p-4 border border-border/50">
                <div className="flex items-center gap-3 mb-3">
                  <Volume2 className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Voice Waveform</span>
                </div>
                <WaveformVisualizer
                  audioData={project.voice.audioUrl}
                  isPlaying={isPlaying}
                  width={400}
                  height={80}
                  className="w-full"
                />
              </div>

              {/* Audio Player */}
              {project.voice.audioUrl && (
                <div className="bg-muted/10 rounded-lg p-3 border border-border/30">
                  <audio controls className="w-full" ref={audioRef}>
                    <source src={project.voice.audioUrl} type="audio/mpeg" />
                  </audio>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};