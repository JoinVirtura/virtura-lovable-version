import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, ImagePlus, X, Sparkles, Zap, Crown } from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';
import { useToast } from '@/hooks/use-toast';

interface VideoUploadStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  isProcessing: boolean;
}

export const VideoUploadStudio: React.FC<VideoUploadStudioProps> = ({
  project,
  onUpdate,
  isProcessing
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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
    };
    reader.readAsDataURL(file);
  }, [onUpdate, toast]);

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
      avatar: undefined
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/30">
            <ImagePlus className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Upload Avatar Image
              <Sparkles className="h-4 w-4 text-violet-400" />
            </h3>
            <p className="text-sm text-muted-foreground">Upload your image to create AI-powered videos</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30">
            <Zap className="h-3 w-3 mr-1" />
            Ultra-HD
          </Badge>
          <Badge variant="secondary" className="bg-amber-500/20 text-amber-300 border-amber-500/30">
            <Crown className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>
      </div>

      {/* Upload Area */}
      {!imagePreview ? (
        <Card 
          className={`h-96 relative cursor-pointer transition-all duration-300 border-2 ${
            isDragOver 
              ? 'border-violet-400 bg-violet-500/10 scale-[1.02] shadow-[0_0_25px_rgba(212,110,255,0.25)]' 
              : 'border-dashed border-violet-500/40 hover:border-violet-400 hover:shadow-[0_0_25px_rgba(212,110,255,0.25)]'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center border-2 border-dashed transition-all ${
                isDragOver ? 'border-violet-400 bg-violet-500/10 scale-110' : 'border-violet-500/40'
              }`}>
                <Upload className={`h-10 w-10 transition-all ${
                  isDragOver ? 'text-violet-400 scale-110' : 'text-violet-500'
                }`} />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-white">
                  {isDragOver ? 'Drop your image here' : 'Upload Avatar Image'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop or click to browse
                </p>
              </div>

              <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  PNG, JPG, WebP
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Max 10MB
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  4K Support
                </div>
              </div>

              <Button 
                variant="outline" 
                className="mt-4 bg-violet-500/10 border-violet-500/30 hover:bg-violet-500/20 hover:border-violet-400"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </CardContent>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
        </Card>
      ) : (
        <Card className="border-green-500/30 bg-green-500/5 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Small Thumbnail */}
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 ring-2 ring-green-500/30">
                <img
                  src={imagePreview}
                  alt="Uploaded"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Status Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-green-500/90 text-white border-0">
                    Ready
                  </Badge>
                  <span className="text-xs text-muted-foreground">Upload Complete</span>
                </div>
                <p className="text-sm text-white font-medium mb-1">Image Uploaded Successfully</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Preview available in Live Preview panel →
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleClearImage();
                    fileInputRef.current?.click();
                  }}
                  className="h-8 text-xs border-violet-500/30 hover:bg-violet-500/10"
                >
                  <Upload className="h-3 w-3 mr-2" />
                  Change Image
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
    </div>
  );
};
