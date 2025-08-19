import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { 
  User, 
  Palette, 
  Shirt, 
  MapPin, 
  Camera, 
  Sparkles, 
  Download, 
  Share2, 
  Heart,
  RotateCw,
  Zap,
  Crown,
  Lock
} from "lucide-react";

export const AvatarStudio = () => {
  const [selectedCategory, setSelectedCategory] = useState("model");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const categories = [
    { id: "model", name: "Model", icon: User },
    { id: "head", name: "Head", icon: User },
    { id: "body", name: "Body", icon: User },
    { id: "theme", name: "Theme", icon: Crown },
    { id: "image", name: "Image", icon: Camera }
  ];

  const modelOptions = {
    style: [
      { name: "Realistic V2.1", selected: true, premium: false },
      { name: "Anime V2", selected: false, premium: false },
      { name: "Furry V2", selected: false, premium: true },
      { name: "Legacy", selected: false, premium: false }
    ],
    gender: [
      { name: "Woman", selected: true },
      { name: "Man", selected: false },
      { name: "Trans", selected: false }
    ],
    age: [
      { name: "Teen (18+)", selected: false },
      { name: "20s", selected: true },
      { name: "30s", selected: false },
      { name: "MILF", selected: false },
      { name: "DILF", selected: false }
    ],
    ethnicity: [
      { name: "Latina", selected: false },
      { name: "Caucasian", selected: true },
      { name: "Asian", selected: false },
      { name: "Afro", selected: false },
      { name: "Arab", selected: false },
      { name: "Indian", selected: false }
    ]
  };

  const headOptions = {
    eyeColor: [
      { name: "Blue", selected: true },
      { name: "Brown", selected: false },
      { name: "Green", selected: false },
      { name: "Hazel", selected: false }
    ],
    hairColor: [
      { name: "Blonde", selected: true },
      { name: "Brunette", selected: false },
      { name: "Black", selected: false },
      { name: "Ginger", selected: false },
      { name: "Pink", selected: false }
    ],
    hairStyle: [
      { name: "Long", selected: true },
      { name: "Short", selected: false },
      { name: "Ponytail", selected: false },
      { name: "Bun", selected: false },
      { name: "Pigtails", selected: false }
    ]
  };

  const bodyOptions = {
    bodyType: [
      { name: "Skinny", selected: false },
      { name: "Slim", selected: true },
      { name: "Fit", selected: false },
      { name: "Athletic", selected: false },
      { name: "Curvy", selected: false },
      { name: "Muscular", selected: false }
    ],
    clothing: [
      { name: "Lingerie", selected: true, premium: true },
      { name: "Bikini", selected: false },
      { name: "Dress", selected: false },
      { name: "Casual", selected: false },
      { name: "Sportswear", selected: false }
    ],
    pose: [
      { name: "Standing", selected: true },
      { name: "Sitting", selected: false },
      { name: "Lying", selected: false },
      { name: "Dancing", selected: false, premium: true }
    ]
  };

  const locationOptions = [
    { name: "Bedroom", selected: true },
    { name: "Beach", selected: false },
    { name: "Office", selected: false },
    { name: "Gym", selected: false },
    { name: "Pool", selected: false },
    { name: "Outdoor", selected: false }
  ];

  const lightingOptions = [
    { name: "Natural", selected: true },
    { name: "Studio", selected: false },
    { name: "Dramatic", selected: false },
    { name: "Cinematic", selected: false },
    { name: "Neon", selected: false, premium: true }
  ];

  const renderOptionGrid = (title: string, options: any[], columns = 3) => (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-foreground">{title}</h4>
        <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary/80">
          <Sparkles className="w-3 h-3 mr-1" />
          Random
        </Button>
      </div>
      <div className={`grid grid-cols-${columns} gap-2`}>
        {options.map((option, index) => (
          <Button
            key={index}
            variant={option.selected ? "default" : "outline"}
            size="sm"
            className={`relative ${
              option.selected
                ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow'
                : 'border-border/50 hover:border-primary/30 hover:bg-primary/5 text-foreground'
            }`}
          >
            {option.premium && (
              <Crown className="w-3 h-3 absolute -top-1 -right-1 text-yellow-500" />
            )}
            {option.name}
          </Button>
        ))}
      </div>
    </div>
  );

  const generateAvatar = () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 100) {
          setIsGenerating(false);
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <section className="min-h-screen bg-gradient-hero pt-20">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Categories */}
            <div className="lg:col-span-1">
              <Card className="p-4 bg-gradient-card border-border/50 sticky top-24">
                <h3 className="font-semibold text-lg mb-4 text-foreground">Tags Library</h3>
                <div className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = category.icon;
                    return (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.id ? "default" : "ghost"}
                        className={`w-full justify-start ${
                          selectedCategory === category.id
                            ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
                            : 'hover:bg-primary/10 text-foreground'
                        }`}
                        onClick={() => setSelectedCategory(category.id)}
                      >
                        <IconComponent className="w-4 h-4 mr-3" />
                        {category.name}
                      </Button>
                    );
                  })}
                </div>

                <Separator className="my-6 bg-border/50" />

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full border-primary/30 text-primary hover:bg-primary/10"
                    onClick={generateAvatar}
                    disabled={isGenerating}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isGenerating ? 'Generating...' : 'Generate Image'}
                  </Button>
                  
                  {isGenerating && (
                    <div className="space-y-2">
                      <Progress value={generationProgress} className="w-full" />
                      <p className="text-xs text-center text-muted-foreground">
                        {generationProgress}% Complete
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1 border-border/50">
                      <RotateCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 border-border/50">
                      <Zap className="w-3 h-3 mr-1" />
                      Enhance
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Center - Options Panel */}
            <div className="lg:col-span-2">
              <Card className="p-6 bg-gradient-card border-border/50">
                <ScrollArea className="h-[700px] pr-4">
                  {selectedCategory === "model" && (
                    <div className="space-y-6">
                      {renderOptionGrid("Style", modelOptions.style, 2)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Gender", modelOptions.gender, 3)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Age", modelOptions.age, 3)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Ethnicity", modelOptions.ethnicity, 3)}
                    </div>
                  )}

                  {selectedCategory === "head" && (
                    <div className="space-y-6">
                      {renderOptionGrid("Eyes Color", headOptions.eyeColor, 3)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Hair Color", headOptions.hairColor, 3)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Hair Style", headOptions.hairStyle, 3)}
                    </div>
                  )}

                  {selectedCategory === "body" && (
                    <div className="space-y-6">
                      {renderOptionGrid("Body Type", bodyOptions.bodyType, 3)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Clothing", bodyOptions.clothing, 3)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Pose", bodyOptions.pose, 3)}
                    </div>
                  )}

                  {selectedCategory === "theme" && (
                    <div className="space-y-6">
                      {renderOptionGrid("Location", locationOptions, 3)}
                      <Separator className="bg-border/50" />
                      {renderOptionGrid("Lighting", lightingOptions, 3)}
                      
                      <Separator className="bg-border/50" />
                      
                      {/* Advanced Settings */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-foreground">Advanced Settings</h4>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-sm text-foreground">HD Quality</label>
                            <Switch />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-foreground">Creativity</label>
                              <span className="text-xs text-muted-foreground">75%</span>
                            </div>
                            <Slider defaultValue={[75]} max={100} step={1} />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label className="text-sm text-foreground">Style Strength</label>
                              <span className="text-xs text-muted-foreground">60%</span>
                            </div>
                            <Slider defaultValue={[60]} max={100} step={1} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedCategory === "image" && (
                    <div className="space-y-6 text-center">
                      <div className="border-2 border-dashed border-border/50 rounded-lg p-12 hover:border-primary/30 transition-colors">
                        <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h4 className="font-medium text-foreground mb-2">Upload Reference</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Upload an image to use as reference for generation
                        </p>
                        <Button className="bg-primary hover:bg-primary/90">
                          Choose File
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="border-border/50">
                          <Palette className="w-4 h-4 mr-2" />
                          Color Match
                        </Button>
                        <Button variant="outline" className="border-border/50">
                          <User className="w-4 h-4 mr-2" />
                          Face Reference
                        </Button>
                      </div>
                    </div>
                  )}
                </ScrollArea>
              </Card>
            </div>

            {/* Right - Preview & Results */}
            <div className="lg:col-span-1">
              <div className="space-y-6 sticky top-24">
                {/* Preview */}
                <Card className="p-4 bg-gradient-card border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-foreground">Preview</h3>
                    <Badge variant="secondary" className="text-xs">4:5</Badge>
                  </div>
                  
                  <div className="aspect-[4/5] bg-background/30 rounded-lg border border-border/30 flex items-center justify-center mb-4">
                    {isGenerating ? (
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Generating...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Your avatar will appear here</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {["1:1", "5:4", "4:5", "16:9"].map((ratio) => (
                      <Button
                        key={ratio}
                        variant={ratio === "4:5" ? "default" : "outline"}
                        size="sm"
                        className={`text-xs ${
                          ratio === "4:5"
                            ? 'bg-primary hover:bg-primary/90'
                            : 'border-border/50 hover:border-primary/30'
                        }`}
                      >
                        {ratio}
                      </Button>
                    ))}
                  </div>
                </Card>

                {/* Generation Settings */}
                <Card className="p-4 bg-gradient-card border-border/50">
                  <h3 className="font-semibold text-foreground mb-4">Generation</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">Number of Images</span>
                      <div className="flex space-x-1">
                        {[1, 2, 4, 6].map((num) => (
                          <Button
                            key={num}
                            variant={num === 1 ? "default" : "outline"}
                            size="sm"
                            className={`w-8 h-8 p-0 text-xs ${
                              num === 1
                                ? 'bg-primary hover:bg-primary/90'
                                : 'border-border/50 hover:border-primary/30'
                            }`}
                          >
                            {num}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
                      onClick={generateAvatar}
                      disabled={isGenerating}
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </Button>
                    
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">
                        Cost: 1 token • You have 150 left
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="p-4 bg-gradient-card border-border/50">
                  <h3 className="font-semibold text-foreground mb-4">Actions</h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="border-border/50">
                      <Heart className="w-3 h-3 mr-1" />
                      Like
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/50">
                      <Download className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/50">
                      <Share2 className="w-3 h-3 mr-1" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" className="border-border/50">
                      <Lock className="w-3 h-3 mr-1" />
                      Private
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};