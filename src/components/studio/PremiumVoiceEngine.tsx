import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Languages,
  Settings,
  CheckCircle,
  Download
} from 'lucide-react';
import { EnhancedWaveformVisualizer } from './EnhancedWaveformVisualizer';
import type { StudioProject } from '@/hooks/useStudioProject';

interface PremiumVoiceEngineProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
}

const PREMIUM_VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', type: 'Executive Female', accent: 'American', description: 'Confident, authoritative', category: 'executive' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', type: 'Executive Male', accent: 'British', description: 'Distinguished, mature', category: 'executive' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', type: 'Creative Female', accent: 'American', description: 'Friendly, engaging', category: 'creative' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', type: 'Narrator Male', accent: 'American', description: 'Deep, resonant', category: 'narrator' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', type: 'Executive Male', accent: 'American', description: 'Professional, commanding', category: 'executive' }
];

const VOICE_CATEGORIES = [
  { id: 'all', name: 'All', icon: Volume2 },
  { id: 'executive', name: 'Executive', icon: Crown },
  { id: 'creative', name: 'Creative', icon: Mic },
  { id: 'narrator', name: 'Narrator', icon: Volume2 }
];

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' }
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
    emotion: 50
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
        speed: voiceSettings.speed / 100
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
      }
    } catch (error) {
      console.error('Preview playback failed:', error);
      toast({
        title: "Preview Failed",
        description: "Could not play voice preview",
        variant: "destructive"
      });
    }
  };

  const selectedVoiceData = PREMIUM_VOICES.find(v => v.id === selectedVoice);

  return (
    <div className="space-y-4">
      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tts"><Volume2 className="h-4 w-4 mr-2" />Text-to-Speech</TabsTrigger>
          <TabsTrigger value="clone"><Wand2 className="h-4 w-4 mr-2" />Voice Clone</TabsTrigger>
          <TabsTrigger value="upload"><Upload className="h-4 w-4 mr-2" />Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="tts" className="space-y-4 mt-4">
          {/* Script Editor */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Script Content</CardTitle>
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

              {/* Language */}
              <div>
                <Label className="text-xs">Language</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Voice Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Crown className="h-4 w-4 text-violet-400" />
                Voice Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1">
                {VOICE_CATEGORIES.map((category) => (
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {filteredVoices.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} • {voice.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Voice Preview */}
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


          {/* Generate Button */}
          <Button
            onClick={handleGenerateVoice}
            disabled={!script.trim() || isProcessing}
            className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating Voice...
              </>
            ) : (
              <>
                <Crown className="h-4 w-4 mr-2" />
                Generate Studio Voice
              </>
            )}
          </Button>
        </TabsContent>

        <TabsContent value="clone" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Voice Cloning
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-violet-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-violet-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-violet-400" />
                <p className="font-medium mb-1">Upload Voice Sample</p>
                <p className="text-sm text-muted-foreground">30-60 seconds • High quality • Clear speech</p>
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Audio Upload
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-violet-500/30 rounded-lg p-8 text-center cursor-pointer hover:border-violet-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-3 text-violet-400" />
                <p className="font-medium mb-1">Upload Audio File</p>
                <p className="text-sm text-muted-foreground">WAV, MP3, FLAC • Up to 50MB</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

    </div>
  );
};
