import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
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

  const getPreviewDimensions = () => {
    switch (previewMode) {
      case 'mobile': return 'max-w-xs aspect-[9/16]';
      case 'tablet': return 'max-w-sm aspect-[4/3]';
      default: return 'aspect-video';
    }
  };

  const handlePlayPreview = () => {
    if (project.voice?.audioUrl) {
      setIsPlaying(!isPlaying);
    }
  };

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
        <div className={`mx-auto ${getPreviewDimensions()} bg-black rounded-lg overflow-hidden relative`}>
          {project.video?.videoUrl ? (
            <video
              src={project.video.videoUrl}
              controls
              className="w-full h-full object-cover"
              poster={project.avatar?.processedUrl || project.avatar?.originalUrl}
            >
              Your browser does not support the video tag.
            </video>
          ) : project.style?.resultUrl ? (
            <img
              src={project.style.resultUrl}
              alt="Styled Avatar"
              className="w-full h-full object-cover"
            />
          ) : project.avatar?.processedUrl || project.avatar?.originalUrl ? (
            <img
              src={project.avatar.processedUrl || project.avatar.originalUrl}
              alt="Avatar Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <Film className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Preview will appear here</p>
              </div>
            </div>
          )}

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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => {
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            fileInput?.click();
          }}>
            <Eye className="h-3 w-3 mr-1" />
            Upload Image
          </Button>
          
          {project.video?.videoUrl && (
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <a href={project.video.videoUrl} download="generated-video.mp4">
                <Download className="h-3 w-3 mr-1" />
                Download
              </a>
            </Button>
          )}
        </div>

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
                <span className="font-medium text-right">{project.avatar?.metadata?.resolution || 'Auto'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground w-24">Processing Time:</span>
                <span className="font-medium text-right">{(project.avatar?.metadata as any)?.processingTime || '0'}s</span>
              </div>
            </div>
          </div>
          
          {project.avatar?.status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Avatar Ready</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                High-quality avatar generated with {project.avatar.metadata?.faceAlignment || 0}% face alignment accuracy
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};