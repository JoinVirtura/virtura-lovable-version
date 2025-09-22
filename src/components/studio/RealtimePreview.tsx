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

  const handleSaveToLibrary = async (imageUrl: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to save avatars');
        return;
      }

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
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save avatar');
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
        {/* Processing Status Bar */}
        <div className="bg-muted/50 rounded-lg p-3 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Processing Status</h4>
            {project.avatar?.status === 'completed' && project.voice?.status === 'completed' && (
              <Badge className="bg-green-500 text-white">
                <CheckCircle className="h-3 w-3 mr-1" />
                Processing Complete
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                project.avatar?.status === 'completed' ? 'bg-green-500' : 
                project.avatar?.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-300'
              }`} />
              <span className="text-sm font-medium">Avatar</span>
              {project.avatar?.status === 'completed' && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {project.avatar?.status === 'processing' && (
                <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                project.voice?.status === 'completed' ? 'bg-green-500' : 
                project.voice?.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-300'
              }`} />
              <span className="text-sm font-medium">Voice</span>
              {project.voice?.status === 'completed' && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {project.voice?.status === 'processing' && (
                <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                project.style?.status === 'completed' ? 'bg-green-500' : 
                project.style?.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-300'
              }`} />
              <span className="text-sm font-medium">Style</span>
              {project.style?.status === 'completed' && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {project.style?.status === 'processing' && (
                <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${
                project.video?.status === 'completed' ? 'bg-green-500' : 
                project.video?.status === 'processing' ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-300'
              }`} />
              <span className="text-sm font-medium">Video</span>
              {project.video?.status === 'completed' && (
                <CheckCircle className="h-3 w-3 text-green-500" />
              )}
              {project.video?.status === 'processing' && (
                <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />
              )}
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className={`${getPreviewDimensions()} bg-black rounded-lg overflow-hidden relative group flex items-center justify-center`}>
          {(() => {
            // Priority: Video > Style Transfer > Original Avatar
            if (project.video?.videoUrl) {
              return (
                <video
                  src={project.video.videoUrl}
                  controls
                  className="w-full h-full object-contain"
                  poster={project.avatar?.processedUrl || project.avatar?.originalUrl}
                >
                  Your browser does not support the video tag.
                </video>
              );
            }
            
            if (project.style?.resultUrl) {
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={project.style.resultUrl}
                    alt="Styled Avatar"
                    className="w-full h-full object-contain"
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
                        handleSaveToLibrary(project.style.resultUrl);
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
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={imageUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-contain"
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
                        handleSaveToLibrary(imageUrl || '');
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

        {/* Audio Player */}
        {project.voice?.audioUrl && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Voice Preview</span>
              <Button
                size="sm"
                onClick={handlePlayPreview}
                className="h-8"
              >
                <Play className="h-3 w-3 mr-1" />
                Play Preview
              </Button>
            </div>
            
            <PremiumAudioPlayer
              audioUrl={project.voice.audioUrl}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPreview}
              waveformData={project.voice.metadata?.waveform}
              className="border-0 bg-muted/50"
            />
          </div>
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