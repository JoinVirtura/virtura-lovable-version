import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Download, 
  Upload, 
  CheckCircle, 
  Mic,
  Video,
  Zap,
  User,
  FileAudio,
  Loader2,
  Share2,
  Sparkles
} from 'lucide-react';

export function TalkingAvatarWorkflow() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // User inputs
  const [avatarImage, setAvatarImage] = useState<string>('');
  const [audioFile, setAudioFile] = useState<string>('');
  const [script, setScript] = useState('Hello! This is an amazing AI-generated talking avatar video.');
  const [prompt, setPrompt] = useState('Create a professional speaking video with natural head movements and expressions');
  
  // Generated outputs
  const [generatedAudio, setGeneratedAudio] = useState<string>('');
  const [generatedVideo, setGeneratedVideo] = useState<string>('');
  const [finalVideo, setFinalVideo] = useState<string>('');

  const availableVoices = [
    { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', gender: 'Female', accent: 'American' },
    { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger', gender: 'Male', accent: 'American' },
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Female', accent: 'American' },
    { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', gender: 'Female', accent: 'British' },
    { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', gender: 'Male', accent: 'American' }
  ];

  const [selectedVoice, setSelectedVoice] = useState(availableVoices[0].id);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAudioFile(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAudio = async () => {
    if (!script.trim()) {
      toast({
        title: "Script Required",
        description: "Please enter a script to generate audio",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-generate', {
        body: {
          script: script,
          voiceId: selectedVoice,
          model: 'eleven_multilingual_v2',
          voiceSettings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedAudio(data.audioData);
        toast({
          title: "Audio Generated! 🎵",
          description: "Your AI voice has been created successfully!",
        });
        setStep(2);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Audio generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const generateVideo = async () => {
    if (!avatarImage) {
      toast({
        title: "Avatar Required",
        description: "Please upload an avatar image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('video-generate', {
        body: {
          avatarImage: avatarImage,
          engine: 'heygen',
          prompt: prompt,
          duration: 30
        }
      });

      if (error) throw error;

      if (data.success) {
        setGeneratedVideo(data.videoUrl);
        toast({
          title: "Video Generated! 🎬",
          description: "Your AI video has been created successfully!",
        });
        setStep(3);
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Video generation error:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const syncAudioVideo = async () => {
    const audioSource = audioFile || generatedAudio;
    
    if (!audioSource || !generatedVideo) {
      toast({
        title: "Assets Required",
        description: "Please ensure both audio and video are ready",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('video-sync', {
        body: {
          audioUrl: audioSource,
          videoUrl: generatedVideo,
          engine: 'heygen',
          trimSettings: null
        }
      });

      if (error) throw error;

      if (data.success) {
        setFinalVideo(data.finalVideoUrl);
        toast({
          title: "Video Synced! ✨",
          description: "Your final talking avatar video is ready!",
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync audio and video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadVideo = () => {
    if (finalVideo) {
      const link = document.createElement('a');
      link.href = finalVideo;
      link.download = 'talking-avatar-video.mp4';
      link.click();
    }
  };

  const shareVideo = async () => {
    if (finalVideo && navigator.share) {
      try {
        await navigator.share({
          title: 'My AI Talking Avatar Video',
          text: 'Check out this amazing AI-generated talking avatar video!',
          url: finalVideo,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(finalVideo);
      toast({
        title: "Link Copied!",
        description: "Video link copied to clipboard",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">AI Talking Avatar Studio</h1>
        </div>
        <p className="text-muted-foreground text-lg">Create stunning AI videos in 3 simple steps</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((num) => (
            <React.Fragment key={num}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                step >= num ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {num}
              </div>
              {num < 3 && (
                <div className={`w-8 h-0.5 ${step > num ? 'bg-primary' : 'bg-muted'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step 1: Avatar & Audio Setup */}
      {step >= 1 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Step 1: Upload Avatar & Create Audio
            </CardTitle>
            <CardDescription>Upload your avatar image and create or upload audio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Avatar Upload */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Avatar Image</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  {avatarImage ? (
                    <div className="space-y-2">
                      <img src={avatarImage} alt="Avatar" className="w-24 h-24 rounded-full mx-auto object-cover" />
                      <p className="text-sm text-green-600 font-medium">Avatar uploaded!</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Upload your avatar image</p>
                    </div>
                  )}
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="mt-2"
                  />
                </div>
              </div>

              {/* Audio Section */}
              <div className="space-y-4">
                <Label className="text-base font-semibold">Audio Source</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm">Upload Audio File</Label>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="mt-1"
                    />
                    {audioFile && (
                      <div className="mt-2 p-2 bg-green-50 rounded flex items-center">
                        <FileAudio className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-700">Audio uploaded!</span>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-sm text-muted-foreground">OR</div>

                  <div>
                    <Label className="text-sm">Generate from Script</Label>
                    <Textarea
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      placeholder="Enter your script here..."
                      className="mt-1 min-h-[80px]"
                    />
                    <div className="mt-2">
                      <Label className="text-sm">Voice</Label>
                      <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableVoices.map((voice) => (
                            <SelectItem key={voice.id} value={voice.id}>
                              {voice.name} ({voice.gender}, {voice.accent})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={generateAudio}
                      disabled={isProcessing || !script.trim()}
                      className="w-full mt-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating Audio...
                        </>
                      ) : (
                        <>
                          <Mic className="w-4 h-4 mr-2" />
                          Generate Audio
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {generatedAudio && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700">Audio Ready!</span>
                      <Button size="sm" variant="outline" onClick={() => {
                        const audio = new Audio(generatedAudio);
                        audio.play();
                      }}>
                        <Play className="w-3 h-3" />
                      </Button>
                    </div>
                    <audio controls className="w-full">
                      <source src={generatedAudio} type="audio/mpeg" />
                    </audio>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Video Generation */}
      {step >= 2 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="w-5 h-5 mr-2" />
              Step 2: Generate Video
            </CardTitle>
            <CardDescription>Create your AI video with HeyGen technology</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Video Generation Prompt</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe how you want your avatar to appear and behave..."
                className="min-h-[80px]"
              />
            </div>

            <Button
              onClick={generateVideo}
              disabled={isProcessing || !avatarImage}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4 mr-2" />
                  Generate Video with HeyGen
                </>
              )}
            </Button>

            {generatedVideo && (
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-green-700 font-medium">Video generated successfully!</span>
                </div>
                <video controls className="w-full rounded">
                  <source src={generatedVideo} type="video/mp4" />
                </video>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 3: Sync & Export */}
      {step >= 3 && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              Step 3: Sync & Export
            </CardTitle>
            <CardDescription>Combine audio and video with perfect lip-sync</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={syncAudioVideo}
              disabled={isProcessing || (!audioFile && !generatedAudio) || !generatedVideo}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Syncing Audio & Video...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Create Final Video
                </>
              )}
            </Button>

            {finalVideo && (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-lg font-semibold text-green-700">Your AI Talking Avatar is Ready! 🎉</span>
                  </div>
                  <video controls className="w-full rounded-lg">
                    <source src={finalVideo} type="video/mp4" />
                  </video>
                </div>

                <div className="flex space-x-3">
                  <Button onClick={downloadVideo} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                  <Button onClick={shareVideo} variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Video
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}