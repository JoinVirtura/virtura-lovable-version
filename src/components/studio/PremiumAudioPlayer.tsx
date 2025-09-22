import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  SkipBack,
  SkipForward,
  Download,
  Sparkles
} from 'lucide-react';
import { EnhancedWaveformVisualizer } from '@/components/studio/EnhancedWaveformVisualizer';

interface PremiumAudioPlayerProps {
  audioUrl?: string;
  waveformData?: number[];
  className?: string;
  title?: string;
  metadata?: {
    voice?: string;
    language?: string;
    duration?: number;
    quality?: string;
  };
}

export const PremiumAudioPlayer: React.FC<PremiumAudioPlayerProps> = ({
  audioUrl,
  waveformData,
  className = '',
  title = 'Generated Audio',
  metadata
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = (value[0] / 100) * duration;
      setCurrentTime(audio.currentTime);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const skipForward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.min(audio.currentTime + 10, duration);
    }
  };

  const skipBackward = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(audio.currentTime - 10, 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const downloadAudio = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = 'premium-voice.wav';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!audioUrl) {
    return (
      <Card className={`${className}`}>
        <CardContent className="p-6 text-center">
          <Volume2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No audio available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`border-primary/20 bg-gradient-to-br from-primary/5 to-purple/5 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        {metadata && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {metadata.voice && <span>Voice: {metadata.voice}</span>}
            {metadata.language && <span>Language: {metadata.language}</span>}
            {metadata.quality && (
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {metadata.quality}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <audio ref={audioRef} src={audioUrl} preload="metadata" />
        
        {/* Enhanced Professional Waveform */}
        <div className="relative h-24 bg-card/50 rounded-lg border border-primary/10 p-2">
          <EnhancedWaveformVisualizer
            audioData={waveformData}
            isPlaying={isPlaying}
            fillContainer={true}
            showSpectrum={true}
            showFrequencyBands={true}
            color="#8b5cf6"
            className="h-full"
          />
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              <Volume2 className="h-3 w-3 mr-1" />
              Studio
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
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

        {/* Enhanced Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={skipBackward}>
              <SkipBack className="h-3 w-3" />
            </Button>
            
            <Button 
              size="sm" 
              onClick={togglePlayPause} 
              className="h-10 w-10 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            
            <Button size="sm" variant="outline" onClick={skipForward}>
              <SkipForward className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button size="sm" variant="outline" onClick={toggleMute}>
              {isMuted ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
            </Button>
            
            <div className="w-24">
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="h-1"
              />
            </div>
            
            <Button size="sm" variant="outline" onClick={downloadAudio} className="border-primary/20 hover:bg-primary/10">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};