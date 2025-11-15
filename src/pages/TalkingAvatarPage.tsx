import { useState, useRef, useCallback } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Play, 
  Pause, 
  Mic, 
  Volume2, 
  Settings, 
  Eye, 
  Download,
  ImageIcon,
  VideoIcon,
  Sparkles,
  MessageSquare,
  CheckCircle2,
  Circle,
  Target,
  Palette,
  Film,
  Package,
  Wand2,
  Camera,
  Lightbulb,
  RotateCcw
} from "lucide-react";

// Import the store types
import type { Voice, Style, Exports } from "@/features/talking-avatar/store";
import { initialVoice, initialStyle, initialExports } from "@/features/talking-avatar/store";

// Hero Canvas Component
const HeroCanvas = ({ 
  uploadedFile, 
  onFileUpload 
}: { 
  uploadedFile: File | null;
  onFileUpload: (file: File) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      (file.type.startsWith('image/') && file.size <= 10 * 1024 * 1024) ||
      (file.type.startsWith('video/') && file.size <= 50 * 1024 * 1024)
    );
    
    if (validFile) {
      onFileUpload(validFile);
    }
  }, [onFileUpload]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  }, [onFileUpload]);

  return (
    <Card 
      className={`h-96 relative bg-gradient-to-br from-card/80 to-card/60 rounded-2xl border border-border/50 overflow-hidden cursor-pointer transition-all duration-300 ${
        isDragOver ? 'border-primary/50 shadow-lg shadow-primary/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      {/* Subtle particles background */}
      <div className="absolute inset-0 opacity-30">
        <div className="animate-pulse absolute top-1/4 left-1/4 w-2 h-2 bg-primary/40 rounded-full"></div>
        <div className="animate-pulse absolute top-1/2 right-1/3 w-1 h-1 bg-primary/30 rounded-full" style={{animationDelay: '1s'}}></div>
        <div className="animate-pulse absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-primary/35 rounded-full" style={{animationDelay: '2s'}}></div>
      </div>

      {uploadedFile ? (
        <div className="flex items-center justify-center h-full relative">
          {uploadedFile.type.startsWith('image/') ? (
            <div className="relative">
              <img 
                src={URL.createObjectURL(uploadedFile)} 
                alt="Uploaded avatar" 
                className="max-h-80 max-w-full object-contain rounded-lg animate-fade-in"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-lg"></div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <VideoIcon className="w-16 h-16 text-primary" />
              <p className="text-sm text-muted-foreground">{uploadedFile.name}</p>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Play className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
          <div className={`p-4 rounded-full border-2 border-dashed border-primary/30 bg-primary/5 transition-all duration-300 ${
            isDragOver ? 'border-primary/60 bg-primary/10 scale-110' : ''
          }`}>
            <Upload className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">Drop image/video here or click to upload</h3>
            <p className="text-sm text-muted-foreground">
              Images: PNG, JPG, WebP (up to 10MB) • Videos: MP4, MOV, WebM (up to 50MB)
            </p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpg,image/jpeg,image/webp,video/mp4,video/mov,video/webm"
        className="hidden"
        onChange={handleFileSelect}
      />
    </Card>
  );
};

// Avatar Panel
const AvatarPanel = ({ uploadedFile, onFileUpload }: { uploadedFile: File | null; onFileUpload: (file: File) => void }) => (
  <div className="space-y-6">
    <div className="flex space-x-4">
      <Button variant="outline" className="flex-1">
        <Upload className="w-4 h-4 mr-2" />
        Upload/Replace
      </Button>
      <Button variant="outline" className="flex-1">
        <ImageIcon className="w-4 h-4 mr-2" />
        Choose from Library
      </Button>
      <Button variant="outline" className="flex-1">
        <Sparkles className="w-4 h-4 mr-2" />
        Generate AI Avatar
      </Button>
    </div>
    
    {uploadedFile && (
      <Card className="p-4">
        <h4 className="font-medium mb-3">Face Alignment</h4>
        <div className="text-sm text-muted-foreground mb-3">
          Adjust positioning for optimal lip-sync results
        </div>
        <div className="flex space-x-4">
          <Button size="sm" variant="outline">
            <Camera className="w-4 h-4 mr-1" />
            Auto-Align
          </Button>
          <Button size="sm" variant="outline">
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
        </div>
      </Card>
    )}
  </div>
);

// Voice Panel
const VoicePanel = ({ voice, onVoiceChange }: { voice: Voice; onVoiceChange: (voice: Partial<Voice>) => void }) => {
  const [script, setScript] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="space-y-6">
      {/* Text-to-Speech Editor */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Script</h4>
        <Textarea
          placeholder="Enter your script here..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          className="min-h-24 resize-none"
          maxLength={600}
        />
        <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
          <span>{script.length}/600 characters</span>
          <span className="text-green-500">Auto-saved</span>
        </div>
      </Card>

      {/* Recording & Upload */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          variant={isRecording ? "destructive" : "outline"}
          onClick={() => setIsRecording(!isRecording)}
          className="h-20 flex-col"
        >
          <Mic className="w-6 h-6 mb-1" />
          {isRecording ? "Stop Recording" : "Record Voice"}
        </Button>
        <Button variant="outline" className="h-20 flex-col">
          <Upload className="w-6 h-6 mb-1" />
          Upload Audio
        </Button>
      </div>

      {/* Voice Settings */}
      <Card className="p-4">
        <h4 className="font-medium mb-4">Voice Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Voice</label>
            <Select value={voice.voiceId} onValueChange={(value) => onVoiceChange({ voiceId: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="9BWtsMINqrJLrRacOk9x">Aria (Professional Female)</SelectItem>
                <SelectItem value="CwhRBWXzGAHq8TQ4Fs17">Roger (Mature Male)</SelectItem>
                <SelectItem value="EXAVITQu4vr4xnSDxMaL">Sarah (Young Female)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Emotion</label>
              <Slider
                value={[voice.emotion]}
                onValueChange={([value]) => onVoiceChange({ emotion: value })}
                max={100}
                step={1}
                className="mb-2"
              />
              <span className="text-xs text-muted-foreground">{voice.emotion}%</span>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Speed</label>
              <Slider
                value={[voice.speed]}
                onValueChange={([value]) => onVoiceChange({ speed: value })}
                min={0.5}
                max={2}
                step={0.1}
                className="mb-2"
              />
              <span className="text-xs text-muted-foreground">{voice.speed}x</span>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Pitch</label>
              <Slider
                value={[voice.pitch]}
                onValueChange={([value]) => onVoiceChange({ pitch: value })}
                min={0.5}
                max={2}
                step={0.1}
                className="mb-2"
              />
              <span className="text-xs text-muted-foreground">{voice.pitch}x</span>
            </div>
          </div>
        </div>

        <Button className="w-full mt-4">
          <Volume2 className="w-4 h-4 mr-2" />
          Generate Audio
        </Button>
      </Card>
    </div>
  );
};

// Style & FX Panel
const StylePanel = ({ style, onStyleChange }: { style: Style; onStyleChange: (style: Partial<Style>) => void }) => (
  <div className="space-y-6">
    {/* Presets */}
    <div>
      <h4 className="font-medium mb-3">Style Presets</h4>
      <div className="grid grid-cols-2 gap-3">
        {['Studio', 'Cinematic', 'Clean White', 'Gradient Fade'].map((preset) => (
          <Card
            key={preset}
            className={`p-4 cursor-pointer transition-all hover:border-primary/50 ${
              style.preset === preset ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => onStyleChange({ preset })}
          >
            <div className="text-sm font-medium">{preset}</div>
          </Card>
        ))}
      </div>
    </div>

    {/* AI Look Modes */}
    <div>
      <h4 className="font-medium mb-3">AI Look Mode</h4>
      <div className="grid grid-cols-3 gap-2">
        {['realistic', 'pixar', 'vintage', 'cyberpunk', 'anime'].map((mode) => (
          <Button
            key={mode}
            variant={style.lookMode === mode ? "default" : "outline"}
            size="sm"
            onClick={() => onStyleChange({ lookMode: mode as any })}
            className="capitalize"
          >
            {mode}
          </Button>
        ))}
      </div>
    </div>

    {/* Background */}
    <div>
      <h4 className="font-medium mb-3">Background</h4>
      <div className="grid grid-cols-4 gap-2">
        {['blur', 'solid', 'upload', 'green'].map((bg) => (
          <Button
            key={bg}
            variant={style.bg === bg ? "default" : "outline"}
            size="sm"
            onClick={() => onStyleChange({ bg: bg as any })}
            className="capitalize"
          >
            {bg}
          </Button>
        ))}
      </div>
    </div>

    {/* Lighting Controls */}
    <Card className="p-4">
      <h4 className="font-medium mb-4">Lighting & Camera</h4>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Key Light</label>
            <Slider
              value={[style.lighting.key]}
              onValueChange={([value]) => onStyleChange({ lighting: { ...style.lighting, key: value } })}
              max={100}
              className="mb-1"
            />
            <span className="text-xs text-muted-foreground">{style.lighting.key}%</span>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Fill Light</label>
            <Slider
              value={[style.lighting.fill]}
              onValueChange={([value]) => onStyleChange({ lighting: { ...style.lighting, fill: value } })}
              max={100}
              className="mb-1"
            />
            <span className="text-xs text-muted-foreground">{style.lighting.fill}%</span>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Rim Light</label>
            <Slider
              value={[style.lighting.rim]}
              onValueChange={([value]) => onStyleChange({ lighting: { ...style.lighting, rim: value } })}
              max={100}
              className="mb-1"
            />
            <span className="text-xs text-muted-foreground">{style.lighting.rim}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">FOV</label>
            <Slider
              value={[style.camera.fov]}
              onValueChange={([value]) => onStyleChange({ camera: { ...style.camera, fov: value } })}
              min={20}
              max={80}
              className="mb-1"
            />
            <span className="text-xs text-muted-foreground">{style.camera.fov}°</span>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Framing</label>
            <Select 
              value={style.camera.frame} 
              onValueChange={(value) => onStyleChange({ camera: { ...style.camera, frame: value as any } })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Tight</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="wide">Wide</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </Card>
  </div>
);

