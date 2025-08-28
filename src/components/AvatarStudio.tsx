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
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Wand2 className="w-6 h-6 text-primary" />
              <h1 className="text-3xl font-display font-bold text-foreground">AI Copilot Studio</h1>
              <Shield className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-muted-foreground">Your ChatGPT-powered creative assistant for all avatar flows</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left - Chat Interface */}
            <div className="lg:col-span-1">
              <Card className="h-[700px] bg-gradient-card border-border/50 flex flex-col">
                <div className="p-4 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground">AI Copilot</h3>
                    <Badge variant="secondary" className="text-xs">Live</Badge>
                  </div>
                </div>
                
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            message.type === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-background/50 text-foreground border border-border/50'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <span className="text-xs opacity-70 mt-1 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <div className="p-4 border-t border-border/50">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Describe your avatar idea or ask for changes..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="min-h-[60px] resize-none bg-background/50"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!prompt.trim() || isGenerating}
                      className="px-3"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Center - Preview Cards */}
            <div className="lg:col-span-1">
              <Card className="h-[700px] bg-gradient-card border-border/50 p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Preview Cards</h3>
                  <Badge variant="outline" className="text-xs">3 Variants</Badge>
                </div>
                
                {previewCards.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Start a conversation to generate previews</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="h-[640px]">
                    <div className="space-y-4">
                      {previewCards.map((card, index) => (
                        <Card key={card.id} className="p-4 bg-background/30 border-border/50">
                          <div className="aspect-[3/4] bg-background/50 rounded-lg border border-border/30 mb-3 relative overflow-hidden">
                            {card.isGenerating ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                                  <p className="text-xs text-muted-foreground">Generating...</p>
                                </div>
                              </div>
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                  <p className="text-xs text-muted-foreground">Variant {index + 1}</p>
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
                          
                          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{card.prompt}</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEdit(card.id, 'more stylized')}
                              disabled={card.isGenerating}
                            >
                              <Edit3 className="w-3 h-3 mr-1" />
                              Style
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleQuickEdit(card.id, 'better lighting')}
                              disabled={card.isGenerating}
                            >
                              <Zap className="w-3 h-3 mr-1" />
                              Light
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </Card>
            </div>

            {/* Right - Export & Settings */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Export Packs */}
              <Card className="p-4 bg-gradient-card border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Export Packs</h3>
                <div className="space-y-3">
                  {exportPacks.map((pack) => {
                    const IconComponent = pack.icon;
                    return (
                      <Button
                        key={pack.id}
                        variant={selectedExportPack === pack.id ? "default" : "outline"}
                        className={`w-full justify-start h-auto p-3 ${
                          selectedExportPack === pack.id
                            ? 'bg-primary hover:bg-primary/90'
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                        onClick={() => setSelectedExportPack(pack.id)}
                      >
                        <div className="flex items-start w-full">
                          <IconComponent className="w-5 h-5 mr-3 mt-0.5 shrink-0" />
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{pack.name}</span>
                              {pack.premium && <Crown className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{pack.description}</p>
                            <div className="text-xs text-muted-foreground mt-1">
                              {pack.formats.join(', ')}
                            </div>
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </Card>

              {/* Format Settings */}
              <Card className="p-4 bg-gradient-card border-border/50">
                <h3 className="font-semibold text-foreground mb-4">Format Options</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" size="sm" className="border-border/50">
                      <FileImage className="w-3 h-3 mr-1" />
                      PNG
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/50">
                      <FileImage className="w-3 h-3 mr-1" />
                      JPG
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="w-full border-border/50">
                    <Video className="w-4 h-4 mr-2" />
                    MP4 Video
                    <Crown className="w-3 h-3 ml-2 text-yellow-500" />
                  </Button>
                </div>
              </Card>

              {/* Safety & Watermark */}
              <Card className="p-4 bg-gradient-card border-border/50">
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
                  
                  <div className="pt-2 border-t border-border/50">
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

              {/* Quick Actions */}
              <Card className="p-4 bg-gradient-card border-border/50">
                <div className="grid grid-cols-3 gap-2">
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
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};