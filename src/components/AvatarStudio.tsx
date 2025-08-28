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
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "assistant",
      content: "Hi! I'm your AI Copilot. Describe what you'd like to create and I'll generate 3 preview options with quick edit controls. Try: 'Professional headshot of a woman with curly hair'",
      timestamp: new Date()
    }
  ]);
  const [previewCards, setPreviewCards] = useState<PreviewCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedExportPack, setSelectedExportPack] = useState<string | null>(null);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  const [aiProofEnabled, setAiProofEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Generate 3 preview cards
    const newCards: PreviewCard[] = [
      {
        id: Date.now() + "_1",
        imageUrl: "/placeholder.svg",
        prompt: finalPrompt + " - Style A",
        isGenerating: true,
        safetyPassed: true
      },
      {
        id: Date.now() + "_2", 
        imageUrl: "/placeholder.svg",
        prompt: finalPrompt + " - Style B",
        isGenerating: true,
        safetyPassed: true
      },
      {
        id: Date.now() + "_3",
        imageUrl: "/placeholder.svg", 
        prompt: finalPrompt + " - Style C",
        isGenerating: true,
        safetyPassed: true
      }
    ];

    setPreviewCards(newCards);

    // Simulate generation completion
    setTimeout(() => {
      setPreviewCards(prev => prev.map(card => ({ ...card, isGenerating: false })));
      setIsGenerating(false);
      
      // Add copilot suggestion
      const suggestions = [
        "Want a LinkedIn banner version?",
        "How about creating a social media pack?",
        "Need this in different aspect ratios?"
      ];
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: "assistant",
        content: suggestions[Math.floor(Math.random() * suggestions.length)],
        timestamp: new Date()
      }]);
    }, 3000);
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
    if (previewCards.length > 0 && prompt.toLowerCase().includes('make')) {
      // Handle refinements
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant", 
        content: `Great! I'll update the previews with: "${prompt}". Generating now...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update existing cards
      setIsGenerating(true);
      setTimeout(() => {
        setPreviewCards(prev => prev.map(card => ({
          ...card,
          prompt: card.prompt + ` + ${prompt}`
        })));
        setIsGenerating(false);
      }, 2000);
      
    } else {
      // Generate new previews
      await generatePreviews(prompt);
    }
    
    setPrompt("");
  };

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
            <Card className="max-w-2xl mx-auto p-2 bg-gradient-card border-border/50 shadow-lg">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Describe your avatar idea... e.g., 'Professional headshot of a woman with curly hair'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[60px] resize-none bg-background/50 border-0 focus-visible:ring-0 text-base"
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
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                              <p className="text-sm text-muted-foreground font-medium">Variant {index + 1}</p>
                            </div>
                          </div>
                        )}
                        
                        {card.safetyPassed && (
                          <Badge className="absolute top-2 right-2 bg-green-500/20 text-green-600 border-green-500/30">
                            <Shield className="w-3 h-3 mr-1" />
                            Safe
                          </Badge>
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

                        <div className="grid grid-cols-3 gap-1">
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

          {/* Chat History - Minimized */}
          {messages.length > 1 && (
            <Card className="mt-8 p-4 bg-gradient-card border-border/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-foreground">Recent Conversations</h4>
                <Badge variant="secondary" className="text-xs">{messages.length - 1} messages</Badge>
              </div>
              <ScrollArea className="h-32">
                <div className="space-y-2">
                  {messages.slice(1).map((message) => (
                    <div key={message.id} className="text-sm">
                      <span className={`font-medium ${message.type === 'user' ? 'text-primary' : 'text-muted-foreground'}`}>
                        {message.type === 'user' ? 'You: ' : 'AI: '}
                      </span>
                      <span className="text-foreground">{message.content}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};