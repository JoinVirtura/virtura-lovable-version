import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Upload, Sparkles, Download, ArrowRight, Image as ImageIcon, Video, Zap, Star, Eye, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

export function UploadSection() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processingSteps = [
    "Analyzing content...",
    "Enhancing image quality...",
    "Generating AI variations...",
    "Creating optimized versions...",
    "Finalizing results..."
  ];

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

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error("Please upload an image or video file");
      return;
    }
    
    setUploadedFile(file);
    setIsProcessing(true);
    setProcessingStep(0);
    setProcessingProgress(0);
    
    // Simulate realistic processing with progress
    const processFile = () => {
      const totalSteps = processingSteps.length;
      let currentStep = 0;
      let progress = 0;
      
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // Random progress increment
        
        if (progress >= 100) {
          progress = 100;
          currentStep++;
          
          if (currentStep >= totalSteps) {
            clearInterval(interval);
            setIsProcessing(false);
            toast.success("🎉 File processed successfully!");
            return;
          }
          
          progress = 0;
          setProcessingStep(currentStep);
        }
        
        setProcessingProgress(progress);
      }, 300);
    };
    
    processFile();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const getFileTypeIcon = (file: File) => {
    return file.type.startsWith('video/') ? Video : ImageIcon;
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          AI Content Studio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your photos and videos into professional content with cutting-edge AI technology
        </p>
      </div>

      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-all duration-500 animate-fade-in ${
            isDragging 
              ? "border-yellow-500 bg-gradient-to-br from-yellow-50/20 to-orange-50/20 shadow-2xl scale-[1.02] shadow-yellow-500/30" 
              : "border-border hover:border-yellow-500/50 hover:shadow-lg"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-16 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-2xl">
                <Upload className="w-12 h-12 text-white" />
              </div>
              {isDragging && (
                <div className="absolute inset-0 w-24 h-24 mx-auto rounded-full bg-yellow-500/20 animate-ping"></div>
              )}
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  ✨ Upload a photo or video and let Virtura repurpose it instantly
                </h3>
                <p className="text-muted-foreground text-lg">
                  Drag and drop your files here or click to browse
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white hover-scale shadow-lg"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Choose Files
                </Button>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="gap-1">
                    <ImageIcon className="w-3 h-3" />
                    JPG, PNG, WEBP
                  </Badge>
                  <Badge variant="secondary" className="gap-1">
                    <Video className="w-3 h-3" />
                    MP4, MOV, AVI
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">AI Enhancement</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Zap className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">Instant Processing</span>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/50">
                  <Star className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">Pro Quality</span>
                </div>
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
        <div className="space-y-8 animate-fade-in">
          {isProcessing ? (
            <Card className="p-8 text-center bg-gradient-to-br from-background to-accent/20">
              <div className="max-w-md mx-auto space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center animate-pulse shadow-2xl">
                    <Sparkles className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-full bg-yellow-500/20 animate-ping"></div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">{processingSteps[processingStep]}</h3>
                  <p className="text-muted-foreground">AI is working its magic ✨</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Step {processingStep + 1} of {processingSteps.length}</span>
                      <span>{Math.round(processingProgress)}%</span>
                    </div>
                    <Progress value={processingProgress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-center gap-2 mt-4">
                    {getFileTypeIcon(uploadedFile) === Video ? (
                      <Video className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-sm text-muted-foreground">{uploadedFile.name}</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <>
              {/* Results Header */}
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-foreground">🎉 Processing Complete!</h2>
                <p className="text-muted-foreground">Your content has been enhanced and optimized with AI</p>
              </div>

              {/* Main Results */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Enhanced Version */}
                <Card className="p-6 hover-scale transition-all duration-300 border-2 border-green-200/50 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        Enhanced Version
                      </h3>
                      <Badge className="bg-green-100 text-green-700 border-green-300">Enhancor AI</Badge>
                    </div>
                    
                    <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex items-center justify-center border-2 border-dashed border-green-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-green-600" />
                        </div>
                        <p className="text-sm text-muted-foreground font-medium">Enhanced Preview</p>
                        <p className="text-xs text-muted-foreground">Quality improved by 4x</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1">
                        <Eye className="w-4 h-4" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* AI Variations */}
                <Card className="p-6 hover-scale transition-all duration-300 border-2 border-blue-200/50 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        AI Variations
                      </h3>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-300">OpenArt/KlingAI</Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Style Transfer", likes: 42 },
                        { label: "Color Pop", likes: 38 },
                        { label: "Artistic", likes: 51 },
                        { label: "Pro Edit", likes: 29 }
                      ].map((variation, index) => (
                        <div key={index} className="aspect-square bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-blue-300 relative overflow-hidden group cursor-pointer">
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-colors"></div>
                          <div className="relative z-10 text-center">
                            <div className="w-8 h-8 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <Star className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-xs text-muted-foreground font-medium">{variation.label}</p>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Heart className="w-3 h-3 text-red-400" />
                              <span className="text-xs text-muted-foreground">{variation.likes}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <Button size="sm" variant="outline" className="w-full">
                      View All 12 Variations
                    </Button>
                  </div>
                </Card>
              </div>

              {/* AI Suggestion */}
              <Card className="p-8 bg-gradient-to-r from-violet-50/80 to-purple-50/80 border-2 border-violet-200/50 animate-scale-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                        AI Suggestion
                        <Badge className="bg-violet-100 text-violet-700 border-violet-300">Powered by GPT-5</Badge>
                      </h3>
                      <p className="text-muted-foreground mb-4 text-lg">
                        "Want me to make a TikTok ad version of this?"
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Video className="w-4 h-4" />
                          9:16 Aspect Ratio
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-4 h-4" />
                          60s Duration
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          Trending Style
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="gap-2">
                      <Share2 className="w-4 h-4" />
                      Share
                    </Button>
                    <Button className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white hover-scale gap-2 text-lg px-6">
                      Create TikTok Ad
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadedFile(null);
                    setIsProcessing(false);
                    setProcessingStep(0);
                    setProcessingProgress(0);
                  }}
                  className="gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Upload Another File
                </Button>
                <Button className="gap-2" disabled>
                  <Download className="w-4 h-4" />
                  Download All (3 files)
                </Button>
                <Button variant="outline" className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Results
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}