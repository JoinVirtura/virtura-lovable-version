import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Enhanced project structure for world-class AI studio
export interface StudioProject {
  id: string;
  name: string;
  avatar: {
    type: 'upload' | 'generate' | 'library';
    originalUrl?: string;
    processedUrl?: string;
    faceData?: any;
    status: 'pending' | 'processing' | 'completed' | 'error';
    quality: 'HD' | '4K' | '8K';
    metadata?: {
      resolution?: string;
      faceAlignment?: number;
      consistency?: number;
    };
  } | null;
  
  voice: {
    type: 'tts' | 'clone' | 'upload';
    script?: string;
    voiceId?: string;
    provider?: 'elevenlabs' | 'openai' | 'heygen';
    emotions?: Record<string, number>;
    audioUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    language?: string;
    metadata?: {
      duration?: number;
      waveform?: number[];
      phonemes?: any[];
    };
  } | null;
  
  style: {
    preset: string;
    lookMode: 'realistic' | 'pixar' | 'anime' | 'cinematic' | 'vintage';
    background: 'studio' | 'office' | 'custom' | 'transparent' | 'virtual';
    lighting: {
      key: number;
      fill: number;
      rim: number;
      ambient: number;
    };
    camera: {
      angle: number;
      distance: number;
      focus: number;
    };
    effects: {
      colorGrading?: string;
      lut?: string;
      bokeh?: number;
      vignette?: number;
    };
    status: 'pending' | 'processing' | 'completed' | 'error';
  } | null;
  
  video: {
    engine: 'kling' | 'heygen' | 'runway' | 'virtura-pro';
    quality: '720p' | '1080p' | '4K' | '8K';
    fps: 24 | 30 | 60;
    duration: number;
    ratio: '1:1' | '9:16' | '16:9' | '4:5';
    motionSettings: {
      headMovement: number;
      eyeContact: number;
      expressions: number;
      gestures: number;
    };
    videoUrl?: string;
    status: 'pending' | 'processing' | 'completed' | 'error';
    metadata?: {
      frames?: number;
      bitrate?: string;
      codec?: string;
    };
  } | null;
  
  export: {
    formats: string[];
    qualities: string[];
    watermark: boolean;
    subtitles: boolean;
    deliveryMethod: 'download' | 'email' | 'cloud';
    status: 'pending' | 'processing' | 'completed' | 'error';
    urls?: Record<string, string>;
  } | null;
  
  qualitySettings: {
    enableUltraHD: boolean;
    neuralEnhancement: boolean;
    cinematicEffects: boolean;
    realTimeSync: boolean;
    gpuAcceleration: boolean;
  };
  
  timeline: {
    totalDuration: number;
    segments: Array<{
      type: 'avatar' | 'voice' | 'effect';
      startTime: number;
      duration: number;
      content: any;
    }>;
  };
  
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: string;
    totalProcessingTime?: number;
  };
}

