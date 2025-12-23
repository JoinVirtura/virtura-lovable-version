import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Download,
  Repeat,
  Shuffle
} from 'lucide-react';
import { EnhancedWaveformVisualizer } from './EnhancedWaveformVisualizer';

interface PremiumAudioPlayerProps {
  audioUrl?: string;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  waveformData?: number[];
  className?: string;
}

export const PremiumAudioPlayer: React.FC<PremiumAudioPlayerProps> = ({
  audioUrl,
  isPlaying = false,
  onPlayPause,
  waveformData = [],
  className = ""
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioUrl]);

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    
    if (onPlayPause) {
      onPlayPause();
    }
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    
    const audio = audioRef.current;
    if (audio) {
      audio.volume = newVolume / 100;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume / 100;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className={`w-full overflow-hidden ${className}`}>
      <CardContent className="p-3 sm:p-4 overflow-hidden">
        <div className="space-y-4">
          {/* Waveform Visualizer */}
          <div className="relative">
            <EnhancedWaveformVisualizer
              audioData={waveformData}
              isPlaying={isPlaying}
              width={400}
              height={80}
              className="w-full"
            />
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[progressPercentage]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => skip(-10)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0"
              >
                <SkipBack className="h-3 w-3" />
              </Button>
              
              <Button
                size="sm"
                onClick={handlePlayPause}
                className="h-9 w-9 sm:h-10 sm:w-10 p-0 shrink-0"
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => skip(10)}
                className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0"
              >
                <SkipForward className="h-3 w-3" />
              </Button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 overflow-hidden">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsLooping(!isLooping)}
                className={`h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0 ${isLooping ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <Repeat className="h-3 w-3" />
              </Button>
              
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="h-7 w-7 sm:h-8 sm:w-8 p-0 shrink-0"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="h-3 w-3" />
                  ) : (
                    <Volume2 className="h-3 w-3" />
                  )}
                </Button>
                
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="h-7 sm:h-8 w-14 sm:w-16"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Audio Element */}
        {audioUrl && (
          <audio
            ref={audioRef}
            src={audioUrl}
            loop={isLooping}
            className="hidden"
          />
        )}
      </CardContent>
    </Card>
  );
};