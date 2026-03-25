import React, { useState, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { DashboardLibraryView } from '@/components/DashboardLibraryView';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  Upload,
  Check,
  FileImage,
  Library
} from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface AvatarGenerationStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onGenerate: (config: any) => Promise<void>;
  isProcessing: boolean;
  onStepComplete?: () => void;
}

export const AvatarGenerationStudio: React.FC<AvatarGenerationStudioProps> = ({
  project,
  onUpdate,
  onGenerate,
  isProcessing,
  onStepComplete
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WEBP)",
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
    const imageUrl = URL.createObjectURL(file);
    setUploadedImage(imageUrl);
    
    onUpdate({
      avatar: {
        type: 'upload',
        originalUrl: imageUrl,
        status: 'completed',
        quality: '4K',
        metadata: {
          resolution: `4K (${Math.round(file.size / 1024)}KB)`,
          faceAlignment: 95,
          consistency: 90
        }
      }
    });

    // Show success toast
    toast({
      title: "✓ Avatar uploaded!",
      description: "Proceeding to style transfer..."
    });

    // Auto-advance to Style step immediately
    onStepComplete?.();
  }, [onUpdate, onStepComplete, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  }, [handleFileUpload]);

  const handleLibrarySelect = useCallback((avatarUrl: string) => {
    setUploadedImage(avatarUrl);
    setUploadProgress(100);
    
    onUpdate({
      avatar: {
        type: 'library',
        originalUrl: avatarUrl,
        processedUrl: avatarUrl,
        status: 'completed',
        quality: '4K',
        metadata: {
          resolution: '4K',
          faceAlignment: 95,
          consistency: 90
        }
      }
    });
    
    setIsLibraryOpen(false);
    
    toast({
      title: "✓ Avatar loaded from library!",
      description: "Proceeding to style transfer..."
    });
    
    // Auto-advance to Style step immediately
    onStepComplete?.();
  }, [onUpdate, onStepComplete, toast]);

  return (
    <div
      className={`py-6 flex items-center justify-center transition-all duration-300 border rounded-lg cursor-pointer ${
        isDragOver
          ? 'border-violet-400 bg-violet-500/10'
          : 'border-dashed border-violet-500/30 hover:border-violet-400/60'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
    >
      {uploadProgress === 100 && uploadedImage ? (
        // Success State - Compact
        <div className="flex items-center gap-4 px-6 w-full">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-green-500/30 shrink-0">
            <img
              src={uploadedImage}
              alt="Uploaded avatar"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-1 right-1 bg-green-500/90 rounded-full p-0.5">
              <Check className="h-3 w-3 text-white" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-green-400 shrink-0" />
              Avatar ready
            </p>
            <p className="text-xs text-gray-400">Proceeding to style transfer...</p>
          </div>

          <Button
            onClick={() => {
              setUploadProgress(0);
              setUploadedImage(null);
            }}
            variant="ghost"
            size="sm"
            className="text-xs text-gray-400 hover:text-white shrink-0"
          >
            Change
          </Button>
        </div>
      ) : (
        // Upload State - Compact
        <div className="flex flex-col sm:flex-row items-center gap-4 px-6 w-full">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-primary/30 flex items-center justify-center bg-primary/5">
              <Upload className="h-5 w-5 text-primary" />
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <CircularProgress value={uploadProgress} size={48} className="text-primary" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-sm font-medium text-white">
              {isDragOver ? 'Drop your image here' : 'Upload avatar image'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG, WebP · Max 10MB · 4K</p>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              className="bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400 text-xs"
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              File
            </Button>

            <Button
              onClick={() => setIsLibraryOpen(true)}
              variant="outline"
              size="sm"
              className="bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400 text-xs"
              disabled={uploadProgress > 0 && uploadProgress < 100}
            >
              <Library className="h-3.5 w-3.5 mr-1.5" />
              Library
            </Button>
          </div>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <p className="text-xs font-medium text-white shrink-0">Uploading... {uploadProgress}%</p>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
            className="hidden"
          />
        </div>
      )}

        <Dialog open={isLibraryOpen} onOpenChange={setIsLibraryOpen}>
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto flex flex-col p-6">
            <DashboardLibraryView 
              onSelectAvatar={(avatarUrl) => {
                handleLibrarySelect(avatarUrl);
                setIsLibraryOpen(false);
              }}
              isModal={true}
            />
          </DialogContent>
        </Dialog>
    </div>
  );
};
