import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Upload, 
  Play,
  Download,
  Share2,
  Settings,
  Film,
  Mic,
  Eye,
  Loader2,
  Sparkles,
  Crown,
  Video
} from 'lucide-react';

import { VideoUploadStudio } from '@/components/studio/VideoUploadStudio';
import { PremiumVoiceEngine } from '@/components/studio/PremiumVoiceEngine';
import { RealVideoEngine } from '@/components/studio/RealVideoEngine';
import { ProjectTimeline } from '@/components/studio/ProjectTimeline';
import { RealtimePreview } from '@/components/studio/RealtimePreview';
import { useStudioProject } from '@/hooks/useStudioProject';

import { QualitySettings } from '@/components/studio/QualitySettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomStepNavigation } from '@/components/studio/BottomStepNavigation';
import { useSidebar } from '@/components/ui/sidebar';

const VIDEO_PRO_STEPS = [
  { id: 'upload', title: 'Upload', icon: Upload, color: 'bg-blue-500' },
  { id: 'voice', title: 'Voice', icon: Mic, color: 'bg-green-500' },
  { id: 'video', title: 'Video', icon: Film, color: 'bg-orange-500' }
];

export default function VideoProPage() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVideoSaved, setIsVideoSaved] = useState(false);
  
  const {
    project,
    updateProject,
    generateVoice,
    generateVideo,
    exportProject,
    downloadVideo,
    saveToLibrary,
    projectProgress,
    qualityMetrics
  } = useStudioProject(false); // Start fresh, don't load old projects

  const fileInputRef = useRef<HTMLInputElement>(null);
  const previousVideoUrlRef = useRef<string | null>(null);

  // Track if video URL changes to a NEW video to reset saved state
  useEffect(() => {
    const currentVideoUrl = project.video?.videoUrl;
    
    // Only reset saved state if this is a completely new video URL
    if (currentVideoUrl && previousVideoUrlRef.current !== null && currentVideoUrl !== previousVideoUrlRef.current) {
      console.log('🔄 New video detected, resetting saved state');
      setIsVideoSaved(false);
    }
    
    // Update the ref to track the current URL
    previousVideoUrlRef.current = currentVideoUrl || null;
  }, [project.video?.videoUrl]);

  // Load pre-selected avatar from Library
  useEffect(() => {
    const selectedAvatar = sessionStorage.getItem('selectedAvatar');
    if (selectedAvatar) {
      try {
        const { avatarUrl, metadata } = JSON.parse(selectedAvatar);
        
        updateProject({
          avatar: {
            type: 'library',
            originalUrl: avatarUrl,
            processedUrl: avatarUrl,
            status: 'completed',
            quality: '4K' as any,
            metadata
          }
        });
        
        sessionStorage.removeItem('selectedAvatar');
        toast.success('Avatar loaded from library');
      } catch (error) {
        console.error('Failed to load selected avatar:', error);
      }
    }
  }, [updateProject]);

  const handleImageUpload = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      updateProject({
        avatar: {
          type: 'upload',
          originalUrl: imageUrl,
          status: 'completed',
          quality: '4K',
          metadata: {
            resolution: `4K (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
            faceAlignment: 95,
            consistency: 85
          }
        }
      });
    };
    reader.readAsDataURL(file);
  }, [updateProject]);

  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case 'upload':
        return project.avatar?.status || 'pending';
      case 'voice':
        return project.voice?.status || 'pending';
      case 'video':
        return project.video?.status || 'pending';
      default:
        return 'pending';
    }
  };

  const handleResetAvatar = useCallback(() => {
    updateProject({
      avatar: undefined,
      style: undefined
    });
    setCurrentStep('upload');
    toast.info('Avatar cleared - select a new image');
  }, [updateProject]);

  return (
    <div className="w-full min-h-screen pb-20 sm:pb-32 bg-gradient-to-br from-[#0F0F1A] via-[#1a1a2e] to-[#0F0F1A] relative overflow-hidden">
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
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Main Studio Interface */}
      <div className="w-full px-4 sm:px-6 py-4 sm:py-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Global file input - always available */}
          <input
            ref={fileInputRef}
            id="avatar-upload-input"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                handleImageUpload(file);
                e.target.value = '';
              }
            }}
          />

          {/* Main Studio Panel */}
          <div className="lg:col-span-8 relative order-2 lg:order-1">
            <Card className="border-0 shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-visible">
              <CardContent className="p-4 sm:p-6">
                <Tabs value={currentStep} onValueChange={setCurrentStep}>
                  <TabsContent value="upload" className="mt-0" key={`upload-${currentStep}-${project.avatar?.status || 'empty'}-${project.voice?.status || 'empty'}`}>
                    <ErrorBoundary>
                      <VideoUploadStudio
                        project={project}
                        onUpdate={updateProject}
                        isProcessing={isProcessing}
                        onStepChange={handleStepChange}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="voice" className="mt-0">
                    <ErrorBoundary>
                      <PremiumVoiceEngine
                        project={project}
                        onUpdate={updateProject}
                        onGenerate={generateVoice}
                        isProcessing={isProcessing}
                        onStepChange={handleStepChange}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="video" className="mt-0">
                    <ErrorBoundary>
                      <RealVideoEngine
                        project={project}
                        onUpdate={updateProject}
                        onGenerate={generateVideo}
                        isProcessing={isProcessing}
                        onDownload={downloadVideo}
                        onSaveToLibrary={saveToLibrary}
                      />
                    </ErrorBoundary>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Preview & Controls */}
          <div className="lg:col-span-4 space-y-4 sm:space-y-6 mb-4 sm:mb-6 order-1 lg:order-2">
            {/* Real-time Preview */}
            <div className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden">
              <RealtimePreview 
                project={project}
                isProcessing={isProcessing}
                onStepChange={handleStepChange}
                onResetAvatar={handleResetAvatar}
                onDownload={downloadVideo}
                onSaveToLibrary={async (customTitle?: string) => {
                  if (customTitle) {
                    updateProject({ name: customTitle });
                    // Wait a tick for state to update
                    await new Promise(resolve => setTimeout(resolve, 100));
                  }
                  await saveToLibrary();
                  setIsVideoSaved(true);
                }}
                isSaved={isVideoSaved}
              />
            </div>
            {/* Processing Status */}
            {isProcessing && (
              <Card className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="font-medium">Processing</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Creating Video</span>
                      <span className="font-medium">{projectProgress}%</span>
                    </div>
                    <Progress value={projectProgress} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">Ultra-HD Processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">Neural Enhancement</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
