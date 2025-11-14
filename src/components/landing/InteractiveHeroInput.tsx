import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Camera, Mic, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";

interface InteractiveHeroInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const PLACEHOLDER_PROMPTS = [
  "A futuristic city at sunset with flying cars and neon lights...",
  "Professional headshot of a confident business executive in modern office...",
  "Abstract geometric art with vibrant purple and blue gradients...",
  "A serene forest landscape with a mystical glowing lake...",
  "Portrait of a creative artist in their colorful studio workspace...",
  "Minimalist product photography of luxury tech device...",
];

export function InteractiveHeroInput({ onGenerate, isGenerating }: InteractiveHeroInputProps) {
  const [prompt, setPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt to generate images");
      return;
    }
    onGenerate(prompt);
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info("Listening... Speak your prompt");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setPrompt(transcript);
      toast.success("Voice captured!");
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      toast.error("Failed to capture voice. Please try again.");
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleImageUpload = () => {
    toast.info("Image upload coming soon!");
  };

  const characterCount = prompt.length;
  const maxCharacters = 500;

  return (
    <div className="relative max-w-3xl mx-auto animate-fade-in input-card">
      {/* Main Input Card */}
      <div className="relative rounded-2xl border border-primary/30 bg-card/30 backdrop-blur-xl p-6 shadow-elegant">
        {/* Textarea */}
        <Textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, maxCharacters))}
          placeholder={PLACEHOLDER_PROMPTS[placeholderIndex]}
          disabled={isGenerating}
          className="min-h-[120px] text-lg resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 transition-all"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleGenerate();
            }
          }}
        />

        {/* Character Counter */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            {characterCount} / {maxCharacters} characters
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleImageUpload}
              disabled={isGenerating}
              className="hover:bg-primary/10"
              title="Upload reference image"
            >
              <Camera className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceInput}
              disabled={isGenerating}
              className={`hover:bg-primary/10 ${isRecording ? 'animate-pulse bg-red-500/20' : ''}`}
              title="Voice input"
            >
              <Mic className={`w-4 h-4 ${isRecording ? 'text-red-500' : ''}`} />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              disabled={isGenerating}
              className="hover:bg-primary/10"
              title="Style options"
            >
              <Wand2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full mt-4 bg-gradient-primary hover:shadow-violet-glow transition-all h-12 text-lg"
        >
          {isGenerating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Creating Magic...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Generate AI Content
            </>
          )}
        </Button>

        {/* Hint */}
        <p className="text-center text-xs text-muted-foreground mt-3">
          Press {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+Enter to generate
        </p>
      </div>

      {/* Floating Glow Effect */}
      <div className="absolute -inset-0.5 bg-gradient-primary opacity-20 blur-xl -z-10 animate-pulse" />
    </div>
  );
}
