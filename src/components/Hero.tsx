import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Mic, Send, Crown, Lock, Zap, Camera, Shuffle, Star, X, Circle, Search } from "lucide-react";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

// Import high-quality style images
import styleLongExposure from '@/assets/style-long-exposure.jpg';
import styleChildAnimal from '@/assets/style-child-animal.jpg';
import style90sAnime from '@/assets/style-90s-anime.jpg';
import styleMinimalistArch from '@/assets/style-minimalist-arch.jpg';
import styleFantasyCreature from '@/assets/style-fantasy-creature.jpg';
import styleStreetFashion from '@/assets/style-street-fashion.jpg';
import styleMoskvichka from '@/assets/style-moskvichka.jpg';
import styleFantasyPortraits from '@/assets/style-fantasy-portraits.jpg';
import stylePhotoset from '@/assets/style-photoset.jpg';
import styleHokTech from '@/assets/style-hok-tech.jpg';
import styleFluffWorld from '@/assets/style-fluff-world.jpg';
import styleFantasyLandscape from '@/assets/style-fantasy-landscape.jpg';
import styleArtNouveau from '@/assets/style-art-nouveau.jpg';
import styleNighttimeDreams from '@/assets/style-nighttime-dreams.jpg';
import styleCyberpunk from '@/assets/style-cyberpunk.jpg';
import styleWatercolor from '@/assets/style-watercolor.jpg';
import styleFilmNoir from '@/assets/style-film-noir.jpg';
import styleSteampunk from '@/assets/style-steampunk.jpg';
import stylePopArt from '@/assets/style-pop-art.jpg';
import styleGothic from '@/assets/style-gothic.jpg';
import styleSurreal from '@/assets/style-surreal.jpg';
import styleGlitch from '@/assets/style-glitch.jpg';
import styleOilPainting from '@/assets/style-oil-painting.jpg';
import stylePixelArt from '@/assets/style-pixel-art.jpg';
import styleImpressionist from '@/assets/style-impressionist.jpg';
import styleBiomechanical from '@/assets/style-biomechanical.jpg';
import styleSynthwave from '@/assets/style-synthwave.jpg';
import styleAbstractGeo from '@/assets/style-abstract-geo.jpg';
import styleBotanical from '@/assets/style-botanical.jpg';

// Style data with high-quality images
const styleData = [
  { name: "long exposure emotion", username: "tenparisien", id: "longexposure", image: styleLongExposure },
  { name: "Illustrated Child with Animal", username: "neyroph", id: "childanimal", image: styleChildAnimal },
  { name: "90's anime", username: "DERNIEREXILE", id: "90sanime", image: style90sAnime },
  { name: "Minimalist Architecture", username: "Bokn", id: "minimal", image: styleMinimalistArch },
  { name: "Fantasy Creature", username: "neyroph", id: "fantasycreature", image: styleFantasyCreature },
  { name: "kontext.streetfashion", username: "superbdiplomaticwolf", id: "streetfashion", image: styleStreetFashion },
  { name: "Moskvichka.AI", username: "KNezderova", id: "moskvichka", image: styleMoskvichka },
  { name: "Fantasy Portraits", username: "unfettereddextrousdisciple", id: "fantasyportraits", image: styleFantasyPortraits },
  { name: "kontext.photoset", username: "frugalpoisedwrasse", id: "photoset", image: stylePhotoset },
  { name: "HOK (Technically S...)", username: "Sup3r", id: "hoktech", image: styleHokTech },
  { name: "Fluff World", username: "Beccu", id: "fluffworld", image: styleFluffWorld },
  { name: "Fantasy Landscape...", username: "usefulokapi", id: "fantasylandscape", image: styleFantasyLandscape },
  { name: "Art Nouveau Portrait...", username: "splendidlyricalcamel", id: "artnouveau", image: styleArtNouveau },
  { name: "Nighttime Dreams, ...", username: "personalizedamiablecat", id: "nighttimedreams", image: styleNighttimeDreams },
  { name: "Cyberpunk Neon", username: "neonartist", id: "cyberpunk", image: styleCyberpunk },
  { name: "Watercolor Dreams", username: "aquabrush", id: "watercolor", image: styleWatercolor },
  { name: "Film Noir Classic", username: "shadowmaster", id: "filmnoir", image: styleFilmNoir },
  { name: "Steampunk Mechanical", username: "brassgears", id: "steampunk", image: styleSteampunk },
  { name: "Pop Art Vibrant", username: "popvisual", id: "popart", image: stylePopArt },
  { name: "Gothic Architecture", username: "stonecarver", id: "gothic", image: styleGothic },
  { name: "Surreal Dreamscape", username: "mindmelter", id: "surreal", image: styleSurreal },
  { name: "Digital Glitch", username: "datamancer", id: "glitch", image: styleGlitch },
  { name: "Oil Painting Master", username: "brushstroke", id: "oilpainting", image: styleOilPainting },
  { name: "Pixel Art Retro", username: "pixelcrafter", id: "pixelart", image: stylePixelArt },
  { name: "Impressionist Light", username: "lightcatcher", id: "impressionist", image: styleImpressionist },
  { name: "Biomechanical Fusion", username: "organictech", id: "biomechanical", image: styleBiomechanical },
  { name: "Synthwave Retro", username: "neonwave", id: "synthwave", image: styleSynthwave },
  { name: "Abstract Geometric", username: "shapeshifter", id: "abstractgeo", image: styleAbstractGeo },
  { name: "Botanical Vintage", username: "plantlore", id: "botanical", image: styleBotanical },
];

