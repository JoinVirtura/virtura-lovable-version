import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Sparkles, Download, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { MotionBackground } from "@/components/MotionBackground";

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toast.error("Please upload an image or video file");
      return;
    }
    
    setUploadedFile(file);
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("File processed successfully!");
    }, 3000);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="flex-1 p-3 sm:p-4 md:p-6 bg-background relative overflow-hidden">
      <MotionBackground />
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 relative z-10">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Upload Content</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Transform your photos and videos with AI</p>
        </div>

        {!uploadedFile ? (
          <Card
            className={`border-2 border-dashed transition-all duration-300 ${
              isDragging 
                ? "border-yellow-500 bg-yellow-50/10 shadow-lg scale-[1.02]" 
                : "border-border hover:border-yellow-500/50"
            }`}
            style={{
              borderColor: isDragging ? "hsl(var(--warning))" : undefined,
              boxShadow: isDragging ? "0 0 20px hsl(var(--warning) / 0.3)" : undefined
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="p-6 sm:p-8 md:p-12 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 mx-auto mb-4 sm:mb-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <Upload className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
                    ✨ Upload a photo or video and let Virtura repurpose it instantly
                  </h3>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    Drag and drop your files here or click to browse
                  </p>
                </div>
                
                <div className="flex flex-col gap-2 sm:gap-3 justify-center items-center">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose Files
                  </Button>
                  <p className="text-xs sm:text-sm text-muted-foreground">
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
          <div className="space-y-6">
            {isProcessing ? (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Processing your content...</h3>
                <p className="text-muted-foreground">AI is working its magic ✨</p>
              </Card>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-yellow-500" />
                      Enhanced Version
                    </h3>
                    <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                      <p className="text-muted-foreground">Enhanced version preview</p>
                    </div>
                    <Button className="w-full" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Enhanced
                    </Button>
                  </Card>

                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">AI Variations</h3>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                          <p className="text-xs text-muted-foreground">Variation {i}</p>
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant="outline">
                      View All Variations
                    </Button>
                  </Card>
                </div>

                <Card className="p-6 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-2 border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">AI Suggestion</h3>
                      <p className="text-muted-foreground">Want me to make a TikTok ad version of this?</p>
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                      Create TikTok Ad
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>

                <Button 
                  variant="outline" 
                  onClick={() => {
                    setUploadedFile(null);
                    setIsProcessing(false);
                  }}
                  className="w-full"
                >
                  Upload Another File
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}