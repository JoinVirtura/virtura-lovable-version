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

export default function StudioPage() {
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
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Studio Panel */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-hidden">
              <CardContent className="p-0">
                <Tabs value={currentStep} onValueChange={setCurrentStep}>
                  <TabsContent value="avatar" className="p-6 space-y-6">
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

                  <TabsContent value="style" className="p-6 space-y-6">
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
          </div>

          {/* Sidebar - Preview & Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Real-time Preview */}
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

                  console.log('📥 Starting styled avatar download:', styledUrl);

                  try {
                    const response = await fetch(styledUrl);
                    if (!response.ok) throw new Error('Failed to fetch styled avatar');

                    const blob = await response.blob();
                    console.log('✅ Avatar blob created:', blob.size, 'bytes');

                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = `styled-avatar-${Date.now()}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);

                    toast.success("Styled avatar downloaded successfully!");
                    console.log('✅ Styled avatar download complete');
                  } catch (error: any) {
                    console.error('❌ Download failed:', error);
                    toast.error(error.message || "Failed to download styled avatar");
                  }
                }}
              />
            </div>

            {/* Processing Status */}
            {isProcessing && (
              <Card className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    Processing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{processingPhase}</span>
                      <span className="font-medium">{projectProgress}%</span>
                    </div>
                    <Progress value={projectProgress} className="h-2" />
                  </div>
                  
                  {/* Enhanced processing indicators */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">Ultra-HD Processing</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">Neural Enhancement</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">Cinematic Effects</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions - Disabled for now */}
            {/* <Card className="glass-card border border-violet-500/20 rounded-xl">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground text-center">Quick actions coming soon...</p>
              </CardContent>
            </Card> */}
          </div>
        </div>
      </div>
    </div>
  );
}