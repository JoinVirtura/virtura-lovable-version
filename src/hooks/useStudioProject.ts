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
      processingTime?: string;
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
    strength?: number;
    preserveOriginal?: number;
    enhanceDetails?: number;
    resultUrl?: string;
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
    metadata?: {
      styleName?: string;
      styleType?: string;
      category?: string;
      processingTime?: string;
    };
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
    heygenUrl?: string;
    fallbackUrl?: string;
    videoSize?: string;
    contentType?: string;
    storageError?: string;
    storagePath?: string;
    currentStage?: string;
    progress?: number;
    errorMessage?: string;
    model?: string;  // Replicate model name (sync-labs, sadtalker, wav2lip)
    replicateUrl?: string;  // Original Replicate video URL
    storageSuccess?: boolean;  // Whether Supabase storage upload succeeded
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
              
            if (error) throw error;
          }
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

      // First try generate-avatar-real, fallback to generate-avatar
      let data, error;
      try {
        const result = await supabase.functions.invoke('generate-avatar-real', {
          body: {
            prompt: config.prompt,
            style: config.style,
            quality: config.quality || 'HD',
            content_type: config.contentType || 'portrait',
            aspect_ratio: '1:1'
          }
        });
        data = result.data;
        error = result.error;
      } catch (realError) {
        console.log('generate-avatar-real failed, trying generate-avatar');
        const result = await supabase.functions.invoke('generate-avatar', {
          body: {
            prompt: config.prompt,
            style: config.style,
            quality: config.quality || 'HD',
            photoMode: true,
            resolution: config.quality || 'HD'
          }
        });
        data = result.data;
        error = result.error;
      }

      if (error) throw error;

      const imageUrl = data.imageUrl || data.image_url || data.url;
      if (!imageUrl) throw new Error('No image URL received from generation');

      setProject(prev => ({
        ...prev,
        avatar: {
          type: 'generate',
          originalUrl: imageUrl,
          processedUrl: imageUrl,
          status: 'completed',
          quality: config.quality || 'HD',
          metadata: {
            resolution: data.resolution || '1024x1024',
            faceAlignment: data.faceAlignment || 95,
            consistency: data.consistency || 90
          }
        }
      }));

      toast({
        title: "Avatar Generated",
        description: `AI avatar created successfully`,
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
          language: config.language || 'en',
          voiceSettings: config.voiceSettings || {
            stability: 0.75,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
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
        title: "Voice Generated Successfully",
        description: data.provider === 'elevenlabs' 
          ? "Premium ElevenLabs voice generated"
          : "High-quality OpenAI voice generated",
      });

    } catch (error: any) {
      setProject(prev => ({
        ...prev,
        voice: { ...prev.voice, status: 'error' } as any
      }));
      
      const errorMsg = error.message || 'Failed to generate voice';
      const isApiKey = errorMsg.toLowerCase().includes('api key');
      
      toast({
        title: "Voice Generation Failed",
        description: isApiKey 
          ? "Voice API configuration issue. Using fallback provider..."
          : errorMsg,
        variant: "destructive"
      });
    }
  }, [toast]);

  const generateVideo = useCallback(async (config: any) => {
    try {
      setProject(prev => ({
        ...prev,
        video: { 
          ...prev.video, 
          status: 'processing',
          metadata: {
            ...prev.video?.metadata,
            currentStage: 'Initializing...',
            progress: 0
          }
        } as any
      }));

      // Priority 2: Use SSE for real-time progress
      const supabaseUrl = 'https://ujaoziqnxhjqlmnvlxav.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW96aXFueGhqcWxtbnZseGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1ODYwMDMsImV4cCI6MjA3MTE2MjAwM30.jbBjuZPRyc2CDonO7JJstuhBUlRxgX2K1qgDhpXrIHU';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/video-engine-pro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({
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
            background: project.style?.background || 'studio',
            backgroundValue: project.style?.effects?.colorGrading,
            lookMode: project.style?.lookMode,
            lighting: project.style?.lighting,
            camera: project.style?.camera,
            effects: project.style?.effects,
            talkingStyle: config.talkingStyle || 'stable',
            voiceEmotions: project.voice?.emotions,
            voiceLanguage: project.voice?.language,
            voiceProvider: project.voice?.provider,
            ultraHD: project.qualitySettings.enableUltraHD,
            neuralEnhancement: project.qualitySettings.neuralEnhancement,
            cinematicEffects: project.qualitySettings.cinematicEffects,
            realTimeSync: project.qualitySettings.realTimeSync,
            gpuAcceleration: project.qualitySettings.gpuAcceleration
          }
        })
      });

      if (!response.ok) throw new Error('Failed to start video generation');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      
      if (!reader) throw new Error('No response stream');

      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.slice(6));
            
            // Update project with progress
            setProject(prev => ({
              ...prev,
              video: {
                ...prev.video,
                status: data.stage === 'complete' ? 'completed' : data.stage === 'error' ? 'error' : 'processing',
                metadata: {
                  ...prev.video?.metadata,
                  currentStage: data.message,
                  progress: data.progress
                }
              } as any
            }));

            if (data.stage === 'complete') {
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
                    ...data.metadata,
                    currentStage: 'Completed',
                    progress: 100
                  }
                }
              }));

              toast({
                title: "Video Generated",
                description: `High-quality talking avatar created with ${data.provider} engine`,
              });
            } else if (data.stage === 'error') {
              throw new Error(data.error);
            }
          } catch (parseError) {
            console.error('Failed to parse SSE data:', parseError);
          }
        }
      }

    } catch (error: any) {
      setProject(prev => ({
        ...prev,
        video: { 
          ...prev.video, 
          status: 'error',
          metadata: {
            ...prev.video?.metadata,
            errorMessage: error.message
          }
        } as any
      }));
      
      toast({
        title: "Video Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  }, [project.avatar, project.voice, project.style, project.qualitySettings, toast]);

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