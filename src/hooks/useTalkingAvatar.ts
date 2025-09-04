import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Voice, Style, Exports, Asset, Job } from '@/features/talking-avatar/store';

interface TalkingAvatarHookReturn {
  // State
  uploadedFile: File | null;
  voice: Voice;
  style: Style;
  exports: Exports;
  generatedAudio: string | null;
  generatedVideo: string | null;
  finalVideo: string | null;
  job: Job | null;
  isProcessing: boolean;
  
  // Actions
  handleFileUpload: (file: File) => void;
  updateVoice: (voice: Partial<Voice>) => void;
  updateStyle: (style: Partial<Style>) => void;
  updateExports: (exports: Partial<Exports>) => void;
  generateAudio: (script: string) => Promise<void>;
  generateVideo: (prompt: string) => Promise<void>;
  syncAudioVideo: () => Promise<void>;
  downloadVideo: () => void;
  shareVideo: () => void;
  saveToLibrary: () => void;
  resetWorkflow: () => void;
}

export const useTalkingAvatar = (
  initialVoice: Voice,
  initialStyle: Style,
  initialExports: Exports
): TalkingAvatarHookReturn => {
  const { toast } = useToast();
  
  // State
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [voice, setVoice] = useState<Voice>(initialVoice);
  const [style, setStyle] = useState<Style>(initialStyle);
  const [exports, setExports] = useState<Exports>(initialExports);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [finalVideo, setFinalVideo] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Actions
  const handleFileUpload = useCallback((file: File) => {
    setUploadedFile(file);
    toast({
      title: "File uploaded",
      description: `${file.name} uploaded successfully`,
    });
  }, [toast]);

  const updateVoice = useCallback((voiceUpdate: Partial<Voice>) => {
    setVoice(prev => ({ ...prev, ...voiceUpdate }));
  }, []);

  const updateStyle = useCallback((styleUpdate: Partial<Style>) => {
    setStyle(prev => ({ ...prev, ...styleUpdate }));
  }, []);

  const updateExports = useCallback((exportsUpdate: Partial<Exports>) => {
    setExports(prev => ({ ...prev, ...exportsUpdate }));
  }, []);

  const generateAudio = useCallback(async (script: string) => {
    if (!script.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setJob({
      id: Date.now().toString(),
      status: 'processing',
      progress: 25,
      steps: {
        voice: 'running',
        'lip-sync': 'pending',
        style: 'pending',
        render: 'pending',
        export: 'pending'
      },
      logs: ['Starting audio generation...']
    });

    try {
      const { data, error } = await supabase.functions.invoke('voice-generate', {
        body: {
          script,
          voiceId: voice.voiceId,
          model: 'eleven_multilingual_v2',
          voiceSettings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: voice.emotion / 100,
            use_speaker_boost: true
          }
        }
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedAudio(data.audioData);
        setJob(prev => prev ? {
          ...prev,
          progress: 50,
          steps: { ...prev.steps, voice: 'done' },
          logs: [...prev.logs, 'Audio generated successfully']
        } : null);
        
        toast({
          title: "Audio Generated",
          description: "Voice synthesis completed successfully",
        });
      } else {
        throw new Error(data?.error || 'Failed to generate audio');
      }
    } catch (error: any) {
      console.error('Audio generation error:', error);
      setJob(prev => prev ? {
        ...prev,
        status: 'error',
        steps: { ...prev.steps, voice: 'error' },
        logs: [...prev.logs, `Error: ${error.message}`]
      } : null);
      
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate audio",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [voice, toast]);

  const generateVideo = useCallback(async (prompt: string) => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "Please upload an avatar image first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setJob(prev => prev ? {
      ...prev,
      progress: 75,
      steps: { ...prev.steps, 'lip-sync': 'running' },
      logs: [...prev.logs, 'Generating video...']
    } : {
      id: Date.now().toString(),
      status: 'processing',
      progress: 50,
      steps: {
        voice: 'done',
        'lip-sync': 'running',
        style: 'pending',
        render: 'pending',
        export: 'pending'
      },
      logs: ['Generating video...']
    });

    try {
      // Convert file to base64 for API call
      const reader = new FileReader();
      const base64Image = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadedFile);
      });

      const { data, error } = await supabase.functions.invoke('video-generate', {
        body: {
          avatarImage: base64Image,
          engine: 'heygen',
          prompt: prompt || 'Generate a natural talking video',
          duration: 30
        }
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedVideo(data.videoUrl);
        setJob(prev => prev ? {
          ...prev,
          progress: 100,
          status: 'done',
          steps: { 
            ...prev.steps, 
            'lip-sync': 'done',
            style: 'done',
            render: 'done',
            export: 'done'
          },
          logs: [...prev.logs, 'Video generated successfully']
        } : null);
        
        toast({
          title: "Video Generated",
          description: "Talking avatar video created successfully",
        });
      } else {
        throw new Error(data?.error || 'Failed to generate video');
      }
    } catch (error: any) {
      console.error('Video generation error:', error);
      setJob(prev => prev ? {
        ...prev,
        status: 'error',
        steps: { ...prev.steps, 'lip-sync': 'error' },
        logs: [...prev.logs, `Error: ${error.message}`]
      } : null);
      
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedFile, toast]);

  const syncAudioVideo = useCallback(async () => {
    if (!generatedAudio || !generatedVideo) {
      toast({
        title: "Error",
        description: "Both audio and video must be generated first",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setJob(prev => prev ? {
      ...prev,
      progress: 90,
      steps: { ...prev.steps, render: 'running' },
      logs: [...prev.logs, 'Syncing audio and video...']
    } : null);

    try {
      const { data, error } = await supabase.functions.invoke('video-sync', {
        body: {
          audioUrl: generatedAudio,
          videoUrl: generatedVideo,
          engine: 'heygen'
        }
      });

      if (error) throw error;

      if (data?.success) {
        setFinalVideo(data.finalVideoUrl || data.videoUrl);
        setJob(prev => prev ? {
          ...prev,
          progress: 100,
          status: 'done',
          steps: { ...prev.steps, render: 'done', export: 'done' },
          logs: [...prev.logs, 'Audio-video sync completed']
        } : null);
        
        toast({
          title: "Sync Complete",
          description: "Audio and video synchronized successfully",
        });
      } else {
        throw new Error(data?.error || 'Failed to sync audio and video');
      }
    } catch (error: any) {
      console.error('Sync error:', error);
      setJob(prev => prev ? {
        ...prev,
        status: 'error',
        steps: { ...prev.steps, render: 'error' },
        logs: [...prev.logs, `Error: ${error.message}`]
      } : null);
      
      toast({
        title: "Sync Failed",
        description: error.message || "Failed to sync audio and video",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [generatedAudio, generatedVideo, toast]);

  const downloadVideo = useCallback(() => {
    const videoUrl = finalVideo || generatedVideo;
    if (!videoUrl) {
      toast({
        title: "Error",
        description: "No video available for download",
        variant: "destructive",
      });
      return;
    }

    const link = document.createElement('a');
    link.href = videoUrl;
    link.download = `talking-avatar-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Download Started",
      description: "Your video is being downloaded",
    });
  }, [finalVideo, generatedVideo, toast]);

  const shareVideo = useCallback(async () => {
    const videoUrl = finalVideo || generatedVideo;
    if (!videoUrl) {
      toast({
        title: "Error",
        description: "No video available for sharing",
        variant: "destructive",
      });
      return;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Talking Avatar Video',
          text: 'Check out this amazing talking avatar video I created!',
          url: videoUrl,
        });
      } catch (error) {
        console.error('Share error:', error);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(videoUrl);
        toast({
          title: "Link Copied",
          description: "Video link copied to clipboard",
        });
      } catch (error) {
        console.error('Clipboard error:', error);
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard",
          variant: "destructive",
        });
      }
    }
  }, [finalVideo, generatedVideo, toast]);

  const saveToLibrary = useCallback(async () => {
    const videoUrl = finalVideo || generatedVideo;
    if (!videoUrl) {
      toast({
        title: "Error",
        description: "No video available to save",
        variant: "destructive",
      });
      return;
    }

    try {
      // Save to Supabase storage bucket
      const { data, error } = await supabase.functions.invoke('save-to-library', {
        body: {
          videoUrl,
          title: `Talking Avatar ${new Date().toISOString()}`,
          type: 'talking_avatar'
        }
      });

      if (error) throw error;

      toast({
        title: "Saved to Library",
        description: "Video saved to your library successfully",
      });
    } catch (error: any) {
      console.error('Save to library error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save video to library",
        variant: "destructive",
      });
    }
  }, [finalVideo, generatedVideo, toast]);

  const resetWorkflow = useCallback(() => {
    setUploadedFile(null);
    setGeneratedAudio(null);
    setGeneratedVideo(null);
    setFinalVideo(null);
    setJob(null);
    setIsProcessing(false);
    
    toast({
      title: "Workflow Reset",
      description: "Starting fresh with a new project",
    });
  }, [toast]);

  return {
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
    saveToLibrary,
    resetWorkflow,
  };
};