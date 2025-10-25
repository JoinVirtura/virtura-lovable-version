import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
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
import { ExportDeliveryStudio } from '@/components/studio/ExportDeliveryStudio';
import { ProjectTimeline } from '@/components/studio/ProjectTimeline';
import { RealtimePreview } from '@/components/studio/RealtimePreview';
import { useStudioProject } from '@/hooks/useStudioProject';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { QualitySettings } from '@/components/studio/QualitySettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { BottomStepNavigation } from '@/components/studio/BottomStepNavigation';
import { useSidebar } from '@/components/ui/sidebar';

const VIDEO_PRO_STEPS = [
  { id: 'upload', title: 'Upload', icon: Upload, color: 'bg-blue-500' },
  { id: 'voice', title: 'Voice', icon: Mic, color: 'bg-green-500' },
  { id: 'video', title: 'Video', icon: Film, color: 'bg-orange-500' },
  { id: 'export', title: 'Export', icon: Download, color: 'bg-pink-500' }
];

export default function VideoProPage() {
  const [currentStep, setCurrentStep] = useState('upload');
  const [isProcessing, setIsProcessing] = useState(false);
  
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
  } = useStudioProject();

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
      case 'export':
        return project.export?.status || 'pending';
      default:
        return 'pending';
    }
  };

  return (
    <div className="w-full min-h-screen pb-32 bg-gradient-to-br from-[#0F0F1A] via-[#1a1a2e] to-[#0F0F1A] relative overflow-hidden">
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
      <div className="w-full px-6 py-6 mb-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Main Studio Panel */}
          <div className="lg:col-span-9 relative">
            <Card className="border-0 shadow-[0_8px_32px_rgba(0,0,0,0.3)] bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl overflow-visible">
              <CardContent className="p-6">
                <Tabs value={currentStep} onValueChange={setCurrentStep}>
                  <TabsContent value="upload" className="mt-0">
                    <ErrorBoundary>
                      <VideoUploadStudio
                        project={project}
                        onUpdate={updateProject}
                        isProcessing={isProcessing}
                        bottomNavigation={
                          <BottomStepNavigation
                            currentStep={currentStep}
                            steps={VIDEO_PRO_STEPS}
                            onStepChange={handleStepChange}
                            isProcessing={isProcessing}
                            getStepStatus={getStepStatus}
                          />
                        }
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="voice" className="mt-0">
                    <ErrorBoundary>
                      <PremiumVoiceEngine
                        project={project}
                        onUpdate={updateProject}
                        onGenerate={generateVideo}
                        isProcessing={isProcessing}
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
                      />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="export" className="mt-0">
                    <ErrorBoundary>
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
          <div className="lg:col-span-3 space-y-6 mb-6">
            {/* Real-time Preview */}
            <div className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl overflow-hidden">
              <RealtimePreview 
                project={project}
                isProcessing={isProcessing}
              />
            </div>

            {/* Project Timeline */}
            <div className="glass-card border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] rounded-xl">
              <ProjectTimeline
                project={project}
                onUpdate={updateProject}
                currentStep={currentStep}
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

            {/* Quick Actions */}
            <Card className="glass-card border border-violet-500/20 rounded-xl">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button size="sm" variant="ghost" className="h-12 flex-col gap-1 hover:bg-violet-500/10 hover:text-violet-300 transition-all">
                    <Play className="h-4 w-4" />
                    <span className="text-xs">Preview</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-12 flex-col gap-1 hover:bg-violet-500/10 hover:text-violet-300 transition-all">
                    <Share2 className="h-4 w-4" />
                    <span className="text-xs">Share</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-12 flex-col gap-1 hover:bg-violet-500/10 hover:text-violet-300 transition-all">
                    <Download className="h-4 w-4" />
                    <span className="text-xs">Export</span>
                  </Button>
                  <Button size="sm" variant="ghost" className="h-12 flex-col gap-1 hover:bg-violet-500/10 hover:text-violet-300 transition-all">
                    <Settings className="h-4 w-4" />
                    <span className="text-xs">Settings</span>
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
