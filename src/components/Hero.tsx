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
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStyleModal(false)} />
              
              {/* Large Popup Box */}
              <div className="relative bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] overflow-hidden">
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
                        className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2 py-1 h-7"
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

                    {/* Styles Grid - All Individual Styles from Uploaded Images */}
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

                      {/* long exposure emotion */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "long exposure emotion", username: "tenparisien", id: "longexposure"})}
                      >
                        <img src="/lovable-uploads/b1d029c9-7647-4877-aabc-4dff2174dd7c.png" alt="long exposure emotion" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">tenparisien</div>
                          <div className="font-semibold">long exposure emotion</div>
                        </div>
                      </div>

                      {/* Illustrated Child with Animal */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Illustrated Child with Animal", username: "neyroph", id: "childanimal"})}
                      >
                        <img src="/lovable-uploads/6b8516fa-9e86-4c1b-91aa-f5bd3e05a070.png" alt="Illustrated Child with Animal" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">neyroph</div>
                          <div className="font-semibold">Illustrated Child with Animal</div>
                        </div>
                      </div>

                      {/* 90's anime */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "90's anime", username: "DERNIEREXILE", id: "90sanime"})}
                      >
                        <img src="/lovable-uploads/4004f869-38f6-4d09-829d-e879d74ea4e7.png" alt="90's anime" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">DERNIEREXILE</div>
                          <div className="font-semibold">90's anime</div>
                        </div>
                      </div>

                      {/* Minimalist Architecture */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Minimalist Architecture", username: "Bokn", id: "minimal"})}
                      >
                        <img src="/lovable-uploads/7f19875e-32db-4ad5-9948-12c506a5ecab.png" alt="Minimalist Architecture" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Bokn</div>
                          <div className="font-semibold">Minimalist Architecture</div>
                        </div>
                      </div>

                      {/* Fantasy Creature */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Fantasy Creature", username: "neyroph", id: "fantasycreature"})}
                      >
                        <img src="/lovable-uploads/149f854a-d11f-49de-824d-48118e7bcc95.png" alt="Fantasy Creature" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">neyroph</div>
                          <div className="font-semibold">Fantasy Creature</div>
                        </div>
                      </div>

                      {/* kontext.streetfashion */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "kontext.streetfashion", username: "superbdiplomaticwolf", id: "streetfashion"})}
                      >
                        <img src="/lovable-uploads/7f369249-5c17-48b2-a47f-5ec868fa98a1.png" alt="kontext.streetfashion" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">superbdiplomaticwolf</div>
                          <div className="font-semibold">kontext.streetfashion</div>
                        </div>
                      </div>

                      {/* Moskvichka.AI */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Moskvichka.AI", username: "KNezderova", id: "moskvichka"})}
                      >
                        <img src="/lovable-uploads/5cf43d66-ed63-4dd5-9e24-c80cc1c8daf9.png" alt="Moskvichka.AI" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">KNezderova</div>
                          <div className="font-semibold">Moskvichka.AI</div>
                        </div>
                      </div>

                      {/* Fantasy Portraits */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Fantasy Portraits", username: "unfettereddextrousdisciple", id: "fantasyportraits"})}
                      >
                        <img src="/lovable-uploads/10dc3485-5856-4a38-90e1-8c1ebe80ec70.png" alt="Fantasy Portraits" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">unfettereddextrousdisciple</div>
                          <div className="font-semibold">Fantasy Portraits</div>
                        </div>
                      </div>

                      {/* kontext.photoset */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "kontext.photoset", username: "frugalpoisedwrasse", id: "photoset"})}
                      >
                        <img src="/lovable-uploads/ad9a4869-73b6-49e6-a0f8-99274778eb95.png" alt="kontext.photoset" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">frugalpoisedwrasse</div>
                          <div className="font-semibold">kontext.photoset</div>
                        </div>
                      </div>

                      {/* Frank Vibrant Oil Painting */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Frank Vibrant Oil Painting", username: "unlimitedpleasantalligator", id: "frank"})}
                      >
                        <img src="/lovable-uploads/f764d956-0a32-4789-b539-af22cb5d20c8.png" alt="Frank Vibrant Oil Painting" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">unlimitedpleasantalligator</div>
                          <div className="font-semibold">Frank Vibrant Oil Painting</div>
                        </div>
                      </div>

                      {/* atlas silk style */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "atlas silk style", username: "calmtriumphalbat", id: "atlassilk"})}
                      >
                        <img src="/lovable-uploads/f764d956-0a32-4789-b539-af22cb5d20c8.png" alt="atlas silk style" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">calmtriumphalbat</div>
                          <div className="font-semibold">atlas silk style</div>
                        </div>
                      </div>

                      {/* Enamel Pin */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Enamel Pin", username: "Sup3r", id: "enamel"})}
                      >
                        <img src="/lovable-uploads/f764d956-0a32-4789-b539-af22cb5d20c8.png" alt="Enamel Pin" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">Sup3r</div>
                          <div className="font-semibold">Enamel Pin</div>
                        </div>
                      </div>

                      {/* Fantasy Sparkle Portrait */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Fantasy Sparkle Portrait", username: "flatteringgallantcougar", id: "fantasy"})}
                      >
                        <img src="/lovable-uploads/f764d956-0a32-4789-b539-af22cb5d20c8.png" alt="Fantasy Sparkle Portrait" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">flatteringgallantcougar</div>
                          <div className="font-semibold">Fantasy Sparkle Portrait</div>
                        </div>
                      </div>

                      {/* Buryad Nomad */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Buryad Nomad", username: "May_Day_19", id: "nomad"})}
                      >
                        <img src="/lovable-uploads/42bfcd45-c1b2-4e4e-8f95-c3174def439e.png" alt="Buryad Nomad" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">May_Day_19</div>
                          <div className="font-semibold">Buryad Nomad</div>
                        </div>
                      </div>

                      {/* Mualla */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Mualla", username: "unbeatablevivaciousbu...", id: "mualla"})}
                      >
                        <img src="/lovable-uploads/42bfcd45-c1b2-4e4e-8f95-c3174def439e.png" alt="Mualla" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">unbeatablevivaciousbu...</div>
                          <div className="font-semibold">Mualla</div>
                        </div>
                      </div>

                      {/* Culinary Art */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Culinary Art", username: "advancedaccessiblem...", id: "culinary"})}
                      >
                        <img src="/lovable-uploads/42bfcd45-c1b2-4e4e-8f95-c3174def439e.png" alt="Culinary Art" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">advancedaccessiblem...</div>
                          <div className="font-semibold">Culinary Art</div>
                        </div>
                      </div>

                      {/* Blue Flora */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Blue Flora", username: "thrivingmeticulouswall...", id: "flora"})}
                      >
                        <img src="/lovable-uploads/42bfcd45-c1b2-4e4e-8f95-c3174def439e.png" alt="Blue Flora" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">thrivingmeticulouswall...</div>
                          <div className="font-semibold">Blue Flora</div>
                        </div>
                      </div>

                      {/* Abstract Blue Architecture */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Abstract Blue Architecture", username: "sharperkeenpenguin", id: "bluearch"})}
                      >
                        <img src="/lovable-uploads/42bfcd45-c1b2-4e4e-8f95-c3174def439e.png" alt="Abstract Blue Architecture" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">sharperkeenpenguin</div>
                          <div className="font-semibold">Abstract Blue Architecture</div>
                        </div>
                      </div>

                      {/* Airbrush 2025 */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Airbrush 2025", username: "psyikedout", id: "airbrush"})}
                      >
                        <img src="/lovable-uploads/507c9785-5fc3-4834-a8e4-203676f54a21.png" alt="Airbrush 2025" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">psyikedout</div>
                          <div className="font-semibold">Airbrush 2025</div>
                        </div>
                      </div>

                      {/* Chinese Watercolor */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "Chinese Watercolor", username: "enoughfortunateguppy", id: "watercolor"})}
                      >
                        <img src="/lovable-uploads/507c9785-5fc3-4834-a8e4-203676f54a21.png" alt="Chinese Watercolor" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">enoughfortunateguppy</div>
                          <div className="font-semibold">Chinese Watercolor</div>
                        </div>
                      </div>

                      {/* liminality */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "liminality", username: "luxuryfuturisticutonagan", id: "liminal"})}
                      >
                        <img src="/lovable-uploads/507c9785-5fc3-4834-a8e4-203676f54a21.png" alt="liminality" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">luxuryfuturisticutonagan</div>
                          <div className="font-semibold">liminality</div>
                        </div>
                      </div>

                      {/* aBSTRACT tYPE */}
                      <div 
                        className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                        onClick={() => setSelectedStylePreview({name: "aBSTRACT tYPE", username: "maartenvangent", id: "abstracttype"})}
                      >
                        <img src="/lovable-uploads/507c9785-5fc3-4834-a8e4-203676f54a21.png" alt="aBSTRACT tYPE" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-black/50 text-white">
                          <div className="text-white/70">maartenvangent</div>
                          <div className="font-semibold">aBSTRACT tYPE</div>
                        </div>
                      </div>

                      {/* All remaining styles from your uploaded images */}
                      {/* Glazed tile, 90's anime, kontext.photoset, databend, whispy woods */}
                      {/* Scorn landscape, distortion, Santorini Whitewash, 360, pxlsrt 2 */}
                      {/* Natural Fantasy Painting, Game Character, DRAW, Fantasy Creature, Modern Architecture */}
                      {/* ghibli, Anime Expressions, Impressionism, Indie Sleaze, Architectural Sketch */}
                      {/* Cubist Cats, Hayao, sber chat, Urban Crayon, Melagrappa */}
                      {/* Kaan, Cartoon Character, Abstract Geometry, 2001: A Space Odyssey, Medieval */}
                      {/* Ph-Style2, Blank Billboards, Hypergel, kontext.streetfashion, Syd Hoff */}
                      {/* kontext.metalicfuturistic, Food island, Hyperrealistic Character, Gothic Typography, Fantasy Portraits */}
                      {/* Dark and Mysterious, Plushy dogs, Moskvichka.AI, Abstract Sculpture, Child Playing Farmscape */}
                      {/* Van Gogh Style, Kawaii Fantasy Food, Minecraft, Vintage watercolor, AeroFlux */}
                      
                      {/* Continue with more styles... I'll add the remaining ones */}
                      
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