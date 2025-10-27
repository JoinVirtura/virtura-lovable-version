import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
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
  Settings,
  Eye,
  EyeOff,
  Upload,
  Mic,
  MicOff,
  Palette,
  Camera,
  Mountain,
  Square,
  BookOpen,
  X,
  ArrowLeft
} from "lucide-react";
import { ImageGenerationService, type ImageGenerationParams } from "@/services/imageGenerationService";
import { PromptLibrary } from "./PromptLibrary";

interface PreviewCard {
  id: string;
  imageUrl: string;
  prompt: string;
  isGenerating: boolean;
  safetyPassed: boolean;
  isSelected?: boolean;
  isFavorited?: boolean;
  metadata?: {
    contentType: string;
    style: string;
    resolution: string;
  };
}

interface AIImageStudioProps {
  editImage?: {
    imageUrl: string;
    prompt: string;
    title: string;
    dbId?: string;
  } | null;
  onBackToLibrary?: () => void;
}

export const AIImageStudio = ({ editImage, onBackToLibrary }: AIImageStudioProps = {}) => {
  const [prompt, setPrompt] = useState(editImage?.prompt || "");
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, distorted, unrealistic, text, watermark, signature");
  const [contentType, setContentType] = useState<string>("auto");
  const [style, setStyle] = useState("photorealistic");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [resolution, setResolution] = useState<string>("1024x1024");
  const [quality, setQuality] = useState<string>("balanced");
  const [adherence, setAdherence] = useState([8.5]);
  const [steps, setSteps] = useState([50]);
  const [enhanceEnabled, setEnhanceEnabled] = useState(true);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showPromptLibrary, setShowPromptLibrary] = useState(false);
  const [previewCards, setPreviewCards] = useState<PreviewCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referenceImage, setReferenceImage] = useState<string | null>(editImage?.imageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [savingToLibrary, setSavingToLibrary] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [showInputCard, setShowInputCard] = useState(true);
  const [editImageRemoved, setEditImageRemoved] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentTypes = [
    { value: "auto", label: "Auto Detect", icon: Wand2 },
    { value: "portrait", label: "Portrait", icon: Camera },
    { value: "landscape", label: "Landscape", icon: Mountain },
    { value: "object", label: "Object", icon: Square },
    { value: "abstract", label: "Abstract", icon: Palette },
    { value: "scene", label: "Scene", icon: FileImage }
  ];

  const styles = [
    "photorealistic", "cinematic", "artistic", "anime", "sketch", "oil painting",
    "watercolor", "digital art", "fantasy", "sci-fi", "vintage", "minimalist"
  ];

  const qualityPresets = [
    { value: "speed", label: "Speed", description: "Fast generation, good quality" },
    { value: "balanced", label: "Balanced", description: "Best of both speed and quality" },
    { value: "ultra", label: "Ultra", description: "Maximum quality, slower generation" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [previewCards]);

  const checkPromptSafety = (text: string): { safe: boolean; reframedPrompt?: string } => {
    const unsafeKeywords = ['nude', 'naked', 'explicit', 'nsfw', 'violence', 'weapon'];
    const lowerText = text.toLowerCase();
    
    for (const keyword of unsafeKeywords) {
      if (lowerText.includes(keyword)) {
        return { 
          safe: false, 
          reframedPrompt: text.replace(new RegExp(keyword, 'gi'), 'artistic') 
        };
      }
    }
    
    return { safe: true };
  };

  const generatePreviews = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    const safetyCheck = checkPromptSafety(prompt);
    if (!safetyCheck.safe) {
      toast.error("Prompt contains unsafe content. Please revise.");
      return;
    }

    setIsGenerating(true);
    
    // Create placeholder cards
    const newCardIds = Array.from({ length: 3 }, (_, i) => `card-${Date.now()}-${i}`);
    const placeholderCards: PreviewCard[] = newCardIds.map((id, index) => ({
      id,
      imageUrl: "",
      prompt: prompt,
      isGenerating: true,
      safetyPassed: true,
    }));

    setPreviewCards(prev => [...placeholderCards, ...prev]);

    try {
      const params: ImageGenerationParams = {
        prompt,
        negativePrompt,
        contentType: contentType as any,
        style,
        aspectRatio: aspectRatio as any,
        resolution: resolution as any,
        quality: quality as any,
        adherence: adherence[0],
        steps: steps[0],
        enhance: enhanceEnabled,
        referenceImage
      };

      // Generate variants
      const results = await ImageGenerationService.generateVariants(prompt, params, 3);
      
      // Update cards with results
      setPreviewCards(prev => 
        prev.map((card, index) => {
          if (newCardIds.includes(card.id)) {
            const cardIndex = newCardIds.indexOf(card.id);
            const result = results[cardIndex];
            
            if (result && result.success && result.image) {
              return {
                ...card,
                imageUrl: result.image,
                isGenerating: false,
                metadata: result.metadata
              };
            } else {
              return {
                ...card,
                imageUrl: "/placeholder.svg",
                isGenerating: false,
                prompt: `Failed: ${result?.error || 'Unknown error'}`
              };
            }
          }
          return card;
        })
      );

      toast.success("Images generated successfully!");
      setShowInputCard(false); // Hide input card after successful generation
      
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Generation failed. Please try again.");
      
      // Update failed cards
      setPreviewCards(prev => 
        prev.map(card => 
          newCardIds.includes(card.id) 
            ? { ...card, isGenerating: false, imageUrl: "/placeholder.svg" }
            : card
        )
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReferenceImage(e.target?.result as string);
        toast.success("Reference image uploaded successfully");
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const removeReferenceImage = () => {
    // Clear reference image
    setReferenceImage(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Clear prompt (return to blank state)
    setPrompt("");
    
    // Clear any generated previews
    setPreviewCards([]);
    
    // Clear selected variant
    setSelectedVariant(null);
    
    // Mark edit image as removed
    setEditImageRemoved(true);
    
    // Show success message
    toast.success("Reference image removed. Ready for new generation!");
  };

  const handleVariantSelect = (cardId: string) => {
    setSelectedVariant(cardId);
  };

  const handleSaveToLibrary = async (cardId: string) => {
    setSavingToLibrary(cardId);
    // Simulate saving
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSavingToLibrary(null);
    toast.success("Saved to library!");
  };

  const handleShareVariant = (cardId: string) => {
    toast.success("Sharing link copied to clipboard!");
  };

  const handleDownloadVariant = (cardId: string) => {
    const card = previewCards.find(c => c.id === cardId);
    if (card?.imageUrl) {
      const link = document.createElement('a');
      link.href = card.imageUrl;
      link.download = `ai-image-${cardId}.png`;
      link.click();
      toast.success("Download started!");
    }
  };

  const handleUsePromptFromLibrary = (newPrompt: string, newContentType?: string, newStyle?: string) => {
    // If we have a reference image, don't fill the prompt (editing mode)
    // User wants to describe their edit, not use the full prompt
    if (!referenceImage) {
      setPrompt(newPrompt);
    }
    // Always apply content type and style settings
    if (newContentType) setContentType(newContentType);
    if (newStyle) setStyle(newStyle);
    
    // Show helpful toast based on mode
    if (referenceImage) {
      toast.success("Style applied! Now describe your edit.");
    } else {
      toast.success("Prompt applied successfully!");
    }
  };

  const toggleVoiceInput = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startVoiceInput();
    }
  };

  const startVoiceInput = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        setAudioChunks(prev => [...prev, event.data]);
      };
      
      recorder.onstop = () => {
        transcribeWithWhisper();
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      toast.success("Recording started");
    } catch (error) {
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const transcribeWithWhisper = async () => {
    if (audioChunks.length === 0) return;
    
    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const formData = new FormData();
      formData.append('audio', audioBlob);
      
      toast.info("Transcribing audio...");
      
      // This would call your Whisper transcription service
      // const response = await fetch('/api/transcribe', { method: 'POST', body: formData });
      // const { text } = await response.json();
      
      // For demo purposes, simulate transcription
      setTimeout(() => {
        setPrompt(prev => prev + " [Voice input transcribed]");
        toast.success("Voice transcription complete!");
      }, 2000);
      
    } catch (error) {
      toast.error("Transcription failed");
    } finally {
      setAudioChunks([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Background Graphics */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 pt-32 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Copilot
          </h1>
          <p className="text-lg text-muted-foreground">
            Edit and enhance your images with AI-powered transformations
          </p>
        </div>

        {/* Edit Mode - Display the original image being edited */}
        {editImage && !editImageRemoved && (
          <div className="mb-8">
            <Card className="max-w-md mx-auto p-4 bg-black/40 backdrop-blur-md border-2 border-primary/30 shadow-[0_0_40px_rgba(212,110,255,0.3)]">
              <img 
                src={editImage.imageUrl} 
                alt={editImage.title}
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </Card>
          </div>
        )}

        {/* Main Input Card - Hide after generation */}
        {showInputCard && (
          <Card className="max-w-4xl mx-auto mb-8 border-2 border-primary/30 backdrop-blur-xl bg-black/60 shadow-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] focus-within:border-primary focus-within:shadow-[0_0_40px_rgba(139,92,246,0.4)] transition-all duration-300">
            <div className="p-6">
              <div className="space-y-6">
                {/* Prompt Input */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Describe your image</label>
                    <div className="flex gap-2">
                      <Dialog open={showPromptLibrary} onOpenChange={setShowPromptLibrary}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-10 rounded-full bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Prompt Library
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
                          <PromptLibrary 
                            onUsePrompt={handleUsePromptFromLibrary}
                            onClose={() => setShowPromptLibrary(false)}
                          />
                        </DialogContent>
                      </Dialog>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={toggleVoiceInput}
                              className={`h-10 w-10 rounded-full backdrop-blur-md border-2 transition-all duration-300 ${
                                isRecording 
                                  ? 'bg-red-500/20 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.5)]' 
                                  : 'bg-black/40 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)]'
                              }`}
                            >
                              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isRecording ? "Stop recording" : "Voice input"}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Textarea
                      placeholder="A majestic mountain landscape at sunset, snow-capped peaks, dramatic clouds, photorealistic, 8K quality..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[60px] max-h-[200px] pr-14 resize-y bg-transparent border-2 border-primary/30 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/50 outline-none text-white placeholder:text-gray-400 px-4 py-4 overflow-y-auto whitespace-pre-wrap break-words transition-all duration-300"
                    />
                    <Button
                      onClick={generatePreviews}
                      disabled={isGenerating || !prompt.trim()}
                      className="absolute bottom-3 right-3 h-12 w-12 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300"
                      size="icon"
                    >
                      {isGenerating ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Send className="h-5 w-5" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Reference Image Preview */}
                {referenceImage && (
                  <div className="flex items-center gap-3 p-3 bg-black/40 backdrop-blur-md rounded-lg border-2 border-primary/30">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-black/50 border border-primary/20">
                      <img 
                        src={referenceImage} 
                        alt="Reference" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">Reference Image</p>
                      <p className="text-xs text-gray-400">This image will guide the generation</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeReferenceImage}
                      className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border-2 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* Advanced Settings Toggle */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm font-medium">Advanced Settings</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="hover:text-primary hover:bg-primary/10 transition-all duration-300"
                  >
                    {showAdvanced ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                  <div className="space-y-6 pt-4 border-t">
                    {/* Content Type, Style, Quality */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Content Type</label>
                        <Select value={contentType} onValueChange={setContentType}>
                          <SelectTrigger className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-2 border-primary/30 z-50">
                            {contentTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Style</label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-2 border-primary/30 z-50">
                            {styles.map((styleOption) => (
                              <SelectItem key={styleOption} value={styleOption}>
                                {styleOption}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Quality</label>
                        <Select value={quality} onValueChange={setQuality}>
                          <SelectTrigger className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-black/95 backdrop-blur-xl border-2 border-primary/30 z-50">
                            {qualityPresets.map((preset) => (
                              <SelectItem key={preset.value} value={preset.value}>
                                {preset.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Aspect Ratio</label>
                          <Select value={aspectRatio} onValueChange={setAspectRatio}>
                            <SelectTrigger className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/95 backdrop-blur-xl border-2 border-primary/30">
                              <SelectItem value="1:1">Square (1:1)</SelectItem>
                              <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                              <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                              <SelectItem value="4:3">Classic (4:3)</SelectItem>
                              <SelectItem value="3:4">Classic Portrait (3:4)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Resolution</label>
                          <Select value={resolution} onValueChange={setResolution}>
                            <SelectTrigger className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:border-primary/50 transition-all duration-300">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/95 backdrop-blur-xl border-2 border-primary/30">
                              <SelectItem value="512x512">512×512 (Fast)</SelectItem>
                              <SelectItem value="1024x1024">1024×1024 (Standard)</SelectItem>
                              <SelectItem value="1536x1536">1536×1536 (High Quality)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Prompt Adherence: {adherence[0]}</label>
                          <Slider
                            value={adherence}
                            onValueChange={setAdherence}
                            max={12}
                            min={1}
                            step={0.5}
                            className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary/50 [&_[role=slider]]:shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">Quality Steps: {steps[0]}</label>
                          <Slider
                            value={steps}
                            onValueChange={setSteps}
                            max={100}
                            min={20}
                            step={5}
                            className="w-full [&_[role=slider]]:bg-primary [&_[role=slider]]:border-primary/50 [&_[role=slider]]:shadow-[0_0_15px_rgba(139,92,246,0.4)]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Negative Prompt</label>
                        <Textarea
                          placeholder="What you don't want in the image..."
                          value={negativePrompt}
                          onChange={(e) => setNegativePrompt(e.target.value)}
                          className="min-h-[60px] bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-400"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id="enhance"
                            checked={enhanceEnabled}
                            onCheckedChange={setEnhanceEnabled}
                            className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-secondary"
                          />
                          <label htmlFor="enhance" className="text-sm font-medium">
                            AI Enhancement
                          </label>
                        </div>
                      </div>

                      {/* Reference Image Upload */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Reference Image (Optional)</label>
                        <div className="flex gap-4">
                          <Button
                            variant="ghost"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="h-10 rounded-full bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {isUploading ? "Uploading..." : "Upload Reference"}
                          </Button>
                          {referenceImage && (
                            <Button
                              variant="ghost"
                              onClick={removeReferenceImage}
                              className="h-10 rounded-full bg-black/40 backdrop-blur-md border-2 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 hover:shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all duration-300"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        {referenceImage && (
                          <div className="mt-2">
                            <img
                              src={referenceImage}
                              alt="Reference"
                              className="h-20 w-20 object-cover rounded-md border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* New Generation Button - Show after input is hidden */}
        {!showInputCard && (
          <div className="mb-8 text-center">
            <Button
              onClick={() => setShowInputCard(true)}
              size="lg"
              className="rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-primary/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] backdrop-blur-md transition-all duration-300"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              New Generation
            </Button>
          </div>
        )}

        {/* Results Section */}
        {previewCards.length > 0 && (
          <Card className="border-2 border-primary/30 backdrop-blur-xl bg-black/60 shadow-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-300">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Generated Images
              </h3>
              
              <ScrollArea className="h-[600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {previewCards.map((card) => (
                    <Card 
                      key={card.id} 
                      className={`overflow-hidden transition-all duration-300 hover:shadow-lg border-2 backdrop-blur-md bg-black/40 ${
                        selectedVariant === card.id 
                          ? 'ring-2 ring-primary border-primary/50 shadow-[0_0_30px_rgba(139,92,246,0.4)]' 
                          : 'border-primary/20'
                      }`}
                    >
                      <div className="aspect-square relative group">
                        {card.isGenerating ? (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <div className="text-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground">Generating...</p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <img
                              src={card.imageUrl}
                              alt={card.prompt}
                              className="w-full h-full object-cover"
                              onClick={() => handleVariantSelect(card.id)}
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300"
                                      onClick={() => handleDownloadVariant(card.id)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Download</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300"
                                      onClick={() => handleShareVariant(card.id)}
                                    >
                                      <Share2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Share</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      className="h-9 w-9 rounded-full bg-black/60 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all duration-300"
                                      onClick={() => handleSaveToLibrary(card.id)}
                                      disabled={savingToLibrary === card.id}
                                    >
                                      {savingToLibrary === card.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                      ) : (
                                        <Heart className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Save to Library</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </>
                        )}
                      </div>
                      
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {card.metadata && (
                              <>
                                <Badge variant="outline" className="text-xs">
                                  {card.metadata.contentType}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {card.metadata.resolution}
                                </Badge>
                              </>
                            )}
                          </div>
                          
                          {card.safetyPassed && (
                            <Badge variant="outline" className="text-xs flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Safe
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </Card>
        )}

        {/* Studio Chat - Show below Generated Previews */}
        {previewCards.length > 0 && (
          <Card className="mb-8 border-2 border-primary/30 backdrop-blur-xl bg-black/60 shadow-2xl hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-300">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Studio Chat
              </h3>
              
              <div className="space-y-4">
                {/* Quick Edit Suggestions */}
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setChatInput("Change the lighting to vibrant neon")} className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300">
                    <Wand2 className="h-3 w-3 mr-1" />
                    Vibrant Light
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setChatInput("Make it more dramatic")} className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300">
                    <Camera className="h-3 w-3 mr-1" />
                    More Dramatic
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setChatInput("Change the camera angle")} className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300">
                    <Eye className="h-3 w-3 mr-1" />
                    Different Angle
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setChatInput("Enhance the colors")} className="bg-black/40 backdrop-blur-md border-2 border-primary/30 hover:bg-primary/10 hover:border-primary/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all duration-300">
                    <Palette className="h-3 w-3 mr-1" />
                    Enhance Colors
                  </Button>
                </div>

                {/* Chat Messages */}
                {chatMessages.length > 0 && (
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {chatMessages.map((message, index) => (
                      <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                        <span className={`inline-block px-2 py-1 rounded text-sm ${
                          message.role === 'user' 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {message.content}
                        </span>
                      </div>
                    ))}
                  </ScrollArea>
                )}

                {/* Chat Input */}
                <div className="relative">
                  <Textarea
                    placeholder="Ask for refinements: 'Make it more cinematic', 'Change the mood', 'Different composition'..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="min-h-[60px] pr-14 resize-none bg-transparent border-0 focus-visible:ring-0 text-white placeholder:text-gray-400"
                  />
                  <Button
                    onClick={() => {
                      if (chatInput.trim()) {
                        setChatMessages(prev => [...prev, { role: 'user', content: chatInput }]);
                        setChatInput("");
                        toast.info("Chat refinement coming soon!");
                      }
                    }}
                    disabled={!chatInput.trim()}
                    className="absolute bottom-2 right-2 h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all duration-300"
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};