import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { PremiumVoiceEngine } from '@/components/studio/PremiumVoiceEngine';
import { RealVideoEngine } from '@/components/studio/RealVideoEngine';
import { StyleTransferStudio } from '@/components/studio/StyleTransferStudio';
import { ExportDeliveryStudio } from '@/components/studio/ExportDeliveryStudio';
import { ProjectTimeline } from '@/components/studio/ProjectTimeline';
import { RealtimePreview } from '@/components/studio/RealtimePreview';
import { useStudioProject } from '@/hooks/useStudioProject';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { QualitySettings } from '@/components/studio/QualitySettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';

const STUDIO_STEPS = [
  { id: 'avatar', title: 'Avatar', icon: Upload, color: 'bg-blue-500' },
  { id: 'style', title: 'Style', icon: Palette, color: 'bg-purple-500' },
  { id: 'voice', title: 'Voice', icon: Mic, color: 'bg-green-500' },
  { id: 'video', title: 'Video', icon: Film, color: 'bg-orange-500' },
  { id: 'export', title: 'Export', icon: Download, color: 'bg-pink-500' }
];

export default function StudioPage() {
  const [currentStep, setCurrentStep] = useState('avatar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string>('');
  
  const {
    project,
    updateProject,
    generateAvatar,
    generateVoice,
    generateVideo,
    exportProject,
    projectProgress,
    qualityMetrics
  } = useStudioProject();

  const handleStepChange = (stepId: string) => {
    setCurrentStep(stepId);
  };

  const getStepStatus = (stepId: string) => {
    switch (stepId) {
      case 'avatar':
        return project.avatar?.status || 'pending';
      case 'voice':
        return project.voice?.status || 'pending';
      case 'style':
        return project.style?.status || 'pending';
      case 'video':
        return project.video?.status || 'pending';
      case 'export':
        return project.export?.status || 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20">
      {/* Hero Header */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Sparkles className="h-8 w-8 text-primary" />
                    <div className="absolute -top-1 -right-1">
                      <Crown className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold">
                    <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      AI Studio Pro
                    </span>
                  </h1>
                </div>
                <Badge variant="secondary" className="text-xs font-semibold">
                  <Star className="h-3 w-3 mr-1" />
                  Ultra-HD
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Professional AI media creation • 47+ Art Styles • 20 Premium Voices • Real Video Synthesis
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">Project Quality</div>
                <div className="flex items-center gap-2">
                  <Progress value={qualityMetrics.overall} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">
                    {qualityMetrics.overall}%
                  </span>
                </div>
              </div>
              
              <QualitySettings 
                settings={project.qualitySettings}
                onUpdate={(settings) => updateProject({ qualitySettings: settings })}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Studio Navigation */}
      <div className="border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6">
          <StudioNavigation
            steps={STUDIO_STEPS}
            currentStep={currentStep}
            onStepChange={handleStepChange}
            getStepStatus={getStepStatus}
            isProcessing={isProcessing}
          />
        </div>
      </div>

      {/* Main Studio Interface */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Studio Panel */}
          <div className="lg:col-span-8">
            <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Tabs value={currentStep} onValueChange={setCurrentStep}>
                  <TabsContent value="avatar" className="p-6 space-y-6">
                    <ErrorBoundary fallbackTitle="Avatar Generation Error" fallbackMessage="There was an issue with the avatar generation component.">
                      <AvatarGenerationStudio
                        project={project}
                        onUpdate={updateProject}
                        onGenerate={generateAvatar}
                        isProcessing={isProcessing}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="voice" className="p-6 space-y-6">
                    <ErrorBoundary fallbackTitle="Premium Voice Engine Error" fallbackMessage="There was an issue with the premium voice generation component.">
                      <PremiumVoiceEngine
                        project={project}
                        onUpdate={updateProject}
                        onGenerate={generateVoice}
                        isProcessing={isProcessing}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="style" className="p-6 space-y-6">
                    <ErrorBoundary fallbackTitle="Style Transfer Error" fallbackMessage="There was an issue with the style transfer component.">
                      <StyleTransferStudio
                        project={project}
                        onUpdate={updateProject}
                        isProcessing={isProcessing}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="video" className="p-6 space-y-6">
                    <ErrorBoundary fallbackTitle="Real Video Engine Error" fallbackMessage="There was an issue with the real video generation component.">
                      <RealVideoEngine
                        project={project}
                        onUpdate={updateProject}
                        onGenerate={generateVideo}
                        isProcessing={isProcessing}
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="export" className="p-6 space-y-6">
                    <ErrorBoundary fallbackTitle="Export Studio Error" fallbackMessage="There was an issue with the export component.">
                      <ExportDeliveryStudio
                        project={project}
                        onUpdate={updateProject}
                        onExport={exportProject}
                        isProcessing={isProcessing}
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
              <RealtimePreview 
                project={project}
                isProcessing={isProcessing}
              />

            {/* Project Timeline */}
            <ProjectTimeline
              project={project}
              onUpdate={updateProject}
              currentStep={currentStep}
            />

            {/* Processing Status */}
            {isProcessing && (
              <Card className="border-0 shadow-lg bg-card/90 backdrop-blur-sm">
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

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-card/90 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" className="h-8">
                    <Play className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline" className="h-8">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                  <Button size="sm" variant="outline" className="h-8">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button size="sm" variant="outline" className="h-8">
                    <Settings className="h-3 w-3 mr-1" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}