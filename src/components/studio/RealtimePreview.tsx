import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Play, 
  Volume2, 
  Palette, 
  Film, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Monitor,
  Smartphone,
  Tablet,
  Download,
  Heart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PremiumAudioPlayer } from './PremiumAudioPlayer';
import type { StudioProject } from '@/hooks/useStudioProject';

interface RealtimePreviewProps {
  project: StudioProject;
  isProcessing?: boolean;
}

const PREVIEW_MODES = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' }
];

export const RealtimePreview: React.FC<RealtimePreviewProps> = ({ 
  project, 
  isProcessing = false 
}) => {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedAvatars, setSavedAvatars] = useState<Set<string>>(new Set());
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile': return 'w-full h-[600px]';
      case 'tablet': return 'w-full h-[500px]';
      default: return 'w-full h-[400px]';
    }
  };

  const handlePlayPreview = () => {
    if (project.voice?.audioUrl) {
      setIsPlaying(!isPlaying);
    }
  };

  const handleToggleLibrary = async (imageUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save avatars');
        return;
      }

      const isCurrentlySaved = savedAvatars.has(imageUrl);

      if (isCurrentlySaved) {
        // Remove from library
        const { error } = await supabase
          .from('avatar_library')
          .delete()
          .eq('user_id', user.id)
          .eq('image_url', imageUrl);

        if (error) {
          console.error('Error removing avatar:', error);
          toast.error('Failed to remove avatar from library');
          return;
        }

        setSavedAvatars(prev => {
          const newSet = new Set(prev);
          newSet.delete(imageUrl);
          return newSet;
        });
        toast.success('Avatar removed from library');
      } else {
        // Add to library
        const { error } = await supabase
          .from('avatar_library')
          .insert({
            user_id: user.id,
            image_url: imageUrl,
            prompt: 'Live Preview Avatar',
            title: 'Generated Avatar',
            tags: ['live-preview']
          });

        if (error) {
          console.error('Error saving avatar:', error);
          toast.error('Failed to save avatar to library');
          return;
        }

        setSavedAvatars(prev => new Set([...prev, imageUrl]));
        toast.success('Avatar saved to library!');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update avatar library');
    }
  };

  useEffect(() => {
    const loadSavedAvatars = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: avatars } = await supabase
          .from('avatar_library')
          .select('image_url')
          .eq('user_id', user.id);

        if (avatars) {
          setSavedAvatars(new Set(avatars.map(a => a.image_url)));
        }
      } catch (error) {
        console.error('Error loading saved avatars:', error);
      }
    };

    loadSavedAvatars();
  }, []);

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Live Preview
          </CardTitle>
          
          <div className="flex items-center gap-1">
            {PREVIEW_MODES.map((mode) => (
              <Button
                key={mode.id}
                size="sm"
                variant={previewMode === mode.id ? "default" : "outline"}
                onClick={() => setPreviewMode(mode.id)}
                className="h-7 px-2"
              >
                <mode.icon className="h-3 w-3" />
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Preview Area */}
        <div className={`${getPreviewDimensions()} bg-black rounded-lg overflow-hidden relative group`}>
          {(() => {
            // Priority: Video > Style Transfer > Original Avatar
            if (project.video?.videoUrl) {
              const fallbackUrl = project.video?.metadata?.heygenUrl || project.video?.metadata?.fallbackUrl;
              
              return (
                <div className="relative w-full h-full">
                  {videoError && (
                    <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-10 p-4">
                      <div className="text-center text-white max-w-md">
                        <AlertCircle className="h-8 w-8 mx-auto mb-3 text-red-400" />
                        <p className="text-sm mb-3">{videoError}</p>
                        <div className="flex flex-col gap-2">
                          {retryCount < 2 && (
                            <Button
                              size="sm"
                              onClick={() => {
                                setVideoError(null);
                                setRetryCount(prev => prev + 1);
                                const video = document.querySelector('video');
                                if (video) video.load();
                              }}
                            >
                              Retry ({2 - retryCount} attempts left)
                            </Button>
                          )}
                          {fallbackUrl && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setVideoError(null);
                                window.open(fallbackUrl, '_blank');
                              }}
                            >
                              Open Original Video
                            </Button>
                          )}
                          <p className="text-xs text-gray-400 mt-2">
                            Video URL: {project.video.videoUrl}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {videoLoading && !videoError && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                      <div className="text-center text-white">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                        <p className="text-sm">Loading video...</p>
                      </div>
                    </div>
                  )}
                  
                  <video
                    key={`${project.video.videoUrl}-${retryCount}`}
                    src={project.video.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                    poster={project.avatar?.processedUrl || project.avatar?.originalUrl}
                    preload="metadata"
                    onLoadStart={() => {
                      console.log('🎬 Video loading started:', project.video.videoUrl);
                      setVideoLoading(true);
                      setVideoError(null);
                    }}
                    onCanPlay={() => {
                      console.log('✅ Video can play');
                      setVideoLoading(false);
                    }}
                    onLoadedMetadata={(e) => {
                      const video = e.currentTarget;
                      console.log('📊 Video metadata loaded:', {
                        duration: video.duration,
                        videoWidth: video.videoWidth,
                        videoHeight: video.videoHeight
                      });
                    }}
                    onError={(e) => {
                      const video = e.currentTarget;
                      const error = video.error;
                      console.error('❌ Video playback error:', {
                        code: error?.code,
                        message: error?.message,
                        url: project.video.videoUrl
                      });
                      
                      setVideoLoading(false);
                      
                      let errorMessage = 'Video playback failed. ';
                      switch (error?.code) {
                        case 1: // MEDIA_ERR_ABORTED
                          errorMessage += 'Playback was aborted.';
                          break;
                        case 2: // MEDIA_ERR_NETWORK
                          errorMessage += 'Network error occurred.';
                          break;
                        case 3: // MEDIA_ERR_DECODE
                          errorMessage += 'Video file is corrupted or in wrong format.';
                          break;
                        case 4: // MEDIA_ERR_SRC_NOT_SUPPORTED
                          errorMessage += 'Video format not supported by browser.';
                          break;
                        default:
                          errorMessage += 'Unknown error occurred.';
                      }
                      
                      setVideoError(errorMessage);
                      toast.error(errorMessage);
                    }}
                  >
                    <source src={project.video.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              );
            }
            
            if (project.style?.resultUrl) {
              return (
                <div className="relative w-full h-full">
                  <img
                    src={project.style.resultUrl}
                    alt="Styled Avatar"
                    className="w-full h-full object-cover"
                  />
                  {/* Heart save button overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`h-8 w-8 rounded-full backdrop-blur-sm ${
                        savedAvatars.has(project.style.resultUrl) 
                          ? 'bg-red-500/80 hover:bg-red-600/80 text-white' 
                          : 'bg-white/80 hover:bg-white/90 text-gray-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLibrary(project.style.resultUrl);
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          savedAvatars.has(project.style.resultUrl) ? 'fill-current' : ''
                        }`} 
                      />
                    </Button>
                  </div>
                </div>
              );
            }
            
            if (project.avatar?.processedUrl || project.avatar?.originalUrl) {
              const imageUrl = project.avatar.processedUrl || project.avatar.originalUrl;
              return (
                <div className="relative w-full h-full">
                  <img
                    src={imageUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Heart save button overlay */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <Button
                      size="icon"
                      variant="secondary"
                      className={`h-8 w-8 rounded-full backdrop-blur-sm ${
                        savedAvatars.has(imageUrl || '') 
                          ? 'bg-red-500/80 hover:bg-red-600/80 text-white' 
                          : 'bg-white/80 hover:bg-white/90 text-gray-700'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleLibrary(imageUrl || '');
                      }}
                    >
                      <Heart 
                        className={`h-4 w-4 ${
                          savedAvatars.has(imageUrl || '') ? 'fill-current' : ''
                        }`} 
                      />
                    </Button>
                  </div>
                </div>
              );
            }
            
            return (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Preview will appear here</p>
                </div>
              </div>
            );
          })()}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Processing...</p>
              </div>
            </div>
          )}

          {/* Quality Badge */}
          {project.video?.quality && (
            <Badge className="absolute top-2 right-2 bg-black/50 text-white">
              {project.video.quality}
            </Badge>
          )}
        </div>

        {/* Voice Preview Section - Full Audio Player */}
        {project.voice?.status === 'completed' && project.voice?.audioUrl && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                Voice Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Studio Voice Generated</span>
                <Button
                  size="sm"
                  onClick={handlePlayPreview}
                  className="h-7 px-2"
                >
                  <Play className="h-3 w-3 mr-1" />
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              </div>
              
              <PremiumAudioPlayer
                audioUrl={project.voice.audioUrl}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPreview}
                waveformData={project.voice.metadata?.waveform}
                className="border-0 bg-card/50"
              />
              
              <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div>
                  <span className="block font-medium">Duration</span>
                  <span>{project.voice.metadata?.duration || 'Unknown'}s</span>
                </div>
                <div>
                  <span className="block font-medium">Quality</span>
                  <span>Ultra-HD</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Controls */}
        {project.video?.videoUrl && (
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <a href={project.video.videoUrl} download="generated-video.mp4">
                <Download className="h-3 w-3 mr-1" />
                Download
              </a>
            </Button>
          </div>
        )}

        {/* Expanded Metadata */}
        <div className="pt-2 border-t space-y-3">
          <h4 className="text-sm font-medium">Project Metadata</h4>
          
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20">Engine:</span>
                <span className="font-medium text-right">{project.video?.engine || 'Not selected'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-24">Face Alignment:</span>
                <span className="font-medium text-right">{project.avatar?.metadata?.faceAlignment || 0}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20">Quality:</span>
                <span className="font-medium text-right">{project.video?.quality || project.avatar?.quality || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-24">Consistency:</span>
                <span className="font-medium text-right">{project.avatar?.metadata?.consistency || 0}%</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20">Format:</span>
                <span className="font-medium text-right">{project.video?.ratio || '16:9'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-24">Voice Duration:</span>
                <span className="font-medium text-right">{project.voice?.metadata?.duration || '0'}s</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-muted-foreground w-20">Resolution:</span>
                <span className="font-medium text-right">{
                  (() => {
                    const res = project.avatar?.metadata?.resolution || 'Auto';
                    if (res.includes('3840x2160')) return '4K';
                    if (res.includes('1920x1080')) return '1080p';
                    if (res.includes('1280x720')) return '720p';
                    if (res.includes('4K')) return '4K';
                    if (res.includes('HD')) return '1080p';
                    return 'Auto';
                  })()
                }</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-24">Processing:</span>
                <span className="font-medium text-right">{(project.avatar?.metadata as any)?.processingTime || '0'}s</span>
              </div>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};