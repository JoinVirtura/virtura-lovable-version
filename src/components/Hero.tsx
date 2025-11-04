import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Mic, Send, Crown, Lock, Zap, Camera, Shuffle, Star, X, Circle, Search, Target, Image, Palette, RectangleHorizontal, Diamond, Upload, ChevronDown, Download, Heart, Share2, Shield, Settings, Wand2, Save, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ImageGenerationService, type ImageGenerationParams } from "@/services/imageGenerationService";
import { toast } from "sonner";

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
  const [showStyleOptions, setShowStyleOptions] = useState(false);
  const [showAspectOptions, setShowAspectOptions] = useState(false);
  const [showStyleModal, setShowStyleModal] = useState(false);
  const [showImageStylePopup, setShowImageStylePopup] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedImageStyle, setSelectedImageStyle] = useState<{name: string, username: string, id: string, image: string} | null>(null);
  const [uploadedImagePrompt, setUploadedImagePrompt] = useState<string | null>(null);
  const [uploadedGeneralImage, setUploadedGeneralImage] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{
    id: string;
    imageUrl: string;
    prompt: string;
    isGenerating: boolean;
    metadata?: any;
  }>>([]);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [savingImageId, setSavingImageId] = useState<string | null>(null);
  
  // Handle file upload for Image Style
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
          setSelectedImageStyle(null); // Clear style selection when uploading image
          setSelectedStylePreview(null); // Clear style preview when uploading image
          setShowImageStylePopup(false); // Close popup after upload
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for General Image Upload (Pin button replacement)
  const handleGeneralImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedGeneralImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle file upload for Image Prompt
  const handleImagePromptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImagePrompt(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeUploadedImage = () => {
    setUploadedImage(null);
  };

  const removeUploadedImagePrompt = () => {
    setUploadedImagePrompt(null);
  };

  const handleStyleSelect = (style: typeof styleData[0]) => {
    setSelectedImageStyle(style);
    setUploadedImage(null); // Clear uploaded image when selecting style
    setShowImageStylePopup(false);
    setShowStyleModal(false);
  };

  const removeSelectedStyle = () => {
    setSelectedImageStyle(null);
  };

  const removeUploadedGeneralImage = () => {
    setUploadedGeneralImage(null);
  };

  const handleCompleteReset = () => {
    // Clear all upload states
    setReferenceImage(null);
    setUploadedImagePrompt(null);
    setUploadedImage(null);
    setUploadedGeneralImage(null);
    
    // Clear selection states
    setSelectedImageStyle(null);
    setSelectedStylePreview(null);
    
    // Clear input
    setInputValue("");
    
    // Reset style and aspect selections
    setSelectedStyle("Style");
    setSelectedAspect("2:3");
    
    // Clear generated images
    setGeneratedImages([]);
    
    // Reset generation state
    setIsGenerating(false);
    
    // Close any open modals
    setShowStyleModal(false);
    setShowImageStylePopup(false);
    setShowAdvanced(false);
    
    toast.success("Reset complete - ready for a new generation!");
  };
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
  
  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Close aspect dropdown if clicked outside
      if (showAspectOptions && !target.closest('[data-aspect-container]')) {
        setShowAspectOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAspectOptions]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      console.log("User input:", inputValue);
      console.log("Style:", selectedStyle);
      console.log("Aspect ratio:", selectedAspect);
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
              toast.error("Voice transcription failed");
            }
          };
          
          reader.readAsDataURL(audioBlob);
        };

        recorder.start();
        setMediaRecorder(recorder);
        setIsRecording(true);
      } catch (error) {
        console.error('Error accessing microphone:', error);
        toast.error("Could not access microphone");
      }
    }
  };

  const handleGenerate = async () => {
    if (!inputValue.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    
    // Create placeholder cards
    const newCardIds = Array.from({ length: 3 }, (_, i) => `card-${Date.now()}-${i}`);
    const placeholderCards = newCardIds.map(id => ({
      id,
      imageUrl: "",
      prompt: inputValue,
      isGenerating: true,
    }));

    setGeneratedImages(prev => [...placeholderCards, ...prev]);

    try {
      // 🔍 DEBUG: Check reference image state before generating
      const refImage = uploadedImagePrompt || referenceImage || undefined;
      console.log('🖼️ HERO: Reference image state:', {
        uploadedImagePrompt: uploadedImagePrompt ? 'SET' : 'NOT SET',
        referenceImage: referenceImage ? 'SET' : 'NOT SET',
        finalRefImage: refImage ? 'SET' : 'NOT SET',
        hasData: refImage?.startsWith('data:') ? 'YES' : 'NO',
        length: refImage?.length || 0,
        first50Chars: refImage?.substring(0, 50) || 'EMPTY'
      });

      const params: ImageGenerationParams = {
        prompt: inputValue,
        negativePrompt: "blurry, low quality, distorted",
        contentType: "auto",
        style: selectedImageStyle?.name || selectedStyle === "Style" ? "photorealistic" : selectedStyle,
        aspectRatio: "9:16" as any,
        resolution: "1080x1920",
        quality: "8k",
        adherence: 9.5,
        steps: 50,
        enhance: false,
        referenceImage: refImage
      };

      const results = await ImageGenerationService.generateVariants(inputValue, params, 3);
      
      // Update cards with results, keep all 3 slots
      setGeneratedImages(prev => 
        prev.map(card => {
          if (newCardIds.includes(card.id)) {
            const cardIndex = newCardIds.indexOf(card.id);
            const result = results[cardIndex];
            
            if (result?.success && result.image) {
              return {
                ...card,
                imageUrl: result.image,
                isGenerating: false,
                metadata: result.metadata
              };
            } else {
              // Mark as failed but keep the slot
              return {
                ...card,
                isGenerating: false,
                failed: true,
                error: result?.error || 'Generation failed'
              };
            }
          }
          return card;
        })
      );

      toast.success("Images generated successfully!");
      setInputValue(""); // Clear input after generation
    } catch (error) {
      console.error('Generation error:', error);
      toast.error("Generation failed. Please try again.");
      setInputValue(""); // Clear input even on error
      
      // Remove placeholder cards on error
      setGeneratedImages(prev => prev.filter(card => !newCardIds.includes(card.id)));
    } finally {
      setIsGenerating(false);
      setInputValue(""); // Ensure input always clears
    }
  };

  const handleSaveToLibrary = async (card: {
    id: string;
    imageUrl: string;
    prompt: string;
    metadata?: any;
  }) => {
    setSavingImageId(card.id);
    
    try {
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please sign in to save images to your library");
        setSavingImageId(null);
        return;
      }

      let finalImageUrl = card.imageUrl;

      // Handle base64 images - upload to Supabase Storage
      if (card.imageUrl.startsWith('data:image/')) {
        const base64Data = card.imageUrl.split(',')[1];
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/png' });
        
        const fileName = `generated-image-${Date.now()}-${card.id}.png`;
        const filePath = `images/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('virtura-media')
          .upload(filePath, blob, {
            contentType: 'image/png',
            cacheControl: '3600',
            upsert: true
          });
          
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('virtura-media')
          .getPublicUrl(filePath);
          
        finalImageUrl = publicUrl;
      }

      // Insert into avatar_library
      const { error } = await supabase
        .from('avatar_library')
        .insert({
          user_id: user.id,
          image_url: finalImageUrl,
          video_url: null,
          thumbnail_url: finalImageUrl,
          audio_url: null,
          is_video: false,
          prompt: card.prompt,
          title: `AI Generated Image ${new Date().toLocaleDateString()}`,
          tags: ['ai-generated', 'home-page', selectedStyle !== 'Style' ? selectedStyle : 'photorealistic'],
          duration: 0
        });

      if (error) throw error;

      // Dispatch event to refresh library page if open
      window.dispatchEvent(new Event('library-updated'));
      
      toast.success("Image saved to your library!");
    } catch (error: any) {
      console.error('Save to library error:', error);
      toast.error(error.message || "Failed to save image. Please try again.");
    } finally {
      setSavingImageId(null);
    }
  };

  return (
    <section className="relative min-h-screen bg-background overflow-hidden">
      {/* Futuristic Violet-to-Blue Background System */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep Space Navy Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F1A] via-[#1a1a2e] to-[#0F0F1A]" />
        
        {/* Glowing Orbs (Brain-like energy) */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96">
          <div className="w-full h-full bg-gradient-to-br from-violet-500/30 to-blue-500/20 rounded-full blur-[100px] animate-neon-pulse" />
        </div>
        <div className="absolute bottom-1/3 left-1/4 w-[500px] h-[500px]">
          <div className="w-full h-full bg-gradient-to-tl from-blue-500/20 to-purple-500/30 rounded-full blur-[120px] animate-pulse" />
        </div>
        
        {/* Particle System */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute w-1 h-1 bg-violet-400/60 rounded-full animate-particle-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </div>
        
        {/* Neural Network Lines */}
        <div className="absolute inset-0">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent top-1/4 animate-pulse" />
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent top-2/3" />
          <div className="absolute h-full w-px bg-gradient-to-b from-transparent via-violet-500/20 to-transparent left-1/3" />
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
      
      <div className="relative z-10 container mx-auto px-12 pt-40 pb-4 flex flex-col items-center min-h-screen text-center max-w-6xl">
        {/* Header Badge */}
        <Badge className="bg-card/80 border-primary/20 text-foreground px-6 py-3 text-base font-semibold mb-8 animate-fade-in backdrop-blur-sm">
          Virtura AI
        </Badge>

        {/* Main Heading - Futuristic Aesthetic */}
        {generatedImages.length === 0 && !isGenerating && (
          <div className="mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="text-white font-light">Where Identity </span>
              <span className="text-gradient-primary font-bold animate-glow-text">Evolves</span>
            </h1>
          </div>
        )}

        {/* Output Display Section - ABOVE input */}
        {generatedImages.length > 0 && (
          <div className="w-full max-w-[1800px] mb-2 animate-fade-in px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {generatedImages.map((card) => (
            <Card 
              key={card.id} 
              className="group overflow-hidden hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 p-0 border-0 bg-transparent"
            >
                  {card.isGenerating ? (
                    <div className="aspect-square bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex flex-col items-center justify-center rounded-2xl">
                      <div className="relative">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <Sparkles className="absolute top-0 left-0 h-12 w-12 animate-pulse text-primary/50" />
                      </div>
                      <p className="text-white mt-6 text-center font-medium">Creating magic...</p>
                      <p className="text-white/60 text-sm mt-2">This may take a moment</p>
                    </div>
                  ) : (card as any).failed ? (
                    <div className="aspect-square bg-gradient-to-br from-red-500/10 to-orange-500/10 flex flex-col items-center justify-center p-8 rounded-2xl">
                      <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                      <p className="text-white text-center font-medium mb-2">Generation Failed</p>
                      <p className="text-white/60 text-sm text-center mb-4">{(card as any).error}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setGeneratedImages(prev => prev.filter(c => c.id !== card.id));
                          handleGenerate();
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                      </Button>
                    </div>
                  ) : (
                    <div className="aspect-square relative overflow-hidden w-full">
                      <img
                        src={card.imageUrl}
                        alt={card.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-2xl"
                      />
                      
                      {/* Overlaid metadata */}
                      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent">
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-1">
                            {card.metadata?.resolution && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-transparent border-0">
                                {card.metadata.resolution}
                              </Badge>
                            )}
                            {card.metadata?.provider && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-transparent border-0">
                                {card.metadata.provider}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs hover:bg-white/10 bg-transparent"
                              onClick={async () => {
                                try {
                                  const response = await fetch(card.imageUrl);
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  const link = document.createElement('a');
                                  link.href = url;
                                  link.download = `virtura-${Date.now()}.png`;
                                  document.body.appendChild(link);
                                  link.click();
                                  document.body.removeChild(link);
                                  window.URL.revokeObjectURL(url);
                                  toast.success("Image downloaded!");
                                } catch (error) {
                                  console.error('Download failed:', error);
                                  toast.error("Failed to download image");
                                }
                              }}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs hover:bg-white/10 bg-transparent"
                              onClick={() => handleSaveToLibrary(card)}
                              disabled={savingImageId === card.id}
                            >
                              {savingImageId === card.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Save className="h-3 w-3" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Input Interface - Studio Pro Style */}
        <div className="w-full max-w-5xl mb-4 animate-fade-in">
          <Card className="backdrop-blur-xl bg-black/60 border-2 border-primary/30 shadow-2xl overflow-hidden">
            <div className="p-4">
              {/* Main Input Row */}
              <div className="flex items-center gap-3">
                <Textarea
                  placeholder="Describe the image you want to create..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="flex-1 min-h-[32px] max-h-[32px] text-sm bg-transparent border-0 focus:ring-0 placeholder:text-muted-foreground/70 resize-none py-2"
                  style={{ outline: 'none' }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                />
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  {/* Image Upload Button */}
                  {referenceImage ? (
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/50 hover:border-primary transition-all">
                        <img 
                          src={referenceImage} 
                          alt="Uploaded reference" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompleteReset();
                        }}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center transition-colors shadow-lg"
                      >
                        <X className="h-3 w-3 text-white" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => document.getElementById('reference-upload')?.click()}
                      className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-primary/30 hover:bg-primary/20 hover:border-primary/50 transition-all flex items-center justify-center"
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                  )}
                  <input
                    id="reference-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setReferenceImage(event.target?.result as string);
                          toast.success("Reference image uploaded");
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = '';
                    }}
                  />
                  
                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={handleVoiceInput}
                    className={`w-9 h-9 rounded-full backdrop-blur-md border transition-all flex items-center justify-center ${
                      isRecording 
                        ? 'bg-red-500 border-red-400 animate-pulse' 
                        : 'bg-black/40 border-primary/30 hover:bg-primary/20 hover:border-primary/50'
                    }`}
                  >
                    <Mic className="h-4 w-4 text-white" />
                  </button>
                  
                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !inputValue.trim()}
                    className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-4 w-4 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </Card>
        </div>
          
          {/* Large Styles Popup Window */}
          {showStyleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowStyleModal(false)} />
              
              {/* Large Popup Box - Properly Centered */}
              <div className="relative bg-black/95 backdrop-blur-xl border-2 border-primary/30 rounded-2xl shadow-2xl w-full max-w-7xl h-[85vh] overflow-hidden mx-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b-2 border-primary/20 bg-black/40">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">Styles</h2>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="bg-black/40 text-gray-400 border border-primary/20 hover:bg-primary/20 hover:text-white text-xs px-2 py-1 h-7"
                      >
                        Individual
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-white hover:bg-primary/90 text-xs px-2 py-1 h-7"
                      >
                        Brand
                      </Button>
                      <Button
                        size="sm"
                        className="bg-black/40 text-gray-400 border border-primary/20 hover:bg-primary/20 hover:text-white text-xs px-2 py-1 h-7"
                      >
                        Private
                      </Button>
                      <Button
                        size="sm"
                        className="bg-black/40 text-gray-400 border border-primary/20 hover:bg-primary/20 hover:text-white text-xs px-2 py-1 h-7"
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
                      className="pl-10 bg-black/40 border-primary/30 text-white placeholder:text-gray-500"
                    />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex items-center gap-4 mb-4">
                      <Button variant="ghost" className="text-white bg-primary/20 font-semibold text-sm">All</Button>
                      <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-primary/10 text-sm">Fantasy</Button>
                      <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-primary/10 text-sm">Portrait</Button>
                      <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-primary/10 text-sm">Abstract</Button>
                      <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-primary/10 text-sm">Vintage</Button>
                    </div>

                    {/* Styles Grid - Smaller thumbnails */}
                    <div className="grid grid-cols-6 gap-2">
                      {/* Create Style Card */}
                      <div 
                        className="aspect-square bg-black/40 rounded-xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center cursor-pointer hover:bg-primary/20 hover:border-primary/50 transition-all"
                      >
                        <div className="text-xl mb-1 text-white">+</div>
                        <div className="text-xs text-center px-2">
                          <div className="text-gray-400">Train a style</div>
                          <div className="font-semibold text-white">Create style</div>
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
                          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all" />
                          <div className="absolute bottom-0 left-0 right-0 p-2 text-xs bg-gradient-to-t from-black/70 to-transparent text-white">
                            <div className="font-semibold">{style.name}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Side Preview Panel */}
                  <div className="w-80 bg-black/40 border-l border-primary/20 p-4 overflow-hidden flex flex-col">
                    <div className="flex flex-col h-full">
                      <div className="flex-1 flex flex-col justify-center pt-8">
                        <h3 className="text-lg font-bold text-white mb-4">
                          {uploadedImage ? 'Custom Style' : selectedStylePreview ? selectedStylePreview.name : 'Select a style to preview'}
                        </h3>
                        {uploadedImage ? (
                          <div className="mb-6">
                            <div className="relative bg-black/50 border border-primary/20 rounded-xl overflow-hidden h-64">
                              <img 
                                src={uploadedImage} 
                                alt="Uploaded style"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ) : selectedStylePreview ? (
                          <div className="mb-6">
                            <div className="relative bg-black/50 border border-primary/20 rounded-xl overflow-hidden h-64">
                              <img 
                                src={selectedStylePreview.image} 
                                alt={selectedStylePreview.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        ) : null}
                      </div>
                      
                      <div className="space-y-4 flex-shrink-0">
                        <Button 
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 rounded-xl text-sm"
                          onClick={() => {
                            if (selectedStylePreview) {
                              handleStyleSelect(selectedStylePreview);
                              setShowStyleModal(false);
                            } else if (uploadedImage) {
                              setShowStyleModal(false);
                              setUploadedImagePrompt(uploadedImage);
                              setUploadedImage(null);
                            }
                          }}
                          disabled={!selectedStylePreview && !uploadedImage}
                        >
                          {uploadedImage ? 'Upload' : '+ Add Style'}
                        </Button>
                        {!uploadedImage && (
                          <label className="w-full cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                            <Button 
                              type="button"
                              className="w-full bg-black/40 border-2 border-primary/30 text-white hover:bg-primary/20 py-3 rounded-xl text-sm"
                              onClick={(e) => {
                                e.preventDefault();
                                (e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement)?.click();
                              }}
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              Upload Image
                            </Button>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Style Popup - Outside all containers */}
          {showImageStylePopup && (
            <div 
              className="absolute top-[calc(100%+8px)] left-[180px] bg-card border border-border rounded-xl shadow-2xl z-[9999] p-4 w-[400px] backdrop-blur-xl max-h-[500px] overflow-y-auto"
              data-image-style-popup
            >
                {/* Style Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {styleData.slice(0, 12).map((style) => (
                    <div 
                      key={style.id}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-all duration-200 group"
                      onClick={() => handleStyleSelect(style)}
                    >
                      <img 
                        src={style.image} 
                        alt={style.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.log('Image failed to load:', style.image);
                          e.currentTarget.src = 'https://via.placeholder.com/100x100/1a1a1a/ffffff?text=Style';
                        }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all" />
                      {/* Selection indicator with proper border radius */}
                      {selectedImageStyle?.id === style.id && (
                        <div className="absolute inset-0 border-2 border-primary bg-primary/20 rounded-lg" />
                      )}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <label className="flex-1 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button 
                      type="button"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 rounded-lg text-sm"
                      onClick={(e) => {
                        e.preventDefault();
                        (e.currentTarget.parentElement?.querySelector('input[type="file"]') as HTMLInputElement)?.click();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </Button>
                  </label>
                  <Button 
                    type="button"
                    variant="outline" 
                    className="flex-1 border-violet-500/30 text-foreground hover:bg-gradient-primary hover:text-white hover:border-violet-500/50 py-2 rounded-lg text-sm transition-all duration-200"
                    onClick={() => {
                      console.log('Select asset clicked');
                      setShowImageStylePopup(false);
                    }}
                  >
                    {uploadedImage ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded overflow-hidden border border-white/20">
                          <img 
                            src={uploadedImage} 
                            alt="Selected asset" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>Asset selected</span>
                      </div>
                    ) : selectedImageStyle ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded overflow-hidden border border-white/20">
                          <img 
                            src={selectedImageStyle.image} 
                            alt={selectedImageStyle.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>Style selected</span>
                      </div>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Select asset
                      </>
                    )}
                  </Button>
                </div>
            </div>
          )}
          
          {/* Aspect Ratio Dropdown - Outside container */}
          {showAspectOptions && (
            <div className="absolute top-[calc(100%+8px)] left-[260px] bg-card border border-border rounded-xl shadow-2xl z-[9999] p-3 min-w-[320px] backdrop-blur-xl max-h-[400px] overflow-y-auto">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { ratio: '4:3', width: 24, height: 18 },
                  { ratio: '3:2', width: 24, height: 16 },
                  { ratio: '16:9', width: 28, height: 16 },
                  { ratio: '2.35:1', width: 28, height: 12 },
                  { ratio: '1:1', width: 20, height: 20 },
                  { ratio: '4:5', width: 16, height: 20 },
                  { ratio: '2:3', width: 16, height: 24 },
                  { ratio: '9:16', width: 14, height: 24 }
                ].map(({ratio, width, height}) => (
                  <Button
                    key={ratio}
                    type="button"
                    variant={selectedAspect === ratio ? "default" : "ghost"}
                    className="p-4 h-auto flex flex-col items-center justify-center gap-3 hover:bg-muted transition-colors rounded-lg"
                    onClick={() => {
                      setSelectedAspect(ratio);
                      setShowAspectOptions(false);
                    }}
                  >
                    <div 
                      className={`border-2 rounded-md ${selectedAspect === ratio ? 'border-primary bg-primary/30' : 'border-muted-foreground bg-muted-foreground/20'}`}
                      style={{ 
                        width: `${width}px`, 
                        height: `${height}px`
                      }}
                    />
                    <span className="text-xs font-semibold">{ratio}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
      </div>
    </section>
  );
};

