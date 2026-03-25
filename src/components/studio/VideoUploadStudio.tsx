import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, ImagePlus, X, Sparkles, Zap, Crown, Library } from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';
import { useToast } from '@/hooks/use-toast';
import { DashboardLibraryView } from '@/components/DashboardLibraryView';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface VideoUploadStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  isProcessing: boolean;
  onStepChange?: (stepId: string) => void;
}

export const VideoUploadStudio: React.FC<VideoUploadStudioProps> = ({
  project,
  onUpdate,
  isProcessing,
  onStepChange
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sync imagePreview with project.avatar changes
  useEffect(() => {
    if (project.avatar?.originalUrl) {
      setImagePreview(project.avatar.originalUrl);
    } else {
      setImagePreview(null);
    }
  }, [project.avatar]);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please upload an image file (PNG, JPG, WebP)",
        variant: "destructive"
      });
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image under 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadProgress(0);
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Create object URL for preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setImagePreview(imageUrl);
      
      onUpdate({
        avatar: {
          type: 'upload',
          originalUrl: imageUrl,
          status: 'completed',
          quality: '4K',
          metadata: {
            resolution: `4K (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
            faceAlignment: 95,
            consistency: 85
          }
        }
      });

      toast({
        title: "Upload Successful",
        description: "Image uploaded and ready for video creation",
      });

      // Auto-advance to voice step immediately
      onStepChange?.('voice');
    };
    reader.readAsDataURL(file);
  }, [onUpdate, toast, onStepChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload]);

  const handleClearImage = () => {
    setImagePreview(null);
    setUploadProgress(0);
    onUpdate({
      avatar: undefined,
      voice: undefined  // Reset voice status to clear "skipped" state
    });
  };

  const handleLibrarySelect = (avatarUrl: string, metadata?: { title?: string; prompt?: string }) => {
    setImagePreview(avatarUrl);
    
    onUpdate({
      avatar: {
        type: 'upload',
        originalUrl: avatarUrl,
        status: 'completed',
        quality: '4K',
        metadata: {
          resolution: '4K (Library)',
          faceAlignment: 95,
          consistency: 85
        }
      }
    });
    
    toast({
      title: "Avatar Selected",
      description: "Avatar from library loaded successfully",
    });

    setShowLibrary(false);
    
    // Auto-advance to voice step
    setTimeout(() => {
      onStepChange?.('voice');
    }, 500);
  };

  return (
    <div className="space-y-4">
      {/* File input - always rendered but hidden */}
      <input
        id="avatar-upload-input"
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      
      {/* Upload Area - Compact */}
      {!imagePreview ? (
        <div
          className={`py-6 flex items-center justify-center transition-all duration-300 border rounded-lg cursor-pointer ${
            isDragOver
              ? 'border-violet-400 bg-violet-500/10'
              : 'border-dashed border-violet-500/30 hover:border-violet-400/60'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 px-6 w-full">
            <div className="shrink-0">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
                <Upload className="h-5 w-5 text-primary" />
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left min-w-0">
              <p className="text-sm font-medium text-white">
                {isDragOver ? 'Drop your image here' : 'Upload avatar image'}
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, WebP · Max 10MB · 4K</p>
            </div>

            <div className="flex gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                File
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowLibrary(true);
                }}
              >
                <Library className="h-3.5 w-3.5 mr-1.5" />
                Library
              </Button>
            </div>
          </div>
        </div>
      ) : !onStepChange ? (
        <div className="flex items-center gap-4 px-6 py-4 border rounded-lg border-green-500/20 bg-green-500/5">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-green-500/30 shrink-0">
            <img src={imagePreview} alt="Uploaded" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Avatar ready</p>
            <p className="text-xs text-gray-400">Preview available above</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              handleClearImage();
              fileInputRef.current?.click();
            }}
            className="text-xs text-gray-400 hover:text-white shrink-0"
          >
            Change
          </Button>
        </div>
      ) : null}

      {/* Enhancement Settings */}
      {imagePreview && (
        <Card className="glass-card border-violet-500/20">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-violet-400" />
              Enhancement Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                <Zap className="h-4 w-4 text-violet-400" />
                <span className="text-sm">4K Quality</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/5 border border-violet-500/20">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="text-sm">AI Enhanced</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Library Modal */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose from Library</DialogTitle>
          </DialogHeader>
          <DashboardLibraryView 
            onSelectAvatar={handleLibrarySelect}
            isModal={true}
            hideVideoCategory={false}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
