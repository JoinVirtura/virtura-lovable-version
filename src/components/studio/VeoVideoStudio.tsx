import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Upload,
  Image as ImageIcon,
  Library,
  Play,
  Loader2,
  Download,
  Save,
  X,
  Sparkles,
  Film,
  Clock,
  Maximize2,
  Wand2,
  Check,
} from "lucide-react";
import { generateVeoVideo, saveVeoVideoToLibrary } from "@/services/veoVideoService";
import { DashboardLibraryView } from "@/components/DashboardLibraryView";

const VEO_MODELS = [
  {
    id: "veo-2.0-generate-001",
    label: "Veo 2.0",
    description: "Balanced speed & quality",
    speed: "~30s",
    audio: false,
    minDuration: 5,
    maxDuration: 8,
  },
  {
    id: "veo-3.0-fast-generate-001",
    label: "Veo 3.0 Fast",
    description: "Fast generation",
    speed: "~45s",
    audio: false,
    minDuration: 4,
    maxDuration: 8,
  },
  {
    id: "veo-3.0-generate-001",
    label: "Veo 3.0",
    description: "Best quality + audio",
    speed: "~2min",
    audio: true,
    minDuration: 4,
    maxDuration: 8,
  },
];

const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9", icon: "🖥️" },
  { id: "9:16", label: "9:16", icon: "📱" },
];

