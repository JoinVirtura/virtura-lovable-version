import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Mic, Send, Crown, Lock, Zap, Camera, Shuffle, Star, X, Circle, Heart } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Style");
  const [selectedAspect, setSelectedAspect] = useState("2:3");
  const [selectedResolution, setSelectedResolution] = useState("1K");
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [showAspectOptions, setShowAspectOptions] = useState(false);
  const [showResolutionOptions, setShowResolutionOptions] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [selectedStylePreview, setSelectedStylePreview] = useState<{name: string, username: string, id: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      console.log("User input:", inputValue);
      console.log("Style:", selectedStyle);
      console.log("Aspect ratio:", selectedAspect);
      console.log("Resolution:", selectedResolution);
      // TODO: Implement actual generation logic
    }
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        recorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        recorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          // TODO: Upload to Supabase and process with voice-to-text
          console.log("Audio recorded:", audioBlob);
        };

        setMediaRecorder(recorder);
        recorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error("Error accessing microphone:", error);
      }
    }
  };

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-background via-background to-muted/30 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/20 via-primary/8 to-transparent animate-corner-glow-1" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/12 via-primary/4 to-transparent animate-corner-glow-2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent animate-corner-glow-3" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/12 via-primary/4 to-transparent animate-corner-glow-4" />
      </div>
      
      <div className="relative z-10 container mx-auto px-12 py-20 flex flex-col items-center justify-center min-h-screen text-center max-w-6xl">
        {/* Header Badge */}
        <Badge className="bg-card/80 border-primary/20 text-foreground px-6 py-3 text-base font-semibold mb-8 animate-fade-in backdrop-blur-sm">
          <Crown className="w-5 h-5 mr-3 text-primary" />
          Revolutionary AI Technology
        </Badge>

        {/* Hero Title */}
        <h1 className="text-7xl md:text-8xl font-bold mb-8 animate-fade-in-up">
          <span className="block text-foreground leading-tight">Create</span>
          <span className="block bg-gradient-to-r from-primary via-primary to-secondary bg-clip-text text-transparent leading-tight">
            Stunning AI<br />Portraits
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl text-muted-foreground mb-12 max-w-2xl leading-relaxed animate-fade-in-up-delay">
          Transform your photos into professional headshots, artistic portraits, and brand photography with advanced AI technology. Perfect for LinkedIn, social media, and professional use.
        </p>

        {/* Input Form */}
        <div className="w-full max-w-3xl mb-8 animate-fade-in-up-delay-2">
          <form onSubmit={handleSubmit} className="relative">
            {/* Main Input Container */}
            <div className="relative bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder="Describe your perfect portrait..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="border-0 bg-transparent text-lg placeholder:text-muted-foreground/70 focus:ring-0 focus:outline-none p-0 h-auto"
                  />
                </div>
                
                {/* Voice Input Button */}
                <Button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    isRecording 
                      ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                      : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  <Mic className="w-5 h-5" />
                </Button>

                {/* Generate Button */}
                <Button 
                  type="submit" 
                  className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground px-8 py-3 rounded-xl text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate
                </Button>
              </div>

              {/* Controls Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Random Prompt Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="bg-muted/60 border-border/50 hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-medium h-10"
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Random prompt
                </Button>

                {/* Style Button - Correct Icon and Spacing */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowStyleModal(true)}
                    className="bg-muted/60 border-border/50 hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-medium h-10"
                  >
                    <Circle className="w-4 h-4 mr-1" />
                    Style
                  </Button>
                </div>

                {/* Image Prompt Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="bg-muted/60 border-border/50 hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-medium h-10"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Image prompt
                </Button>

                {/* Image Style Button */}
                <Button
                  type="button"
                  variant="outline"
                  className="bg-muted/60 border-border/50 hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-medium h-10"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Image style
                </Button>

                {/* Aspect Ratio */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAspectOptions(!showAspectOptions)}
                    className="bg-muted/60 border-border/50 hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-medium h-10"
                  >
                    <div className="w-4 h-4 mr-2 border border-current rounded-sm" />
                    {selectedAspect}
                  </Button>
                  
                  {/* Aspect Ratio Dropdown */}
                  {showAspectOptions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 p-2 min-w-[200px]">
                      <div className="grid grid-cols-4 gap-2">
                        {['4:3', '3:2', '16:9', '2.35:1', '1:1', '4:5', '2:3', '9:16'].map((ratio) => (
                          <Button
                            key={ratio}
                            type="button"
                            variant={selectedAspect === ratio ? "default" : "ghost"}
                            className="text-xs p-2 h-8"
                            onClick={() => {
                              setSelectedAspect(ratio);
                              setShowAspectOptions(false);
                            }}
                          >
                            {ratio}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Resolution */}
                <div className="relative">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowResolutionOptions(!showResolutionOptions)}
                    className="bg-muted/60 border-border/50 hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-medium h-10"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    {selectedResolution}
                  </Button>
                  
                  {/* Resolution Dropdown */}
                  {showResolutionOptions && (
                    <div className="absolute bottom-full left-0 mb-2 bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-50 p-2 min-w-[120px]">
                      {['1K', '1.2K', '1.5K', '4K'].map((res) => (
                        <Button
                          key={res}
                          type="button"
                          variant={selectedResolution === res ? "default" : "ghost"}
                          className="w-full justify-start text-sm p-2 h-8"
                          onClick={() => {
                            setSelectedResolution(res);
                            setShowResolutionOptions(false);
                          }}
                        >
                          {res}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Style Modal */}
        {showStyleModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl w-full max-w-7xl h-[85vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-bold text-foreground">Styles</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background border-border/50 hover:bg-muted/50 text-xs px-2 py-1 h-7"
                    >
                      Community
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-background text-foreground border border-border/50 text-xs px-2 py-1 h-7"
                    >
                      Krea
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background border-border/50 hover:bg-muted/50 text-xs px-2 py-1 h-7"
                    >
                      Private
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-background border-border/50 hover:bg-muted/50 text-xs px-2 py-1 h-7"
                    >
                      Pinned
                    </Button>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStyleModal(false)}
                  className="hover:bg-muted/50 p-1 h-6 w-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Modal Content - Split Layout */}
              <div className="flex h-[calc(85vh-80px)]">
                {/* Left Side - Styles Grid */}
                <div className="flex-1 p-4 overflow-y-auto">
                  {/* Category Tabs */}
                  <div className="flex items-center gap-4 mb-4">
                    <Button variant="ghost" className="text-foreground font-semibold text-sm">All</Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">Krea 1</Button>
                    <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">Flux</Button>
                  </div>

                  {/* Styles Grid - All Available Styles */}
                  <div className="grid grid-cols-5 gap-3">
                    {/* Create Style Card */}
                    <div 
                      className="aspect-square bg-muted/30 rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all"
                    >
                      <div className="text-xl mb-1">+</div>
                      <div className="text-xs text-center px-2">
                        <div className="text-muted-foreground">Train a style</div>
                        <div className="font-semibold">Create style</div>
                      </div>
                    </div>

                    {/* Style Cards with Real Images */}
                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "frank Vibrant Oil Painting", username: "unlimitedpleasantllig...", id: "oil"})}
                    >
                      <img src="/lovable-uploads/aaf40797-dcd5-4e74-8ec5-3e2522fbd266.png" alt="Frank Vibrant Oil Painting" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">unlimitedpleasantllig...</div>
                        <div className="font-semibold">frank Vibrant Oil Pa...</div>
                      </div>
                    </div>

                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "Illustrated Child with Animal", username: "neyroph", id: "child"})}
                    >
                      <img src="/lovable-uploads/aaf40797-dcd5-4e74-8ec5-3e2522fbd266.png" alt="Illustrated Child with Animal" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">neyroph</div>
                        <div className="font-semibold">Illustrated Child wit...</div>
                      </div>
                    </div>

                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "atlas silk style", username: "calmtriumphatbat", id: "silk"})}
                    >
                      <img src="/lovable-uploads/aaf40797-dcd5-4e74-8ec5-3e2522fbd266.png" alt="atlas silk style" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">calmtriumphatbat</div>
                        <div className="font-semibold">atlas silk style</div>
                      </div>
                    </div>

                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "Enamel Pin", username: "Sup3r", id: "enamel"})}
                    >
                      <img src="/lovable-uploads/aaf40797-dcd5-4e74-8ec5-3e2522fbd266.png" alt="Enamel Pin" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">Sup3r</div>
                        <div className="font-semibold">Enamel Pin</div>
                      </div>
                    </div>

                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "Fantasy Sparkle Portrait", username: "flatteringgallantcougar", id: "fantasy"})}
                    >
                      <img src="/lovable-uploads/aaf40797-dcd5-4e74-8ec5-3e2522fbd266.png" alt="Fantasy Sparkle Portrait" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">flatteringgallantcougar</div>
                        <div className="font-semibold">Fantasy Sparkle Por...</div>
                      </div>
                    </div>

                    {/* Additional style cards */}
                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "Buryad Nomad", username: "May_Day_19", id: "buryad"})}
                    >
                      <img src="/lovable-uploads/e9f3cb5e-50e2-4dce-90dd-1d7f788372a1.png" alt="Buryad Nomad" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">May_Day_19</div>
                        <div className="font-semibold">Buryad Nomad</div>
                      </div>
                    </div>

                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "Van Gogh Style", username: "vsdsgn", id: "vangogh"})}
                    >
                      <img src="/lovable-uploads/304b0a7d-15e7-43b0-a044-285bfe1d6599.png" alt="Van Gogh Style" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">vsdsgn</div>
                        <div className="font-semibold">Van Gogh Style</div>
                      </div>
                    </div>

                    <div 
                      className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                      onClick={() => setSelectedStylePreview({name: "Minecraft", username: "iker", id: "minecraft"})}
                    >
                      <img src="/lovable-uploads/304b0a7d-15e7-43b0-a044-285bfe1d6599.png" alt="Minecraft" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                        <div className="text-white/70">iker</div>
                        <div className="font-semibold">Minecraft</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Style Preview */}
                <div className="w-80 p-4 border-l border-border bg-muted/20">
                  {selectedStylePreview ? (
                    <div className="space-y-4">
                      <div className="aspect-square rounded-xl overflow-hidden bg-muted">
                        <img 
                          src="/lovable-uploads/ae302689-cd9a-4495-8012-2ab562f424bb.png" 
                          alt={selectedStylePreview.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{selectedStylePreview.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedStylePreview.username}</p>
                      </div>
                      <div className="space-y-2">
                        <Button className="w-full bg-primary hover:bg-primary/90">
                          Add Style
                        </Button>
                        <Button variant="outline" className="w-full">
                          <Heart className="w-4 h-4 mr-2" />
                          Pin
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                      <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                        <Circle className="w-8 h-8" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">Click to view a style.</div>
                        <div className="text-xs">Generating with styles lets you explore new aesthetics.</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-4 animate-fade-in">
          <Badge variant="secondary" className="px-4 py-2 bg-card/80 border-primary/20 text-foreground backdrop-blur-sm">
            <Lock className="w-4 h-4 mr-2 text-primary" />
            PRIVATE & SECURE
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-card/80 border-primary/20 text-foreground backdrop-blur-sm">
            <Zap className="w-4 h-4 mr-2 text-primary" />
            INSTANT GENERATION
          </Badge>
          <Badge variant="secondary" className="px-4 py-2 bg-card/80 border-primary/20 text-foreground backdrop-blur-sm">
            <Camera className="w-4 h-4 mr-2 text-primary" />
            STUDIO QUALITY
          </Badge>
        </div>
      </div>
    </section>
  );
};