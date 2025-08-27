import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Settings, Camera, Users, TrendingUp, Package } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChatInterfaceProps {
  type: "individuals" | "brands";
  onGenerate?: (prompt: string) => void;
}

export function ChatInterface({ type, onGenerate }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const quickPresets = type === "individuals" 
    ? [
        { label: "Headshot", icon: Camera, prompt: "Professional headshot with neutral background" },
        { label: "Family Portrait", icon: Users, prompt: "Warm family portrait in natural lighting" },
        { label: "Social Post", icon: TrendingUp, prompt: "Casual photo perfect for social media" },
        { label: "Commercial", icon: Package, prompt: "Professional commercial-style photo" },
      ]
    : [
        { label: "Commercial", icon: Package, prompt: "Professional commercial for advertising campaign" },
        { label: "Campaign", icon: TrendingUp, prompt: "Brand campaign hero image" },
        { label: "Product Mockup", icon: Camera, prompt: "Product showcase with professional styling" },
        { label: "Ad Pack", icon: Package, prompt: "Complete advertising package assets" },
      ];

  const handleGenerate = () => {
    if (prompt.trim() && onGenerate) {
      onGenerate(prompt);
    }
  };

  const handlePresetClick = (preset: typeof quickPresets[0]) => {
    setPrompt(preset.prompt);
    if (onGenerate) {
      onGenerate(preset.prompt);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Chat Input */}
      <Card className="p-6 bg-gradient-card border-border/50 shadow-card">
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe what you want: 'Make a smiling teacher in a bright classroom'...`}
              className="min-h-[100px] text-base bg-background/50 border-border resize-none pr-12"
            />
            <Button
              onClick={handleGenerate}
              size="icon"
              className="absolute bottom-3 right-3 shadow-gold"
              disabled={!prompt.trim()}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickPresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  onClick={() => handlePresetClick(preset)}
                  className="flex flex-col gap-2 h-auto py-4 hover-zoom"
                >
                  <preset.icon className="w-6 h-6 text-primary" />
                  <span className="text-xs font-medium">{preset.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-muted-foreground">
                <Settings className="w-4 h-4" />
                Advanced Options
                <span className="text-xs">({showAdvanced ? "Hide" : "Show"})</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Advanced options would go here */}
                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Advanced customization options will appear here
                  </p>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}