export function VeoVideoStudio() {
  // Source image state
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceImageName, setSourceImageName] = useState<string>("");
  const [showLibrary, setShowLibrary] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generation params
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("veo-2.0-generate-001");
  const [duration, setDuration] = useState(5);
  const [aspectRatio, setAspectRatio] = useState("16:9");

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [progressStage, setProgressStage] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);

  // Result state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoSize, setVideoSize] = useState<string>("");
  const [isSaved, setIsSaved] = useState(false);

  const selectedModel = VEO_MODELS.find((m) => m.id === model) || VEO_MODELS[0];

  // Load pre-selected image from sessionStorage (sent from other pages)
  useEffect(() => {
    const stored = sessionStorage.getItem("veoSourceImage");
    if (stored) {
      try {
        const { imageUrl, title } = JSON.parse(stored);
        if (imageUrl) {
          setSourceImage(imageUrl);
          setSourceImageName(title || "From editor");
        }
      } catch (e) {
        console.error("Failed to load veoSourceImage:", e);
      }
      sessionStorage.removeItem("veoSourceImage");
    }
  }, []);

  // ── File upload handler ───────────────────────────────────────
  const handleFileUpload = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Image must be under 20MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setSourceImage(reader.result as string);
      setSourceImageName(file.name);
      setVideoUrl(null);
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  }, []);

  // ── Library selection handler ─────────────────────────────────
  const handleLibrarySelect = useCallback((imageUrl: string, metadata?: any) => {
    setSourceImage(imageUrl);
    setSourceImageName(metadata?.title || "Library image");
    setShowLibrary(false);
    setVideoUrl(null);
    setIsSaved(false);
    toast.success("Image loaded from library");
  }, []);

  // ── Generate video ────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (!sourceImage && !prompt.trim()) {
      toast.error("Add an image or enter a prompt");
      return;
    }

    setIsGenerating(true);
    setProgressStage("Starting...");
    setProgressPercent(0);
    setVideoUrl(null);
    setIsSaved(false);

    const isDataUrl = sourceImage?.startsWith("data:");
    const isRemoteUrl = sourceImage && !isDataUrl;

    const result = await generateVeoVideo(
      {
        model,
        prompt: prompt.trim() || "Animate with natural, cinematic motion",
        imageBase64: isDataUrl ? sourceImage : undefined,
        imageUrl: isRemoteUrl ? sourceImage : undefined,
        durationSeconds: duration,
        aspectRatio,
      },
      (stage, percent) => {
        setProgressStage(stage);
        setProgressPercent(percent);
      }
    );

    setIsGenerating(false);

    if (result.success && result.videoUrl) {
      setVideoUrl(result.videoUrl);
      setVideoSize(result.videoSize || "");
      toast.success("Video generated successfully!");

      // Auto-save to library
      const saveResult = await saveVeoVideoToLibrary({
        videoUrl: result.videoUrl,
        thumbnailUrl: sourceImage || undefined,
        title: `Veo Video ${new Date().toLocaleDateString()}`,
        prompt: prompt.trim() || "Image-to-video generation",
        duration,
        model,
        aspectRatio,
      });

      if (saveResult.success) {
        setIsSaved(true);
        toast.success("Saved to library automatically");
      }
    } else {
      toast.error(result.error || "Video generation failed");
    }
  }, [sourceImage, prompt, model, duration, aspectRatio]);

  // ── Download video ────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    if (!videoUrl) return;
    try {
      const res = await fetch(videoUrl);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `veo-video-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
      toast.success("Video downloaded!");
    } catch {
      toast.error("Download failed");
    }
  }, [videoUrl]);

  // ── Manual save to library ────────────────────────────────────
  const handleSaveToLibrary = useCallback(async () => {
    if (!videoUrl || isSaved) return;
    const result = await saveVeoVideoToLibrary({
      videoUrl,
      thumbnailUrl: sourceImage || undefined,
      title: `Veo Video ${new Date().toLocaleDateString()}`,
      prompt: prompt.trim() || "Image-to-video generation",
      duration,
      model,
      aspectRatio,
    });
    if (result.success) {
      setIsSaved(true);
      toast.success("Saved to library!");
    } else {
      toast.error(result.error || "Failed to save");
    }
  }, [videoUrl, sourceImage, prompt, duration, model, aspectRatio, isSaved]);

  // ── Clear / reset ─────────────────────────────────────────────
  const handleClear = () => {
    setSourceImage(null);
    setSourceImageName("");
    setVideoUrl(null);
    setIsSaved(false);
    setPrompt("");
  };

  return (
    <div className="w-full min-h-screen pb-32 bg-gradient-to-br from-[#0F0F1A] via-[#1a1a2e] to-[#0F0F1A] relative overflow-hidden">
      {/* Ambient particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-violet-400/30 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 mb-6 sm:mb-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* ── Preview Area ──────────────────────────────────── */}
          <div className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Film className="h-5 w-5 text-violet-400" />
                <h2 className="text-lg font-semibold text-white">Video Generator</h2>
              </div>
              {videoUrl && (
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={handleDownload} className="text-white/70 hover:text-white">
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                  {!isSaved ? (
                    <Button size="sm" variant="ghost" onClick={handleSaveToLibrary} className="text-white/70 hover:text-white">
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      <Check className="h-3 w-3 mr-1" /> Saved
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Video / Image Preview */}
            <div className="relative bg-black aspect-video flex items-center justify-center">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  autoPlay
                  loop
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : sourceImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={sourceImage}
                    alt="Source"
                    className="w-full h-full object-contain"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute top-2 right-2 h-8 w-8 p-0 bg-black/60 hover:bg-black/80 text-white rounded-full"
                    onClick={handleClear}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  {isGenerating && (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4">
                      <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
                      <div className="text-center space-y-2 px-8 w-full max-w-sm">
                        <p className="text-white text-sm font-medium">{progressStage}</p>
                        <Progress value={progressPercent} className="h-2" />
                        <p className="text-white/50 text-xs">{progressPercent}%</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
                  <div className="text-center space-y-2 w-full max-w-sm px-8">
                    <p className="text-white text-sm font-medium">{progressStage}</p>
                    <Progress value={progressPercent} className="h-2" />
                    <p className="text-white/50 text-xs">{progressPercent}%</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-white/40">
                  <Film className="h-12 w-12" />
                  <p className="text-sm">Preview will appear here</p>
                </div>
              )}
            </div>

            {/* Video metadata */}
            {videoUrl && videoSize && (
              <div className="px-4 py-2 border-t border-white/5 flex items-center gap-4 text-xs text-white/50">
                <span>{selectedModel.label}</span>
                <span>{duration}s</span>
                <span>{aspectRatio}</span>
                <span>{videoSize}</span>
                {isSaved && <Badge variant="outline" className="text-green-400 border-green-400/30 text-[10px] py-0">In Library</Badge>}
              </div>
            )}
          </div>

          {/* ── Controls Panel ────────────────────────────────── */}
          <Card className="border-0 shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-visible">
            <CardContent className="p-4 sm:p-6 space-y-5">
              {/* Image Source */}
              <div className="space-y-2">
                <Label className="text-white/80 text-sm font-medium">Source Image (optional for text-to-video)</Label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                        e.target.value = "";
                      }
                    }}
                  />
                  <Button
                    variant="outline"
                    className="flex-1 border-violet-500/30 hover:bg-violet-500/10 text-white/80"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {sourceImage ? sourceImageName || "Image selected" : "Upload Image"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-violet-500/30 hover:bg-violet-500/10 text-white/80"
                    onClick={() => setShowLibrary(true)}
                    disabled={isGenerating}
                  >
                    <Library className="h-4 w-4 mr-2" />
                    Library
                  </Button>
                </div>
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <Label className="text-white/80 text-sm font-medium">
                  Prompt {sourceImage ? "(optional)" : "(required for text-to-video)"}
                </Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    sourceImage
                      ? "Describe the motion... e.g. 'Gentle camera zoom with wind blowing hair'"
                      : "Describe the video... e.g. 'A calm ocean wave at sunset, cinematic 4K'"
                  }
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px] resize-none"
                  disabled={isGenerating}
                />
              </div>

              {/* Model / Duration / Aspect Ratio */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Model */}
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" /> Model
                  </Label>
                  <Select value={model} onValueChange={setModel} disabled={isGenerating}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEO_MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex items-center gap-2">
                            <span>{m.label}</span>
                            {m.audio && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">🔊 Audio</span>}
                            <span className="text-xs text-muted-foreground">{m.speed}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Duration
                  </Label>
                  <Select
                    value={String(duration)}
                    onValueChange={(v) => setDuration(Number(v))}
                    disabled={isGenerating}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        { length: selectedModel.maxDuration - selectedModel.minDuration + 1 },
                        (_, i) => selectedModel.minDuration + i
                      ).map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d} seconds
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm font-medium flex items-center gap-1">
                    <Maximize2 className="h-3.5 w-3.5" /> Aspect Ratio
                  </Label>
                  <div className="flex gap-1.5">
                    {ASPECT_RATIOS.map((ar) => (
                      <Button
                        key={ar.id}
                        variant={aspectRatio === ar.id ? "default" : "outline"}
                        size="sm"
                        className={`flex-1 ${
                          aspectRatio === ar.id
                            ? "bg-violet-600 hover:bg-violet-700 text-white"
                            : "border-white/10 text-white/60 hover:bg-white/5"
                        }`}
                        onClick={() => setAspectRatio(ar.id)}
                        disabled={isGenerating}
                      >
                        {ar.icon} {ar.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Model info badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-violet-300 border-violet-500/30 text-xs">
                  {selectedModel.label}: {selectedModel.description}
                </Badge>
                {selectedModel.audio ? (
                  <Badge variant="outline" className="text-green-300 border-green-500/30 text-xs">
                    🔊 Native Audio
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-white/30 border-white/10 text-xs">
                    🔇 No Audio
                  </Badge>
                )}
                <Badge variant="outline" className="text-white/40 border-white/10 text-xs">
                  {selectedModel.speed}
                </Badge>
              </div>

              {/* Generate Button */}
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-violet-500/25"
                onClick={handleGenerate}
                disabled={isGenerating || (!sourceImage && !prompt.trim())}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {progressStage}
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5 mr-2" />
                    {sourceImage ? "Generate Video from Image" : "Generate Video from Text"}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Library Picker Dialog */}
      <Dialog open={showLibrary} onOpenChange={setShowLibrary}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-gray-900 border-violet-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">Select Image from Library</DialogTitle>
          </DialogHeader>
          <DashboardLibraryView
            onSelectAvatar={handleLibrarySelect}
            isModal={true}
            hideVideoCategory={true}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
