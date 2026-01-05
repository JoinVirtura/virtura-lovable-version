import { Textarea } from "@/components/ui/textarea";
import { Camera, Mic, Send, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface InteractiveHeroInputProps {
  onGenerate: (prompt: string, referenceImage?: string) => void;
  isGenerating: boolean;
  value: string;
  onChange: (value: string) => void;
}

const PLACEHOLDER_PROMPTS = [
  "A futuristic city at sunset with flying cars...",
  "Professional headshot in modern office...",
  "Abstract art with vibrant gradients...",
  "Serene forest with mystical glowing lake...",
  "Creative artist in colorful studio...",
  "Minimalist luxury tech product...",
];

export function InteractiveHeroInput({ onGenerate, isGenerating, value, onChange }: InteractiveHeroInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPlaceholder = PLACEHOLDER_PROMPTS[placeholderIndex];

  const handleGenerate = () => {
    if (!value.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    onGenerate(value, uploadedImage || undefined);
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info("Listening...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onChange(transcript);
      toast.success("Voice captured!");
      setIsRecording(false);
    };

    recognition.onerror = () => {
      toast.error("Failed to capture voice");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image must be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        toast.success("Reference image uploaded");
      };
      reader.readAsDataURL(file);
    }
    // Reset input to allow re-uploading same file
    e.target.value = '';
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    toast.info("Reference image removed");
  };

  return (
    <Card className="max-w-full sm:max-w-4xl mx-auto backdrop-blur-xl bg-black/60 border-2 border-primary/30 shadow-2xl rounded-xl sm:rounded-2xl overflow-hidden">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileUpload}
      />
      
      <div className="p-3 sm:p-4">
        {/* Uploaded image preview */}
        {uploadedImage && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative group">
              <img 
                src={uploadedImage} 
                alt="Reference" 
                className="w-16 h-16 object-cover rounded-lg border border-primary/50"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center transition-colors"
                title="Remove reference image"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
            <span className="text-xs text-muted-foreground">Reference image attached</span>
          </div>
        )}
        
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Single-line Textarea */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder={currentPlaceholder}
            className="flex-1 min-h-[40px] max-h-[120px] text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-2 overflow-y-auto placeholder:text-muted-foreground/60"
          />
          
          {/* Action Buttons on Right */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Camera Button - Hidden on very small screens */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className={`hidden sm:flex w-9 h-9 rounded-full backdrop-blur-md border transition-all duration-300 items-center justify-center group ${
                uploadedImage 
                  ? 'bg-primary/20 border-primary/60' 
                  : 'bg-black/40 border-primary/30 hover:border-primary/60 hover:bg-primary/10'
              }`}
              title="Upload reference image"
            >
              <Camera className={`h-4 w-4 transition-colors ${
                uploadedImage ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
              }`} />
            </button>

            {/* Microphone Button - Hidden on very small screens */}
            <button
              onClick={handleVoiceInput}
              className={`hidden sm:flex w-9 h-9 rounded-full backdrop-blur-md border transition-all duration-300 items-center justify-center group ${
                isRecording 
                  ? 'bg-red-500 border-red-400 animate-pulse' 
                  : 'bg-black/40 border-primary/30 hover:border-primary/60 hover:bg-primary/10'
              }`}
              title={isRecording ? "Recording..." : "Voice input"}
            >
              <Mic className={`h-4 w-4 transition-colors ${
                isRecording ? 'text-white' : 'text-muted-foreground group-hover:text-primary'
              }`} />
            </button>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !value.trim()}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-r from-primary to-primary-blue hover:shadow-violet-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              title="Generate"
            >
              {isGenerating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}
