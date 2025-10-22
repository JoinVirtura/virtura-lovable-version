import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Sparkles, Settings, Camera, Users, TrendingUp, Package } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChatInterfaceProps {
  type: "individuals" | "brands";
  onGenerate?: (prompt: string) => void;
}

export function ChatInterface({ type, onGenerate }: ChatInterfaceProps) {
  const [prompt, setPrompt] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Options State
  const [selectedGender, setSelectedGender] = useState("woman");
  const [selectedAge, setSelectedAge] = useState("20s");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedExpression, setSelectedExpression] = useState("");
  const [selectedHairColor, setSelectedHairColor] = useState("");
  const [selectedHairStyle, setSelectedHairStyle] = useState("");
  const [selectedEyeColor, setSelectedEyeColor] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLighting, setSelectedLighting] = useState("");
  const [selectedPose, setSelectedPose] = useState("");
  const [selectedClothing, setSelectedClothing] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState("");
  const [creativity, setCreativity] = useState([70]);
  const [resolution, setResolution] = useState("1024x1024");

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

  const genderOptions = ["Woman", "Man", "Trans"];
  const ageRanges = ["10s", "20s", "30s", "40s", "50s", "60s", "70s+"];
  const bodyTypes = ["Slim", "Athletic", "Average", "Curvy", "Plus Size"];
  const expressions = ["Neutral", "Smiling", "Confident", "Serious", "Friendly", "Mysterious"];
  const hairColors = ["Black", "Brown", "Blonde", "Red", "Auburn", "Gray", "White"];
  const hairStyles = ["Long", "Medium", "Short", "Curly", "Straight", "Wavy", "Braided"];
  const eyeColors = ["Brown", "Blue", "Green", "Hazel", "Gray", "Amber"];
  const locations = ["Studio", "Office", "Outdoor", "Home", "Cafe", "Library", "Park"];
  const lightingOptions = ["Natural", "Studio", "Vibrant", "Soft", "Dramatic", "Neon"];
  const poses = ["Standing", "Sitting", "Portrait", "Three-Quarter", "Profile", "Action"];
  const clothingStyles = ["Casual", "Business", "Formal", "Creative", "Sporty", "Elegant"];
  const accessories = ["None", "Glasses", "Watch", "Jewelry", "Hat", "Scarf"];

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
      <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        <div className="space-y-4">
          <div className="relative">
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={`Describe what you want: 'Make a smiling teacher in a bright classroom'...`}
              className="min-h-[100px] text-base bg-black/40 backdrop-blur-md border-2 border-violet-500/30 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:shadow-[0_0_20px_rgba(168,85,247,0.4)] resize-none pr-12"
              id="main-prompt-textarea"
            />
            <Button
              onClick={handleGenerate}
              size="icon"
              className="absolute bottom-3 right-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
              disabled={!prompt.trim()}
            >
              <Sparkles className="w-5 h-5" />
            </Button>
          </div>

          {/* Quick Presets */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-violet-300">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickPresets.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  onClick={() => handlePresetClick(preset)}
                  className="flex flex-col gap-2 h-auto py-4 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                >
                  <preset.icon className="w-6 h-6 text-violet-400" />
                  <span className="text-xs font-medium">{preset.label}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 text-violet-300 hover:text-violet-200 hover:bg-violet-500/10">
                <Settings className="w-4 h-4" />
                Advanced Options
                <span className="text-xs">({showAdvanced ? "Hide" : "Show"})</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-6 pt-4">
              <h3 className="text-xl font-display font-bold mb-4">Advanced Customization</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Gender */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Gender</label>
                    <div className="flex gap-2">
                      {genderOptions.map((gender) => (
                        <Button
                          key={gender}
                          variant={selectedGender === gender.toLowerCase() ? "default" : "outline"}
                          onClick={() => setSelectedGender(gender.toLowerCase())}
                          className="flex-1"
                        >
                          {gender}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Age Range */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Age Range</label>
                    <Select value={selectedAge} onValueChange={setSelectedAge}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select age range" />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRanges.map((age) => (
                          <SelectItem key={age} value={age}>{age}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Body Type */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Body Type</label>
                    <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select body type" />
                      </SelectTrigger>
                      <SelectContent>
                        {bodyTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Facial Expression */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Facial Expression</label>
                    <Select value={selectedExpression} onValueChange={setSelectedExpression}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select expression" />
                      </SelectTrigger>
                      <SelectContent>
                        {expressions.map((expr) => (
                          <SelectItem key={expr} value={expr}>{expr}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Creativity Level */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Creativity Level: {creativity[0]}%</label>
                    <Slider
                      value={creativity}
                      onValueChange={setCreativity}
                      max={100}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Conservative</span>
                      <span>Experimental</span>
                    </div>
                  </div>

                  {/* Resolution */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Resolution</label>
                    <div className="space-y-2">
                      {["512x512", "1024x1024", "1536x1536"].map((res) => (
                        <Button
                          key={res}
                          variant={resolution === res ? "default" : "outline"}
                          onClick={() => setResolution(res)}
                          className="w-full"
                        >
                          {res}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Hair */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">Hair</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Color</label>
                        <Select value={selectedHairColor} onValueChange={setSelectedHairColor}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair color" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairColors.map((color) => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Style</label>
                        <Select value={selectedHairStyle} onValueChange={setSelectedHairStyle}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select hair style" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairStyles.map((style) => (
                              <SelectItem key={style} value={style}>{style}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Eyes */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">Eyes</h4>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Eye color</label>
                      <Select value={selectedEyeColor} onValueChange={setSelectedEyeColor}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select eye color" />
                        </SelectTrigger>
                        <SelectContent>
                          {eyeColors.map((color) => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Setting */}
                  <div>
                    <h4 className="text-lg font-medium mb-3">Setting</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Location</label>
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((loc) => (
                              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Lighting</label>
                        <Select value={selectedLighting} onValueChange={setSelectedLighting}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select lighting" />
                          </SelectTrigger>
                          <SelectContent>
                            {lightingOptions.map((light) => (
                              <SelectItem key={light} value={light}>{light}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Body Pose */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Body Pose</label>
                    <Select value={selectedPose} onValueChange={setSelectedPose}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select pose" />
                      </SelectTrigger>
                      <SelectContent>
                        {poses.map((pose) => (
                          <SelectItem key={pose} value={pose}>{pose}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Clothing Style */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Clothing Style</label>
                    <Select value={selectedClothing} onValueChange={setSelectedClothing}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select outfit" />
                      </SelectTrigger>
                      <SelectContent>
                        {clothingStyles.map((style) => (
                          <SelectItem key={style} value={style}>{style}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Accessories */}
                  <div>
                    <label className="text-sm font-medium mb-3 block">Accessories</label>
                    <Select value={selectedAccessories} onValueChange={setSelectedAccessories}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select accessories" />
                      </SelectTrigger>
                      <SelectContent>
                        {accessories.map((acc) => (
                          <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </Card>
    </div>
  );
}