// Timeline Panel
const TimelinePanel = () => (
  <div className="space-y-6">
    <Card className="p-4">
      <h4 className="font-medium mb-3">Timeline Editor</h4>
      <div className="h-32 bg-muted/20 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <p className="text-muted-foreground">Timeline visualization coming soon</p>
      </div>
    </Card>

    <div className="flex items-center space-x-2">
      <Switch id="captions" />
      <label htmlFor="captions" className="text-sm font-medium">Auto-generate captions</label>
    </div>
  </div>
);

// Preview & Export Panel
const PreviewExportPanel = ({ exports, onExportsChange }: { exports: Exports; onExportsChange: (exports: Partial<Exports>) => void }) => (
  <div className="space-y-6">
    <Card className="p-4">
      <h4 className="font-medium mb-3">Live Preview</h4>
      <div className="aspect-video bg-muted/20 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <p className="text-muted-foreground">Preview will appear here</p>
      </div>
    </Card>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Aspect Ratio</label>
        <Select value={exports.ratio} onValueChange={(value) => onExportsChange({ ratio: value as any })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="9:16">9:16 (Stories)</SelectItem>
            <SelectItem value="1:1">1:1 (Square)</SelectItem>
            <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Quality</label>
        <Select value={exports.quality.toString()} onValueChange={(value) => onExportsChange({ quality: parseInt(value) as any })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="720">720p</SelectItem>
            <SelectItem value="1080">1080p</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Switch 
          id="captions-export" 
          checked={exports.captions}
          onCheckedChange={(checked) => onExportsChange({ captions: checked })}
        />
        <label htmlFor="captions-export" className="text-sm font-medium">Burn-in captions</label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch 
          id="transparent" 
          checked={exports.transparent}
          onCheckedChange={(checked) => onExportsChange({ transparent: checked })}
        />
        <label htmlFor="transparent" className="text-sm font-medium">Transparent background</label>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-3">
      <Button variant="outline">
        <Eye className="w-4 h-4 mr-2" />
        Render Draft
      </Button>
      <Button>
        <Film className="w-4 h-4 mr-2" />
        Render Final
      </Button>
      <Button variant="outline">
        <Download className="w-4 h-4 mr-2" />
        Export All
      </Button>
    </div>
  </div>
);

// Job Status Card
const JobStatusCard = () => {
  const steps = [
    { label: 'Voice', icon: Volume2, status: 'done' },
    { label: 'Lip-Sync', icon: Target, status: 'running' },
    { label: 'Style', icon: Palette, status: 'pending' },
    { label: 'Render', icon: Film, status: 'pending' },
    { label: 'Export', icon: Package, status: 'pending' },
  ];

  return (
    <Card className="p-4">
      <h4 className="font-medium mb-4">Job Status</h4>
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center space-x-3">
            <div className={`p-1.5 rounded-full ${
              step.status === 'done' ? 'bg-green-500/20 text-green-500' :
              step.status === 'running' ? 'bg-primary/20 text-primary' :
              'bg-muted/20 text-muted-foreground'
            }`}>
              {step.status === 'done' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : step.status === 'running' ? (
                <step.icon className="w-4 h-4 animate-pulse" />
              ) : (
                <Circle className="w-4 h-4" />
              )}
            </div>
            <span className="text-sm">{step.label}</span>
          </div>
        ))}
      </div>
      <Progress value={40} className="mt-4" />
      <p className="text-xs text-muted-foreground mt-2">ETA: 2m 30s</p>
    </Card>
  );
};

