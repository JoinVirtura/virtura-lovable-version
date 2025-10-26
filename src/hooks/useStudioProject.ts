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
    model?: string;
    replicateUrl?: string;
    storageSuccess?: boolean;
    engineAttempt?: number;
    totalEngines?: number;
    lastError?: string;
    width?: number;
    height?: number;
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
    videos?: Array<{
      aspectRatio: string;
      url: string;
      width: number;
      height: number;
      size: string;
      isNative?: boolean;
    }>;
    pack?: string;
    primaryRatio?: string;
    exportId?: string;
    timestamp?: string;
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

  // Load most recent project on mount
  useEffect(() => {
    const loadProject = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: projects } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(1);

        if (projects && projects.length > 0) {
          const savedProject = projects[0];
          if (savedProject.metadata) {
            setProject(prev => ({
              ...prev,
              ...(savedProject.metadata as Partial<StudioProject>),
              id: savedProject.id,
              name: savedProject.title
            }));
            console.log('✅ Loaded project from database:', savedProject.id);
          }
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    };

    loadProject();
  }, []);

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

      console.log('🎙️ Generating voice with:', {
        voiceId: config.voiceId,
        language: config.language || 'en',
        scriptPreview: config.script?.substring(0, 50) + '...'
      });

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
      
      console.log('✅ Voice generation response:', { 
        success: !error, 
        provider: data?.provider,
        hasAudioUrl: !!data?.audioUrl 
      });

      if (error) throw error;

      // Calculate actual audio duration - wait for metadata before updating state
      const audioUrl = data.audioUrl;
      
      await new Promise<void>((resolve) => {
        const audio = new Audio(audioUrl);
        
        audio.addEventListener('loadedmetadata', () => {
          const durationInSeconds = Math.round(audio.duration);
          
          setProject(prev => ({
            ...prev,
            voice: {
              type: 'tts',
              script: config.script,
              voiceId: config.voiceId,
              audioUrl,
              status: 'completed',
              language: config.language,
              metadata: {
                duration: durationInSeconds,
                waveform: data.waveform,
                phonemes: data.phonemes,
                provider: data.provider,
                model: data.model
              }
            }
          }));
          
          resolve();
        });
        
        audio.addEventListener('error', () => {
          console.warn('Could not load audio metadata, using default duration');
          resolve();
        });
      });

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

  // Retry helper with exponential backoff
  const retryWithBackoff = async (
    fn: () => Promise<any>,
    maxRetries: number = 3,
    baseDelay: number = 2000
  ): Promise<any> => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error: any) {
        // Don't retry on validation errors or missing API keys
        if (
          error.message?.includes('Required') || 
          error.message?.includes('not configured') ||
          error.message?.includes('health check failed')
        ) {
          throw error; // Throw immediately for config errors
        }
        
        // Don't retry on final attempt
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Calculate exponential backoff delay (2s, 4s, 8s)
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.log(`⚠️ Attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`);
        
        // Update UI to show retry status
        setProject(prev => ({
          ...prev,
          video: {
            ...prev.video,
            status: 'processing',
            metadata: {
              ...prev.video?.metadata,
              currentStage: `Retrying (attempt ${attempt}/${maxRetries})...`,
              progress: 5,
              error: error.message
            }
          } as any
        }));
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  const generateVideo = useCallback(async (config: any) => {
    try {
      // VALIDATION: Check prerequisites (check EITHER processedUrl OR originalUrl)
      const avatarUrl = project.avatar?.processedUrl || project.avatar?.originalUrl;
      if (!avatarUrl) {
        toast({
          title: "Avatar Required",
          description: "Please select or generate an avatar before creating video",
          variant: "destructive"
        });
        return;
      }
      
      if (!project.voice?.audioUrl) {
        toast({
          title: "Voice Required", 
          description: "Please generate voice audio before creating video",
          variant: "destructive"
        });
        return;
      }

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

      // Convert blob URLs OR data URLs to public Supabase URLs
      let publicAvatarUrl = avatarUrl;

      if (avatarUrl.startsWith('blob:') || avatarUrl.startsWith('data:')) {
        console.log('Converting blob/data URL to public URL...');
        const response = await fetch(avatarUrl);
        const blob = await response.blob();
        const fileName = `avatar-${Date.now()}.png`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('virtura-media')
          .upload(`avatars/${fileName}`, blob, {
            contentType: 'image/png',
            upsert: true
          });
          
        if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);
        
        const { data: urlData } = supabase.storage
          .from('virtura-media')
          .getPublicUrl(`avatars/${fileName}`);
          
        publicAvatarUrl = urlData.publicUrl;
        console.log('✅ Avatar uploaded to:', publicAvatarUrl);
      }

      console.log('🚀 Starting video generation...');
      console.log('Avatar URL:', publicAvatarUrl);
      console.log('Audio URL:', project.voice?.audioUrl);

      // Use supabase.functions.invoke() for automatic authentication (same pattern as all other edge functions)
      const { data, error } = await supabase.functions.invoke('video-engine-pro', {
        body: {
          avatarImageUrl: publicAvatarUrl,
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
        }
      });

      if (error) throw error;
      if (!data) throw new Error('No response from video engine');

      console.log('✅ Video generation complete:', data);

      const getDimensionsForRatio = (ratio: string) => {
        const dimensions: Record<string, { width: number; height: number }> = {
          '1:1': { width: 1080, height: 1080 },
          '9:16': { width: 1080, height: 1920 },
          '16:9': { width: 1920, height: 1080 },
          '4:5': { width: 1080, height: 1350 }
        };
        return dimensions[ratio] || { width: 1920, height: 1080 };
      };

      const dims = getDimensionsForRatio(config.ratio || '16:9');

      // Update project with completed video
      setProject(prev => ({
        ...prev,
        video: {
          engine: config.engine || 'virtura-pro',
          quality: config.quality || '4K',
          fps: config.fps || 30,
          ratio: config.ratio || '16:9',
          duration: config.duration || 30,
          motionSettings: config.motionSettings,
          videoUrl: data.videoUrl,
          status: 'completed',
          metadata: {
            currentStage: 'Video generation complete',
            progress: 100,
            provider: data.provider,
            model: data.model,
            processingTime: data.processingTime
          }
        }
      }));

      toast({
        title: "Video Generated Successfully! 🎉",
        description: `Created with ${data.provider || 'Replicate'}`,
      });

      // Auto-save to library after successful generation
      const autoSaveEnabled = localStorage.getItem('virtura_auto_save_videos') !== 'false';
      if (autoSaveEnabled && data.videoUrl && data.videoUrl.includes('supabase.co')) {
        setTimeout(async () => {
          try {
            await saveToLibrary();
            toast({
              title: "Auto-saved to Library",
              description: "Your video has been automatically saved",
            });
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }, 1000);
      }

    } catch (error: any) {
      console.error('❌ Video generation error:', error);
      
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
      
      // Enhanced error handling
      let errorMessage = error.message || 'Failed to generate video';
      let errorTitle = "Video Generation Failed";
      
      // Timeout error
      if (error.name === 'AbortError') {
        errorTitle = "Request Timeout";
        errorMessage = "Video generation request timed out after 10 minutes. The edge function may be experiencing issues. Please check: 1) Edge function is deployed 2) REPLICATE_API_KEY is set in Supabase secrets 3) Replicate account has available credits";
      }
      // Network errors
      else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        errorTitle = "Connection Failed";
        errorMessage = "Unable to connect to video engine. Please check your internet connection and ensure the edge function is deployed.";
      }
      // Replicate errors
      else if (errorMessage.includes('429') || errorMessage.toLowerCase().includes('rate limit')) {
        errorTitle = "Rate Limit Reached";
        errorMessage = "Replicate rate limit exceeded. Please wait 60 seconds and try again, or add a payment method to your Replicate account at replicate.com/account/billing";
      } else if (errorMessage.includes('402') || errorMessage.toLowerCase().includes('payment')) {
        errorTitle = "Payment Required";
        errorMessage = "Replicate payment method required. Add a payment method at replicate.com/account/billing to continue.";
      } else if (errorMessage.toLowerCase().includes('all replicate engines failed')) {
        errorTitle = "All Engines Failed";
        errorMessage = "Video generation failed due to Replicate API limits. Please add a payment method at replicate.com/account/billing or wait 60 seconds before retrying.";
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive"
      });
    }
  }, [project.avatar, project.voice, project.style, project.qualitySettings, toast]);

  const exportProject = useCallback(async (config: any) => {
    if (!project.video?.videoUrl) {
      toast({
        title: "Error",
        description: "No video to export",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Processing Export",
        description: `Generating ${config.ratios.length} video(s)...`,
      });

      setProject(prev => ({
        ...prev,
        export: { ...prev.export, status: 'processing' } as any
      }));

      const { data, error } = await supabase.functions.invoke('export-studio-project', {
        body: {
          projectId: project.id,
          videoUrl: project.video.videoUrl,
          pack: config.pack,
          aspectRatios: config.ratios,
          contentCredentials: config.contentCredentials,
          sourceVideo: {
            width: project.video.metadata?.width || 1920,
            height: project.video.metadata?.height || 1080,
            duration: project.video.duration,
            ratio: project.video.ratio
          }
        }
      });

      if (error) throw error;

      if (!data.success || !data.videos) {
        throw new Error(data.error || 'Export failed');
      }

      setProject(prev => ({
        ...prev,
        export: {
          status: 'completed',
          pack: config.pack,
          videos: data.videos,
          exportId: data.exportId,
          timestamp: new Date().toISOString()
        } as any
      }));

      toast({
        title: "Export Completed!",
        description: `${data.videos.length} video(s) ready for download`,
      });

      return data.videos;
    } catch (error: any) {
      console.error('Export error:', error);
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

  const downloadVideo = useCallback(async () => {
    if (!project.video?.videoUrl) {
      toast({ title: "Error", description: "No video available to download", variant: "destructive" });
      return;
    }

    console.log('📥 Starting video download:', project.video.videoUrl);

    try {
      const response = await fetch(project.video.videoUrl);
      if (!response.ok) throw new Error('Failed to fetch video');

      const blob = await response.blob();
      console.log('✅ Video blob created:', blob.size, 'bytes');

      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `virtura-studio-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      toast({ title: "Success", description: "Video downloaded successfully!" });
      console.log('✅ Video download complete');
    } catch (error: any) {
      console.error('❌ Download failed:', error);
      toast({ 
        title: "Download Failed", 
        description: error.message || "Failed to download video",
        variant: "destructive" 
      });
    }
  }, [project.video?.videoUrl, toast]);

  const saveToLibrary = useCallback(async () => {
    if (!project.video?.videoUrl) {
      toast({ title: "Error", description: "No video available to save", variant: "destructive" });
      return;
    }

    console.log('💾 Starting save to library:', {
      videoUrl: project.video.videoUrl,
      hasAvatar: !!project.avatar?.originalUrl,
      hasVoice: !!project.voice?.script
    });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Error", description: "Please sign in to save to library", variant: "destructive" });
        return;
      }

      let thumbnailUrl = project.avatar?.processedUrl || project.avatar?.originalUrl;
      
      if (!thumbnailUrl && project.avatar?.originalUrl?.startsWith('blob:')) {
        console.log('📤 Uploading avatar as thumbnail...');
        
        const response = await fetch(project.avatar.originalUrl);
        const blob = await response.blob();
        
        const fileName = `thumbnail-${Date.now()}.png`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('virtura-media')
          .upload(`thumbnails/${fileName}`, blob, {
            contentType: 'image/png',
            cacheControl: '3600'
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('virtura-media')
          .getPublicUrl(`thumbnails/${fileName}`);

        thumbnailUrl = publicUrl;
        console.log('✅ Thumbnail uploaded:', thumbnailUrl);
      }

      console.log('📡 Calling save-to-library edge function...');

      const { data, error } = await supabase.functions.invoke('save-to-library', {
        body: {
          videoUrl: project.video.videoUrl,
          thumbnailUrl: thumbnailUrl,
          title: project.name || `Studio Video ${new Date().toLocaleDateString()}`,
          prompt: project.voice?.script || 'Studio Pro generated video',
          voiceId: project.voice?.voiceId,
          quality: project.video?.quality,
          duration: project.video?.duration,
          metadata: {
            engine: project.video?.engine,
            fps: project.video?.fps,
            ratio: project.video?.ratio,
            style: project.style?.preset
          }
        }
      });

      if (error) throw error;

      toast({ 
        title: "Success", 
        description: "Video saved to your library!",
        duration: 3000
      });
      
      console.log('✅ Video saved to library successfully');
    } catch (error: any) {
      console.error('❌ Save to library failed:', error);
      toast({ 
        title: "Save Failed", 
        description: error.message || "Failed to save video to library",
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
    downloadVideo,
    saveToLibrary,
    projectProgress,
    qualityMetrics,
    setProjectProgress
  };
};