export const Hero = () => {
  const [inputValue, setInputValue] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("Style");
  const [selectedAspect, setSelectedAspect] = useState("2:3");
  const [selectedResolution, setSelectedResolution] = useState("1K");
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [showAspectOptions, setShowAspectOptions] = useState(false);
  const [showResolutionOptions, setShowResolutionOptions] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStylePreview, setSelectedStylePreview] = useState<{name: string, username: string, id: string, image: string} | null>(null);

  // Filter styles based on search query
  const filteredStyles = useMemo(() => {
    if (!searchQuery.trim()) return styleData;
    
    return styleData.filter(style => 
      style.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      style.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
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
                    {/* Search Bar */}
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder="Search styles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-background/50 border-border/50"
                      />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-4 mb-4">
                      <Button variant="ghost" className="text-foreground font-semibold text-sm">All</Button>
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">Krea 1</Button>
                      <Button variant="ghost" className="text-muted-foreground hover:text-foreground text-sm">Flux</Button>
                    </div>

                    {/* Styles Grid - All Individual Styles */}
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

                      {/* Render filtered styles */}
                      {filteredStyles.map((style) => (
                        <div 
                          key={style.id}
                          className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-all duration-300 group relative border-2 border-transparent hover:border-primary"
                          onClick={() => setSelectedStylePreview(style)}
                        >
                          <img src={style.image} alt={style.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                          <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-gradient-to-t from-black/70 to-transparent text-white">
                            <div className="font-semibold">{style.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Side Preview Panel */}
                  <div className="flex-1 bg-muted/30 border-l border-border/30 p-6 overflow-y-auto">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-foreground mb-4">
                          {selectedStylePreview ? selectedStylePreview.name : 'Preview'}
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Preview images showing 4 variations with style name overlay */}
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative aspect-[4/3] bg-muted/50 rounded-lg overflow-hidden">
                              <img 
                                src={selectedStylePreview ? selectedStylePreview.image : "https://via.placeholder.com/200x200/1a1a1a/ffffff?text=Select+Style"} 
                                alt={`Preview ${i}`}
                                className="w-full h-full object-cover"
                              />
                              {selectedStylePreview && (
                                <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-gradient-to-t from-black/70 to-transparent text-white">
                                  <span className="font-medium">{selectedStylePreview.name}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl">
                          + Add Style
                        </Button>
                        <Button variant="outline" className="w-full border-primary/30 text-foreground hover:bg-primary/10 py-3 rounded-xl">
                          📌 Pin
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
