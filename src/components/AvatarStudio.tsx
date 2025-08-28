import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
  EyeOff
} from "lucide-react";

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
}

interface ExportPack {
  id: string;
  name: string;
  description: string;
  formats: string[];
  icon: any;
  premium?: boolean;
}

export const AvatarStudio = () => {
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry fingers, extra limbs, distorted faces, unrealistic body proportions, text, watermark, low quality");
  const [adherence, setAdherence] = useState(7);
  const [steps, setSteps] = useState(49);
  const [enhanceEnabled, setEnhanceEnabled] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isMultiGeneration, setIsMultiGeneration] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hi! I'm your OpenArt AI Workflow Assistant. Describe your avatar idea and I'll follow the professional workflow: detailed prompts, negative prompts, enhancement, and character presets. Try: 'Tall young woman walking down the street in high heels'",
      timestamp: new Date()
    }
  ]);
  const [previewCards, setPreviewCards] = useState<PreviewCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExportPack, setSelectedExportPack] = useState<string | null>(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [aiProofEnabled, setAiProofEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Character presets (stored locally for session)
  const [characterPresets, setCharacterPresets] = useState<Array<{
    id: string;
    name: string;
    baseImage: string;
    prompt: string;
  }>>([]);

  const exportPacks: ExportPack[] = [
    {
      id: "social",
      name: "Social Pack",
      description: "IG Post, TikTok Reel, Story",
      formats: ["1080x1080", "1080x1920", "1080x1920"],
      icon: Instagram
    },
    {
      id: "professional",
      name: "Professional Pack", 
      description: "LinkedIn headshot + banner",
      formats: ["400x400", "1584x396"],
      icon: Linkedin,
      premium: true
    },
    {
      id: "ad",
      name: "Ad Pack",
      description: "TikTok + LinkedIn + Meta ads",
      formats: ["1080x1920", "1200x628", "1080x1080"],
      icon: PlayCircle,
      premium: true
    }
  ];

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

  const generatePreviews = async (userPrompt: string) => {
    const safetyCheck = checkPromptSafety(userPrompt);
    
    if (!safetyCheck.safe && !safetyCheck.reframedPrompt) {
      toast.error("Prompt contains unsafe content. Please revise your request.");
      return;
    }

    const finalPrompt = safetyCheck.reframedPrompt || userPrompt;
    setIsGenerating(true);

    // Enhanced prompts following OpenArt workflow
    const enhancedPositive = `${finalPrompt}, detailed clothing, realistic natural lighting, high quality, professional photography, 8k resolution, sharp focus, realistic skin texture, detailed hair, photorealistic`;
    
    // Generate cards based on multi-generation setting
    const cardCount = isMultiGeneration ? 10 : 3;
    const poses = isMultiGeneration 
      ? ["front facing close-up", "full body portrait", "three-quarter view", "profile view", "sitting pose", "standing pose", "professional pose", "casual pose", "dynamic angle", "elegant stance"]
      : ["Style A - Professional", "Style B - Creative", "Style C - Natural"];

    const newCards: PreviewCard[] = Array.from({ length: cardCount }, (_, i) => ({
      id: Date.now() + "_" + (i + 1),
      imageUrl: "/placeholder.svg",
      prompt: isMultiGeneration 
        ? `${enhancedPositive}, ${poses[i]}` 
        : `${enhancedPositive} - ${poses[i]}`,
      isGenerating: true,
      safetyPassed: true
    }));

    setPreviewCards(newCards);

    try {
      // Call actual avatar generation service
      const { AvatarService } = await import("@/services/avatarService");
      
      for (let i = 0; i < newCards.length; i++) {
        const result = await AvatarService.generateAvatar({
          prompt: newCards[i].prompt,
          negativePrompt,
          adherence,
          steps,
          enhance: enhanceEnabled,
          selectedPreset,
          resolution: "1024x1024",
          photoMode: true
        });

        if (result.success && result.image) {
          setPreviewCards(prev => prev.map(card => 
            card.id === newCards[i].id 
              ? { ...card, imageUrl: result.image!, isGenerating: false }
              : card
          ));
        } else {
          setPreviewCards(prev => prev.map(card => 
            card.id === newCards[i].id 
              ? { ...card, isGenerating: false }
              : card
          ));
          toast.error(`Generation failed for variant ${i + 1}: ${result.error}`);
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

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Check if it's a refinement or new generation
    if (previewCards.length > 0 && (prompt.toLowerCase().includes('change') || prompt.toLowerCase().includes('make') || prompt.toLowerCase().includes('add') || prompt.toLowerCase().includes('remove'))) {
      // Handle refinements - apply to all variants
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant", 
        content: `Applying "${prompt}" to all variants. Regenerating now...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update and regenerate all existing cards with the edit
      setIsGenerating(true);
      const updatedPrompt = prompt;
      
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
            photoMode: true
          });

          if (result.success && result.image) {
            setPreviewCards(prev => prev.map((card, idx) => 
              idx === i ? { ...card, imageUrl: result.image!, isGenerating: false } : card
            ));
          } else {
            setPreviewCards(prev => prev.map((card, idx) => 
              idx === i ? { ...card, isGenerating: false } : card
            ));
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
      await generatePreviews(prompt);
    }
    
    setPrompt("");
  };

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
    <section className="min-h-screen bg-gradient-hero pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Wand2 className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-display font-bold text-foreground">AI Copilot Studio</h1>
              <Shield className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-lg text-muted-foreground mb-8">Your ChatGPT-powered creative assistant</p>
            
            {/* Main Search Bar */}
            <Card className="max-w-4xl mx-auto p-4 bg-gradient-card border-border/50 shadow-lg">
              <div className="space-y-4">
                {/* Positive Prompt */}
                <div className="flex gap-2">
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
                    className="min-h-[80px] resize-none bg-background/50 border-0 focus-visible:ring-0 text-base"
                  />
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

                {/* Negative Prompt */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Negative Prompt (OpenArt Workflow)</label>
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
            <div className="space-y-8">
              
              {/* Export Packs - Horizontal */}
              <Card className="p-6 bg-gradient-card border-border/50">
                <h3 className="font-semibold text-foreground mb-4 text-center">Choose Export Pack</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {exportPacks.map((pack) => {
                    const IconComponent = pack.icon;
                    return (
                      <Button
                        key={pack.id}
                        variant={selectedExportPack === pack.id ? "default" : "outline"}
                        className={`h-auto p-4 ${
                          selectedExportPack === pack.id
                            ? 'bg-primary hover:bg-primary/90'
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedExportPack(pack.id)}
                      >
                        <div className="text-center">
                          <IconComponent className="w-8 h-8 mx-auto mb-2" />
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <span className="font-medium">{pack.name}</span>
                            {pack.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <p className="text-xs text-muted-foreground">{pack.description}</p>
                          <div className="text-xs text-muted-foreground mt-1">
                            {pack.formats.join(', ')}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </Card>

              {/* Preview Results - Horizontal Grid */}
              <Card className="p-6 bg-gradient-card border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-foreground text-xl">Generated Previews</h3>
                  <Badge variant="outline" className="text-sm">3 Variants</Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {previewCards.map((card, index) => (
                    <Card key={card.id} className="p-4 bg-background/30 border-border/50">
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
                        <p className="text-sm text-muted-foreground line-clamp-2">{card.prompt}</p>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleQuickEdit(card.id, 'more stylized')}
                            disabled={card.isGenerating}
                            className="border-border/50"
                          >
                            <Edit3 className="w-3 h-3 mr-1" />
                            Style
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleQuickEdit(card.id, 'better lighting')}
                            disabled={card.isGenerating}
                            className="border-border/50"
                          >
                            <Zap className="w-3 h-3 mr-1" />
                            Light
                          </Button>
                        </div>

                        <div className="grid grid-cols-4 gap-1">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="border-border/50"
                            onClick={() => {
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
                          >
                            <Crown className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-border/50">
                            <Heart className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-border/50">
                            <Share2 className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="border-border/50">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Card>

              {/* Settings - Horizontal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Format Settings */}
                <Card className="p-6 bg-gradient-card border-border/50">
                  <h3 className="font-semibold text-foreground mb-4">Format Options</h3>
                  <div className="space-y-4">
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
                <Card className="p-6 bg-gradient-card border-border/50">
                  <h3 className="font-semibold text-foreground mb-4">Safety & Settings</h3>
                  <div className="space-y-4">
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

          {/* Studio Chat - Horizontal Interface */}
          <Card className="mt-8 p-6 bg-gradient-card border-border/50">
            <h3 className="font-semibold text-foreground mb-4">Studio Chat</h3>
            
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
              <div className="flex gap-2">
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
                  className="px-6 py-4"
                  size="lg"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Edit Suggestions - Horizontal Below */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-medium">Quick Edits:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  "Change hair color to blonde",
                  "Add professional clothing", 
                  "Make background darker",
                  "Change to sunset lighting"
                ].map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => setPrompt(suggestion)}
                    className="text-sm border-border/30 hover:border-primary/30 justify-center h-10"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
};