// AI Assist Card
const AIAssistCard = () => (
  <Card className="p-4">
    <div className="flex items-center space-x-2 mb-3">
      <Wand2 className="w-4 h-4 text-primary" />
      <h4 className="font-medium">AI Assist</h4>
    </div>
    <div className="space-y-2 text-sm text-muted-foreground">
      <p>💡 Try energetic voice for better engagement</p>
      <p>🎬 Use cinematic lighting for premium feel</p>
    </div>
    <Button size="sm" variant="outline" className="w-full mt-3">
      <MessageSquare className="w-4 h-4 mr-2" />
      Chat with AI
    </Button>
  </Card>
);

export default function TalkingAvatarStudio() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [voice, setVoice] = useState<Voice>(initialVoice);
  const [style, setStyle] = useState<Style>(initialStyle);
  const [exports, setExports] = useState<Exports>(initialExports);
  const [activeTab, setActiveTab] = useState("avatar");

  const handleVoiceChange = (changes: Partial<Voice>) => {
    setVoice(prev => ({ ...prev, ...changes }));
  };

  const handleStyleChange = (changes: Partial<Style>) => {
    setStyle(prev => ({ 
      ...prev, 
      ...changes,
      lighting: changes.lighting ? { ...prev.lighting, ...changes.lighting } : prev.lighting,
      camera: changes.camera ? { ...prev.camera, ...changes.camera } : prev.camera
    }));
  };

  const handleExportsChange = (changes: Partial<Exports>) => {
    setExports(prev => ({ ...prev, ...changes }));
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#0B0B0F' }}>
      {/* Background Graphics */}
      <div className="absolute inset-0 z-0">
        {/* Circular patterns */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 border border-primary/10 rounded-full animate-gentle-sway"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 border border-primary/15 rounded-full animate-gentle-sway" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 border border-primary/8 rounded-full animate-gentle-sway" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/6 w-32 h-32 border border-primary/20 rounded-full animate-gentle-sway" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 border border-primary/12 rounded-full animate-gentle-sway" style={{animationDelay: '1.5s'}}></div>
        
        {/* Scattered yellow dots */}
        <div className="absolute top-1/4 left-1/3 w-2 h-2 bg-yellow-400/60 rounded-full animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-1.5 h-1.5 bg-yellow-400/40 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-1/3 left-1/5 w-3 h-3 bg-yellow-400/50 rounded-full animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-yellow-400/70 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-1/6 right-1/6 w-2.5 h-2.5 bg-yellow-400/45 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        <div className="absolute bottom-1/4 left-3/4 w-1.5 h-1.5 bg-yellow-400/55 rounded-full animate-pulse" style={{animationDelay: '0.8s'}}></div>
        <div className="absolute top-2/3 left-1/4 w-2 h-2 bg-yellow-400/35 rounded-full animate-pulse" style={{animationDelay: '2.2s'}}></div>
        <div className="absolute bottom-1/6 right-1/2 w-1 h-1 bg-yellow-400/60 rounded-full animate-pulse" style={{animationDelay: '1.8s'}}></div>
      </div>
      
      <SidebarProvider>
        <div className="flex min-h-screen w-full relative z-10">
          <AppSidebar />
          
          <main className="flex-1 flex flex-col min-h-screen">
            {/* Hero Canvas */}
            <div className="p-3 sm:p-6">
              <HeroCanvas uploadedFile={uploadedFile} onFileUpload={setUploadedFile} />
            </div>

            {/* Workflow Tabs */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="px-3 sm:px-6">
                <TabsList className="grid w-full grid-cols-5 bg-muted/10">
                  <TabsTrigger value="avatar" className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4" />
                    <span>Avatar</span>
                  </TabsTrigger>
                  <TabsTrigger value="voice" className="flex items-center space-x-2">
                    <Volume2 className="w-4 h-4" />
                    <span>Voice</span>
                  </TabsTrigger>
                  <TabsTrigger value="style" className="flex items-center space-x-2">
                    <Palette className="w-4 h-4" />
                    <span>Style & FX</span>
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex items-center space-x-2">
                    <Film className="w-4 h-4" />
                    <span>Timeline</span>
                  </TabsTrigger>
                  <TabsTrigger value="export" className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Preview & Export</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex gap-3 sm:gap-6 p-3 sm:p-6">
              {/* Panels */}
              <div className="flex-1 max-w-4xl">
                <Tabs value={activeTab} className="w-full">
                  <TabsContent value="avatar" className="mt-0">
                    <AvatarPanel uploadedFile={uploadedFile} onFileUpload={setUploadedFile} />
                  </TabsContent>
                  <TabsContent value="voice" className="mt-0">
                    <VoicePanel voice={voice} onVoiceChange={handleVoiceChange} />
                  </TabsContent>
                  <TabsContent value="style" className="mt-0">
                    <StylePanel style={style} onStyleChange={handleStyleChange} />
                  </TabsContent>
                  <TabsContent value="timeline" className="mt-0">
                    <TimelinePanel />
                  </TabsContent>
                  <TabsContent value="export" className="mt-0">
                    <PreviewExportPanel exports={exports} onExportsChange={handleExportsChange} />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Right Rail */}
              <div className="w-80 space-y-4 sticky top-24 h-fit">
                <JobStatusCard />
                <AIAssistCard />
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}