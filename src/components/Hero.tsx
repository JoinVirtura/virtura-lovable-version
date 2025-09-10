
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Mic, Send, Crown, Lock, Zap, Camera, Shuffle, Star, X, Circle } from "lucide-react";
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
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          const reader = new FileReader();
          
          reader.onloadend = async () => {
            const base64Audio = (reader.result as string).split(',')[1];
            
            try {
              // Call Supabase Edge Function for transcription
              const { data, error } = await supabase.functions.invoke('voice-transcribe', {
                body: { audio: base64Audio },
              });
              
              if (error) throw error;
              
              if (data?.transcript) {
                setInputValue(data.transcript);
              }
            } catch (error) {
              console.error('Transcription error:', error);
            }
          };
          
          reader.readAsDataURL(audioBlob);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    }
  };

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Revolutionary Futuristic Background System */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep Space Gradient Foundation */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background" />
        
        {/* Morphing Geometric Shapes */}
        <div className="absolute top-1/4 left-1/6 w-64 h-64 opacity-30">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-transparent animate-morph-1 blur-xl" />
        </div>
        <div className="absolute bottom-1/3 right-1/6 w-80 h-80 opacity-25">
          <div className="w-full h-full bg-gradient-to-tl from-primary/15 to-transparent animate-morph-2 blur-2xl" />
        </div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-20">
          <div className="w-full h-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent animate-morph-3 blur-3xl" />
        </div>
        
        {/* Advanced Particle Trail System */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-1 h-1 bg-primary animate-particle-trail-1" />
          <div className="absolute top-32 left-24 w-0.5 h-0.5 bg-primary/80 animate-particle-trail-2" />
          <div className="absolute top-24 left-28 w-0.5 h-0.5 bg-primary/60 animate-particle-trail-3" />
          
          <div className="absolute top-40 right-32 w-1 h-1 bg-primary animate-particle-trail-4" />
          <div className="absolute top-52 right-36 w-0.5 h-0.5 bg-primary/80 animate-particle-trail-5" />
          
          <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-primary animate-particle-trail-6" />
          <div className="absolute bottom-24 left-1/3 w-0.5 h-0.5 bg-primary/70 animate-particle-trail-7" />
          
          <div className="absolute bottom-20 right-20 w-1 h-1 bg-primary animate-particle-trail-8" />
        </div>
        
        {/* Holographic Grid System */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-grid-holographic animate-grid-pulse" />
        </div>
        
        {/* Revolutionary Rotating Energy Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[800px] h-[800px] border border-primary/10 rounded-full animate-ring-rotate-1" />
          <div className="absolute w-[600px] h-[600px] border border-primary/8 rounded-full animate-ring-rotate-2" />
          <div className="absolute w-[400px] h-[400px] border border-primary/6 rounded-full animate-ring-rotate-3" />
        </div>
        
        {/* Advanced Scanning Matrix */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-scan-matrix-1" />
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-scan-matrix-2" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary/15 to-transparent animate-scan-vertical-1" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-primary/10 to-transparent animate-scan-vertical-2" />
        </div>
        
        {/* Depth-Creating Parallax Layers */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-primary/40 rounded-full animate-parallax-1" />
          <div className="absolute top-20 right-16 w-1.5 h-1.5 bg-primary/50 rounded-full animate-parallax-2" />
          <div className="absolute bottom-16 left-1/4 w-1 h-1 bg-primary/60 rounded-full animate-parallax-3" />
          <div className="absolute bottom-10 right-1/3 w-2.5 h-2.5 bg-primary/30 rounded-full animate-parallax-4" />
        </div>
        
        {/* Glitch Effect Overlays */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent animate-glitch-1" />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-primary/15 to-transparent animate-glitch-2" />
        </div>
        
        {/* Cinematic Corner Illumination */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent animate-corner-glow-1" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-primary/12 via-primary/4 to-transparent animate-corner-glow-2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-primary/15 via-primary/5 to-transparent animate-corner-glow-3" />
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-primary/12 via-primary/4 to-transparent animate-corner-glow-4" />
      </div>
      
      <div className="relative z-10 container mx-auto px-12 py-20 flex flex-col items-center justify-center min-h-screen text-center max-w-6xl">{/* More padding */}
        {/* Header Badge */}
        <Badge className="bg-card/80 border-primary/20 text-foreground px-6 py-3 text-base font-semibold mb-8 animate-fade-in backdrop-blur-sm">
          <Crown className="w-5 h-5 mr-3 text-primary" />
          Revolutionary AI Technology
        </Badge>

        {/* Main Heading - Steve Jobs Level Sophistication */}
        <div className="mb-16 animate-fade-in">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-light leading-[1.1] mb-8 tracking-tight w-full max-w-5xl mx-auto break-words px-4">
            <span className="text-foreground font-light">Where Identity </span>
            <span className="bg-gradient-to-r from-primary via-primary to-primary-dark bg-clip-text text-transparent font-medium italic inline-block pr-2">Evolves</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
            Transform your vision into reality with hyper realistic AI avatars
          </p>
        </div>

        {/* Compact Image Generation Interface */}
        <div className="w-full max-w-5xl mb-12 animate-fade-in">
          <form onSubmit={handleSubmit} className="relative">
            {/* Main Input Container - Improved Width */}
            <div className="relative bg-card/90 border border-border/50 rounded-2xl backdrop-blur-xl shadow-2xl overflow-hidden">
              {/* Text Input Area - Minimized Height */}
              <div className="px-8 py-4">
                <textarea
                  placeholder="Describe an image and click generate..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full h-12 text-lg bg-transparent border-0 focus:ring-0 placeholder:text-muted-foreground/70 resize-none leading-relaxed p-0"
                  style={{ outline: 'none' }}
                />
              </div>

              {/* Bottom Action Bar - Full Width Layout */}
              <div className="px-6 py-4 bg-muted/10 border-t border-border/30">
                <div className="flex items-center justify-between gap-4 w-full">
                  {/* Options Row - Flex Wrap for Responsiveness */}
                  <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
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

                  {/* Raw Option */}
                  <Button
                    type="button"
                    variant="outline"
                    className="bg-muted/60 border-border/50 hover:bg-muted/80 px-4 py-2 rounded-xl text-sm font-medium h-10"
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Raw
                  </Button>
                  </div>
                  
                  {/* Action Buttons Group - Fixed Width */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Microphone Button */}
                    <Button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`w-12 h-12 p-0 rounded-xl transition-all duration-300 ${
                        isRecording 
                          ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                          : 'bg-primary/10 border border-primary/30 hover:bg-primary/20'
                      }`}
                    >
                      <Mic className={`w-5 h-5 ${isRecording ? 'text-white' : 'text-primary'}`} />
                    </Button>
                    
                    {/* Generate Button */}
                    <Button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="bg-gradient-gold hover:bg-gradient-gold-hover shadow-gold px-6 py-3 rounded-xl font-bold text-base h-12 whitespace-nowrap"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </form>
          
          {/* Large Styles Popup Window */}
          {showStyleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-8">
              {/* Large Popup Box */}
              <div className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/30">
                  <div className="flex items-center gap-3">
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

                      {/* Row 1 */}
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

                      {/* Row 2 */}
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
                        onClick={() => setSelectedStylePreview({name: "Mualla", username: "unbeatablevivaciousbu...", id: "mualla"})}
                      >
                        <img src="/lovable-uploads/e9f3cb5e-50e2-4dce-90dd-1d7f788372a1.png" alt="Mualla" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">unbeatablevivaciousbu...</div>
                          <div className="font-semibold">Mualla</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Culinary Art", username: "advancedaccessiblem...", id: "culinary"})}
                      >
                        <img src="/lovable-uploads/e9f3cb5e-50e2-4dce-90dd-1d7f788372a1.png" alt="Culinary Art" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">advancedaccessiblem...</div>
                          <div className="font-semibold">Culinary Art</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Blue Flora", username: "thrivingmeticulouswall...", id: "blueflora"})}
                      >
                        <img src="/lovable-uploads/e9f3cb5e-50e2-4dce-90dd-1d7f788372a1.png" alt="Blue Flora" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">thrivingmeticulouswall...</div>
                          <div className="font-semibold">Blue Flora</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Abstract Blue Architecture", username: "sharperkeenpenguin", id: "bluearch"})}
                      >
                        <img src="/lovable-uploads/e9f3cb5e-50e2-4dce-90dd-1d7f788372a1.png" alt="Abstract Blue Architecture" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">sharperkeenpenguin</div>
                          <div className="font-semibold">Abstract Blue Archi...</div>
                        </div>
                      </div>

                      {/* Row 3 */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Airbrush 2025", username: "psyikedout", id: "airbrush"})}
                      >
                        <img src="/lovable-uploads/bb0a2a75-a269-45e8-9e96-3eb404ac4f45.png" alt="Airbrush 2025" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">psyikedout</div>
                          <div className="font-semibold">Airbrush 2025</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Chinese Watercolor", username: "enoughfortunateguppy", id: "watercolor"})}
                      >
                        <img src="/lovable-uploads/bb0a2a75-a269-45e8-9e96-3eb404ac4f45.png" alt="Chinese Watercolor" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">enoughfortunateguppy</div>
                          <div className="font-semibold">Chinese Watercolo...</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Minimalist Architecture", username: "Bokn", id: "minarch"})}
                      >
                        <img src="/lovable-uploads/bb0a2a75-a269-45e8-9e96-3eb404ac4f45.png" alt="Minimalist Architecture" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Bokn</div>
                          <div className="font-semibold">Minimalist Architec...</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "liminality", username: "luxuryfuturistictonagan", id: "liminality"})}
                      >
                        <img src="/lovable-uploads/bb0a2a75-a269-45e8-9e96-3eb404ac4f45.png" alt="liminality" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">luxuryfuturistictonagan</div>
                          <div className="font-semibold">liminality</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "aBSTRACT tYPE", username: "maartenvangent", id: "abstracttype"})}
                      >
                        <img src="/lovable-uploads/bb0a2a75-a269-45e8-9e96-3eb404ac4f45.png" alt="aBSTRACT tYPE" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">maartenvangent</div>
                          <div className="font-semibold">aBSTRACT tYPE</div>
                        </div>
                      </div>

                      {/* Row 4 */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Glazed tile", username: "astonishedreverentgor...", id: "glazed"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="Glazed tile" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">astonishedreverentgor...</div>
                          <div className="font-semibold">Glazed tile</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "90's anime", username: "DERNIEREXILE", id: "anime90s"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="90's anime" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">DERNIEREXILE</div>
                          <div className="font-semibold">90's anime</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "kontext.photoset", username: "frugalpoisedwrasse", id: "photoset"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="kontext.photoset" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">frugalpoisedwrasse</div>
                          <div className="font-semibold">kontext.photoset</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "databend", username: "frowenz", id: "databend"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="databend" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">frowenz</div>
                          <div className="font-semibold">databend</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "whispy woods", username: "adequatealbatross", id: "whispy"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="whispy woods" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">adequatealbatross</div>
                          <div className="font-semibold">whispy woods</div>
                        </div>
                      </div>

                      {/* Row 5 */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Scorn landscape", username: "lyuk12", id: "scorn"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="Scorn landscape" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">lyuk12</div>
                          <div className="font-semibold">Scorn landscape</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "distortion", username: "frowenz", id: "distortion"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="distortion" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">frowenz</div>
                          <div className="font-semibold">distortion</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Santorini Whitewash", username: "peaceabledistinctlycor...", id: "santorini"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="Santorini Whitewash" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">peaceabledistinctlycor...</div>
                          <div className="font-semibold">Santorini Whitewash</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "360", username: "krea", id: "360"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="360" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">krea</div>
                          <div className="font-semibold">360</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "pxlsrt 2", username: "frowenz", id: "pxlsrt"})}
                      >
                        <img src="/lovable-uploads/16537529-e39d-4c40-862b-a37c8d95ecde.png" alt="pxlsrt 2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">frowenz</div>
                          <div className="font-semibold">pxlsrt 2</div>
                        </div>
                      </div>

                      {/* Row 6 */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Natural Fantasy Painting", username: "Creatistico", id: "naturalfantasy"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Natural Fantasy Painting" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Creatistico</div>
                          <div className="font-semibold">Natural Fantasy Pain...</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Game Character", username: "oksyakuper", id: "gamechar"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Game Character" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">oksyakuper</div>
                          <div className="font-semibold">Game Character</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "DRAW", username: "Mikatroj", id: "draw"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="DRAW" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Mikatroj</div>
                          <div className="font-semibold">DRAW</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Fantasy Creature", username: "neyroph", id: "fantasycreat"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Fantasy Creature" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">neyroph</div>
                          <div className="font-semibold">Fantasy Creature</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Modern Architecture", username: "MADI2", id: "modernarch"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Modern Architecture" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">MADI2</div>
                          <div className="font-semibold">Modern Architecture</div>
                        </div>
                      </div>

                      {/* Row 7 - Additional from other images */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "ghibli", username: "nowen", id: "ghibli"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="ghibli" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">nowen</div>
                          <div className="font-semibold">ghibli</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Anime Expressions", username: "excitingconsiderategre...", id: "animeexp"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Anime Expressions" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">excitingconsiderategre...</div>
                          <div className="font-semibold">Anime Expressions</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Impressionism", username: "frog", id: "impressionism"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Impressionism" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">frog</div>
                          <div className="font-semibold">Impressionism</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Indie Sleaze", username: "smootherwinninggiraffe", id: "indiesleaze"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Indie Sleaze" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">smootherwinninggiraffe</div>
                          <div className="font-semibold">Indie Sleaze</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Architectural Sketch", username: "usefulokapi", id: "archsketch"})}
                      >
                        <img src="/lovable-uploads/2c842564-c2d9-4e99-a8e1-62949e226894.png" alt="Architectural Sketch" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">usefulokapi</div>
                          <div className="font-semibold">Architectural Sketch</div>
                        </div>
                      </div>

                      {/* Row 8 - More styles from other uploaded images */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Cubist Cats", username: "VilloAr", id: "cubistcats"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Cubist Cats" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">VilloAr</div>
                          <div className="font-semibold">Cubist Cats</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Hayao", username: "davidchase03", id: "hayao"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Hayao" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">davidchase03</div>
                          <div className="font-semibold">Hayao</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "sber chat", username: "neuronka", id: "sberchat"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="sber chat" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">neuronka</div>
                          <div className="font-semibold">sber chat</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Urban Crayon", username: "HallIsEmpty", id: "urbancrayon"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Urban Crayon" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">HallIsEmpty</div>
                          <div className="font-semibold">Urban Crayon</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Melagrappa", username: "divinewallaby", id: "melagrappa"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Melagrappa" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">divinewallaby</div>
                          <div className="font-semibold">Melagrappa</div>
                        </div>
                      </div>

                      {/* More styles from remaining images... */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Kaan", username: "Kaan", id: "kaan"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Kaan" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Kaan</div>
                          <div className="font-semibold">Kaan</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Cartoon Character", username: "Kaan", id: "cartoonchar"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Cartoon Character" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Kaan</div>
                          <div className="font-semibold">Cartoon Character</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Abstract Geometric", username: "fantasticeventfulhuman", id: "abstractgeo"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Abstract Geometric" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">fantasticeventfulhuman</div>
                          <div className="font-semibold">Abstract Geometric</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "2001: A Space Odyssey", username: "Sup3r", id: "space2001"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="2001: A Space Odyssey" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Sup3r</div>
                          <div className="font-semibold">2001: A Space Odys...</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Medieval", username: "autohomousforemostk...", id: "medieval"})}
                      >
                        <img src="/lovable-uploads/526563d4-baa4-40ab-bb75-1344394c996d.png" alt="Medieval" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">autohomousforemostk...</div>
                          <div className="font-semibold">Medieval</div>
                        </div>
                      </div>

                      {/* Final row from last uploaded images */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Ph-Style2", username: "rewardingwelcomeibis", id: "phstyle2"})}
                      >
                        <img src="/lovable-uploads/5fe3a8cb-a930-4f6e-b131-3611dd8bb48f.png" alt="Ph-Style2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">rewardingwelcomeibis</div>
                          <div className="font-semibold">Ph-Style2</div>
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
                        onClick={() => setSelectedStylePreview({name: "Kawaii Fantasy Food", username: "maneuverableaptgraffe", id: "kawaiifood"})}
                      >
                        <img src="/lovable-uploads/304b0a7d-15e7-43b0-a044-285bfe1d6599.png" alt="Kawaii Fantasy Food" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">maneuverableaptgraffe</div>
                          <div className="font-semibold">Kawaii Fantasy Food</div>
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

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "AeroFlux", username: "paranormality", id: "aeroflux"})}
                      >
                        <img src="/lovable-uploads/304b0a7d-15e7-43b0-a044-285bfe1d6599.png" alt="AeroFlux" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">paranormality</div>
                          <div className="font-semibold">AeroFlux</div>
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
                          <div className="font-semibold">atlas silk style</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-yellow-300 to-red-400 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Enamel Pin", username: "Sup3r", id: "enamel"})}
                      >
                        <div className="absolute inset-2 bg-yellow-400 rounded-full" />
                        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-red-500 rounded" />
                        <div className="absolute top-3 left-1/3 w-1 h-1 bg-green-500 rounded-full" />
                        <div className="absolute top-3 right-1/3 w-1 h-1 bg-blue-500 rounded-full" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Sup3r</div>
                          <div className="font-semibold">Enamel Pin</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-purple-500 to-pink-600 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Fantasy Sparkle Portrait", username: "flatteringgallantcougar", id: "fantasy"})}
                      >
                        <div className="absolute inset-2 bg-white/10 rounded-full blur-sm" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">flatteringgallantcougar</div>
                          <div className="font-semibold">Fantasy Sparkle Po...</div>
                        </div>
                      </div>

                      {/* Row 3 - More Styles */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-blue-400 to-red-500 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Buryad Nomad", username: "May_Day_19", id: "nomad"})}
                      >
                        <div className="absolute inset-2 bg-gradient-to-br from-blue-300 to-purple-400 rounded-lg" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">May_Day_19</div>
                          <div className="font-semibold">Buryad Nomad</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-red-400 to-yellow-500 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Mualla", username: "unbeatablevivaciousbu...", id: "mualla"})}
                      >
                        <div className="absolute inset-2 bg-gradient-to-br from-orange-300 to-red-400 rounded-lg" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">unbeatablevivaciousbu...</div>
                          <div className="font-semibold">Mualla</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-yellow-300 to-orange-400 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Culinary Art", username: "advancedaccessiblem...", id: "culinary"})}
                      >
                        <div className="absolute inset-3 bg-yellow-400 rounded-full" />
                        <div className="absolute inset-4 bg-orange-300 rounded-full" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">advancedaccessiblem...</div>
                          <div className="font-semibold">Culinary Art</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-blue-300 to-purple-500 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Blue Flora", username: "thrivingmeticulouswall...", id: "flora"})}
                      >
                        <div className="absolute inset-2 bg-blue-400 rounded-lg opacity-70" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">thrivingmeticulouswall...</div>
                          <div className="font-semibold">Blue Flora</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-gray-300 to-blue-400 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Abstract Blue Architecture", username: "sharperkeenpenguin", id: "bluearch"})}
                      >
                        <div className="absolute inset-2 bg-gray-400 transform rotate-45" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">sharperkeenpenguin</div>
                          <div className="font-semibold">Abstract Blue Archi...</div>
                        </div>
                      </div>

                      {/* Row 4 - Additional Styles */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-blue-500 via-white to-purple-500 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Airbrush 2025", username: "psyikedout", id: "airbrush"})}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-600" />
                        <div className="absolute inset-2 bg-white/20 rounded-lg blur-md" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">psyikedout</div>
                          <div className="font-semibold">Airbrush 2025</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-pink-200 to-red-300 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Chinese Watercolor", username: "enoughfortunateguppy", id: "watercolor"})}
                      >
                        <div className="absolute inset-3 bg-pink-300 rounded-full opacity-50" />
                        <div className="absolute inset-4 bg-red-200 rounded-full opacity-70" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">enoughfortunateguppy</div>
                          <div className="font-semibold">Chinese Watercolo...</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-white to-gray-200 relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Minimalist Architecture", username: "Bokn", id: "minimal"})}
                      >
                        <div className="absolute inset-4 border border-gray-400" />
                        <div className="absolute inset-6 bg-white" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Bokn</div>
                          <div className="font-semibold">Minimalist Architec...</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-gray-800 to-black relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "liminality", username: "luxuryfuturisticutonagan", id: "liminal"})}
                      >
                        <div className="absolute inset-3 bg-gray-700 rounded-lg" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">luxuryfuturisticutonagan</div>
                          <div className="font-semibold">liminality</div>
                        </div>
                      </div>

                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group bg-gradient-to-br from-yellow-200 to-black relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "aBSTRACT tYPE", username: "maartenvangent", id: "abstracttype"})}
                      >
                        <div className="absolute inset-2 flex items-center justify-center text-lg font-bold text-black transform -rotate-12">aB</div>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">maartenvangent</div>
                          <div className="font-semibold">aBSTRACT tYPE</div>
                        </div>
                      </div>

                      {/* Continue with more rows... */}
                      {Array.from({length: 35}).map((_, i) => (
                        <div 
                          key={`extra-${i}`} 
                          className="aspect-square rounded-xl bg-muted/20 border border-border/30 cursor-pointer hover:scale-105 transition-all duration-300 relative"
                          onClick={() => setSelectedStylePreview({name: `Style ${i + 6}`, username: `creator${i}`, id: `style${i}`})}
                        >
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500 rounded-xl" />
                          <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white rounded-b-xl">
                            <div className="text-white/70">creator{i}</div>
                            <div className="font-semibold">Style {i + 6}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Selected Style Preview */}
                  <div className="w-80 border-l border-border/30 p-4 flex flex-col">
                    {selectedStylePreview ? (
                      <>
                        {/* Style Header */}
                        <div className="mb-4">
                          <div className="text-sm text-muted-foreground mb-1">Flux</div>
                          <h3 className="text-xl font-bold text-foreground mb-1">{selectedStylePreview.name}</h3>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-white rounded-full" />
                            <span className="text-sm text-muted-foreground">{selectedStylePreview.username}</span>
                          </div>
                        </div>

                        {/* Example Images Grid */}
                        <div className="grid grid-cols-2 gap-2 mb-6 flex-1">
                          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-orange-300 to-red-400" />
                          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500" />
                          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-green-300 to-blue-400" />
                          <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-pink-300 to-purple-400" />
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                          <Button 
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                            onClick={() => {
                              setSelectedStyle(selectedStylePreview.name);
                              setShowStyleModal(false);
                            }}
                          >
                            + Add Style
                          </Button>
                          <Button 
                            variant="outline" 
                            className="w-full border-border/50 hover:bg-muted/50"
                          >
                            📌 Pin
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
                        <div>
                          <div className="text-lg mb-2">🎨</div>
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
        </div>

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
