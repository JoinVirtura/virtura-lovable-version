import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface AudioPlayerWithControlsProps {
  audioUrl: string | null;
  isGenerating?: boolean;
}

export const AudioPlayerWithControls = ({ audioUrl, isGenerating }: AudioPlayerWithControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
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
    if (!audio || !audioUrl) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  const restart = () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    audio.currentTime = 0;
    setCurrentTime(0);
    if (isPlaying) {
      audio.play();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="space-y-3">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={togglePlayPause}
          disabled={isGenerating}
          className="w-10 h-10 p-0"
        >
          {isPlaying ? (
            <Pause className="w-4 h-4" />
          ) : (
            <Play className="w-4 h-4" />
          )}
        </Button>
        
        <Button
          size="sm"
          variant="outline"
          onClick={restart}
          disabled={isGenerating}
          className="w-10 h-10 p-0"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>

        <div className="flex-1 space-y-1">
          <Progress value={(currentTime / duration) * 100 || 0} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <Volume2 className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
};