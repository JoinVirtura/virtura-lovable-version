import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Music, Play, Pause, Check, X, Search, 
  Cloud, Briefcase, Zap, Film, Radio, Heart, Volume2, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface MusicTrack {
  id: string;
  name: string;
  url: string;
  duration: number;
  license: string;
  category: string;
  tags?: string[];
  username?: string;
  downloadUrl?: string;
  previewHq?: string;
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

export const MusicLibrary: React.FC<MusicLibraryProps> = ({ onSelectMusic, selectedMusic }) => {
  const [activeCategory, setActiveCategory] = useState('ambient');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingTrack, setPlayingTrack] = useState<string | null>(null);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Fetch tracks from Freesound API
  const fetchTracks = async (category: string, page: number = 1, query?: string, append: boolean = false) => {
    try {
      if (page === 1) {
        setIsLoading(true);
        setLoadError(null);
      } else {
        setIsLoadingMore(true);
      }

      const params: Record<string, string> = {
        category,
        page: page.toString(),
        pageSize: '30'
      };

      if (query) {
        params.query = query;
      }

      const { data, error } = await supabase.functions.invoke('fetch-freesound-music', {
        body: params
      });

      if (error) throw error;

      const { tracks: newTracks, totalCount: count } = data;

      if (append) {
        setTracks(prev => [...prev, ...newTracks]);
      } else {
        setTracks(newTracks);
      }
      
      setTotalCount(count);
      setCurrentPage(page);

    } catch (err: any) {
      console.error('Error fetching tracks:', err);
      setLoadError(err.message || 'Failed to load music tracks');
      toast.error('Failed to load music. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Fetch tracks when category changes
  useEffect(() => {
    setCurrentPage(1);
    fetchTracks(activeCategory, 1);
  }, [activeCategory]);

  // Search with debounce
  useEffect(() => {
    if (!searchQuery) {
      fetchTracks(activeCategory, 1);
      return;
    }

    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchTracks(activeCategory, 1, searchQuery);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

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

  const handleLoadMore = () => {
    fetchTracks(activeCategory, currentPage + 1, searchQuery, true);
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
            >
              {category.label}
            </Button>
          );
        })}
      </div>

      {/* Music Grid */}
      <ScrollArea className="h-[400px] pr-4">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <Card key={i} className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 flex-1" />
                    <Skeleton className="h-8 flex-1" />
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              </Card>
            ))}
          </div>
        ) : loadError ? (
          <div className="text-center py-8 text-destructive">
            <p>{loadError}</p>
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No tracks found</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tracks.map((track) => (
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
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(track.duration)}
                        {track.username && ` • by ${track.username}`}
                      </p>
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
                </div>
              </Card>
              ))}
            </div>

            {/* Load More Button */}
            {tracks.length < totalCount && (
              <div className="flex flex-col items-center gap-2 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing {tracks.length} of {totalCount} tracks
                </p>
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  variant="outline"
                  className="w-full max-w-xs"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More Tracks'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </ScrollArea>
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
