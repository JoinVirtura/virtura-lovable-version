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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
        <Card className="border-violet-500/20 shadow-[0_0_25px_rgba(212,110,255,0.15)]">
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4 text-violet-400" />
                Uploaded Image
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearImage}
                className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden border border-violet-500/20">
              <img 
                src={imagePreview} 
                alt="Uploaded preview" 
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className="bg-green-500/90 text-white border-0">
                  Ready
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="text-green-400 font-medium">✓ Upload Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quality</span>
                <span className="text-violet-400 font-medium">Ultra-HD Ready</span>
              </div>
            </div>

            <div className="pt-4 border-t border-violet-500/20">
              <p className="text-xs text-center text-muted-foreground">
                Your image is ready! Proceed to <span className="text-violet-400 font-medium">Voice</span> to add audio.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card border-violet-500/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-violet-500/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-violet-400" />
            </div>
            <h4 className="text-sm font-medium text-white mb-1">4K Quality</h4>
            <p className="text-xs text-muted-foreground">Ultra high definition support</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-violet-500/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-blue-400" />
            </div>
            <h4 className="text-sm font-medium text-white mb-1">AI Enhanced</h4>
            <p className="text-xs text-muted-foreground">Neural enhancement technology</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-violet-500/20">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Crown className="h-5 w-5 text-green-400" />
            </div>
            <h4 className="text-sm font-medium text-white mb-1">Premium</h4>
            <p className="text-xs text-muted-foreground">Professional grade output</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
