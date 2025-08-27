import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Package, Shield, Sparkles } from "lucide-react";
import { toast } from "sonner";

const exportPacks = {
  social: {
    name: "Social Pack",
    description: "Perfect for social media platforms",
    icon: "📱",
    formats: ["1:1", "9:16", "4:5"],
    features: ["Instagram Stories", "TikTok Ready", "Facebook Posts"]
  },
  professional: {
    name: "Professional Pack", 
    description: "Business and corporate use",
    icon: "💼",
    formats: ["16:9", "4:5", "1:1"],
    features: ["LinkedIn Posts", "Presentations", "Website Headers"]
  },
  ad: {
    name: "Ad Pack",
    description: "Advertising and marketing campaigns", 
    icon: "🎯",
    formats: ["16:9", "9:16", "1:1", "4:5"],
    features: ["Google Ads", "Facebook Ads", "YouTube Covers"]
  }
};

const aspectRatios = {
  "1:1": { label: "Square", description: "Instagram Posts, Profile Pictures" },
  "9:16": { label: "Vertical", description: "Stories, TikTok, Reels" },
  "16:9": { label: "Landscape", description: "YouTube, Presentations" },
  "4:5": { label: "Portrait", description: "Instagram Feed, Pinterest" }
};

export default function ExportPage() {
  const [selectedPack, setSelectedPack] = useState<keyof typeof exportPacks>("social");
  const [selectedRatios, setSelectedRatios] = useState<string[]>(["1:1"]);
  const [contentCredentials, setContentCredentials] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const handleRatioToggle = (ratio: string) => {
    setSelectedRatios(prev => 
      prev.includes(ratio) 
        ? prev.filter(r => r !== ratio)
        : [...prev, ratio]
    );
  };

  const handleExport = async () => {
    if (selectedRatios.length === 0) {
      toast.error("Please select at least one aspect ratio");
      return;
    }

    setIsExporting(true);
    
    // Simulate export process
    setTimeout(() => {
      setIsExporting(false);
      toast.success(`${exportPacks[selectedPack].name} exported successfully!`);
    }, 3000);
  };

  return (
    <div className="flex-1 p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Export Content</h1>
          <p className="text-muted-foreground">Choose your export pack and customize your content</p>
        </div>

        {/* Export Pack Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Export Pack
          </h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {Object.entries(exportPacks).map(([key, pack]) => (
              <Card 
                key={key}
                className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedPack === key 
                    ? "ring-2 ring-primary bg-primary/5" 
                    : "hover:bg-accent/50"
                }`}
                onClick={() => setSelectedPack(key as keyof typeof exportPacks)}
              >
                <div className="text-center">
                  <div className="text-3xl mb-2">{pack.icon}</div>
                  <h3 className="font-semibold text-foreground mb-1">{pack.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{pack.description}</p>
                  <div className="space-y-1">
                    {pack.features.map((feature, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Aspect Ratios */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Aspect Ratios</h2>
          <p className="text-muted-foreground mb-4">
            Select the aspect ratios you need for your {exportPacks[selectedPack].name.toLowerCase()}
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {Object.entries(aspectRatios).map(([ratio, info]) => (
              <Card 
                key={ratio}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedRatios.includes(ratio)
                    ? "ring-2 ring-primary bg-primary/5"
                    : "hover:bg-accent/50"
                } ${
                  exportPacks[selectedPack].formats.includes(ratio)
                    ? ""
                    : "opacity-50 pointer-events-none"
                }`}
                onClick={() => handleRatioToggle(ratio)}
              >
                <div className="text-center">
                  <div className={`w-12 h-12 mx-auto mb-3 rounded border-2 border-border flex items-center justify-center ${
                    ratio === "1:1" ? "aspect-square" :
                    ratio === "9:16" ? "w-8 h-12" :
                    ratio === "16:9" ? "w-12 h-8" :
                    "w-10 h-12"
                  } bg-muted`}>
                    <span className="text-xs font-mono">{ratio}</span>
                  </div>
                  <h4 className="font-medium text-foreground">{info.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{info.description}</p>
                  {selectedRatios.includes(ratio) && (
                    <div className="mt-2">
                      <Badge className="text-xs">Selected</Badge>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          
          <p className="text-sm text-muted-foreground">
            Available ratios for {exportPacks[selectedPack].name}: {exportPacks[selectedPack].formats.join(", ")}
          </p>
        </Card>

        {/* Export Options */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Export Options
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="space-y-1">
                <Label htmlFor="content-credentials" className="text-base font-medium">
                  Content Credentials Watermark
                </Label>
                <p className="text-sm text-muted-foreground">
                  Add proof of AI generation watermark to exported content
                </p>
              </div>
              <Switch
                id="content-credentials"
                checked={contentCredentials}
                onCheckedChange={setContentCredentials}
              />
            </div>
          </div>
        </Card>

        {/* Export Summary */}
        <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <Sparkles className="w-5 h-5 mr-2 text-primary" />
            Export Summary
          </h3>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Pack:</span> {exportPacks[selectedPack].name}</p>
            <p><span className="font-medium">Aspect Ratios:</span> {selectedRatios.length} selected ({selectedRatios.join(", ")})</p>
            <p><span className="font-medium">Content Credentials:</span> {contentCredentials ? "Enabled" : "Disabled"}</p>
            <p><span className="font-medium">Total Files:</span> {selectedRatios.length} files</p>
          </div>
        </Card>

        {/* Export Button */}
        <Button 
          onClick={handleExport}
          disabled={isExporting || selectedRatios.length === 0}
          className="w-full h-12 text-base bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export {exportPacks[selectedPack].name}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}