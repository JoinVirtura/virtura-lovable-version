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
  Heart,
  Upload,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PremiumAudioPlayer } from './PremiumAudioPlayer';
import { Input } from '@/components/ui/input';
import type { StudioProject } from '@/hooks/useStudioProject';

interface RealtimePreviewProps {
  project: StudioProject;
  isProcessing?: boolean;
  onStepChange?: (stepId: string) => void;
  onResetAvatar?: () => void;
  onSaveToLibrary?: (customTitle?: string) => Promise<void>;
  onDownload?: () => void;
  onDownloadStyle?: () => void;
  onSendToVideoGen?: () => void;
  isSaved?: boolean;
}

const PREVIEW_MODES = [
  { id: 'desktop', icon: Monitor, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, label: 'Mobile' }
];

export const RealtimePreview: React.FC<RealtimePreviewProps> = ({ 
  project, 
  isProcessing = false,
  onStepChange,
  onResetAvatar,
  onSaveToLibrary,
  onDownload,
  onDownloadStyle,
  onSendToVideoGen,
  isSaved = false
}) => {
  const [previewMode, setPreviewMode] = useState('desktop');
  const [isPlaying, setIsPlaying] = useState(false);
  const [savedAvatars, setSavedAvatars] = useState<Set<string>>(new Set());
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  
  // New states for hover-over naming
  const [isHovering, setIsHovering] = useState(false);
  const [avatarTitle, setAvatarTitle] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

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
        // Check if imageUrl is a video and prevent saving it directly
        const isVideoUrl = imageUrl.endsWith('.mp4') || 
                          imageUrl.endsWith('.webm') ||
                          imageUrl.startsWith('blob:');
        
        if (isVideoUrl) {
          toast.error('Cannot save video URLs directly. Please use the original avatar image.');
          return;
        }

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

  // Handle save to library from hover overlay
  const handleSaveStyledAvatar = async () => {
    const styledImageUrl = project.style?.resultUrl;
    if (!styledImageUrl) return;

    setIsSaving(true);
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
          image_url: styledImageUrl,
          prompt: avatarTitle || `Styled Avatar - ${project.style?.metadata?.styleName || 'Custom'}`,
          title: avatarTitle || `Styled Avatar - ${project.style?.metadata?.styleName || 'Custom'}`,
          tags: [
            'style-transfer',
            project.style?.preset || 'custom',
            project.style?.metadata?.category || 'general'
          ]
        });

      if (error) throw error;

      setSavedAvatars(prev => new Set([...prev, styledImageUrl]));
      toast.success('Avatar saved to library!', {
        description: 'Your styled avatar is now in your library'
      });
      setAvatarTitle(''); // Clear input after save
      setIsHovering(false); // Hide overlay after save
    } catch (error: any) {
      console.error('Error saving avatar:', error);
      toast.error('Failed to save avatar to library');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full" data-preview-section>
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
            // Priority 1: Video (if generated)
            if (project.video?.videoUrl) {
              return (
                <div 
                  className="relative w-full h-full"
                  onMouseEnter={() => setIsHoveringVideo(true)}
                  onMouseLeave={() => setIsHoveringVideo(false)}
                >
                  <video
                    controls
                    className="w-full h-full object-cover"
                    src={project.video.videoUrl}
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <source src={project.video.videoUrl} type="video/mp4" />
                  </video>
                  
                  {/* Quality Badge */}
                  {project.video.quality && (
                    <Badge className="absolute top-2 right-2 bg-black/50 text-white">
                      {project.video.quality}
                    </Badge>
                  )}
                  
                  {/* Naming Overlay - Show when NOT saved and hovering */}
                  {!isSaved && isHoveringVideo && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-20 rounded-lg">
                      <div className="space-y-4 w-full max-w-sm">
                        <div className="text-center mb-2">
                          <h4 className="text-white font-semibold mb-1">Save to Library</h4>
                          <p className="text-white/60 text-sm">Give your video a name (optional)</p>
                        </div>
                        <Input
                          placeholder="Enter video title..."
                          value={videoTitle}
                          onChange={(e) => setVideoTitle(e.target.value)}
                          className="bg-black/40 border-violet-400/30 text-white"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && onSaveToLibrary) {
                              onSaveToLibrary(videoTitle.trim() || undefined);
                              setVideoTitle('');
                            }
                          }}
                        />
                        <Button 
                          className="w-full" 
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (onSaveToLibrary) {
                              await onSaveToLibrary(videoTitle.trim() || undefined);
                              setVideoTitle('');
                            }
                          }}
                        >
                          <Heart className="mr-2 h-4 w-4" /> Save to Library
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Saved Heart Icon - Filled Red, only show when NOT hovering */}
                  {isSaved && !isHoveringVideo && (
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/60 backdrop-blur-md border-red-500/50 hover:bg-black/80 hover:scale-110 transition-all duration-300"
                      title="Saved to Library"
                    >
                      <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                    </Button>
                  )}
                </div>
              );
            }
            
            // Priority 2: Style Transfer > Original Avatar (No video in Style Transfer Studio)
            if (project.style?.resultUrl) {
              const isStyleCompleted = project.style?.status === 'completed';
              const isAlreadySaved = savedAvatars.has(project.style.resultUrl);
              
              return (
                <div 
                  className="relative w-full h-full"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  <img
                    src={project.style.resultUrl}
                    alt="Styled Avatar"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay for Naming and Saving - Only show if style is completed */}
                  {isStyleCompleted && isHovering && !isAlreadySaved && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 transition-all duration-300 z-20">
                      <div className="w-full max-w-md space-y-3">
                        <input
                          type="text"
                          placeholder="Enter avatar name (optional)"
                          value={avatarTitle}
                          onChange={(e) => setAvatarTitle(e.target.value)}
                          className="w-full px-4 py-3 bg-black/40 border border-violet-500/30 rounded-lg text-white placeholder:text-gray-400 focus:outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-500/20"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isSaving) {
                              handleSaveStyledAvatar();
                            }
                          }}
                        />
                        
                        <Button
                          onClick={handleSaveStyledAvatar}
                          disabled={isSaving}
                          className="w-full h-12 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold"
                        >
                          {isSaving ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Heart className="h-4 w-4 mr-2" />
                              Save to Library
                            </>
                          )}
                        </Button>
                        
                        <Button
                          onClick={() => {
                            if (onResetAvatar) onResetAvatar();
                            setIsHovering(false);
                          }}
                          variant="outline"
                          className="w-full h-10 border-white/20 hover:border-white/40 text-white hover:bg-white/10"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change Image
                        </Button>

                        {onSendToVideoGen && (
                          <Button
                            onClick={() => {
                              onSendToVideoGen();
                              setIsHovering(false);
                            }}
                            className="w-full h-10 bg-violet-600/80 hover:bg-violet-700/90 text-white border-0"
                          >
                            <Film className="h-4 w-4 mr-2" />
                            Generate Video
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Already Saved Indicator */}
                  {isAlreadySaved && isHovering && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all duration-300 z-20">
                      <div className="text-center space-y-2">
                        <CheckCircle className="h-12 w-12 text-green-400 mx-auto" />
                        <p className="text-lg font-semibold text-white">Already in Library</p>
                        <p className="text-sm text-gray-300">This avatar is saved to your library</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            }
            
            if (project.avatar?.processedUrl || project.avatar?.originalUrl) {
              const imageUrl = project.avatar.processedUrl || project.avatar.originalUrl;
              const showUploadOverlay = project.avatar?.status === 'completed' && !project.video?.videoUrl;
              
              return (
                <div className="relative w-full h-full">
                  <img
                    src={imageUrl}
                    alt="Avatar Preview"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Centered Hover Buttons */}
                  {showUploadOverlay && (
                    <div
                      className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 hover:opacity-100 group/upload"
                    >
                      <div className="flex flex-col gap-3">
                        {onSendToVideoGen && (
                          <Button
                            size="lg"
                            className="bg-violet-600/80 backdrop-blur-md border-2 border-violet-400/40 hover:bg-violet-700/90 hover:border-violet-400/60 transition-all text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSendToVideoGen();
                            }}
                          >
                            <Film className="h-5 w-5 mr-2" />
                            Generate Video
                          </Button>
                        )}
                        <Button
                          size="lg"
                          className="bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white/20 hover:border-white/50 transition-all"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onResetAvatar) onResetAvatar();
                          }}
                        >
                          <Upload className="h-5 w-5 mr-2" />
                          Change Image
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Heart save button overlay - only show when NO upload overlay */}
                  {!showUploadOverlay && (
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
                  )}
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

        {/* Voice Preview Section - Compact Audio Player */}
        {project.voice?.status === 'completed' && project.voice?.audioUrl && (
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-primary" />
                Voice Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 overflow-hidden">
              <PremiumAudioPlayer
                audioUrl={project.voice.audioUrl}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPreview}
                waveformData={project.voice.metadata?.waveform}
                className="border-0 bg-card/50"
              />
              
              {/* Duration and Quality on ONE LINE with Download Button */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                  <div>
                    <span className="font-medium">Duration: </span>
                    <span>{typeof project.voice.metadata?.duration === 'number' ? `${project.voice.metadata.duration}s` : 'Unknown'}</span>
                  </div>
                  <div className="hidden sm:block">
                    <span className="font-medium">Quality: </span>
                    <span>Ultra-HD</span>
                  </div>
                </div>
                
                {/* Download Audio Button */}
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 px-2 gap-1"
                  onClick={async () => {
                    try {
                      const response = await fetch(project.voice.audioUrl);
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `voice-preview-${Date.now()}.mp3`;
                      document.body.appendChild(a);
                      a.click();
                      window.URL.revokeObjectURL(url);
                      document.body.removeChild(a);
                      toast.success('Downloading audio file...');
                    } catch (error) {
                      toast.error('Failed to download audio');
                    }
                  }}
                >
                  <Download className="h-3 w-3" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Style Transfer Download Button */}
        {project.style?.status === 'completed' && project.style?.resultUrl && onDownloadStyle && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={onDownloadStyle}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        )}

        {/* Preview Controls */}
        {project.video?.videoUrl && onDownload && (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={onDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        )}

        {/* Expanded Metadata */}
        <div className="pt-2 border-t space-y-3">
          <h4 className="text-sm font-medium">Project Metadata</h4>
          
          <div className="grid grid-cols-1 gap-3 text-xs">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2">
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