export const useStudioProject = () => {
  const { toast } = useToast();
  const [project, setProject] = useState<StudioProject>({
    id: '',
    name: 'Untitled Project',
    avatar: null,
    voice: null,
    style: null,
    video: null,
    export: null,
    qualitySettings: {
      enableUltraHD: true,
      neuralEnhancement: true,
      cinematicEffects: true,
      realTimeSync: true,
      gpuAcceleration: true
    },
    timeline: {
      totalDuration: 0,
      segments: []
    },
    metadata: {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: '1.0.0'
    }
  });

  const [projectProgress, setProjectProgress] = useState(0);
  const [qualityMetrics, setQualityMetrics] = useState({
    overall: 85,
    avatar: 90,
    voice: 88,
    video: 82,
    style: 87
  });

  // Auto-save project changes
  useEffect(() => {
    const saveProject = async () => {
      if (project.id) {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('projects')
              .upsert({
                id: project.id,
                user_id: user.id,
                title: project.name,
                metadata: project as any,
                updated_at: new Date().toISOString()
              });
          }
          
          if (error) throw error;
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    };

    const debounceTimer = setTimeout(saveProject, 2000);
    return () => clearTimeout(debounceTimer);
  }, [project]);

  const updateProject = useCallback((updates: Partial<StudioProject>) => {
    setProject(prev => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date().toISOString()
      }
    }));
  }, []);

  const generateAvatar = useCallback(async (config: any) => {
    try {
      setProject(prev => ({
        ...prev,
        avatar: { ...prev.avatar, status: 'processing' } as any
      }));

      const { data, error } = await supabase.functions.invoke('generate-avatar-hf', {
        body: {
          prompt: config.prompt,
          style: config.style,
          quality: config.quality || '4K',
          faceConsistency: true,
          neuralEnhancement: project.qualitySettings.neuralEnhancement
        }
      });

      if (error) throw error;

      setProject(prev => ({
        ...prev,
        avatar: {
          type: 'generate',
          processedUrl: data.imageUrl,
          status: 'completed',
          quality: config.quality || '4K',
          metadata: {
            resolution: data.resolution,
            faceAlignment: data.faceAlignment,
            consistency: data.consistency
          }
        }
      }));

      toast({
        title: "Avatar Generated",
        description: `Ultra-HD avatar created with ${data.quality} quality`,
      });

    } catch (error: any) {
      setProject(prev => ({
        ...prev,
        avatar: { ...prev.avatar, status: 'error' } as any
      }));
      
      toast({
        title: "Avatar Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [project.qualitySettings, toast]);

  const generateVoice = useCallback(async (config: any) => {
    try {
      setProject(prev => ({
        ...prev,
        voice: { ...prev.voice, status: 'processing' } as any
      }));

      const { data, error } = await supabase.functions.invoke('voice-generate', {
        body: {
          script: config.script,
          voiceId: config.voiceId,
          model: 'eleven_multilingual_v2',
          emotions: config.emotions,
          language: config.language || 'en',
          qualityMode: 'ultra-hd'
        }
      });

      if (error) throw error;

      setProject(prev => ({
        ...prev,
        voice: {
          type: 'tts',
          script: config.script,
          voiceId: config.voiceId,
          audioUrl: data.audioUrl,
          status: 'completed',
          language: config.language,
          metadata: {
            duration: data.duration,
            waveform: data.waveform,
            phonemes: data.phonemes
          }
        }
      }));

      toast({
        title: "Voice Generated",
        description: "High-fidelity voice synthesis completed",
      });

    } catch (error: any) {
      setProject(prev => ({
        ...prev,
        voice: { ...prev.voice, status: 'error' } as any
      }));
      
      toast({
        title: "Voice Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [toast]);

  const generateVideo = useCallback(async (config: any) => {
    try {
      setProject(prev => ({
        ...prev,
        video: { ...prev.video, status: 'processing' } as any
      }));

      const { data, error } = await supabase.functions.invoke('video-engine-pro', {
        body: {
          avatarImageUrl: project.avatar?.processedUrl,
          audioUrl: project.voice?.audioUrl,
          prompt: config.prompt,
          settings: {
            engine: config.engine || 'virtura-pro',
            quality: config.quality || '4K',
            fps: config.fps || 30,
            ratio: config.ratio || '16:9',
            duration: config.duration || 30,
            motionSettings: config.motionSettings,
            ultraHD: project.qualitySettings.enableUltraHD,
            neuralEnhancement: project.qualitySettings.neuralEnhancement,
            cinematicEffects: project.qualitySettings.cinematicEffects
          }
        }
      });

      if (error) throw error;

      setProject(prev => ({
        ...prev,
        video: {
          engine: config.engine || 'virtura-pro',
          quality: config.quality || '4K',
          fps: config.fps || 30,
          duration: config.duration || 30,
          ratio: config.ratio || '16:9',
          motionSettings: config.motionSettings,
          videoUrl: data.videoUrl,
          status: 'completed',
          metadata: {
            frames: data.frames,
            bitrate: data.bitrate,
            codec: data.codec
          }
        }
      }));

      toast({
        title: "Video Generated",
        description: `Ultra-HD video created with ${data.engine} engine`,
      });

    } catch (error: any) {
      setProject(prev => ({
        ...prev,
        video: { ...prev.video, status: 'error' } as any
      }));
      
      toast({
        title: "Video Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [project.avatar, project.voice, project.qualitySettings, toast]);

  const exportProject = useCallback(async (config: any) => {
    try {
      setProject(prev => ({
        ...prev,
        export: { ...prev.export, status: 'processing' } as any
      }));

      const { data, error } = await supabase.functions.invoke('export-studio-project', {
        body: {
          projectId: project.id,
          videoUrl: project.video?.videoUrl,
          formats: config.formats,
          qualities: config.qualities,
          watermark: config.watermark,
          subtitles: config.subtitles,
          deliveryMethod: config.deliveryMethod
        }
      });

      if (error) throw error;

      setProject(prev => ({
        ...prev,
        export: {
          formats: config.formats,
          qualities: config.qualities,
          watermark: config.watermark,
          subtitles: config.subtitles,
          deliveryMethod: config.deliveryMethod,
          status: 'completed',
          urls: data.urls
        }
      }));

      toast({
        title: "Export Completed",
        description: "Your video is ready for download",
      });

    } catch (error: any) {
      setProject(prev => ({
        ...prev,
        export: { ...prev.export, status: 'error' } as any
      }));
      
      toast({
        title: "Export Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [project, toast]);

  return {
    project,
    updateProject,
    generateAvatar,
    generateVoice,
    generateVideo,
    exportProject,
    projectProgress,
    qualityMetrics,
    setProjectProgress
  };
};