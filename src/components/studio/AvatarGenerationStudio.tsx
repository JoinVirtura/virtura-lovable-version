import React, { useState, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Upload,
  Check,
  FileImage
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

    // Auto-advance to Style step after 1 second
    setTimeout(() => {
      onStepComplete?.();
    }, 1000);
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

  return (
    <div 
      className={`min-h-[600px] flex items-center justify-center transition-all duration-300 ${
        isDragOver ? 'bg-primary/5' : ''
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
    >
      {uploadProgress === 100 && uploadedImage ? (
        // Success State
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="relative aspect-square rounded-2xl overflow-hidden border-2 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
            <img 
              src={uploadedImage} 
              alt="Uploaded avatar" 
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-full p-2.5">
              <Check className="h-5 w-5 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-white flex items-center justify-center gap-2">
              <Check className="h-5 w-5 text-green-400" />
              Avatar Uploaded Successfully
            </h3>
            <p className="text-sm text-gray-400">Proceeding to style transfer...</p>
          </div>

          <Button
            onClick={() => {
              setUploadProgress(0);
              setUploadedImage(null);
            }}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Upload Different Image
          </Button>
        </div>
      ) : (
        // Upload State
        <div className="w-full max-w-md space-y-6 text-center px-6">
          {/* Dashed Circle Upload Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center bg-primary/5">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <CircularProgress value={uploadProgress} size={96} className="text-primary" />
                </div>
              )}
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">Upload Avatar Image</h2>
            <p className="text-sm text-gray-400">
              {isDragOver ? 'Drop your image here' : 'Drag and drop or click to browse'}
            </p>
          </div>

          {/* Info Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span>PNG, JPG, WebP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Max 10MB</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
              <span>4K Support</span>
            </div>
          </div>

          {/* Choose File Button */}
          <Button
            onClick={() => fileInputRef.current?.click()}
            size="lg"
            className="w-full max-w-xs"
            disabled={uploadProgress > 0 && uploadProgress < 100}
          >
            <FileImage className="h-5 w-5 mr-2" />
            Choose File
          </Button>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2 pt-4">
              <p className="text-sm font-medium text-white">Uploading... {uploadProgress}%</p>
            </div>
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
    </div>
  );
};
