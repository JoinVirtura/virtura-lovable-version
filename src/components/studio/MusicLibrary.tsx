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
  Cloud, Briefcase, Zap, Film, Radio, Heart, Volume2, Loader2
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

// Real Freesound.org tracks with working preview URLs (Creative Commons licensed)
const CURATED_TRACKS: Record<string, MusicTrack[]> = {
  ambient: [
    { id: '725612', name: 'Relaxing Light Background', url: 'https://cdn.freesound.org/previews/725/725612_15232790-lq.mp3', duration: 165, license: 'CC0', category: 'ambient' },
    { id: '717950', name: 'Beautiful Relaxing Ambient', url: 'https://cdn.freesound.org/previews/717/717950_13885614-lq.mp3', duration: 180, license: 'CC0', category: 'ambient' },
    { id: '726895', name: 'Soothing Soundscapes', url: 'https://cdn.freesound.org/previews/726/726895_13885614-lq.mp3', duration: 142, license: 'CC0', category: 'ambient' },
  ],
  corporate: [
    { id: '711661', name: 'Corporate Business Presentation', url: 'https://cdn.freesound.org/previews/711/711661_15232790-lq.mp3', duration: 156, license: 'CC0', category: 'corporate' },
    { id: '730253', name: 'Commercial Corporate', url: 'https://cdn.freesound.org/previews/730/730253_15232790-lq.mp3', duration: 178, license: 'CC0', category: 'corporate' },
    { id: '726510', name: 'Gentle Corporate', url: 'https://cdn.freesound.org/previews/726/726510_15232790-lq.mp3', duration: 163, license: 'CC0', category: 'corporate' },
  ],
  upbeat: [
    { id: '776657', name: 'Upbeat and Fun', url: 'https://cdn.freesound.org/previews/776/776657_15232790-lq.mp3', duration: 148, license: 'CC0', category: 'upbeat' },
    { id: '767142', name: 'High-Energy Grooves', url: 'https://cdn.freesound.org/previews/767/767142_17091765-lq.mp3', duration: 171, license: 'CC0', category: 'upbeat' },
    { id: '767575', name: 'Lively Rhythms', url: 'https://cdn.freesound.org/previews/767/767575_17091765-lq.mp3', duration: 158, license: 'CC0', category: 'upbeat' },
  ],
  cinematic: [
    { id: '712455', name: 'Epic Cinematic Trailer', url: 'https://cdn.freesound.org/previews/712/712455_15232790-lq.mp3', duration: 182, license: 'CC0', category: 'cinematic' },
    { id: '715823', name: 'Dramatic Orchestral', url: 'https://cdn.freesound.org/previews/715/715823_15232790-lq.mp3', duration: 205, license: 'CC0', category: 'cinematic' },
    { id: '718956', name: 'Grand Adventure', url: 'https://cdn.freesound.org/previews/718/718956_15232790-lq.mp3', duration: 193, license: 'CC0', category: 'cinematic' },
  ],
  electronic: [
    { id: '724387', name: 'Electronic Beat', url: 'https://cdn.freesound.org/previews/724/724387_15232790-lq.mp3', duration: 165, license: 'CC0', category: 'electronic' },
    { id: '729642', name: 'Synth Wave Dreams', url: 'https://cdn.freesound.org/previews/729/729642_15232790-lq.mp3', duration: 177, license: 'CC0', category: 'electronic' },
    { id: '731289', name: 'Future Beats', url: 'https://cdn.freesound.org/previews/731/731289_15232790-lq.mp3', duration: 154, license: 'CC0', category: 'electronic' },
  ],
  calm: [
    { id: '725615', name: 'Relaxing Light (Short)', url: 'https://cdn.freesound.org/previews/725/725615_15232790-lq.mp3', duration: 189, license: 'CC0', category: 'calm' },
    { id: '723891', name: 'Tranquil Piano', url: 'https://cdn.freesound.org/previews/723/723891_15232790-lq.mp3', duration: 201, license: 'CC0', category: 'calm' },
    { id: '728456', name: 'Serene Moments', url: 'https://cdn.freesound.org/previews/728/728456_15232790-lq.mp3', duration: 176, license: 'CC0', category: 'calm' },
  ],
};

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ onSelectMusic, selectedMusic }) => {
  const [activeCategory, setActiveCategory] = useState('ambient');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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

  const handlePlayPreview = async (track: MusicTrack) => {
    if (playingTrack === track.id) {
      audioRef.current?.pause();
      setPlayingTrack(null);
      setIsLoading(false);
    } else {
      if (audioRef.current) {
        setIsLoading(true);
        setLoadError(null);
        
        audioRef.current.src = track.url;
        
        // Add error handler
        audioRef.current.onerror = () => {
          const errorMsg = 'Track unavailable. Please try another track.';
          setLoadError(errorMsg);
          setIsLoading(false);
          toast.error(errorMsg);
          setPlayingTrack(null);
        };
        
        // Add loaded handler
        audioRef.current.onloadeddata = () => {
          setIsLoading(false);
        };
        
        try {
          await audioRef.current.play();
          setPlayingTrack(track.id);
        } catch (err) {
          console.error('Failed to play preview:', err);
          const errorMsg = 'Failed to play preview. Please try again.';
          setLoadError(errorMsg);
          setIsLoading(false);
          toast.error(errorMsg);
        }
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
                    disabled={isLoading && playingTrack === track.id}
                  >
                    {isLoading && playingTrack === track.id ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Loading...
                      </>
                    ) : playingTrack === track.id ? (
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
