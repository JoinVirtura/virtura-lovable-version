import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Play, 
  Download,
  Mic,
  Film,
  CheckCircle,
  Loader2,
  Sparkles,
  Crown
} from 'lucide-react';

interface StudioState {
  currentStep: number;
  avatar: {
    file: File | null;
    url: string | null;
    status: 'idle' | 'uploading' | 'ready' | 'error';
  };
  voice: {
    script: string;
    voiceId: string;
    audioUrl: string | null;
    status: 'idle' | 'generating' | 'ready' | 'error';
  };
  video: {
    prompt: string;
    quality: string;
    ratio: string;
    videoUrl: string | null;
    status: 'idle' | 'generating' | 'ready' | 'error';
  };
  isProcessing: boolean;
  progress: number;
}

const STEPS = [
  { id: 1, title: 'Avatar', icon: Upload },
  { id: 2, title: 'Voice', icon: Mic },
  { id: 3, title: 'Video', icon: Film },
  { id: 4, title: 'Export', icon: Download }
];

const VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria - Professional Female' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger - Executive Male' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah - Young Professional' }
];

export default function StudioInterface() {
  const { toast } = useToast();
  const [state, setState] = useState<StudioState>({
    currentStep: 1,
    avatar: { file: null, url: null, status: 'idle' },
    voice: { script: '', voiceId: '9BWtsMINqrJLrRacOk9x', audioUrl: null, status: 'idle' },
    video: { prompt: 'Create a natural talking video with professional presentation style', quality: '4K', ratio: '16:9', videoUrl: null, status: 'idle' },
    isProcessing: false,
    progress: 0
  });

  const updateState = useCallback((updates: Partial<StudioState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({ title: "Error", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    updateState({ 
      avatar: { ...state.avatar, file, status: 'uploading' },
      isProcessing: true,
      progress: 10
    });

    try {
      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `avatars/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      updateState({
        avatar: { file, url: publicUrl, status: 'ready' },
        isProcessing: false,
        progress: 0
      });

      toast({ title: "Success", description: "Avatar uploaded successfully!" });

    } catch (error: any) {
      console.error('Upload error:', error);
      updateState({
        avatar: { ...state.avatar, status: 'error' },
        isProcessing: false,
        progress: 0
      });
      toast({ title: "Error", description: "Failed to upload avatar", variant: "destructive" });
    }
  }, [state.avatar, toast, updateState]);

  const generateVoice = useCallback(async () => {
    if (!state.voice.script.trim()) {
      toast({ title: "Error", description: "Please enter a script", variant: "destructive" });
      return;
    }

    updateState({
      voice: { ...state.voice, status: 'generating' },
      isProcessing: true,
      progress: 25
    });

    try {
      const { data, error } = await supabase.functions.invoke('voice-generate', {
        body: {
          script: state.voice.script,
          voiceId: state.voice.voiceId,
          model: 'eleven_multilingual_v2'
        }
      });

      if (error) throw error;

      updateState({
        voice: { ...state.voice, audioUrl: data.audioUrl || data.audioData, status: 'ready' },
        isProcessing: false,
        progress: 0
      });

      toast({ title: "Success", description: "Voice generated successfully!" });

    } catch (error: any) {
      console.error('Voice generation error:', error);
      updateState({
        voice: { ...state.voice, status: 'error' },
        isProcessing: false,
        progress: 0
      });
      toast({ title: "Error", description: "Failed to generate voice", variant: "destructive" });
    }
  }, [state.voice, toast, updateState]);

  const generateVideo = useCallback(async (engine: 'sadtalker' | 'liveportrait' | 'pro' = 'sadtalker') => {
    if (!state.avatar.url || !state.voice.audioUrl) {
      toast({ title: "Error", description: "Please complete avatar and voice steps first", variant: "destructive" });
      return;
    }

    updateState({
      video: { ...state.video, status: 'generating' },
      isProcessing: true,
      progress: 50
    });

    try {
      const functionName = engine === 'liveportrait' ? 'video-generate-liveportrait' : 
                          engine === 'pro' ? 'video-engine-pro' : 'video-generate-sadtalker';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: {
          avatarImageUrl: state.avatar.url,
          audioUrl: state.voice.audioUrl,
          prompt: state.video.prompt,
          settings: {
            quality: engine === 'liveportrait' ? '1080p' : engine === 'pro' ? '4K' : '720p',
            ratio: state.video.ratio,
            style: 'cinematic',
            fps: engine === 'pro' ? 60 : 30,
            duration: 30,
            expressionScale: engine !== 'pro' ? 1.0 : undefined,
            lipSyncStrength: engine === 'liveportrait' ? 1.0 : undefined,
            headPoseStrength: engine === 'liveportrait' ? 0.8 : undefined,
            eyeBlink: engine === 'liveportrait' ? true : undefined,
            still: engine === 'sadtalker' ? false : undefined,
            preprocess: engine === 'sadtalker' ? 'crop' : undefined,
            enhancer: engine === 'sadtalker' ? 'gfpgan' : undefined
          }
        }
      });

      if (error) throw error;

      updateState({
        video: { ...state.video, videoUrl: data.videoUrl, status: 'ready' },
        isProcessing: false,
        progress: 0
      });

      const engineNames = {
        sadtalker: 'SadTalker (Free)',
        liveportrait: 'LivePortrait (Enhanced)',
        pro: 'Video Engine Pro'
      };

      toast({ title: "Success", description: `Video generated with ${engineNames[engine]} engine!` });

    } catch (error: any) {
      console.error('Video generation error:', error);
      updateState({
        video: { ...state.video, status: 'error' },
        isProcessing: false,
        progress: 0
      });
      toast({ title: "Error", description: `Video generation failed: ${error.message}`, variant: "destructive" });
    }
  }, [state.avatar.url, state.voice.audioUrl, state.video, toast, updateState]);

  const canProceed = (step: number) => {
    switch (step) {
      case 1: return state.avatar.status === 'ready';
      case 2: return state.voice.status === 'ready';
      case 3: return state.video.status === 'ready';
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sparkles className="h-8 w-8 text-primary" />
              <Crown className="h-4 w-4 absolute -top-1 -right-1 text-yellow-500" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                AI Studio Pro
              </h1>
              <p className="text-muted-foreground">Create professional talking avatar videos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-center gap-4">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <Button
                  variant={state.currentStep === step.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateState({ currentStep: step.id })}
                  className="h-10 px-4"
                  disabled={state.isProcessing}
                >
                  <step.icon className="h-4 w-4 mr-2" />
                  {step.title}
                  {canProceed(step.id) && <CheckCircle className="h-3 w-3 ml-2 text-green-500" />}
                </Button>
                {index < STEPS.length - 1 && <div className="w-8 h-px bg-border"></div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                {/* Step 1: Avatar */}
                {state.currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Upload Avatar</h2>
                      <p className="text-muted-foreground">Upload a high-quality image for your avatar</p>
                    </div>

                    <div 
                      className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                    >
                      {state.avatar.url ? (
                        <div className="space-y-4">
                          <img src={state.avatar.url} alt="Avatar" className="mx-auto h-32 w-32 object-cover rounded-lg" />
                          <Badge className="bg-green-500">Ready</Badge>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                          <div>
                            <p className="font-medium">Click to upload avatar image</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file);
                      }}
                    />
                  </div>
                )}

                {/* Step 2: Voice */}
                {state.currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Generate Voice</h2>
                      <p className="text-muted-foreground">Add a script and generate high-quality voice</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="script">Script</Label>
                        <Textarea
                          id="script"
                          placeholder="Enter your script here..."
                          value={state.voice.script}
                          onChange={(e) => updateState({ voice: { ...state.voice, script: e.target.value } })}
                          className="min-h-24"
                        />
                      </div>

                      <div>
                        <Label>Voice</Label>
                        <Select 
                          value={state.voice.voiceId} 
                          onValueChange={(value) => updateState({ voice: { ...state.voice, voiceId: value } })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VOICES.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>{voice.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button 
                        onClick={generateVoice} 
                        disabled={!state.voice.script.trim() || state.isProcessing}
                        className="w-full"
                      >
                        {state.voice.status === 'generating' ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Generating Voice...
                          </>
                        ) : (
                          <>
                            <Mic className="h-4 w-4 mr-2" />
                            Generate Voice
                          </>
                        )}
                      </Button>

                      {state.voice.audioUrl && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="font-medium text-green-800 mb-2">Voice Generated</p>
                          <audio controls className="w-full">
                            <source src={state.voice.audioUrl} type="audio/mpeg" />
                          </audio>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Video */}
                {state.currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Generate Video</h2>
                      <p className="text-muted-foreground">Create your professional talking avatar video</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="prompt">Video Prompt</Label>
                        <Textarea
                          id="prompt"
                          placeholder="Describe the video style..."
                          value={state.video.prompt}
                          onChange={(e) => updateState({ video: { ...state.video, prompt: e.target.value } })}
                          className="min-h-20"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Quality</Label>
                          <Select 
                            value={state.video.quality} 
                            onValueChange={(value) => updateState({ video: { ...state.video, quality: value } })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HD">HD (1080p)</SelectItem>
                              <SelectItem value="4K">4K Ultra</SelectItem>
                              <SelectItem value="8K">8K Cinema</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Aspect Ratio</Label>
                          <Select 
                            value={state.video.ratio} 
                            onValueChange={(value) => updateState({ video: { ...state.video, ratio: value } })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1:1">1:1 Square</SelectItem>
                              <SelectItem value="9:16">9:16 Portrait</SelectItem>
                              <SelectItem value="16:9">16:9 Landscape</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-3">
                          <Button 
                            onClick={() => generateVideo('sadtalker')} 
                            disabled={!canProceed(2) || state.isProcessing}
                            variant="outline"
                            className="flex-1"
                          >
                            {state.isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Film className="h-4 w-4 mr-2" />
                                Free
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            onClick={() => generateVideo('liveportrait')} 
                            disabled={!canProceed(2) || state.isProcessing}
                            className="flex-1"
                          >
                            {state.isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Crown className="h-4 w-4 mr-2" />
                                Enhanced
                              </>
                            )}
                          </Button>

                          <Button 
                            onClick={() => generateVideo('pro')} 
                            disabled={!canProceed(2) || state.isProcessing}
                            variant="secondary"
                            className="flex-1"
                          >
                            {state.isProcessing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Pro
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <div className="text-xs text-muted-foreground text-center space-y-1">
                          <p>Free: SadTalker (720p, unlimited) • Enhanced: LivePortrait (1080p, premium quality)</p>
                          <p>Pro: Video Engine Pro (4K, 60fps, cinematic effects)</p>
                        </div>
                      </div>

                      {state.video.videoUrl && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <p className="font-medium text-green-800 mb-2">Video Generated</p>
                          <video controls className="w-full rounded">
                            <source src={state.video.videoUrl} type="video/mp4" />
                          </video>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Export */}
                {state.currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Export Video</h2>
                      <p className="text-muted-foreground">Download your finished video</p>
                    </div>

                    <div className="text-center py-8">
                      <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Video Ready!</h3>
                      <p className="text-muted-foreground mb-4">Your professional talking avatar video is ready to download</p>
                      <Button size="lg">
                        <Download className="h-4 w-4 mr-2" />
                        Download Video
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress */}
            {state.isProcessing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Processing</CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress value={state.progress} className="mb-2" />
                  <p className="text-xs text-muted-foreground">
                    {state.avatar.status === 'uploading' && 'Uploading avatar...'}
                    {state.voice.status === 'generating' && 'Generating voice...'}
                    {state.video.status === 'generating' && 'Creating video...'}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Project Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Avatar</span>
                  <Badge variant={state.avatar.status === 'ready' ? 'default' : 'secondary'}>
                    {state.avatar.status === 'ready' ? 'Ready' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Voice</span>
                  <Badge variant={state.voice.status === 'ready' ? 'default' : 'secondary'}>
                    {state.voice.status === 'ready' ? 'Generated' : 'Pending'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Video</span>
                  <Badge variant={state.video.status === 'ready' ? 'default' : 'secondary'}>
                    {state.video.status === 'ready' ? 'Complete' : 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}