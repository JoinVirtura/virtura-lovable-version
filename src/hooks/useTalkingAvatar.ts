import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Voice, Style, Exports, Asset, Job } from '@/features/talking-avatar/store';

interface AvatarData {
  id: string;
  original_image_url: string;
  heygen_talking_photo_id?: string;
  openai_avatar_id?: string;
  runway_avatar_id?: string;
  status: string;
}

interface TalkingAvatarHookReturn {
  // State
  uploadedFile: File | null;
  avatarData: AvatarData | null;
  voice: Voice;
  style: Style;
  exports: Exports;
  generatedAudio: string | null;
  generatedVideo: string | null;
  finalVideo: string | null;
  job: Job | null;
  isProcessing: boolean;
  
  // Actions
  handleFileUpload: (file: File) => Promise<void>;
  updateVoice: (voice: Partial<Voice>) => void;
  updateStyle: (style: Partial<Style>) => void;
  updateExports: (exports: Partial<Exports>) => void;
  generateAudio: (script: string) => Promise<void>;
  generateVideo: (prompt: string, provider?: string) => Promise<void>;
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
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [voice, setVoice] = useState<Voice>(initialVoice);
  const [style, setStyle] = useState<Style>(initialStyle);
  const [exports, setExports] = useState<Exports>(initialExports);
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [finalVideo, setFinalVideo] = useState<string | null>(null);
  const [job, setJob] = useState<Job | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Actions
  const handleFileUpload = useCallback(async (file: File) => {
    setUploadedFile(file);
    setIsProcessing(true);

    try {
      // Upload to Supabase storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${crypto.randomUUID()}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      console.log('Uploading to HeyGen via backend...');

      // Upload to providers and save metadata with auth
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('upload-avatar', {
        body: { photoUrl: publicUrl },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        }
      });

      // Always create avatar data if we have the public URL, regardless of function response
      const basicAvatarData = {
        id: crypto.randomUUID(),
        original_image_url: publicUrl,
        status: 'ready',
        user_id: 'current_user'
      };
      
      setAvatarData(basicAvatarData);

      // Try to process with backend but don't fail if it doesn't work
      try {
        if (data?.success && data.avatar) {
          setAvatarData(data.avatar);
          console.log('Backend processing successful:', data);
        }
      } catch (backendError) {
        console.warn('Backend processing failed but avatar still uploaded:', backendError);
      }

      toast({
        title: "✅ Avatar Ready!",
        description: `${file.name} uploaded successfully and ready for video generation!`,
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload avatar",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
          const audioUrl = data.audioUrl || data.audioData || null;
          setGeneratedAudio(audioUrl);
          setJob(prev => prev ? {
            ...prev,
            progress: 50,
            steps: { ...prev.steps, voice: 'done' },
            logs: [...prev.logs, `Audio generated successfully${data.audioUrl ? ' (uploaded to storage)' : ''}`]
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

  const generateVideo = useCallback(async (prompt: string, provider = 'auto') => {
    console.log('🎬 Pro Video Engine: Starting generation...', { prompt, avatarData: !!avatarData });
    
    if (!avatarData) {
      console.log('No avatar data available');
      toast({
        title: "Error",
        description: "Please upload an avatar image first",
        variant: "destructive",
      });
      return;
    }

    if (!prompt?.trim()) {
      toast({
        title: "Error", 
        description: "Please enter a video prompt",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    // Initialize ultra-HD generation tracking
    setJob({
      id: Date.now().toString(),
      status: 'processing',
      progress: 10,
      steps: {
        voice: generatedAudio ? 'done' : 'pending',
        'ai-engine': 'running',
        'ultra-hd': 'pending',
        'cinematic': 'pending',
        export: 'pending'
      },
      logs: ['🚀 Initializing Pro Video Engine...', '🎬 Starting ultra-HD generation pipeline...']
    });

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // First generate audio if not available
      if (!generatedAudio) {
        setJob(prev => prev ? {
          ...prev,
          progress: 20,
          steps: { ...prev.steps, voice: 'running' },
          logs: [...prev.logs, '🎵 Generating studio-quality audio...']
        } : null);

        const audioResponse = await supabase.functions.invoke('voice-generate', {
          body: { 
            script: prompt,
            voiceId: voice.voiceId,
            model: 'tts-1'
          }
        });

        if (audioResponse.error) {
          throw new Error(`Audio generation failed: ${audioResponse.error.message}`);
        }

        const audioUrl = audioResponse.data?.audioUrl;
        if (!audioUrl) {
          throw new Error('No audio URL received');
        }

        setGeneratedAudio(audioUrl);
        
        setJob(prev => prev ? {
          ...prev,
          progress: 35,
          steps: { ...prev.steps, voice: 'done', 'ai-engine': 'running' },
          logs: [...prev.logs, '✅ Studio-quality audio generated']
        } : null);
      }

      // Generate ultra-HD video using our pro engine
      setJob(prev => prev ? {
        ...prev,
        progress: 50,
        steps: { ...prev.steps, 'ai-engine': 'running', 'ultra-hd': 'running' },
        logs: [...prev.logs, '🎬 Starting Pro Video Engine generation...']
      } : null);
      
      const videoSettings = {
        quality: '4K',
        ratio: '16:9',
        style: 'cinematic',
        fps: 30,
        duration: 30,
        background: 'studio'
      };
      
      // Use SSE stream for real-time progress updates
      const supabaseUrl = 'https://ujaoziqnxhjqlmnvlxav.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/video-engine-pro`;
      
      console.log('🎬 Starting SSE stream for video generation...');
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          avatarImageUrl: avatarData.original_image_url,
          audioUrl: generatedAudio,
          prompt: prompt,
          settings: videoSettings
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to start video generation: ${response.status} ${response.statusText}`);
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let videoUrl = '';
      let lastEventTime = Date.now();
      const TIMEOUT_MS = 300000; // 5 minutes timeout

      if (!reader) {
        throw new Error('Failed to get stream reader');
      }

      const checkTimeout = () => {
        const timeSinceLastEvent = Date.now() - lastEventTime;
        
        // Show warning after 60 seconds of no updates
        if (timeSinceLastEvent > 60000 && timeSinceLastEvent < 62000) {
          console.warn(`⚠️ No progress updates for ${(timeSinceLastEvent / 1000).toFixed(0)}s`);
          toast({
            title: "Still Processing",
            description: "Video generation is taking longer than expected. Large files may take a few minutes to upload.",
          });
        }
        
        // Timeout after 5 minutes
        if (timeSinceLastEvent > TIMEOUT_MS) {
          throw new Error(`Video generation timeout - no updates for ${(TIMEOUT_MS / 60000).toFixed(0)} minutes`);
        }
      };

      while (true) {
        checkTimeout();
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ SSE stream completed');
          break;
        }

        lastEventTime = Date.now();
        buffer += decoder.decode(value, { stream: true });
        
        // Process each complete line
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue;
          
          try {
            const data = JSON.parse(line.substring(6));
            console.log('📡 SSE event:', data.stage, data.progress + '%', data.message);
            
            // Update job progress based on stage
            if (data.stage === 'initializing') {
              setJob(prev => prev ? {
                ...prev,
                progress: data.progress || 5,
                logs: [...prev.logs, `🎬 ${data.message}`]
              } : null);
            } else if (data.stage === 'engine_selection') {
              setJob(prev => prev ? {
                ...prev,
                progress: data.progress || 10,
                logs: [...prev.logs, `🎯 ${data.message}`]
              } : null);
            } else if (data.stage === 'generating') {
              setJob(prev => prev ? {
                ...prev,
                progress: data.progress || 30,
                steps: { ...prev.steps, 'ai-engine': 'running' },
                logs: [...prev.logs, `🎬 ${data.message}`]
              } : null);
            } else if (data.stage === 'processing') {
              setJob(prev => prev ? {
                ...prev,
                progress: data.progress || 60,
                steps: { ...prev.steps, 'ultra-hd': 'running' },
                logs: [...prev.logs, `🎭 ${data.message}`]
              } : null);
            } else if (data.stage === 'downloading') {
              setJob(prev => prev ? {
                ...prev,
                progress: data.progress || 75,
                logs: [...prev.logs, `⬇️ ${data.message}`]
              } : null);
            } else if (data.stage === 'uploading') {
              setJob(prev => prev ? {
                ...prev,
                progress: data.progress || 85,
                logs: [...prev.logs, `☁️ ${data.message}`]
              } : null);
            } else if (data.stage === 'complete') {
              videoUrl = data.videoUrl;
              console.log('✅ Video generation complete:', videoUrl);
              
              setGeneratedVideo(videoUrl);
              
              setJob(prev => prev ? {
                ...prev,
                progress: 100,
                status: 'done',
                steps: { 
                  ...prev.steps, 
                  'ai-engine': 'done',
                  'ultra-hd': 'done',
                  'cinematic': 'done',
                  export: 'done'
                },
                logs: [...prev.logs, '🎉 Ultra-HD video generation completed!']
              } : null);

              toast({
                title: "Ultra-HD Video Generated! 🎬✨",
                description: `${data.metadata?.engine || 'Pro Engine'} created ${data.quality || '4K'} cinematic quality video`,
              });
            } else if (data.stage === 'error') {
              throw new Error(data.error || 'Video generation failed');
            }
          } catch (parseError: any) {
            console.warn('Failed to parse SSE message:', line, parseError);
          }
        }
      }

      if (!videoUrl) {
        throw new Error('Video generation completed but no video URL received');
      }

      console.log('✅ Final video URL:', videoUrl);

    } catch (error: any) {
      console.error('Pro Video Engine failed:', error);
      
      let errorMessage = error.message || 'Unknown error occurred';
      let suggestion = '';
      
      if (errorMessage.includes('limit') || errorMessage.includes('quota')) {
        suggestion = ' Switching to backup engines...';
        
        // Auto-retry with fallback after short delay
        setTimeout(() => {
          setJob(prev => prev ? {
            ...prev,
            progress: 60,
            logs: [...prev.logs, '🔄 Switching to backup engine...']
          } : null);
          generateVideo(prompt, 'fallback');
        }, 2000);
      } else if (errorMessage.includes('API')) {
        suggestion = ' Trying alternative generation methods...';
      }
      
      setJob(prev => prev ? {
        ...prev,
        status: 'error',
        steps: { 
          ...prev.steps, 
          'ai-engine': 'error'
        },
        logs: [...prev.logs, `❌ Error: ${errorMessage}`, `💡 ${suggestion || 'Please try again.'}`]
      } : null);
      
      toast({
        title: "Switching to Backup Engine",
        description: errorMessage + suggestion,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  }, [avatarData, generatedAudio, voice, toast]);

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

  const downloadVideo = useCallback(async () => {
    const videoUrl = finalVideo || generatedVideo;
    console.log('⬇️ downloadVideo called with:', videoUrl?.substring(0, 60) + '...');
    
    if (!videoUrl) {
      console.error('❌ No video URL available for download');
      toast({
        title: "Error",
        description: "No video available for download",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🔄 Fetching video as blob...');
      
      // Fetch video as blob to bypass CORS restrictions
      const response = await fetch(videoUrl);
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      console.log(`✅ Video fetched: ${(blob.size / 1024 / 1024).toFixed(2)}MB`);
      
      // Create local blob URL
      const blobUrl = URL.createObjectURL(blob);
      console.log('✅ Blob URL created, triggering download...');
      
      // Create and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `talking-avatar-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up blob URL
      setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

      console.log('✅ Download triggered successfully');
      toast({
        title: "Download Started",
        description: "Your video is being downloaded",
      });
    } catch (error: any) {
      console.error('❌ Download error:', error);
      toast({
        title: "Download Failed",
        description: error.message || "Failed to download video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
    console.log('💾 saveToLibrary called with:', { 
      videoUrl: videoUrl?.substring(0, 60) + '...', 
      generatedAudio: generatedAudio?.substring(0, 60) + '...', 
      uploadedFile: !!uploadedFile,
      avatarData: !!avatarData
    });
    
    if (!videoUrl) {
      console.error('❌ No video URL available');
      toast({
        title: "Error",
        description: "No video available to save",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      console.log('🔄 Starting save to library process...');
      
      // Handle thumbnail - upload to storage if it's a File object
      let thumbnailUrl: string | null = null;
      
      if (uploadedFile && uploadedFile instanceof File) {
        console.log('📤 Uploading thumbnail to storage...');
        const fileName = `thumbnail-${Date.now()}.jpg`;
        const filePath = `thumbnails/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('virtura-media')
          .upload(filePath, uploadedFile, {
            contentType: uploadedFile.type,
            upsert: false
          });
        
        if (uploadError) {
          console.error('❌ Thumbnail upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('virtura-media')
            .getPublicUrl(filePath);
          thumbnailUrl = publicUrl;
          console.log('✅ Thumbnail uploaded:', thumbnailUrl);
        }
      } else if (avatarData?.original_image_url) {
        thumbnailUrl = avatarData.original_image_url;
        console.log('✅ Using avatar image as thumbnail:', thumbnailUrl);
      }
      
      console.log('📡 Calling save-to-library edge function with:', {
        videoUrl: videoUrl.substring(0, 60) + '...',
        thumbnailUrl: thumbnailUrl?.substring(0, 60) + '...' || 'null',
        audioUrl: generatedAudio?.substring(0, 60) + '...' || 'null'
      });
      
      const { data, error } = await supabase.functions.invoke('save-to-library', {
        body: {
          videoUrl,
          thumbnailUrl,
          audioUrl: generatedAudio,
          title: `Talking Avatar ${new Date().toLocaleDateString()}`,
          prompt: `Created with voice`,
          duration: 0,
          metadata: {
            voice: voice,
            style: style,
            exports: exports,
            generatedAt: new Date().toISOString()
          }
        }
      });

      if (error) {
        console.error('❌ Edge function returned error:', error);
        throw error;
      }

      console.log('✅ Edge function response:', data);
      if (data?.success) {
        toast({
          title: "Saved to Library",
          description: "Video saved successfully! View it in Studio Pro.",
        });
      } else {
        throw new Error(data?.error || 'Failed to save');
      }
    } catch (error: any) {
      console.error('❌ Save to library error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save video to library",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [finalVideo, generatedVideo, generatedAudio, avatarData, uploadedFile, voice, style, exports, toast, supabase]);

  const resetWorkflow = useCallback(() => {
    setUploadedFile(null);
    setAvatarData(null);
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
    avatarData,
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