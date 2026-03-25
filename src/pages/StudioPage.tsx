import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Upload, 
  Play,
  Download,
  Share2,
  Settings,
  Zap,
  Film,
  Mic,
  Palette,
  Eye,
  CheckCircle,
  Loader2,
  Sparkles,
  Crown,
  Star,
  Wand2
} from 'lucide-react';

import { AvatarGenerationStudio } from '@/components/studio/AvatarGenerationStudio';
import { StyleTransferStudio } from '@/components/studio/StyleTransferStudio';
import { ProjectTimeline } from '@/components/studio/ProjectTimeline';
import { RealtimePreview } from '@/components/studio/RealtimePreview';
import { useStudioProject } from '@/hooks/useStudioProject';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { QualitySettings } from '@/components/studio/QualitySettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StyleOnboardingTutorial } from '@/components/studio/StyleOnboardingTutorial';

const STUDIO_STEPS = [
  { id: 'avatar', title: 'Avatar', icon: Upload, color: 'bg-blue-500' },
  { id: 'style', title: 'Style', icon: Palette, color: 'bg-purple-500' }
];

interface StudioPageProps {
  onViewChange?: (view: string) => void;
}

export default function StudioPage({ onViewChange }: StudioPageProps = {}) {
  const [currentStep, setCurrentStep] = useState('avatar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if user needs onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('styleOnboardingComplete');
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);
  
  const {
    project,
    updateProject,
    generateAvatar,
    projectProgress,
    qualityMetrics
  } = useStudioProject(false);

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
      } catch (error) {
        console.error('Failed to load selected avatar:', error);
      }
    }
  }, [updateProject]);

  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case 'avatar':
        return project.avatar?.status || 'pending';
      case 'style':
        return project.style?.status || 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-[#0F0F1A] via-[#1a1a2e] to-[#0F0F1A] relative overflow-hidden pb-8">
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <StyleOnboardingTutorial onComplete={() => setShowOnboarding(false)} />
      )}
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
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Centered Preview */}
          <div className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden">
            <RealtimePreview
              key={currentStep}
              project={project}
              isProcessing={isProcessing}
              onStepChange={handleStepChange}
              onResetAvatar={() => {
                updateProject({
                  avatar: undefined,
                  style: undefined
                });
                setCurrentStep('avatar');
              }}
              onDownloadStyle={async () => {
                const styledUrl = project.style?.resultUrl;
                if (!styledUrl) {
                  toast.error("No styled avatar available to download");
                  return;
                }

                try {
                  const response = await fetch(styledUrl);
                  if (!response.ok) throw new Error('Failed to fetch styled avatar');

                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = blobUrl;
                  link.download = `styled-avatar-${Date.now()}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
                  toast.success("Styled avatar downloaded successfully!");
                } catch (error: any) {
                  console.error('Download failed:', error);
                  toast.error(error.message || "Failed to download styled avatar");
                }
              }}
              onSendToVideoGen={() => {
                const imageUrl = project.style?.resultUrl || project.avatar?.processedUrl || project.avatar?.originalUrl;
                if (imageUrl) {
                  sessionStorage.setItem('veoSourceImage', JSON.stringify({
                    imageUrl,
                    title: project.name || 'From Photo Editor',
                  }));
                  if (onViewChange) {
                    onViewChange('video-gen');
                  }
                  toast.success('Image sent to Video Gen');
                }
              }}
            />
          </div>

          {/* Compact Upload / Style Section Below Preview */}
          <Card className="border-0 shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-hidden">
            <CardContent className="p-0">
              <Tabs value={currentStep} onValueChange={setCurrentStep}>
                <TabsContent value="avatar" className="p-4 sm:p-6">
                  <ErrorBoundary fallbackTitle="Avatar Generation Error" fallbackMessage="There was an issue with the avatar generation component.">
                    <AvatarGenerationStudio
                      project={project}
                      onUpdate={updateProject}
                      onGenerate={generateAvatar}
                      isProcessing={isProcessing}
                      onStepComplete={() => {
                        setCurrentStep('style');
                      }}
                    />
                  </ErrorBoundary>
                </TabsContent>

                <TabsContent value="style" className="p-4 sm:p-6">
                  <ErrorBoundary fallbackTitle="Style Transfer Error" fallbackMessage="There was an issue with the style transfer component.">
                    <StyleTransferStudio
                      project={project}
                      onUpdate={updateProject}
                      isProcessing={isProcessing}
                      currentStep={currentStep}
                      onStepChange={handleStepChange}
                    />
                  </ErrorBoundary>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Processing Status */}
          {isProcessing && (
            <Card className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl">
              <CardContent className="p-4 flex items-center gap-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{processingPhase || 'Processing...'}</span>
                    <span className="font-medium">{projectProgress}%</span>
                  </div>
                  <Progress value={projectProgress} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}