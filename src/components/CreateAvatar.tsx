import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Upload, Sparkles, Wand2, Camera, Video, Settings, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AvatarService } from "@/services/avatarService";
import { Switch } from "@/components/ui/switch";

// Import avatar images
import casualWomanImg from "@/assets/model-casual-woman.jpg";
import fitnessManImg from "@/assets/model-fitness-man.jpg";
import professionalManImg from "@/assets/model-professional-man.jpg";
import previewAvatarImg from "@/assets/preview-avatar.jpg";

export const CreateAvatar = () => {
  const [selectedStyle, setSelectedStyle] = useState("photorealistic");
  const [selectedGender, setSelectedGender] = useState("woman");
  const [selectedAge, setSelectedAge] = useState("20s");
  const [creativity, setCreativity] = useState([0.7]);
  const [resolution, setResolution] = useState("1024x1024");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedHairColor, setSelectedHairColor] = useState("");
  const [selectedHairStyle, setSelectedHairStyle] = useState("");
  const [selectedEyeColor, setSelectedEyeColor] = useState("");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedExpression, setSelectedExpression] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLighting, setSelectedLighting] = useState("");
  const [selectedPose, setSelectedPose] = useState("");
  const [selectedClothing, setSelectedClothing] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState("");
  const [photoMode, setPhotoMode] = useState(true);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please add a description for your avatar");
      return;
    }

    setIsGenerating(true);
    
    try {
      const result = await AvatarService.generateAvatar({
        prompt,
        style: selectedStyle,
        gender: selectedGender,
        age: selectedAge,
        hairColor: selectedHairColor,
        eyeColor: selectedEyeColor,
        setting: selectedLocation,
        pose: selectedPose,
        clothing: selectedClothing,
        accessories: selectedAccessories,
        creativity: photoMode ? Math.min(creativity[0], 0.2) : creativity[0],
        resolution,
        photoMode,
      });

      if (result.success && result.image) {
        setGeneratedImage(result.image);
        toast.success("Avatar generated successfully!");
      } else {
        toast.error(result.error || "Failed to generate avatar");
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("An error occurred while generating your avatar");
    } finally {
      setIsGenerating(false);
    }
  };

  const styles = [
    { id: "photorealistic", name: "Photorealism Pro", gradient: "from-primary/90 to-primary/70" },
    { id: "realistic", name: "Realistic V2.1", gradient: "from-primary/80 to-primary/60" },
    { id: "anime", name: "Anime V2", gradient: "from-purple-500/80 to-pink-500/60" },
    { id: "furry", name: "Furry V2", gradient: "from-violet-500/80 to-blue-500/60" },
    { id: "legacy", name: "Legacy", gradient: "from-gray-500/80 to-gray-400/60" }
  ];

  const genders = ["Woman", "Man", "Trans"];
  const ages = ["Teen (18+)", "20s", "30s", "MILF", "DILF"];
  
  const eyeColors = ["Blue", "Brown", "Green", "Hazel", "Gray"];
  const hairColors = ["Blonde", "Brunette", "Black", "Ginger", "Pink", "Blue", "White"];
  const hairStyles = ["Long", "Short", "Ponytail", "Bun", "Pigtails", "Messy"];
  
  const bodyTypes = ["Skinny", "Slim", "Fit", "Athletic", "Curvy", "Muscular"];
  const locations = ["Bedroom", "Beach", "Office", "Gym", "Pool", "Outdoor"];
  const lighting = ["Natural", "Studio", "Dramatic", "Cinematic", "Neon"];

  const recentAvatars = [
    { name: "Professional Headshot", image: professionalManImg, description: "Confident business professional with navy suit" },
    { name: "Summer Campaign", image: casualWomanImg, description: "Beautiful model in casual white top" },
    { name: "Casual Portrait", image: fitnessManImg, description: "Athletic fitness model in gym setting" }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 pt-8">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">

          <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
            {/* Left Panel - Creation Tools */}
            <div className="xl:col-span-3 space-y-6">
              <Tabs defaultValue="generate" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
                  <TabsTrigger value="generate" className="data-[state=active]:bg-primary/20">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="data-[state=active]:bg-primary/20">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </TabsTrigger>
                  <TabsTrigger value="video" className="data-[state=active]:bg-primary/20">
                    <Video className="w-4 h-4 mr-2" />
                    Video Avatar
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="generate" className="space-y-6 mt-6">
                  {/* Style Selection */}
                  <Card className="p-6 bg-gradient-card border-border/50">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">Style</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {styles.map((style) => (
                        <Button
                          key={style.id}
                          variant={selectedStyle === style.id ? "default" : "outline"}
                          className={`h-16 ${selectedStyle === style.id 
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow' 
                            : 'border-border/50 hover:border-primary/30 hover:bg-primary/5'
                          }`}
                          onClick={() => setSelectedStyle(style.id)}
                        >
                          {style.name}
                        </Button>
                      ))}
                    </div>
                  </Card>

                  {/* Quick Presets */}
                  <Card className="p-6 bg-gradient-card border-border/50">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">Quick Presets</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { name: "Elegant Model", style: "Professional photoshoot style" },
                        { name: "Beach Goddess", style: "Tropical paradise vibes" },
                        { name: "Business Executive", style: "Corporate professional" },
                        { name: "Fantasy Warrior", style: "Epic fantasy character" }
                      ].map((preset) => (
                        <Button
                          key={preset.name}
                          variant="outline"
                          className="h-16 justify-start border-border/50 hover:border-primary/30 hover:bg-primary/5"
                        >
                          <div className="text-left">
                            <p className="font-medium">{preset.name}</p>
                            <p className="text-xs text-muted-foreground">{preset.style}</p>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </Card>

                  {/* Description */}
                  <Card className="p-6 bg-gradient-card border-border/50">
                    <h3 className="font-semibold text-lg mb-4 text-foreground">Description</h3>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={photoMode 
                        ? "Describe a single person for a professional headshot... (e.g., A confident woman with brown hair wearing a professional blazer)"
                        : "Describe your avatar in detail... (e.g., A confident woman with flowing hair, wearing elegant evening wear, in a luxurious setting)"
                      }
                      className="min-h-[100px] bg-background/50 border-border/50 focus:border-primary/50 resize-none"
                    />
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-2">
                        <Badge variant="secondary" className="text-xs">Natural language</Badge>
                        <Badge variant="secondary" className="text-xs">Be specific</Badge>
                      </div>
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                        <Wand2 className="w-4 h-4 mr-2" />
                        AI Enhance
                      </Button>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="upload" className="mt-6">
                  <Card className="p-8 bg-gradient-card border-border/50">
                    <div className="text-center">
                      <Upload className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Upload Reference Image</h3>
                      <p className="text-muted-foreground mb-6">
                        Upload a photo to create an avatar based on specific features
                      </p>
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-8 hover:border-primary/30 transition-colors">
                        <Button className="bg-primary hover:bg-primary/90">
                          <Camera className="w-4 h-4 mr-2" />
                          Choose Image
                        </Button>
                        <p className="text-sm text-muted-foreground mt-2">
                          PNG, JPG up to 10MB
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="video" className="mt-6">
                  <Card className="p-8 bg-gradient-card border-border/50">
                    <div className="text-center">
                      <Video className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-foreground mb-2">Animated Video Avatar</h3>
                      <p className="text-muted-foreground mb-6">
                        Create dynamic video content with your avatar
                      </p>
                      <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
                      <div className="bg-background/30 rounded-lg p-6">
                        <Play className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                          Video avatar generation will be available soon
                        </p>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Advanced Customization */}
              <Card className="p-6 bg-gradient-card border-border/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg text-foreground">Advanced Customization</h3>
                  <Settings className="w-5 h-5 text-muted-foreground" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Attributes */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Gender</label>
                      <div className="flex flex-wrap gap-2">
                        {genders.map((gender) => (
                          <Button
                            key={gender}
                            variant={selectedGender === gender.toLowerCase() ? "default" : "outline"}
                            size="sm"
                            className={selectedGender === gender.toLowerCase() 
                              ? 'bg-primary hover:bg-primary/90' 
                              : 'border-border/50 hover:border-primary/30'
                            }
                            onClick={() => setSelectedGender(gender.toLowerCase())}
                          >
                            {gender}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Age Range</label>
                      <Select value={selectedAge} onValueChange={setSelectedAge}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ages.map((age) => (
                            <SelectItem key={age} value={age}>{age}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Body Type</label>
                      <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select body type" />
                        </SelectTrigger>
                        <SelectContent>
                          {bodyTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Facial Expression</label>
                      <Select>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select expression" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Neutral", "Smiling", "Serious", "Confident", "Mysterious", "Playful"].map((expr) => (
                            <SelectItem key={expr} value={expr}>{expr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Creativity Level: {Math.round(creativity[0] * 100)}%
                      </label>
                      <Slider
                        value={creativity}
                        onValueChange={setCreativity}
                        max={1}
                        min={0}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Conservative</span>
                        <span>Experimental</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Resolution</label>
                      <div className="grid grid-cols-1 gap-2">
                        {["512x512", "1024x1024", "1536x1536"].map((res) => (
                          <Button
                            key={res}
                            variant={resolution === res ? "default" : "outline"}
                            size="sm"
                            className={resolution === res 
                              ? 'bg-primary hover:bg-primary/90' 
                              : 'border-border/50 hover:border-primary/30'
                            }
                            onClick={() => setResolution(res)}
                          >
                            {res}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Appearance Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Hair</label>
                      <div className="space-y-2">
                        <Select value={selectedHairColor} onValueChange={setSelectedHairColor}>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Color" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairColors.map((color) => (
                              <SelectItem key={color} value={color}>{color}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedHairStyle} onValueChange={setSelectedHairStyle}>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Style" />
                          </SelectTrigger>
                          <SelectContent>
                            {hairStyles.map((style) => (
                              <SelectItem key={style} value={style}>{style}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Eyes</label>
                      <Select value={selectedEyeColor} onValueChange={setSelectedEyeColor}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Eye color" />
                        </SelectTrigger>
                        <SelectContent>
                          {eyeColors.map((color) => (
                            <SelectItem key={color} value={color}>{color}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Setting</label>
                      <div className="space-y-2">
                        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Location" />
                          </SelectTrigger>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem key={location} value={location}>{location}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={selectedLighting} onValueChange={setSelectedLighting}>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Lighting" />
                          </SelectTrigger>
                          <SelectContent>
                            {lighting.map((light) => (
                              <SelectItem key={light} value={light}>{light}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Body Pose</label>
                      <Select value={selectedPose} onValueChange={setSelectedPose}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select pose" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Portrait", "Full Body", "Three Quarter", "Profile", "Action", "Seated"].map((pose) => (
                            <SelectItem key={pose} value={pose}>{pose}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Clothing Style</label>
                      <Select value={selectedClothing} onValueChange={setSelectedClothing}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select outfit" />
                        </SelectTrigger>
                        <SelectContent>
                          {["Casual", "Business", "Elegant", "Sporty", "Bohemian", "Gothic", "Futuristic"].map((outfit) => (
                            <SelectItem key={outfit} value={outfit}>{outfit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">Accessories</label>
                      <Select value={selectedAccessories} onValueChange={setSelectedAccessories}>
                        <SelectTrigger className="bg-background/50 border-border/50">
                          <SelectValue placeholder="Select accessories" />
                        </SelectTrigger>
                        <SelectContent>
                          {["None", "Jewelry", "Glasses", "Hat", "Watch", "Earrings", "Necklace"].map((acc) => (
                            <SelectItem key={acc} value={acc}>{acc}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Generate Button */}
              <Card className="p-6 bg-gradient-card border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">Ready to Generate</h4>
                    <p className="text-sm text-muted-foreground">Cost: 1 credit</p>
                     <div className="mt-2 flex items-center gap-3">
                       <Switch checked={photoMode} onCheckedChange={setPhotoMode} />
                       <div>
                         <p className="text-sm font-medium text-foreground">
                           Photo Mode {photoMode && <Badge className="ml-2 bg-primary/20 text-primary border-primary/30">ON</Badge>}
                         </p>
                         <p className="text-xs text-muted-foreground">
                           {photoMode 
                             ? "Studio-quality professional headshots with FLUX.1-dev" 
                             : "Creative freedom with faster generation"
                           }
                         </p>
                       </div>
                     </div>
                  </div>
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow px-8"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Avatar
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </div>

             {/* Right Panel - Preview */}
             <div className="xl:col-span-2 space-y-6">
                <Card className="p-8 bg-gradient-card border-border/50 h-fit">
                  <h3 className="font-semibold text-xl mb-6 text-foreground">Preview</h3>
                  <div className="w-full bg-background/30 rounded-xl border-2 border-dashed border-border/30 flex items-center justify-center overflow-hidden relative" style={{ aspectRatio: '3/4', minHeight: '400px', maxHeight: '600px' }}>
                    {isGenerating ? (
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        <p className="text-muted-foreground text-center">Generating your avatar...</p>
                      </div>
                    ) : generatedImage ? (
                      <img 
                        src={generatedImage} 
                        alt="Generated Avatar"
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <img 
                        src={previewAvatarImg} 
                        alt="Preview Avatar"
                        className="w-full h-full object-cover rounded-xl opacity-60"
                      />
                    )}
                  </div>
                </Card>

                {/* Recent Avatars */}
                <Card className="p-6 bg-gradient-card border-border/50">
                  <h3 className="font-semibold text-lg mb-4 text-foreground">Recent Avatars</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {recentAvatars.slice(0, 6).map((avatar, index) => (
                      <div key={index} className="group cursor-pointer">
                        <div className="aspect-[3/4] rounded-lg overflow-hidden bg-background/30 mb-2">
                          <img 
                            src={avatar.image} 
                            alt={avatar.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <h4 className="font-medium text-sm text-foreground">{avatar.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{avatar.description}</p>
                      </div>
                    ))}
                  </div>
                </Card>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
};