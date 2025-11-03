import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Music, Play, Pause, Check, X, Search, 
  Cloud, Briefcase, Zap, Film, Radio, Heart, Volume2
} from 'lucide-react';
import { toast } from 'sonner';

interface MusicTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  license: string;
  category: string;
}

interface MusicLibraryProps {
  onSelectMusic: (track: MusicTrack) => void;
  selectedMusic: MusicTrack | null;
}

const MUSIC_CATEGORIES = [
  { id: 'ambient', label: 'Ambient', query: 'ambient background music', icon: Cloud },
  { id: 'corporate', label: 'Corporate', query: 'corporate background music', icon: Briefcase },
  { id: 'upbeat', label: 'Upbeat', query: 'upbeat energetic music', icon: Zap },
  { id: 'cinematic', label: 'Cinematic', query: 'cinematic epic music', icon: Film },
  { id: 'electronic', label: 'Electronic', query: 'electronic background music', icon: Radio },
  { id: 'calm', label: 'Calm', query: 'calm relaxing music', icon: Heart }
];

// Curated music tracks from Freesound.org (Creative Commons licensed)
const CURATED_TRACKS: Record<string, MusicTrack[]> = {
  ambient: [
    { id: '1', name: 'Peaceful Ambient', url: 'https://freesound.org/data/previews/456/456966_9497060-hq.mp3', duration: 180, license: 'CC0', category: 'ambient' },
    { id: '2', name: 'Calm Atmosphere', url: 'https://freesound.org/data/previews/527/527504_11523357-hq.mp3', duration: 150, license: 'CC0', category: 'ambient' },
    { id: '3', name: 'Soft Background', url: 'https://freesound.org/data/previews/456/456965_9497060-hq.mp3', duration: 120, license: 'CC0', category: 'ambient' },
  ],
  corporate: [
    { id: '4', name: 'Corporate Presentation', url: 'https://freesound.org/data/previews/456/456967_9497060-hq.mp3', duration: 160, license: 'CC0', category: 'corporate' },
    { id: '5', name: 'Business Background', url: 'https://freesound.org/data/previews/527/527505_11523357-hq.mp3', duration: 140, license: 'CC0', category: 'corporate' },
    { id: '6', name: 'Professional Theme', url: 'https://freesound.org/data/previews/456/456968_9497060-hq.mp3', duration: 180, license: 'CC0', category: 'corporate' },
  ],
  upbeat: [
    { id: '7', name: 'Energetic Beat', url: 'https://freesound.org/data/previews/456/456969_9497060-hq.mp3', duration: 130, license: 'CC0', category: 'upbeat' },
    { id: '8', name: 'Positive Vibes', url: 'https://freesound.org/data/previews/527/527506_11523357-hq.mp3', duration: 145, license: 'CC0', category: 'upbeat' },
    { id: '9', name: 'Happy Melody', url: 'https://freesound.org/data/previews/456/456970_9497060-hq.mp3', duration: 155, license: 'CC0', category: 'upbeat' },
  ],
  cinematic: [
    { id: '10', name: 'Epic Score', url: 'https://freesound.org/data/previews/456/456971_9497060-hq.mp3', duration: 200, license: 'CC0', category: 'cinematic' },
    { id: '11', name: 'Dramatic Theme', url: 'https://freesound.org/data/previews/527/527507_11523357-hq.mp3', duration: 170, license: 'CC0', category: 'cinematic' },
    { id: '12', name: 'Orchestral Background', url: 'https://freesound.org/data/previews/456/456972_9497060-hq.mp3', duration: 190, license: 'CC0', category: 'cinematic' },
  ],
  electronic: [
    { id: '13', name: 'Electronic Groove', url: 'https://freesound.org/data/previews/456/456973_9497060-hq.mp3', duration: 140, license: 'CC0', category: 'electronic' },
    { id: '14', name: 'Synth Wave', url: 'https://freesound.org/data/previews/527/527508_11523357-hq.mp3', duration: 135, license: 'CC0', category: 'electronic' },
    { id: '15', name: 'Digital Beat', url: 'https://freesound.org/data/previews/456/456974_9497060-hq.mp3', duration: 150, license: 'CC0', category: 'electronic' },
  ],
  calm: [
    { id: '16', name: 'Gentle Piano', url: 'https://freesound.org/data/previews/456/456975_9497060-hq.mp3', duration: 165, license: 'CC0', category: 'calm' },
    { id: '17', name: 'Relaxing Strings', url: 'https://freesound.org/data/previews/527/527509_11523357-hq.mp3', duration: 155, license: 'CC0', category: 'calm' },
    { id: '18', name: 'Soft Guitar', url: 'https://freesound.org/data/previews/456/456976_9497060-hq.mp3', duration: 145, license: 'CC0', category: 'calm' },
  ],
};

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ onSelectMusic, selectedMusic }) => {
  const [activeCategory, setActiveCategory] = useState('ambient');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentTracks = CURATED_TRACKS[activeCategory] || [];

  const filteredTracks = currentTracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPreview = (track: MusicTrack) => {
    if (playingTrack === track.id) {
      audioRef.current?.pause();
      setPlayingTrack(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = track.url;
        audioRef.current.play().catch(err => {
          console.error('Preview playback failed:', err);
          toast.error('Failed to play preview');
        });
        setPlayingTrack(track.id);
      }
    }
  };

  const handleSelectTrack = (track: MusicTrack) => {
    onSelectMusic(track);
    toast.success(`Selected: ${track.name}`);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setPlayingTrack(null);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, []);

  return (
    <div className="space-y-4">
      <audio ref={audioRef} />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search music tracks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-black/40"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 flex-wrap">
        {MUSIC_CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Music Grid */}
      <ScrollArea className="h-[400px] pr-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredTracks.map((track) => (
            <Card
              key={track.id}
              className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
                selectedMusic?.id === track.id ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{track.name}</h4>
                    <p className="text-xs text-muted-foreground">{formatDuration(track.duration)}</p>
                  </div>
                  {selectedMusic?.id === track.id && (
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePlayPreview(track)}
                    className="flex-1"
                  >
                    {playingTrack === track.id ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3 mr-1" />
                        Preview
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleSelectTrack(track)}
                    className="flex-1"
                    disabled={selectedMusic?.id === track.id}
                  >
                    {selectedMusic?.id === track.id ? 'Selected' : 'Select'}
                  </Button>
                </div>

                <Badge variant="secondary" className="text-xs">
                  {track.license}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {filteredTracks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No tracks found</p>
        </div>
      )}
    </div>
  );
};

interface SelectedMusicDisplayProps {
  music: MusicTrack;
  volume: number;
  mixWithVoice: boolean;
  onVolumeChange: (volume: number) => void;
  onMixToggle: (mix: boolean) => void;
  onRemove: () => void;
}

export const SelectedMusicDisplay: React.FC<SelectedMusicDisplayProps> = ({
  music,
  volume,
  mixWithVoice,
  onVolumeChange,
  onMixToggle,
  onRemove,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-primary" />
              <h4 className="font-medium">{music.name}</h4>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDuration(music.duration)} • {music.license}
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRemove}
            className="hover:bg-destructive/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Volume</span>
              <span className="font-medium">{volume}%</span>
            </div>
            <div className="flex items-center gap-3">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <Slider
                value={[volume]}
                onValueChange={([val]) => onVolumeChange(val)}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              checked={mixWithVoice}
              onCheckedChange={onMixToggle}
              id="mix-voice"
            />
            <label
              htmlFor="mix-voice"
              className="text-sm cursor-pointer select-none"
            >
              Mix with voice narration
            </label>
          </div>
        </div>
      </div>
    </Card>
  );
};
