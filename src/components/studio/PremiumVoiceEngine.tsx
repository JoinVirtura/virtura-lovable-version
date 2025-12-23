import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, Upload, Sparkles, Play, Pause, Loader2, CheckCircle2, 
  User, Search, Volume2, Globe, Check, Music, SkipForward, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { StudioProject } from '@/hooks/useStudioProject';
import { MusicLibrary, SelectedMusicDisplay } from './MusicLibrary';

interface PremiumVoiceEngineProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
  onStepChange?: (stepId: string) => void;
}

const PREMIUM_VOICES = [
  // Executive Voices
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', type: 'premium', gender: 'female', accent: 'American', age: 'mature', description: 'Professional and confident', category: 'Executive', language: 'en-US' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', type: 'premium', gender: 'male', accent: 'British', age: 'mature', description: 'Authoritative and refined', category: 'Executive', language: 'en-GB' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', type: 'premium', gender: 'male', accent: 'American', age: 'young', description: 'Dynamic and energetic', category: 'Executive', language: 'en-US' },
  { id: 'XB0fDUnXU5powFXDhCwa', name: 'Charlotte', type: 'premium', gender: 'female', accent: 'British', age: 'mature', description: 'Elegant and sophisticated', category: 'Executive', language: 'en-GB' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', type: 'premium', gender: 'female', accent: 'International', age: 'mature', description: 'Multilingual and versatile', category: 'Executive', language: 'en-US' },
  
  // Creative Voices
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', type: 'premium', gender: 'female', accent: 'American', age: 'young', description: 'Warm and engaging', category: 'Creative', language: 'en-US' },
  { id: 'cgSgspJ2msm6clMCkdW9', name: 'Jessica', type: 'premium', gender: 'female', accent: 'American', age: 'young', description: 'Friendly and approachable', category: 'Creative', language: 'en-US' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', type: 'premium', gender: 'female', accent: 'American', age: 'young', description: 'Bright and cheerful', category: 'Creative', language: 'en-US' },
  { id: 'Xb7hH8MSUJpSbSDYk0k2', name: 'Alice', type: 'premium', gender: 'female', accent: 'British', age: 'young', description: 'Sweet and articulate', category: 'Creative', language: 'en-GB' },
  
  // Narrator Voices
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', type: 'premium', gender: 'male', accent: 'American', age: 'mature', description: 'Deep and commanding', category: 'Narrator', language: 'en-US' },
  { id: 'cjVigY5qzO86Huf0OWal', name: 'Eric', type: 'premium', gender: 'male', accent: 'American', age: 'mature', description: 'Warm and trustworthy', category: 'Narrator', language: 'en-US' },
  { id: 'XrExE9yKIg1WjnnlVkGX', name: 'Matilda', type: 'premium', gender: 'female', accent: 'American', age: 'mature', description: 'Authoritative narrator', category: 'Narrator', language: 'en-US' },
  
  // Character Voices
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', type: 'premium', gender: 'male', accent: 'American', age: 'young', description: 'Friendly and casual', category: 'Character', language: 'en-US' },
  { id: 'SAz9YHcvj6GT2YYXdXww', name: 'River', type: 'premium', gender: 'male', accent: 'International', age: 'young', description: 'Versatile character voice', category: 'Character', language: 'en-US' },
  { id: 'N2lVS1w4EtoT3dr4eOWO', name: 'Callum', type: 'premium', gender: 'male', accent: 'Scottish', age: 'young', description: 'Distinctive character', category: 'Character', language: 'en-GB' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', type: 'premium', gender: 'male', accent: 'British', age: 'young', description: 'Youthful and lively', category: 'Character', language: 'en-GB' },
  
  // Professional Voices
  { id: 'iP95p4xoKVk53GoZ742B', name: 'Chris', type: 'premium', gender: 'male', accent: 'American', age: 'mature', description: 'Corporate professional', category: 'Professional', language: 'en-US' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', type: 'premium', gender: 'male', accent: 'American', age: 'mature', description: 'Reliable and clear', category: 'Professional', language: 'en-US' },
  { id: 'pqHfZKP75CvOlQylNhV4', name: 'Bill', type: 'premium', gender: 'male', accent: 'American', age: 'mature', description: 'Experienced professional', category: 'Professional', language: 'en-US' },
  { id: 'bIHbv24MWmeRgasZH58o', name: 'Will', type: 'premium', gender: 'male', accent: 'American', age: 'young', description: 'Energetic presenter', category: 'Professional', language: 'en-US' },
];

const LANGUAGES = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (AU)', flag: '🇦🇺' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' },
  { code: 'es-MX', name: 'Spanish (MX)', flag: '🇲🇽' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'it-IT', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Portuguese (BR)', flag: '🇧🇷' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
  { code: 'nl-NL', name: 'Dutch', flag: '🇳🇱' },
  { code: 'sv-SE', name: 'Swedish', flag: '🇸🇪' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko-KR', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese', flag: '🇨🇳' },
  { code: 'hi-IN', name: 'Hindi', flag: '🇮🇳' },
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
];

const VOICE_CATEGORIES = [
  { id: 'all', name: 'All Voices', count: 20 },
  { id: 'Executive', name: 'Executive', count: 5 },
  { id: 'Creative', name: 'Creative', count: 4 },
  { id: 'Narrator', name: 'Narrator', count: 3 },
  { id: 'Character', name: 'Character', count: 4 },
  { id: 'Professional', name: 'Professional', count: 4 },
];

export const PremiumVoiceEngine: React.FC<PremiumVoiceEngineProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing,
  onStepChange,
}) => {
  const [activeTab, setActiveTab] = useState('tts');
  const [script, setScript] = useState(project.voice?.script || '');
  const [selectedVoice, setSelectedVoice] = useState(project.voice?.voiceId || PREMIUM_VOICES[0].id);
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [clonedVoices, setClonedVoices] = useState<any[]>([]);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  
  // Voice Clone state
  const [cloneFiles, setCloneFiles] = useState<File[]>([]);
  const [cloneName, setCloneName] = useState('');
  const [cloneDescription, setCloneDescription] = useState('');
  const [isCloning, setIsCloning] = useState(false);
  
  // Audio Upload state
  const [uploadedAudio, setUploadedAudio] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedAudioUrl, setUploadedAudioUrl] = useState<string | null>(null);
  
  // Background Music state
  const [selectedMusic, setSelectedMusic] = useState<{
    id: string;
    name: string;
    url: string;
    duration: number;
    license: string;
    category: string;
  } | null>(null);
  const [musicVolume, setMusicVolume] = useState(50);
  const [mixWithVoice, setMixWithVoice] = useState(false);
  
  const cloneFileInputRef = useRef<HTMLInputElement>(null);
  const audioUploadInputRef = useRef<HTMLInputElement>(null);
  const previewAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    loadClonedVoices();
  }, []);

  const loadClonedVoices = async () => {
    try {
      const { data, error } = await supabase
        .from('voice_clones')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setClonedVoices(data || []);
    } catch (error) {
      console.error('Error loading cloned voices:', error);
    }
  };

  const filteredVoices = PREMIUM_VOICES.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         voice.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender = genderFilter === 'all' || voice.gender === genderFilter;
    const matchesCategory = categoryFilter === 'all' || voice.category === categoryFilter;
    return matchesSearch && matchesGender && matchesCategory;
  });

  const allVoices = [
    ...filteredVoices,
    ...clonedVoices.map(cv => ({
      id: cv.voice_id,
      name: cv.voice_name,
      type: 'cloned',
      gender: 'custom',
      accent: 'Custom',
      age: 'custom',
      description: cv.metadata?.description || 'Your cloned voice',
      category: 'Custom',
      language: 'en-US',
    }))
  ];

  const selectedVoiceData = allVoices.find(v => v.id === selectedVoice);

  const handleGenerateVoice = async () => {
    if (!script.trim()) {
      toast.error('Please enter a script');
      return;
    }

    try {
      setGenerationProgress(0);
      setGenerationStatus('Preparing voice generation...');
      toast.loading('Generating studio voice...', { id: 'voice-generation' });
      
      setGenerationProgress(25);
      setGenerationStatus('Processing script...');
      
      await onUpdate({
        voice: {
          ...project.voice,
          script,
          voiceId: selectedVoice,
          language: selectedLanguage,
        }
      });
      
      setGenerationProgress(50);
      setGenerationStatus('Generating voice with AI...');
      
      await onGenerate({
        script,
        voiceId: selectedVoice,
        language: selectedLanguage,
        voiceSettings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.50,
          use_speaker_boost: true,
        },
      });
      
      setGenerationProgress(100);
      setGenerationStatus('Complete!');
      toast.success('Voice generated successfully!', { id: 'voice-generation' });
      
      // Reset progress and immediately navigate to Video step
      setGenerationProgress(0);
      setGenerationStatus('');
      if (onStepChange) {
        onStepChange('video');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate voice', { id: 'voice-generation' });
      setGenerationProgress(0);
      setGenerationStatus('');
    }
  };

  const togglePlayPreview = async () => {
    if (isPlayingPreview) {
      previewAudioRef.current?.pause();
      setIsPlayingPreview(false);
      return;
    }

    try {
      setIsPlayingPreview(true);
      const { data, error } = await supabase.functions.invoke('voice-preview', {
        body: {
          voiceId: selectedVoice,
          text: `Hello, I'm ${selectedVoiceData?.name}. This is a preview of my voice.`,
        },
      });

      if (error) throw error;

      if (data?.audioData && previewAudioRef.current) {
        // Convert base64 to blob for faster playback
        const base64Response = await fetch(data.audioData);
        const blob = await base64Response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        previewAudioRef.current.src = blobUrl;
        
        // Wait for canplaythrough event before playing
        await new Promise((resolve, reject) => {
          const timeoutId = setTimeout(() => reject(new Error('Audio loading timeout')), 3000);
          
          previewAudioRef.current!.addEventListener('canplaythrough', () => {
            clearTimeout(timeoutId);
            resolve(true);
          }, { once: true });
          
          previewAudioRef.current!.load();
        });
        
        await previewAudioRef.current.play();
      } else {
        throw new Error('No audio data received');
      }
    } catch (error: any) {
      console.error('Preview error:', error);
      toast.error('Failed to play preview');
      setIsPlayingPreview(false);
    }
  };

  const handleCloneFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 3) {
      toast.error('Maximum 3 audio files allowed');
      return;
    }
    setCloneFiles(files);
  };

  const handleVoiceClone = async () => {
    if (!cloneName.trim()) {
      toast.error('Please enter a name for your cloned voice');
      return;
    }

    if (cloneFiles.length === 0) {
      toast.error('Please upload at least one audio sample');
      return;
    }

    setIsCloning(true);
    try {
      // Upload files to storage first
      const uploadPromises = cloneFiles.map(async (file, idx) => {
        const fileName = `${Date.now()}-${idx}-${file.name}`;
        const { data, error } = await supabase.storage
          .from('virtura-media')
          .upload(`voice-clones/${fileName}`, file);
        
        if (error) throw error;
        return supabase.storage.from('virtura-media').getPublicUrl(fileName).data.publicUrl;
      });

      const audioUrls = await Promise.all(uploadPromises);

      // Call voice clone edge function
      const { data, error } = await supabase.functions.invoke('voice-clone-elevenlabs', {
        body: {
          voiceName: cloneName,
          audioFiles: audioUrls,
          description: cloneDescription,
        },
      });

      if (error) throw error;

      toast.success('Voice cloned successfully!');
      setCloneName('');
      setCloneDescription('');
      setCloneFiles([]);
      await loadClonedVoices();
      setSelectedVoice(data.voiceId);

      // Immediately navigate to Video step
      if (onStepChange) {
        onStepChange('video');
      }
    } catch (error: any) {
      console.error('Voice clone error:', error);
      toast.error(error.message || 'Failed to clone voice');
    } finally {
      setIsCloning(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File size must be under 50MB');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const { data, error } = await supabase.functions.invoke('voice-upload-audio', {
        body: formData,
      });

      if (error) throw error;

      setUploadedAudio(file);
      setUploadedAudioUrl(data.audioUrl);
      toast.success('Audio uploaded successfully!');
      
      // Update project with uploaded audio
      onUpdate({
        voice: {
          type: 'upload',
          status: 'completed',
          audioUrl: data.audioUrl,
          metadata: {
            duration: data.duration,
          },
        },
      });

      // Immediately navigate to Video step
      if (onStepChange) {
        onStepChange('video');
      }
    } catch (error: any) {
      console.error('Audio upload error:', error);
      toast.error(error.message || 'Failed to upload audio');
    } finally {
      setIsUploading(false);
    }
  };

  const handleMusicSelection = (track: { id: string; name: string; url: string; duration: number; license: string; category: string }) => {
    setSelectedMusic(track);
    
    // Update project with background music
    onUpdate({
      voice: {
        ...project.voice,
        backgroundMusic: {
          id: track.id,
          name: track.name,
          url: track.url,
          duration: track.duration,
          license: track.license,
          source: 'freesound',
          volume: musicVolume,
          mixWithVoice: mixWithVoice,
        },
      },
    });
  };

  const handleRemoveMusic = () => {
    setSelectedMusic(null);
    onUpdate({
      voice: {
        ...project.voice,
        backgroundMusic: undefined,
      },
    });
    toast.info('Background music removed');
  };

  const handleSkipVoice = () => {
    onUpdate({
      voice: {
        ...project.voice,
        status: 'skipped',
        audioUrl: null,
      } as any,
    });
    toast.info('Voice step skipped - generating silent video');
    if (onStepChange) {
      onStepChange('video');
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
          <TabsTrigger value="tts">
            <Volume2 className="h-4 w-4 mr-2" />
            Text-to-Speech
          </TabsTrigger>
          <TabsTrigger value="clone">
            <Sparkles className="h-4 w-4 mr-2" />
            Voice Clone
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="h-4 w-4 mr-2" />
            Upload Audio
          </TabsTrigger>
          <TabsTrigger value="music">
            <Music className="h-4 w-4 mr-2" />
            Background Music
          </TabsTrigger>
        </TabsList>

        {/* Text-to-Speech Tab */}
        <TabsContent value="tts" className="space-y-4">
          {/* Text-to-Speech Header with Skip Button */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm">Text-to-Speech</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Generate professional AI voiceovers from your script in multiple languages and voices.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipVoice}
                  className="ml-2 shrink-0"
                >
                  Skip
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Script Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Voice Script</CardTitle>
                {script && (
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={() => {
                      setScript('');
                      onUpdate({ voice: null });
                    }}
                  >
                    Clear Script
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your script here..."
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="min-h-[120px] resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {script.length} characters • ~{Math.ceil(script.length / 150)} seconds
              </p>
            </CardContent>
          </Card>

          {/* Language Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Language
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Voice Selection with Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="h-4 w-4" />
                Voice Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search voices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={genderFilter === 'all' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGenderFilter('all')}
                  >
                    All
                  </Button>
                  <Button
                    variant={genderFilter === 'male' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGenderFilter('male')}
                  >
                    Male
                  </Button>
                  <Button
                    variant={genderFilter === 'female' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setGenderFilter('female')}
                  >
                    Female
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {VOICE_CATEGORIES.map(cat => (
                    <Button
                      key={cat.id}
                      variant={categoryFilter === cat.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategoryFilter(cat.id)}
                    >
                      {cat.name} ({cat.count})
                    </Button>
                  ))}
                </div>
              </div>

              {/* Voice Cards Grid */}
              <ScrollArea className="h-[400px] pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-1">
                  {allVoices.map(voice => (
                    <Card
                      key={voice.id}
                      className={`cursor-pointer transition-all hover:shadow-md relative ${
                        selectedVoice === voice.id
                          ? 'border-2 border-primary bg-primary/10'
                          : 'border border-border'
                      }`}
                      onClick={() => setSelectedVoice(voice.id)}
                    >
                      {selectedVoice === voice.id && (
                        <div className="absolute top-2 right-2 bg-primary rounded-full p-0.5">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 pr-6">
                            <h4 className="font-medium">{voice.name}</h4>
                            <p className="text-xs text-muted-foreground">{voice.description}</p>
                          </div>
                          {voice.type === 'cloned' && (
                            <Badge variant="secondary" className="ml-2">
                              <Sparkles className="h-3 w-3 mr-1" />
                              Custom
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <Badge variant="outline" className="text-xs inline-flex items-center gap-1">
                            <span className="leading-none text-sm">{voice.gender === 'male' ? '♂' : voice.gender === 'female' ? '♀' : '✨'}</span>
                            <span className="capitalize">{voice.gender}</span>
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {voice.accent}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {voice.category}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>

              {/* Voice Preview */}
              {selectedVoiceData && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{selectedVoiceData.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedVoiceData.description}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={togglePlayPreview}
                    disabled={isPlayingPreview}
                  >
                    {isPlayingPreview ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          {generationProgress > 0 && generationProgress < 100 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{generationStatus}</span>
                    <span className="font-medium text-primary">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerateVoice}
            disabled={isProcessing || !script.trim()}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Voice...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Studio Voice
              </>
            )}
          </Button>
        </TabsContent>

        {/* Voice Clone Tab */}
        <TabsContent value="clone" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Clone Your Voice</CardTitle>
              <p className="text-xs text-muted-foreground">
                Upload 1-3 audio samples (30-60 seconds each) to create a custom voice clone
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Voice Name</Label>
                <Input
                  placeholder="My Custom Voice"
                  value={cloneName}
                  onChange={(e) => setCloneName(e.target.value)}
                />
              </div>

              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="Describe your voice..."
                  value={cloneDescription}
                  onChange={(e) => setCloneDescription(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>Audio Samples (1-3 files)</Label>
                <input
                  ref={cloneFileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  onChange={handleCloneFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => cloneFileInputRef.current?.click()}
                  className="w-full mt-2"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Select Audio Files
                </Button>
                {cloneFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {cloneFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate">{file.name}</span>
                        <Badge variant="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleVoiceClone}
                disabled={isCloning || !cloneName || cloneFiles.length === 0}
                className="w-full"
              >
                {isCloning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cloning Voice...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Clone Voice
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Upload Audio Tab */}
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Upload Your Own Audio</CardTitle>
              <p className="text-xs text-muted-foreground">
                Upload a pre-recorded audio file. Preview will appear below after upload.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={audioUploadInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
              />
              
              <Button
                variant="outline"
                onClick={() => audioUploadInputRef.current?.click()}
                disabled={isUploading}
                className="w-full h-32 border-dashed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Uploading...
                  </>
                ) : uploadedAudio ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                    <span className="text-sm font-medium">{uploadedAudio.name}</span>
                    <span className="text-xs text-muted-foreground">
                      Click to upload different file
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8" />
                    <span>Click to upload audio file</span>
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Background Music Tab */}
        <TabsContent value="music" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-sm">Background Music</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Add background music to your video. Can be used alone or mixed with voice narration.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkipVoice}
                  className="ml-2 shrink-0"
                >
                  Skip
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <MusicLibrary
                onSelectMusic={handleMusicSelection}
                selectedMusic={selectedMusic}
              />

              {selectedMusic && (
                <SelectedMusicDisplay
                  music={selectedMusic}
                  volume={musicVolume}
                  mixWithVoice={mixWithVoice}
                  onVolumeChange={(vol) => {
                    setMusicVolume(vol);
                    if (project.voice?.backgroundMusic) {
                      onUpdate({
                        voice: {
                          ...project.voice,
                          backgroundMusic: {
                            ...project.voice.backgroundMusic,
                            volume: vol,
                          },
                        },
                      });
                    }
                  }}
                  onMixToggle={(mix) => {
                    setMixWithVoice(mix);
                    if (project.voice?.backgroundMusic) {
                      onUpdate({
                        voice: {
                          ...project.voice,
                          backgroundMusic: {
                            ...project.voice.backgroundMusic,
                            mixWithVoice: mix,
                          },
                        },
                      });
                    }
                  }}
                  onRemove={handleRemoveMusic}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>


      <audio
        ref={previewAudioRef}
        onEnded={() => setIsPlayingPreview(false)}
        onError={() => setIsPlayingPreview(false)}
      />
    </div>
  );
};
