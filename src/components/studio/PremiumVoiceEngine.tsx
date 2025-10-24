import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Mic,
  Upload,
  Volume2,
  Play,
  Pause,
  Loader2,
  Wand2,
  Crown,
  Star,
  Zap,
  Brain,
  Languages,
  Settings,
  CheckCircle,
  Download,
  FileAudio,
  Sparkles
} from 'lucide-react';
import { EnhancedWaveformVisualizer } from './EnhancedWaveformVisualizer';
import type { StudioProject } from '@/hooks/useStudioProject';

interface PremiumVoiceEngineProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
}

// Expanded Premium Voice Library (20 voices)
const PREMIUM_VOICES = [
  // Executive Voices
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', type: 'Executive Female', accent: 'American', description: 'Confident, authoritative, perfect for leadership content', category: 'executive', preview: '/voice-previews/aria.mp3' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', type: 'Executive Male', accent: 'British', description: 'Distinguished, mature, ideal for corporate presentations', category: 'executive', preview: '/voice-previews/roger.mp3' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', type: 'Executive Male', accent: 'American', description: 'Professional, commanding presence', category: 'executive', preview: '/voice-previews/liam.mp3' },
  
  // Creative Voices
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', type: 'Creative Female', accent: 'American', description: 'Friendly, engaging, great for tutorials and content creation', category: 'creative', preview: '/voice-previews/Sarah.mp3' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', type: 'Creative Female', accent: 'American', description: 'Warm, expressive, perfect for storytelling', category: 'creative', preview: '/voice-previews/jessica.mp3' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', type: 'Creative Female', accent: 'British', description: 'Artistic, melodic, ideal for creative content', category: 'creative', preview: '/voice-previews/lily.mp3' },
  
  // Narrator Voices
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', type: 'Narrator Male', accent: 'American', description: 'Deep, resonant, perfect for documentaries', category: 'narrator', preview: '/voice-previews/daniel.mp3' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', type: 'Narrator Male', accent: 'American', description: 'Rich, professional, ideal for audiobooks', category: 'narrator', preview: '/voice-previews/eric.mp3' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', type: 'Narrator Female', accent: 'British', description: 'Elegant, sophisticated narration', category: 'narrator', preview: '/voice-previews/charlotte.mp3' },
  
  // Character Voices
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', type: 'Character Male', accent: 'American', description: 'Versatile, animated, great for character work', category: 'character', preview: '/voice-previews/charlie.mp3' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', type: 'Character Female', accent: 'American', description: 'Playful, expressive, perfect for animations', category: 'character', preview: '/voice-previews/alice.mp3' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', type: 'Character Female', accent: 'British', description: 'Whimsical, charming character voice', category: 'character', preview: '/voice-previews/matilda.mp3' },
  
  // International Voices
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', type: 'International Male', accent: 'Australian', description: 'Clear, approachable, great for global content', category: 'international', preview: '/voice-previews/river.mp3' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', type: 'International Male', accent: 'Scottish', description: 'Distinctive, memorable accent', category: 'international', preview: '/voice-previews/callum.mp3' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', type: 'International Female', accent: 'Canadian', description: 'Neutral, professional international appeal', category: 'international', preview: '/voice-previews/laura.mp3' },
  
  // Young Professional Voices
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', type: 'Young Professional', accent: 'American', description: 'Modern, tech-savvy, great for startups', category: 'young', preview: '/voice-previews/george.mp3' },
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', type: 'Young Professional', accent: 'American', description: 'Dynamic, energetic, perfect for modern brands', category: 'young', preview: '/voice-previews/chris.mp3' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', type: 'Young Professional', accent: 'American', description: 'Fresh, contemporary voice', category: 'young', preview: '/voice-previews/brian.mp3' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', type: 'Young Professional', accent: 'American', description: 'Casual, approachable, modern tone', category: 'young', preview: '/voice-previews/bill.mp3' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', type: 'Young Professional', accent: 'American', description: 'Confident, millennial-friendly voice', category: 'young', preview: '/voice-previews/will.mp3' }
];

const VOICE_CATEGORIES = [
  { id: 'all', name: 'All Voices', icon: Volume2 },
  { id: 'executive', name: 'Executive', icon: Crown },
  { id: 'creative', name: 'Creative', icon: Sparkles },
  { id: 'narrator', name: 'Narrator', icon: FileAudio },
  { id: 'character', name: 'Character', icon: Star },
  { id: 'international', name: 'International', icon: Languages },
  { id: 'young', name: 'Young Pro', icon: Zap }
];

const ADVANCED_SETTINGS = {
  sampleRate: [22050, 44100, 48000, 96000],
  audioFormat: ['MP3', 'WAV', 'FLAC'],
  bitRate: [128, 192, 256, 320],
  compression: ['None', 'Light', 'Medium', 'Heavy'],
  effects: ['Reverb', 'EQ', 'Compressor', 'De-esser', 'Noise Gate']
};

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' }
];

