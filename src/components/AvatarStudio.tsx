import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { 
  MessageCircle,
  Send, 
  Sparkles, 
  Download, 
  Share2, 
  Heart,
  Edit3,
  Wand2,
  Shield,
  FileImage,
  Video,
  Instagram,
  Linkedin,
  PlayCircle,
  CheckCircle,
  Zap,
  Crown,
  Eye,
  EyeOff,
  Upload,
  Mic,
  MicOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface PreviewCard {
  id: string;
  imageUrl: string;
  prompt: string;
  isGenerating: boolean;
  safetyPassed: boolean;
  isSelected?: boolean;
  isFavorited?: boolean;
}


interface AvatarStudioProps {
  editImage?: {
    imageUrl: string;
    prompt: string;
    title: string;
    dbId?: string;
  } | null;
  onBackToLibrary?: () => void;
}

export const AvatarStudio = ({ editImage, onBackToLibrary }: AvatarStudioProps) => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry fingers, extra limbs, distorted faces, unrealistic body proportions, text, watermark, low quality");
  const [adherence, setAdherence] = useState(8.5); // Ultra-high adherence
  const [steps, setSteps] = useState(75); // Ultra-high quality steps
  const [enhanceEnabled, setEnhanceEnabled] = useState(true); // Always enhanced
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMultiGeneration, setIsMultiGeneration] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [previewCards, setPreviewCards] = useState<PreviewCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showInputCard, setShowInputCard] = useState(true);
  
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [aiProofEnabled, setAiProofEnabled] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(editImage?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [savingToLibrary, setSavingToLibrary] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Character presets (stored locally for session)
  const [characterPresets, setCharacterPresets] = useState<Array<{
    id: string;
    name: string;
    baseImage: string;
    prompt: string;
  }>>([]);

  // Clear reference image when editImage becomes null (normal mode)
  useEffect(() => {
    if (editImage === null) {
      setReferenceImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else if (editImage?.imageUrl) {
      setReferenceImage(editImage.imageUrl);
    }
  }, [editImage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const checkPromptSafety = (text: string): { safe: boolean; reframedPrompt?: string } => {
    const unsafeKeywords = ['nude', 'naked', 'explicit', 'nsfw', 'child', 'minor', 'violence', 'weapon'];
    const lowerText = text.toLowerCase();
    
    for (const keyword of unsafeKeywords) {
      if (lowerText.includes(keyword)) {
        // Reframe unsafe prompts
        if (keyword === 'nude' || keyword === 'naked') {
          return { 
            safe: false, 
            reframedPrompt: text.replace(/nude|naked/gi, 'portrait') + ' (appropriate clothing added for safety)'
          };
        }
        return { safe: false };
      }
    }
    return { safe: true };
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be smaller than 10MB");
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert to base64 for immediate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setReferenceImage(base64);
        toast.success("Reference image uploaded successfully!");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.success("Reference image removed");
  };

  const handleVariantSelect = (cardId: string) => {
    setSelectedVariant(selectedVariant === cardId ? null : cardId);
    setPreviewCards(prev => prev.map(card => ({
      ...card,
      isSelected: card.id === cardId ? !card.isSelected : false
    })));
  };

  const handleSaveToLibrary = async (card: PreviewCard) => {
    if (!card.imageUrl || card.imageUrl === "/placeholder.svg") {
      toast.error("Cannot save placeholder image to library");
      return;
    }

    setSavingToLibrary(card.id);
    
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      if (editImage?.dbId) {
        // Update existing library item when in edit mode
        const { error } = await supabase
          .from('avatar_library')
          .update({
            image_url: card.imageUrl,
            prompt: card.prompt,
            updated_at: new Date().toISOString()
          })
          .eq('id', editImage.dbId);

        if (error) {
          console.error('Error updating library item:', error);
          toast.error("Failed to update library item. Please try again.");
          return;
        }

        toast.success("Avatar updated in library!");
      } else {
        // Save new item to avatar library
        const { error } = await supabase
          .from('avatar_library')
          .insert({
            image_url: card.imageUrl,
            prompt: card.prompt,
            title: `Generated Avatar ${new Date().toLocaleDateString()}`,
            user_id: (await supabase.auth.getUser()).data.user?.id
          });

        if (error) {
          console.error('Error saving to library:', error);
          toast.error("Failed to save to library. Please try again.");
          return;
        }

        toast.success("Avatar saved to library!");
      }

      // Update card state to show it's favorited
      setPreviewCards(prev => prev.map(c => 
        c.id === card.id ? { ...c, isFavorited: true } : c
      ));

    } catch (error) {
      console.error('Save to library error:', error);
      toast.error("Failed to save to library. Please try again.");
    } finally {
      setSavingToLibrary(null);
    }
  };

  const handleShareVariant = async (card: PreviewCard) => {
    if (!card.imageUrl || card.imageUrl === "/placeholder.svg") {
      toast.error("Cannot share placeholder image");
      return;
    }

    try {
      if (navigator.share) {
        await navigator.share({
          title: 'My AI Generated Avatar',
          text: 'Check out this amazing avatar I created!',
          url: window.location.href
        });
      } else {
        // Fallback: copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error("Failed to share. Please try again.");
    }
  };

  const handleDownloadVariant = async (card: PreviewCard) => {
    if (!card.imageUrl || card.imageUrl === "/placeholder.svg") {
      toast.error("Cannot download placeholder image");
      return;
    }

    try {
      const response = await fetch(card.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `avatar-${card.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Avatar downloaded!");
    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download. Please try again.");
    }
  };

  const generatePreviews = async (userPrompt: string) => {
    const safetyCheck = checkPromptSafety(userPrompt);
    
    if (!safetyCheck.safe && !safetyCheck.reframedPrompt) {
      toast.error("Prompt contains unsafe content. Please revise your request.");
      return;
    }

    const finalPrompt = safetyCheck.reframedPrompt || userPrompt;
    setIsGenerating(true);

    // Ultra-realistic enhancement following professional photography standards
    // In edit mode, generate only 1 image, otherwise use normal counts
    const cardCount = editImage ? 1 : (isMultiGeneration ? 10 : 3);
    
    const intelligentVariants = isMultiGeneration 
      ? [
          "professional studio headshot, perfect lighting, high-end fashion photography style, ultra sharp detail, hyperrealistic skin texture, professional makeup, 85mm lens, shallow depth of field, award-winning portrait photography, 8K ultra HD, magazine cover quality, commercial photography, flawless composition",
          "cinematic portrait, dramatic lighting, editorial fashion style, award-winning photography, medium format camera quality, professional color grading, cinematic bokeh, moody atmosphere, artistic shadows, luxury fashion shoot, ultra-realistic, pristine detail, professional retouching",
          "natural lifestyle portrait, golden hour lighting, authentic expression, candid moment, lifestyle photography, warm natural tones, organic composition, photojournalism style, environmental portrait, genuine emotion, professional quality, ultra-sharp focus, perfect exposure",
          "glamour photography, studio perfection, high-end beauty shoot, flawless lighting setup, professional makeup artistry, luxury fashion styling, ultra-high resolution, pristine detail, magazine quality, commercial beauty photography",
          "artistic portrait, creative lighting, avant-garde composition, editorial excellence, fashion photography mastery, dramatic shadows, professional artistry, ultra-realistic detail, museum quality photography",
          "classic portrait, timeless elegance, refined styling, traditional photography excellence, perfect composition, professional lighting mastery, heritage quality, pristine craftsmanship, archival standard",
          "contemporary portrait, modern aesthetic, urban sophistication, cutting-edge photography, innovative lighting, professional excellence, ultra-modern quality, pristine execution",
          "intimate close-up, emotional depth, psychological portrait, masterful lighting, professional artistry, ultra-detailed, soul-capturing quality, exhibition standard",
          "corporate executive portrait, boardroom excellence, professional authority, commanding presence, luxury business photography, ultra-sharp detail, executive quality standards",
          "creative artistic interpretation, innovative perspective, avant-garde excellence, artistic mastery, professional creativity, ultra-high quality, gallery exhibition standard"
        ]
      : [
          "professional studio headshot, perfect lighting, high-end fashion photography style, ultra sharp detail, hyperrealistic skin texture, professional makeup, 85mm lens, shallow depth of field, award-winning portrait photography, 8K ultra HD, magazine cover quality, commercial photography, flawless composition",
          "cinematic portrait, dramatic lighting, editorial fashion style, award-winning photography, medium format camera quality, professional color grading, cinematic bokeh, moody atmosphere, artistic shadows, luxury fashion shoot, ultra-realistic, pristine detail, professional retouching",
          "natural lifestyle portrait, golden hour lighting, authentic expression, candid moment, lifestyle photography, warm natural tones, organic composition, photojournalism style, environmental portrait, genuine emotion, professional quality, ultra-sharp focus, perfect exposure"
        ];

    const newCards: PreviewCard[] = Array.from({ length: cardCount }, (_, i) => ({
      id: Date.now() + "_" + (i + 1),
      imageUrl: "/placeholder.svg",
      prompt: `${finalPrompt}, ${intelligentVariants[i]}`,
      isGenerating: true,
      safetyPassed: true,
      isSelected: false,
      isFavorited: false
    }));

    setPreviewCards(newCards);

    try {
      // Call actual avatar generation service
      const { AvatarService } = await import("@/services/avatarService");
      
      // Sequential generation with enhanced error handling and ultra-quality settings
      for (let i = 0; i < newCards.length; i++) {
        try {
          const result = await AvatarService.generateAvatar({
            prompt: newCards[i].prompt,
            negativePrompt: `${negativePrompt}, blurry, low quality, distorted, deformed, ugly, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed face, long neck, cropped, worst quality, low quality, jpeg artifacts, watermark, signature, text, logo`,
            adherence: 12.0, // Ultra-high adherence for professional quality
            steps: 100, // Maximum inference steps for ultra-realistic results
            enhance: true, // Always enhance for maximum quality
            selectedPreset,
            resolution: "1024x1024",
            photoMode: true, // Always use photo mode for realism
            referenceImage
          });

          if (result.success && result.image) {
            setPreviewCards(prev => prev.map(card => 
              card.id === newCards[i].id 
                ? { ...card, imageUrl: result.image!, isGenerating: false, safetyPassed: true }
                : card
            ));
            console.log(`Ultra-realistic variant ${i + 1} generated successfully`);
            
            if (i === 0) {
              toast.success("Ultra-realistic avatar generated!");
            }
          } else {
            const errorMessage = result.error || 'Unknown error occurred';
            setPreviewCards(prev => prev.map(card => 
              card.id === newCards[i].id 
                ? { ...card, isGenerating: false, safetyPassed: false }
                : card
            ));
            console.error(`Generation failed for variant ${i + 1}:`, errorMessage);
          }
        } catch (error) {
          console.error(`Generation failed for variant ${i + 1}:`, error);
          setPreviewCards(prev => prev.map(card => 
            card.id === newCards[i].id 
              ? { ...card, isGenerating: false, safetyPassed: false }
              : card
          ));
        }

        // Strategic delay between variants to prevent API rate limiting
        if (i < newCards.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000));
        }
      }
      
      setIsGenerating(false);
      
      // Add workflow suggestion
      const suggestions = isMultiGeneration 
        ? ["Great! Now enhance the best images and create a character preset"]
        : ["Perfect! Try 'Generate 10+ variants' for a full dataset, or enhance your favorite"];
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "assistant",
        content: suggestions[0],
        timestamp: new Date()
      }]);
    } catch (error) {
      setIsGenerating(false);
      toast.error("Generation failed. Please try again.");
      console.error("Avatar generation error:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    // Clear the input immediately
    const currentPrompt = prompt;
    setPrompt("");

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: currentPrompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setShowInputCard(false); // Hide input card immediately when generation starts
    
    // Check if it's a refinement or new generation
    if (previewCards.length > 0 && (currentPrompt.toLowerCase().includes('change') || currentPrompt.toLowerCase().includes('make') || currentPrompt.toLowerCase().includes('add') || currentPrompt.toLowerCase().includes('remove'))) {
      // Handle refinements - apply to all variants
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant", 
        content: `Applying "${currentPrompt}" to all variants. Regenerating now...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update and regenerate all existing cards with the edit
      setIsGenerating(true);
      const updatedPrompt = currentPrompt;
      
      try {
        for (let i = 0; i < previewCards.length; i++) {
          const updatedCardPrompt = previewCards[i].prompt + `, ${updatedPrompt}`;
          
          // Mark card as generating
          setPreviewCards(prev => prev.map((card, idx) => 
            idx === i ? { ...card, isGenerating: true, prompt: updatedCardPrompt } : card
          ));

          // Generate new image with updated prompt
          const { AvatarService } = await import("@/services/avatarService");
          const result = await AvatarService.generateAvatar({
            prompt: updatedCardPrompt,
            negativePrompt,
            adherence,
            steps,
            enhance: enhanceEnabled,
            selectedPreset,
            resolution: "1024x1024",
            photoMode: true,
            referenceImage
          });

          if (result.success && result.image) {
            setPreviewCards(prev => prev.map((card, idx) => 
              idx === i ? { ...card, imageUrl: result.image!, isGenerating: false, safetyPassed: true } : card
            ));
          } else {
            const errorMessage = result.error || 'Edit failed';
            setPreviewCards(prev => prev.map((card, idx) => 
              idx === i ? { ...card, isGenerating: false, safetyPassed: false } : card
            ));
            console.error(`Edit failed for variant ${i + 1}:`, errorMessage);
            toast.error(`Edit failed for variant ${i + 1}: ${errorMessage}`);
          }
        }
        
        setIsGenerating(false);
        
        setMessages(prev => [...prev, {
          id: (Date.now() + 2).toString(),
          type: "assistant",
          content: "All variants updated successfully! Try another edit or generate new variants.",
          timestamp: new Date()
        }]);
        
      } catch (error) {
        setIsGenerating(false);
        toast.error("Edit failed. Please try again.");
      }
      
    } else {
      // Generate new previews
      await generatePreviews(currentPrompt);
      
      // Smooth scroll to Generated Previews section
      setTimeout(() => {
        const resultsSection = document.querySelector('.space-y-8:has(.grid.grid-cols-1.md\\:grid-cols-3)');
        if (resultsSection) {
          resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: scroll to any element with "Generated Previews" text
          const elements = Array.from(document.querySelectorAll('*')).find(el => 
            el.textContent?.includes('Generated Previews')
          );
          if (elements) {
            elements.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 500);
    }
  };

  // Voice input functionality
  const toggleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startVoiceInput();
    }
  };

  const startVoiceInput = () => {
    if (recognition) {
      try {
        setIsRecording(true);
        recognition.start();
        toast.info("Listening... Click mic again to stop");
        
        // Auto-stop after 15 seconds
        setTimeout(() => {
          if (isRecording) {
            recognition.stop();
          }
        }, 15000);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsRecording(false);
        startRecordingWithFallback();
      }
    } else {
      startRecordingWithFallback();
    }
  };

  const stopRecording = () => {
    if (recognition && isRecording) {
      recognition.stop();
    }
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
    setIsRecording(false);
  };

  const startRecordingWithFallback = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await transcribeWithWhisper(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      recorder.start();
      
      toast.info("Recording with Whisper API... Click mic to stop");

      // Auto-stop after 15 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
          setIsRecording(false);
        }
      }, 15000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error("Could not access microphone. Please check permissions.");
      setIsRecording(false);
    }
  };

  const transcribeWithWhisper = async (audioBlob: Blob) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('voice-transcribe', {
          body: { audio: base64Audio }
        });

        if (error) {
          console.error('Transcription error:', error);
          toast.error("Transcription failed. Please try again or use text input.");
          return;
        }

        if (data.ok && data.transcript) {
          setPrompt(prev => prev ? `${prev} ${data.transcript}` : data.transcript);
          toast.success("Voice transcribed successfully!");
        } else {
          toast.error("No speech detected. Please try again.");
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error("Transcription failed. Please try again.");
    }
  };

  // Set reference image when in edit mode
  useEffect(() => {
    if (editImage) {
      setReferenceImage(editImage.imageUrl);
      setShowInputCard(true); // Show input card to allow modifications
    }
  }, [editImage]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setPrompt(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsRecording(false);
        toast.success("Voice input captured!");
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        if (event.error === 'not-allowed') {
          toast.error("Microphone access denied. Please allow microphone access.");
        } else {
          toast.error("Speech recognition failed. Trying Whisper API...");
          startRecordingWithFallback();
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognition);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'm') {
        event.preventDefault();
        toggleVoiceInput();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording]);

  const handleChatMessage = handleSendMessage;

  const handleQuickEdit = (cardId: string, edit: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      type: "assistant",
      content: `Applying "${edit}" to your selection...`,
      timestamp: new Date()
    }]);

    setPreviewCards(prev => prev.map(card => 
      card.id === cardId 
        ? { ...card, prompt: card.prompt + ` + ${edit}`, isGenerating: true }
        : card
    ));

    setTimeout(() => {
      setPreviewCards(prev => prev.map(card => 
        card.id === cardId 
          ? { ...card, isGenerating: false }
          : card
      ));
    }, 2000);
  };

  return (
    <section className="min-h-screen bg-gradient-hero pt-20 overflow-x-hidden w-full relative">
      {/* Background Graphics */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Circular patterns */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-primary/10 rounded-full animate-gentle-sway"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 border border-primary/15 rounded-full animate-gentle-sway" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 border border-primary/8 rounded-full animate-gentle-sway" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-32 h-32 border border-primary/20 rounded-full animate-gentle-sway" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-primary/12 rounded-full animate-gentle-sway" style={{animationDelay: '1.5s'}}></div>
        
        {/* Scattered yellow dots */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-yellow-400/50 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-yellow-400/70 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/6 right-1/6 w-2.5 h-2.5 bg-yellow-400/45 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-yellow-400/55 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-yellow-400/35 rounded-full animate-pulse" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-1/6 right-1/2 w-1 h-1 bg-yellow-400/60 rounded-full animate-pulse" style={{animationDelay: '1.8s'}}></div>
      </div>
      
      <div className="w-full px-4 py-8 relative z-10">
        <div className="max-w-5xl mx-auto w-full">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <h1 className="text-4xl font-display font-bold text-foreground">
                AI <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Image</span> Studio
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-8">Your ChatGPT-powered creative assistant</p>

            {/* Edit Mode - Display the original image being edited */}
            {editImage && (
              <div className="mb-8">
                <Card className="max-w-md mx-auto p-4 bg-gradient-card border-primary/20">
                  <img 
                    src={editImage.imageUrl} 
                    alt={editImage.title}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-muted-foreground mt-3 text-center">
                    Original: {editImage.prompt}
                  </p>
                </Card>
              </div>
            )}

            
            {/* Main Search Bar - Show only when showInputCard is true */}
            {showInputCard && (
              <Card className="w-full max-w-3xl mx-auto p-3 bg-gradient-card border-border/50 shadow-lg">
                <div className="space-y-3 w-full">
                  {/* Positive Prompt */}
                  <div className="flex gap-2 w-full">
                    <Textarea
                      placeholder="Describe your avatar idea... e.g., 'Tall young woman walking down the street in high heels, detailed clothing, realistic natural lighting'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 min-h-[60px] resize-none bg-background/50 border-0 focus-visible:ring-0 text-base min-w-0"
                    />
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline"
                      size="lg"
                      className="px-3 py-4 border-border/50 hover:border-primary/50 flex-shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline"
                            size="lg"
                            className={`px-3 py-4 border-border/50 hover:border-primary/50 flex-shrink-0 ${
                              isRecording ? 'animate-pulse bg-red-500/20 border-red-500/50' : ''
                            }`}
                            onClick={toggleVoiceInput}
                            disabled={isGenerating}
                          >
                            {isRecording ? (
                              <MicOff className="w-5 h-5 text-red-500" />
                            ) : (
                              <Mic className="w-5 h-5" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Speak your prompt</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!prompt.trim() || isGenerating}
                      className="px-6 py-4 bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      {isGenerating ? (
                        <div className="animate-spin w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  {/* Reference Image Preview */}
                  {referenceImage && (
                    <div className="flex items-center gap-3 p-3 bg-background/30 rounded-lg border border-border/30">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-background/50">
                        <img 
                          src={referenceImage} 
                          alt="Reference" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Reference Image</p>
                        <p className="text-xs text-muted-foreground">This image will guide the generation</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeReferenceImage}
                        className="border-border/50 hover:border-red-500/50 hover:text-red-500"
                      >
                        Remove
                      </Button>
                    </div>
                  )}

                  {/* Negative Prompt */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground mb-2 block">Negative Prompt</label>
                    <Textarea
                      placeholder="What to avoid: blurry fingers, extra limbs, distorted faces..."
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      className="min-h-[60px] resize-none bg-background/30 border-border/30 text-sm"
                    />
                  </div>

                  {/* Settings Row */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Adherence:</label>
                      <select 
                        value={adherence} 
                        onChange={(e) => setAdherence(Number(e.target.value))}
                        className="px-2 py-1 rounded border border-border/30 bg-background/50 text-sm"
                      >
                        {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18].map(n => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-muted-foreground">Steps:</label>
                      <select 
                        value={steps} 
                        onChange={(e) => setSteps(Number(e.target.value))}
                        className="px-2 py-1 rounded border border-border/30 bg-background/50 text-sm"
                      >
                        <option value={20}>20</option>
                        <option value={30}>30</option>
                        <option value={49}>49 (Recommended)</option>
                        <option value={100}>100</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={enhanceEnabled}
                        onCheckedChange={setEnhanceEnabled}
                      />
                      <label className="text-sm text-muted-foreground">Enhance</label>
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch 
                        checked={isMultiGeneration}
                        onCheckedChange={setIsMultiGeneration}
                      />
                      <label className="text-sm text-muted-foreground">Generate 10+ variants</label>
                    </div>

                    {characterPresets.length > 0 && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Character:</label>
                        <select 
                          value={selectedPreset || ''} 
                          onChange={(e) => setSelectedPreset(e.target.value || null)}
                          className="px-2 py-1 rounded border border-border/30 bg-background/50 text-sm"
                        >
                          <option value="">None</option>
                          {characterPresets.map(preset => (
                            <option key={preset.id} value={preset.name}>@{preset.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}


            {/* Quick Suggestions */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                "Professional headshot",
                "LinkedIn banner", 
                "Social media avatar",
                "Creative portrait"
              ].map((suggestion) => (
                <Button
                  key={suggestion}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(suggestion)}
                  className="border-border/50 hover:border-primary/50"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>

          {/* Results Section */}
          {previewCards.length > 0 && (
            <div className="space-y-8 w-full">

              {/* Preview Results - Horizontal Grid */}
              <Card className="p-4 bg-gradient-card border-border/50 w-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-foreground text-xl">Generated Previews</h3>
                  <Button
                    onClick={() => {
                      setShowInputCard(true);
                      setPreviewCards([]);
                      setPrompt("");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    variant="default"
                    size="sm"
                    className="h-8 px-4"
                    title="Start a new generation"
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    New Generation
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {previewCards.map((card, index) => (
                    <Card 
                      key={card.id} 
                      className={`p-4 bg-background/30 border-border/50 cursor-pointer transition-all duration-200 ${
                        card.isSelected ? 'ring-2 ring-primary border-primary/50' : 'hover:border-primary/30'
                      }`}
                      onClick={() => handleVariantSelect(card.id)}
                    >
                      <div className="aspect-[3/4] bg-background/50 rounded-lg border border-border/30 mb-4 relative overflow-hidden">
                        {card.isGenerating ? (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground">Generating...</p>
                            </div>
                          </div>
                        ) : card.imageUrl && card.imageUrl !== "/placeholder.svg" ? (
                          <>
                            <img 
                              src={card.imageUrl} 
                              alt={`Generated avatar variant ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-600 border-green-500/30">
                              <Shield className="w-3 h-3 mr-1" />
                              Safe
                            </Badge>
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-medium">Variant {index + 1}</p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                       <div className="space-y-3">

                        <div className="grid grid-cols-4 gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-border/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              const presetName = window.prompt(`Name your character preset (e.g., "Lucy"):`);
                              if (presetName && !card.isGenerating) {
                                const newPreset = {
                                  id: Date.now().toString(),
                                  name: presetName,
                                  baseImage: card.imageUrl,
                                  prompt: card.prompt
                                };
                                setCharacterPresets(prev => [...prev, newPreset]);
                                toast.success(`Character preset "@${presetName}" created!`);
                              }
                            }}
                            disabled={card.isGenerating}
                            title="Create character preset"
                          >
                            <Crown className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className={`border-border/50 ${card.isFavorited ? 'text-red-500 border-red-500/50' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveToLibrary(card);
                            }}
                            disabled={savingToLibrary === card.id || card.isGenerating}
                            title="Save to library"
                          >
                            {savingToLibrary === card.id ? (
                              <div className="animate-spin w-3 h-3 border border-primary border-t-transparent rounded-full" />
                            ) : (
                              <Heart className={`w-3 h-3 ${card.isFavorited ? 'fill-current' : ''}`} />
                            )}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-border/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShareVariant(card);
                            }}
                            disabled={card.isGenerating}
                            title="Share variant"
                          >
                            <Share2 className="w-3 h-3" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-border/50"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadVariant(card);
                            }}
                            disabled={card.isGenerating}
                            title="Download variant"
                          >
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Studio Chat - Horizontal Interface */}
              <Card className="mt-6 p-4 bg-gradient-card border-border/50 w-full">
                <h3 className="font-semibold text-foreground mb-3">Studio Chat</h3>
                
                {/* Chat Messages - Full Width */}
                <div className="mb-4">
                  <ScrollArea className="h-48 border border-border/30 rounded-lg bg-background/30 p-4">
                    <div className="space-y-3">
                      {messages.slice(-5).map((message) => (
                        <div
                          key={message.id}
                          className={`p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary/10 border-l-2 border-primary ml-4'
                              : 'bg-muted/50 border-l-2 border-muted-foreground mr-4'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <span className="font-medium text-sm">
                              {message.type === 'user' ? 'You:' : 'AI:'}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {message.content}
                            </span>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Chat Input - Full Width */}
                <div className="mb-4">
                  <div className="flex gap-3 items-end">
                    <Textarea
                      placeholder="Type editing commands... e.g., 'change hair color to green'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleChatMessage();
                        }
                      }}
                      className="flex-1 min-h-[80px] resize-none bg-background/50 border-border/30 text-sm"
                    />
                    <Button 
                      onClick={handleChatMessage}
                      disabled={!prompt.trim() || isGenerating}
                      className="px-6 h-[80px]"
                      size="lg"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Quick Edit Suggestions - Horizontal Scrollable */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground font-medium">Quick Edits:</p>
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {[
                      "Change hair color to blonde",
                      "Add professional clothing", 
                      "Make background darker",
                      "Change to sunset lighting",
                      "Add luxury jewelry",
                      "Change pose to sitting",
                      "Make outfit more casual",
                      "Add natural makeup",
                      "Change to studio lighting",
                      "Add vintage filter",
                      "Make skin tone warmer",
                      "Change expression to smiling"
                    ].map((suggestion) => (
                      <Button
                        key={suggestion}
                        variant="outline"
                        size="sm"
                        onClick={() => setPrompt(suggestion)}
                        className="text-sm border-border/30 hover:border-primary/30 whitespace-nowrap h-10 flex-shrink-0"
                      >
                        {suggestion}
                      </Button>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Settings - Horizontal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                
                {/* Format Settings */}
                <Card className="p-4 bg-gradient-card border-border/50 w-full">
                  <h3 className="font-semibold text-foreground mb-3">Format Options</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Button variant="outline" className="border-border/50">
                        <FileImage className="w-4 h-4 mr-2" />
                        PNG
                      </Button>
                      <Button variant="outline" className="border-border/50">
                        <FileImage className="w-4 h-4 mr-2" />
                        JPG
                      </Button>
                    </div>
                    
                    <Button variant="outline" className="w-full border-border/50">
                      <Video className="w-4 h-4 mr-2" />
                      MP4 Video
                      <Crown className="w-4 h-4 ml-2 text-yellow-500" />
                    </Button>
                  </div>
                </Card>

                {/* Safety & Settings */}
                <Card className="p-4 bg-gradient-card border-border/50 w-full">
                  <h3 className="font-semibold text-foreground mb-3">Safety & Settings</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {watermarkEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span className="text-sm">Watermark</span>
                      </div>
                      <Switch 
                        checked={watermarkEnabled}
                        onCheckedChange={setWatermarkEnabled}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span className="text-sm">AI Proof Content</span>
                      </div>
                      <Switch 
                        checked={aiProofEnabled}
                        onCheckedChange={setAiProofEnabled}
                      />
                    </div>
                    
                    <div className="pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-green-600">
                        <CheckCircle className="w-3 h-3" />
                        <span>Content scanning active</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
                        <Shield className="w-3 h-3" />
                        <span>Unsafe prompt blocking enabled</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};