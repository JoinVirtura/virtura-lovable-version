import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Download, Eye, Share2 } from "lucide-react";
import { toast } from "sonner";
import { AISuggestionsLibrary } from "./AISuggestionsLibrary";
import { supabase } from "@/integrations/supabase/client";

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedVersion, setEnhancedVersion] = useState<any>(null);
  const [variations, setVariations] = useState<any[]>([]);
  const [selectedPromptStyle, setSelectedPromptStyle] = useState("professional portrait");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file for avatar twin creation");
      return;
    }
    
    setUploadedFile(file);
    setIsProcessing(true);
    setEnhancedVersion(null);
    setVariations([]);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;

        try {
          const { AvatarService } = await import("@/services/avatarService");

          // Base prompt derived from selected style
          const basePrompt = `${selectedPromptStyle}, professional studio headshot, photorealistic, sharp focus, high quality`;

          // 1) Enhanced version (acts like an upscale/refine)
          const enhanced = await AvatarService.generateAvatar({
            prompt: `${basePrompt}, enhanced quality, premium lighting`,
            photoMode: true,
            resolution: "1024x1024",
            steps: 28,
            adherence: 8,
            referenceImage: base64Image,
          });

          if (enhanced.success && enhanced.image) {
            setEnhancedVersion({ url: enhanced.image });
          } else {
            toast.error(enhanced.error || 'Failed to generate enhanced version');
          }

          // 2) Variations with consistent identity via reference image
          const variationDescriptors = [
            "business portrait, confident expression",
            "creative artistic portrait, dynamic lighting",
            "casual lifestyle portrait, natural smile",
            "elegant formal portrait, sophisticated look",
          ];

          const results: any[] = [];
          for (let i = 0; i < variationDescriptors.length; i++) {
            const result = await AvatarService.generateAvatar({
              prompt: `${basePrompt}, ${variationDescriptors[i]}`,
              photoMode: true,
              resolution: "1024x1024",
              steps: 28,
              adherence: 8,
              referenceImage: base64Image,
            });
            if (result.success && result.image) {
              results.push({ url: result.image });
            } else {
              results.push(null);
            }
          }
          setVariations(results);
          toast.success("Generated enhanced image and variations");
        } catch (genErr) {
          console.error('Generation error:', genErr);
          toast.error('Generation failed. Please try again.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      toast.error('Failed to process file');
      setIsProcessing(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Image downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download image');
    }
  };

  const shareImage = async (imageUrl: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'AI Avatar Twin',
          text: 'Check out my AI Avatar Twin!',
          url: imageUrl
        });
      } else {
        await navigator.clipboard.writeText(imageUrl);
        toast.success('Image URL copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share image');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Upload Content</h1>
        <p className="text-muted-foreground">Transform your photos and videos with AI</p>
      </div>

      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-all duration-300 animate-fade-in ${
            isDragging 
              ? "border-yellow-500 bg-yellow-50/10 shadow-lg scale-[1.02] shadow-yellow-500/20" 
              : "border-border hover:border-yellow-500/50"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-xl">
              <Upload className="w-10 h-10 text-white" />
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  ✨ Upload a photo or video and let Virtura repurpose it instantly
                </h3>
                <p className="text-muted-foreground">
                  Drag and drop your files here or click to browse
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white hover-scale"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Files
                </Button>
                <p className="text-sm text-muted-foreground">
                  Supports: JPG, PNG, MP4, MOV
                </p>
              </div>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </Card>
      ) : (
        <div className="space-y-6 animate-fade-in">
          {isProcessing ? (
            <Card className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center animate-pulse">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Processing your content...</h3>
              <p className="text-muted-foreground">AI is working its magic ✨</p>
            </Card>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Prompt Style Selection */}
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-3">Avatar Style</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    "professional portrait",
                    "creative artistic",
                    "casual lifestyle", 
                    "elegant formal"
                  ].map((style) => (
                    <Button
                      key={style}
                      variant={selectedPromptStyle === style ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedPromptStyle(style)}
                      className="text-xs"
                    >
                      {style}
                    </Button>
                  ))}
                </div>
              </Card>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-6 hover-scale flex flex-col h-full">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                    Enhanced Version (Enhancor)
                  </h3>
                  <div className="flex-1 bg-gradient-to-br from-muted to-muted/50 rounded-lg mb-6 flex items-center justify-center border min-h-[400px] overflow-hidden">
                    {enhancedVersion ? (
                      <img 
                        src={enhancedVersion.url} 
                        alt="Enhanced Avatar"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <p className="text-muted-foreground">Enhanced version preview</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      variant="outline"
                      onClick={() => enhancedVersion && downloadImage(enhancedVersion.url, 'enhanced-avatar.png')}
                      disabled={!enhancedVersion}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Enhanced
                    </Button>
                    <Button 
                      size="icon" 
                      variant="outline"
                      onClick={() => enhancedVersion && shareImage(enhancedVersion.url)}
                      disabled={!enhancedVersion}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 hover-scale">
                  <h3 className="text-lg font-semibold mb-4">AI Variations (OpenArt/KlingAI)</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border overflow-hidden group relative">
                        {variations[i] ? (
                          <>
                            <img 
                              src={variations[i].url} 
                              alt={`Variation ${i + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-white border-white/50"
                                onClick={() => downloadImage(variations[i].url, `variation-${i + 1}.png`)}
                              >
                                <Download className="w-3 h-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-white border-white/50"
                                onClick={() => shareImage(variations[i].url)}
                              >
                                <Share2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground">Variation {i + 1}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => {
                      if (variations.length > 0) {
                        toast.success(`Viewing ${variations.length} variations`);
                      } else {
                        toast.error('No variations available yet');
                      }
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View All Variations ({variations.length})
                  </Button>
                </Card>
              </div>

              <AISuggestionsLibrary />

              <Button 
                variant="outline" 
                onClick={() => {
                  setUploadedFile(null);
                  setIsProcessing(false);
                  setEnhancedVersion(null);
                  setVariations([]);
                }}
                className="w-full"
              >
                Upload Another File
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}