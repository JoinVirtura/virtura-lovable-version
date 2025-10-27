import React, { useState, useRef, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Upload,
  Check,
  ArrowRight,
  ImageIcon
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
    <div className="space-y-6">
      {/* Upload Card */}
      <Card 
        className={`glass-card border-2 transition-all duration-300 cursor-pointer ${
          isDragOver 
            ? 'border-primary shadow-[0_0_30px_rgba(139,92,246,0.6)] scale-[1.02]' 
            : uploadProgress === 100
            ? 'border-green-500/50 shadow-[0_0_20px_rgba(34,197,94,0.3)]'
            : 'border-primary/30 hover:border-primary/50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => uploadProgress !== 100 && fileInputRef.current?.click()}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {uploadProgress === 100 ? (
              <>
                <Check className="h-5 w-5 text-green-400" />
                Avatar Uploaded Successfully!
              </>
            ) : (
              <>
                <Upload className="h-5 w-5 text-primary" />
                Upload Your Avatar Image
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {uploadProgress === 100 && uploadedImage ? (
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden border-2 border-green-500/30">
                <img 
                  src={uploadedImage} 
                  alt="Uploaded avatar" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-green-500/90 backdrop-blur-sm rounded-full p-2">
                  <Check className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                <div className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-400" />
                  <span className="text-sm text-green-400 font-medium">Ready for Style Transfer</span>
                </div>
                <ArrowRight className="h-5 w-5 text-green-400 animate-pulse" />
              </div>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setUploadProgress(0);
                  setUploadedImage(null);
                }}
                variant="outline"
                className="w-full"
              >
                Upload Different Image
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-primary/30 rounded-xl bg-black/20 hover:bg-black/30 transition-colors">
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 mb-4">
                  <Upload className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isDragOver ? 'Drop image here!' : 'Drag & Drop or Click to Upload'}
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-xs mb-4">
                  Upload a high-quality photo for best results
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    JPG, PNG, WEBP
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    Max: 10MB
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 border-primary/30">
                    Recommended: 1024x1024+
                  </Badge>
                </div>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <CircularProgress value={uploadProgress} size={60} className="text-primary" />
                    <div>
                      <p className="text-sm font-medium text-white">Uploading...</p>
                      <p className="text-xs text-gray-400">{uploadProgress}% complete</p>
                    </div>
                  </div>
                </div>
              )}
            </>
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
        </CardContent>
      </Card>
    </div>
  );
};
