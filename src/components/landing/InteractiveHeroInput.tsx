import { Textarea } from "@/components/ui/textarea";
import { Camera, Mic, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface InteractiveHeroInputProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const PLACEHOLDER_PROMPTS = [
  "A futuristic city at sunset with flying cars...",
  "Professional headshot in modern office...",
  "Abstract art with vibrant gradients...",
  "Serene forest with mystical glowing lake...",
  "Creative artist in colorful studio...",
  "Minimalist luxury tech product...",
];

export function InteractiveHeroInput({ onGenerate, isGenerating }: InteractiveHeroInputProps) {
  const [prompt, setPrompt] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  // Rotate placeholder every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_PROMPTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentPlaceholder = PLACEHOLDER_PROMPTS[placeholderIndex];

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }
    onGenerate(prompt);
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
      setPrompt(transcript);
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

  return (
    <Card className="max-w-4xl mx-auto backdrop-blur-xl bg-black/60 border-2 border-primary/30 shadow-2xl rounded-2xl overflow-hidden">
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Single-line Textarea */}
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder={currentPlaceholder}
            className="flex-1 min-h-[32px] max-h-[32px] text-sm bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none py-2 placeholder:text-muted-foreground/60"
          />
          
          {/* Action Buttons on Right */}
          <div className="flex items-center gap-2">
            {/* Camera Button */}
            <button
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-primary/30 hover:border-primary/60 hover:bg-primary/10 transition-all duration-300 flex items-center justify-center group"
              title="Upload reference image"
            >
              <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </button>

            {/* Microphone Button */}
            <button
              onClick={handleVoiceInput}
              className={`w-9 h-9 rounded-full backdrop-blur-md border transition-all duration-300 flex items-center justify-center group ${
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
              disabled={isGenerating || !prompt.trim()}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-blue hover:shadow-violet-glow transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
