import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
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
  RotateCcw,
  Clock,
  AlertCircle,
  RefreshCw
} from "lucide-react";

// Import the store types and hook
import type { Voice, Style, Exports } from "@/features/talking-avatar/store";
import { initialVoice, initialStyle, initialExports } from "@/features/talking-avatar/store";
import { useTalkingAvatar } from "@/hooks/useTalkingAvatar";

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
      className={`h-80 relative bg-gradient-to-br from-card/80 to-card/60 rounded-2xl border border-border/50 overflow-hidden cursor-pointer transition-all duration-300 ${
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
                className="max-h-72 max-w-full object-contain rounded-lg animate-fade-in"
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
const VoicePanel = ({ 
  voice, 
  onVoiceChange, 
  onGenerateAudio,
  isProcessing,
  generatedAudio 
}: { 
  voice: Voice; 
  onVoiceChange: (voice: Partial<Voice>) => void;
  onGenerateAudio: (script: string) => void;
  isProcessing: boolean;
  generatedAudio: string | null;
}) => {
  const [script, setScript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const { toast } = useToast();

  const handleGenerateAudio = () => {
    if (!script.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script first",
        variant: "destructive",
      });
      return;
    }
    onGenerateAudio(script);
  };

  const playAudio = () => {
    if (generatedAudio) {
      const audio = new Audio(generatedAudio);
      audio.play();
    }
  };

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
          disabled={isProcessing}
        >
          <Mic className="w-6 h-6 mb-1" />
          {isRecording ? "Stop Recording" : "Record Voice"}
        </Button>
        <Button variant="outline" className="h-20 flex-col" disabled={isProcessing}>
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
                <SelectItem value="FGY2WhTYpPnrIDTdsKH5">Laura (Narrative Female)</SelectItem>
                <SelectItem value="IKne3meq5aSn9XLyUdCD">Charlie (Conversational Male)</SelectItem>
                <SelectItem value="XB0fDUnXU5powFXDhCwa">Charlotte (Energetic Female)</SelectItem>
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

        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1" 
            onClick={handleGenerateAudio}
            disabled={isProcessing || !script.trim()}
          >
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Volume2 className="w-4 h-4 mr-2" />
            )}
            Generate Audio
          </Button>
          {generatedAudio && (
            <Button variant="outline" onClick={playAudio}>
              <Play className="w-4 h-4" />
            </Button>
          )}
        </div>
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
const PreviewExportPanel = ({ 
  exports, 
  onExportsChange,
  generatedVideo,
  finalVideo,
  onGenerateVideo,
  onSyncAudioVideo,
  onDownloadVideo,
  onShareVideo,
  isProcessing,
  uploadedFile 
}: { 
  exports: Exports; 
  onExportsChange: (exports: Partial<Exports>) => void;
  generatedVideo: string | null;
  finalVideo: string | null;
  onGenerateVideo: (prompt: string) => void;
  onSyncAudioVideo: () => void;
  onDownloadVideo: () => void;
  onShareVideo: () => void;
  isProcessing: boolean;
  uploadedFile: File | null;
}) => {
  const [videoPrompt, setVideoPrompt] = useState("Create a natural talking video with professional presentation style");

  const videoToShow = finalVideo || generatedVideo;

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h4 className="font-medium mb-3">Live Preview</h4>
        <div className="aspect-video bg-muted/20 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center overflow-hidden">
          {videoToShow ? (
            <video 
              src={videoToShow} 
              controls 
              className="w-full h-full object-contain rounded"
              poster={uploadedFile ? URL.createObjectURL(uploadedFile) : undefined}
            />
          ) : uploadedFile && uploadedFile.type.startsWith('image/') ? (
            <img 
              src={URL.createObjectURL(uploadedFile)} 
              alt="Avatar preview" 
              className="w-full h-full object-contain rounded"
            />
          ) : (
            <p className="text-muted-foreground">Upload an avatar and generate audio to see preview</p>
          )}
        </div>
      </Card>

      {/* Video Generation */}
      <Card className="p-4">
        <h4 className="font-medium mb-3">Video Generation</h4>
        <Textarea
          placeholder="Describe the video style and presentation..."
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          className="min-h-16 resize-none mb-3"
          maxLength={200}
        />
        <Button 
          className="w-full mb-3" 
          onClick={() => onGenerateVideo(videoPrompt)}
          disabled={isProcessing || !uploadedFile}
        >
          {isProcessing ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <VideoIcon className="w-4 h-4 mr-2" />
          )}
          Generate Video
        </Button>
        
        {generatedVideo && (
          <Button 
            className="w-full" 
            variant="outline"
            onClick={onSyncAudioVideo}
            disabled={isProcessing}
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Sync Audio & Video
          </Button>
        )}
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

      <div className="space-y-3">
        <Button 
          className="w-full" 
          onClick={onDownloadVideo}
          disabled={!videoToShow}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Video
        </Button>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={onShareVideo}
          disabled={!videoToShow}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Share Video
        </Button>
      </div>
    </div>
  );
};

// Job Status Card
const JobStatusCard = ({ job, isProcessing }: { job: any; isProcessing: boolean }) => {
  if (!job && !isProcessing) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-primary animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return "text-green-500";
      case 'running':
        return "text-primary";
      case 'error':
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Generation Progress</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{job?.progress || 0}%</span>
        </div>
        <Progress value={job?.progress || 0} className="h-2" />
        
        <div className="space-y-3">
          {Object.entries(job?.steps || {
            voice: 'pending',
            'lip-sync': 'pending', 
            style: 'pending',
            render: 'pending',
            export: 'pending'
          }).map(([step, status], idx) => (
            <div key={idx} className="flex items-center space-x-3">
              {getStatusIcon(status as string)}
              <span className={`text-sm capitalize ${getStatusColor(status as string)}`}>
                {step.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
        
        {job?.status === 'error' && (
          <div className="text-xs text-destructive mt-4 p-2 bg-destructive/10 rounded">
            Error: {job.logs?.[job.logs.length - 1] || 'Generation failed'}
          </div>
        )}
        
        {isProcessing && job?.status !== 'error' && (
          <div className="text-xs text-muted-foreground mt-4 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            Processing... ETA: ~2 minutes
          </div>
        )}
      </div>
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

// Main Talking Avatar Studio
export default function TalkingAvatarStudio() {
  const {
    // State
    uploadedFile,
    voice,
    style,
    exports,
    generatedAudio,
    generatedVideo,
    finalVideo,
    job,
    isProcessing,
    
    // Actions
    handleFileUpload,
    updateVoice,
    updateStyle,
    updateExports,
    generateAudio,
    generateVideo,
    syncAudioVideo,
    downloadVideo,
    shareVideo,
    resetWorkflow,
  } = useTalkingAvatar(initialVoice, initialStyle, initialExports);

  return (
    <div className="flex gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Hero Canvas */}
        <HeroCanvas uploadedFile={uploadedFile} onFileUpload={handleFileUpload} />

        {/* Workflow Tabs */}
        <Tabs defaultValue="avatar" className="w-full">
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

          <TabsContent value="avatar" className="space-y-6">
            <AvatarPanel 
              uploadedFile={uploadedFile}
              onFileUpload={handleFileUpload}
            />
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-6">
            <VoicePanel 
              voice={voice}
              onVoiceChange={updateVoice}
              onGenerateAudio={generateAudio}
              isProcessing={isProcessing}
              generatedAudio={generatedAudio}
            />
          </TabsContent>
          
          <TabsContent value="style" className="space-y-6">
            <StylePanel 
              style={style}
              onStyleChange={updateStyle}
            />
          </TabsContent>
          
          <TabsContent value="timeline" className="space-y-6">
            <TimelinePanel />
          </TabsContent>
          
          <TabsContent value="export" className="space-y-6">
            <PreviewExportPanel 
              exports={exports}
              onExportsChange={updateExports}
              generatedVideo={generatedVideo}
              finalVideo={finalVideo}
              onGenerateVideo={generateVideo}
              onSyncAudioVideo={syncAudioVideo}
              onDownloadVideo={downloadVideo}
              onShareVideo={shareVideo}
              isProcessing={isProcessing}
              uploadedFile={uploadedFile}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Rail */}
      <div className="w-80 space-y-6">
        <JobStatusCard job={job} isProcessing={isProcessing} />
        <AIAssistCard />
        
        {/* Reset Workflow */}
        {(uploadedFile || generatedAudio || generatedVideo) && (
          <Card className="p-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={resetWorkflow}
              disabled={isProcessing}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Start New Project
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}