export const PremiumVoiceEngine: React.FC<PremiumVoiceEngineProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('tts');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('9BWtsMINqrJLrRacOk9x');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 75,
    clarity: 85,
    speed: 100,
    pitch: 100,
    emotion: 50,
    emphasis: 30
  });

  const [audioSettings, setAudioSettings] = useState({
    sampleRate: 48000,
    format: 'WAV',
    bitRate: 320,
    compression: 'None',
    enableReverb: false,
    enableEQ: false,
    enableCompressor: true,
    enableDeEsser: false,
    enableNoiseGate: false
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const filteredVoices = PREMIUM_VOICES.filter(voice => 
    selectedCategory === 'all' || voice.category === selectedCategory
  );

  const handleGenerateVoice = async () => {
    if (!script.trim()) return;

    await onGenerate({
      script,
      voiceId: selectedVoice,
      language: selectedLanguage,
      voiceSettings: {
        stability: voiceSettings.stability / 100,
        similarity_boost: voiceSettings.clarity / 100,
        style: voiceSettings.emotion / 100,
        use_speaker_boost: true,
        speed: voiceSettings.speed / 100,
        pitch: voiceSettings.pitch / 100
      },
      audioSettings: {
        sample_rate: audioSettings.sampleRate,
        output_format: audioSettings.format.toLowerCase(),
        optimize_streaming_latency: 3,
        voice_settings: {
          stability: voiceSettings.stability / 100,
          similarity_boost: voiceSettings.clarity / 100,
          style: voiceSettings.emotion / 100,
          use_speaker_boost: audioSettings.enableCompressor
        }
      }
    });
  };

  const togglePlayPreview = async (voiceId?: string) => {
    const targetVoiceId = voiceId || selectedVoice;
    const voiceData = PREMIUM_VOICES.find(v => v.id === targetVoiceId);
    
    if (!voiceData) return;

    try {
      const sampleText = "Hello, this is a voice preview for your professional content.";
      
      if (audioRef.current) {
        audioRef.current.pause();
      }

      // Use edge function for voice preview
      const { data, error } = await supabase.functions.invoke('voice-preview', {
        body: {
          voiceId: targetVoiceId,
          text: sampleText
        }
      });

      if (error) throw error;

      if (data?.success && data?.audioData) {
        const audio = new Audio(data.audioData);
        audioRef.current = audio;
        
        await audio.play();
        setIsPlaying(true);
        
        audio.onended = () => {
          setIsPlaying(false);
        };
      } else {
        throw new Error('No audio data received');
      }
    } catch (error) {
      console.error('Preview playback failed:', error);
      toast({
        title: "Preview Failed",
        description: "Could not play voice preview. Voice generation will still work.",
        variant: "destructive"
      });
    }
  };

  const selectedVoiceData = PREMIUM_VOICES.find(v => v.id === selectedVoice);

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between pb-2 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
            <Mic className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Premium Voice Engine
              <Crown className="h-4 w-4 text-violet-400" />
            </h3>
            <p className="text-sm text-muted-foreground">Studio-quality AI voices • 20 Premium models</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30 text-xs">
            <Languages className="h-3 w-3 mr-1" />
            12 Languages
          </Badge>
        </div>
      </div>

      {/* Voice Generation Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tts" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Text-to-Speech Pro
          </TabsTrigger>
          <TabsTrigger value="clone" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Voice Cloning
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Studio Upload
          </TabsTrigger>
        </TabsList>

        {/* Premium Text-to-Speech Tab */}
        <TabsContent value="tts" className="space-y-4">
            {/* Voice Selection Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Crown className="h-4 w-4 text-violet-400" />
                  Voice Selection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Voice Category Pills */}
                <div className="flex flex-wrap gap-1">
                  {VOICE_CATEGORIES.slice(0, 4).map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id)}
                      className="h-7 text-xs"
                    >
                      <category.icon className="h-3 w-3 mr-1" />
                      {category.name}
                    </Button>
                  ))}
                </div>

                {/* Voice Selector */}
                <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select voice..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredVoices.map((voice) => (
                      <SelectItem key={voice.id} value={voice.id}>
                        {voice.name} • {voice.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Selected Voice Info */}
                {selectedVoiceData && (
                  <div className="p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{selectedVoiceData.name}</span>
                      <Button size="sm" variant="ghost" onClick={() => togglePlayPreview()} className="h-6 px-2">
                        {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">{selectedVoiceData.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Script Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Script Editor</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  placeholder="Enter your script here..."
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="min-h-32"
                  maxLength={2000}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{script.length}/2000</span>
                  <span className="text-green-500">Auto-saved</span>
                </div>

                {/* Language Selector */}
                <div>
                  <Label className="text-xs">Language</Label>
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
                </CardContent>
              </Card>

              {/* Voice Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Professional Voice Controls
                  </CardTitle>
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
                        <span>Emotion</span>
                        <span>{voiceSettings.emotion}%</span>
                      </div>
                      <Slider
                        value={[voiceSettings.emotion]}
                        onValueChange={([value]) => setVoiceSettings(prev => ({ ...prev, emotion: value }))}
                        max={100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview & Advanced Settings */}
            <div className="space-y-4">
              {/* Studio Preview */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Volume2 className="h-5 w-5" />
                    Studio Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="text-sm">
                      <div className="font-medium">{selectedVoiceData?.name}</div>
                      <div className="text-muted-foreground">{selectedVoiceData?.type}</div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => togglePlayPreview()}
                      className="w-full"
                    >
                      {isPlaying ? <Pause className="h-3 w-3 mr-2" /> : <Play className="h-3 w-3 mr-2" />}
                      {isPlaying ? 'Pause' : 'Play'} Preview
                    </Button>
                    
                    <audio ref={audioRef} className="hidden">
                      <source src={selectedVoiceData?.preview} type="audio/mpeg" />
                    </audio>
                  </div>
                </CardContent>
              </Card>

              {/* Studio Audio Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileAudio className="h-5 w-5" />
                    Studio Audio Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Sample Rate</Label>
                      <Select 
                        value={audioSettings.sampleRate.toString()} 
                        onValueChange={(value) => setAudioSettings(prev => ({ ...prev, sampleRate: parseInt(value) }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADVANCED_SETTINGS.sampleRate.map((rate) => (
                            <SelectItem key={rate} value={rate.toString()}>
                              {rate} Hz
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-xs">Format</Label>
                      <Select 
                        value={audioSettings.format} 
                        onValueChange={(value) => setAudioSettings(prev => ({ ...prev, format: value }))}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ADVANCED_SETTINGS.audioFormat.map((format) => (
                            <SelectItem key={format} value={format}>
                              {format}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs">Audio Effects</Label>
                    <div className="space-y-2">
                      {[
                        { key: 'enableReverb', label: 'Studio Reverb' },
                        { key: 'enableEQ', label: 'EQ Enhancement' },
                        { key: 'enableCompressor', label: 'Compression' },
                        { key: 'enableDeEsser', label: 'De-esser' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between">
                          <Label className="text-xs">{label}</Label>
                          <Switch
                            checked={audioSettings[key as keyof typeof audioSettings] as boolean}
                            onCheckedChange={(checked) => 
                              setAudioSettings(prev => ({ ...prev, [key]: checked }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateVoice}
                disabled={!script.trim() || isProcessing}
                className="w-full h-14 bg-gradient-to-r from-primary via-purple-500 to-pink-500 hover:from-primary/90 hover:via-purple-500/90 hover:to-pink-500/90 text-white font-semibold"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    <span className="flex flex-col items-start">
                      <span>Generating Studio Voice...</span>
                      <span className="text-xs opacity-90">Premium AI speech synthesis</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-3" />
                    <span className="flex flex-col items-start">
                      <span>Generate Studio Voice</span>
                      <span className="text-xs opacity-90">Professional quality</span>
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Voice Cloning Tab - Enhanced */}
        <TabsContent value="clone" className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-purple/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Professional Voice Cloning
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Clone any voice with 30-60 seconds of clear, high-quality audio
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-medium mb-1">Upload High-Quality Voice Sample</p>
                <p className="text-sm text-muted-foreground">
                  WAV, FLAC preferred • 30-60 seconds • Studio quality • Clear speech
                </p>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                className="hidden"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Audio Tab - Enhanced */}
        <TabsContent value="upload" className="space-y-6">
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-green/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Studio Audio Upload
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Upload professional pre-recorded audio with automatic enhancement
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-primary" />
                <p className="font-medium mb-1">Upload Studio Audio File</p>
                <p className="text-sm text-muted-foreground">
                  WAV, FLAC, MP3 • Up to 50MB • Any duration • Auto-enhancement available
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Enhanced Voice Result Display */}
      {project.voice?.status === 'completed' && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-purple/5 to-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Studio Voice Generated
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground">Voice Model</Label>
                <p className="font-medium">{PREMIUM_VOICES.find(v => v.id === selectedVoice)?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Language</Label>
                <p className="font-medium">{LANGUAGES.find(l => l.code === selectedLanguage)?.name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Quality</Label>
                <p className="font-medium">Studio HD</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Duration</Label>
                <p className="font-medium">{project.voice.metadata?.duration || 'Unknown'}s</p>
              </div>
            </div>
            
            {/* Professional Waveform Display */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Professional Audio Waveform</Label>
              <div className="h-32 bg-card/50 rounded-lg border border-primary/20 p-2">
                <EnhancedWaveformVisualizer
                  audioData={project.voice.metadata?.waveform}
                  isPlaying={isPlaying}
                  fillContainer={true}
                  showSpectrum={true}
                  showFrequencyBands={true}
                  color="#8b5cf6"
                  className="h-full"
                />
              </div>
              
              {project.voice.audioUrl && (
                <div className="flex items-center justify-between bg-card/30 rounded-lg p-3 border border-primary/10">
                  <audio controls className="flex-1">
                    <source src={project.voice.audioUrl} type="audio/mpeg" />
                  </audio>
                  <Button size="sm" variant="outline" className="ml-3">
                    <Download className="h-3 w-3 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
