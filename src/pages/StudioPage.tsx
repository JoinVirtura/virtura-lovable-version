import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CircularProgress } from '@/components/ui/circular-progress';
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
import { StyleTransferStudio } from '@/components/studio/StyleTransferStudio';
import { ProjectTimeline } from '@/components/studio/ProjectTimeline';
import { RealtimePreview } from '@/components/studio/RealtimePreview';
import { useStudioProject } from '@/hooks/useStudioProject';
import { StudioNavigation } from '@/components/studio/StudioNavigation';
import { QualitySettings } from '@/components/studio/QualitySettings';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Alert, AlertDescription } from '@/components/ui/alert';

const STUDIO_STEPS = [
  { id: 'avatar', title: 'Avatar', icon: Upload, color: 'bg-blue-500' },
  { id: 'style', title: 'Style', icon: Palette, color: 'bg-purple-500' }
];

export default function StudioPage() {
  const [currentStep, setCurrentStep] = useState('avatar');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPhase, setProcessingPhase] = useState<string>('');
  
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

      {/* Revolutionary Command Bridge Header */}
      <div className="relative overflow-hidden">
        {/* Animated Gradient Mesh Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-cyan-600/10 animate-gradient-flow" />
        
        {/* Particle Network Background */}
        <div className="absolute inset-0 opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-violet-400/40 animate-float"
              style={{
                width: `${Math.random() * 3 + 1}px`,
                height: `${Math.random() * 3 + 1}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${8 + Math.random() * 4}s`,
              }}
            />
          ))}
        </div>
        
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          {/* Holographic Title Section */}
          <div className="text-center mb-10">
            <div className="relative inline-block">
              {/* Pulsing Energy Rings */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute inset-0 rounded-full border-2 border-violet-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }} />
              </div>
              
              {/* 3D Holographic Title */}
              <h1 className="relative text-5xl font-bold mb-2"
                  style={{
                    textShadow: `
                      0 0 20px rgba(168, 85, 247, 0.8),
                      0 0 40px rgba(168, 85, 247, 0.5),
                      0 2px 0 rgba(168, 85, 247, 0.3),
                      0 4px 0 rgba(139, 92, 246, 0.2),
                      0 6px 0 rgba(124, 58, 237, 0.1),
                      0 8px 10px rgba(0, 0, 0, 0.3)
                    `,
                    backgroundImage: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}>
                Style Transfer Studio
              </h1>
              
              {/* Animated Scan Lines */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-violet-400/50 to-transparent animate-scan-vertical-1" />
              </div>
              
              {/* Holographic Badge */}
              <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 backdrop-blur-xl border border-violet-500/30 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
                <span className="text-sm font-medium text-violet-300">Neural Style Engine Active</span>
              </div>
            </div>
          </div>
          
          {/* Floating Islands Layout */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            {/* Island 1: Reactor Core Quality Meter */}
            <div className="relative group">
              {/* Connection Line to next island */}
              <svg className="absolute left-full top-1/2 w-16 h-1 -translate-y-1/2 pointer-events-none hidden lg:block" style={{ zIndex: 0 }}>
                <line x1="0" y1="0" x2="64" y2="0" stroke="url(#line-gradient)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                <defs>
                  <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="glass-card p-6 rounded-2xl border border-violet-500/30 shadow-[0_8px_32px_rgba(168,85,247,0.2)] backdrop-blur-xl hover:shadow-[0_12px_48px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex flex-col items-center gap-3">
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Avatar Quality</div>
                  <CircularProgress 
                    value={qualityMetrics.avatar} 
                    size={80} 
                    strokeWidth={6}
                    className="text-violet-400"
                  />
                  <QualitySettings 
                    settings={project.qualitySettings}
                    onUpdate={(settings) => updateProject({ qualitySettings: settings })}
                  />
                </div>
              </div>
            </div>
            
            {/* Island 2: Neural Pathway Navigation */}
            <div className="relative group">
              {/* Connection Line to next island */}
              <svg className="absolute left-full top-1/2 w-16 h-1 -translate-y-1/2 pointer-events-none hidden lg:block" style={{ zIndex: 0 }}>
                <line x1="0" y1="0" x2="64" y2="0" stroke="url(#line-gradient-2)" strokeWidth="2" strokeDasharray="4 4" className="animate-pulse" />
                <defs>
                  <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgba(168, 85, 247, 0.5)" />
                    <stop offset="100%" stopColor="rgba(168, 85, 247, 0.1)" />
                  </linearGradient>
                </defs>
              </svg>
              
              <div className="glass-card p-6 rounded-2xl border border-violet-500/30 shadow-[0_8px_32px_rgba(168,85,247,0.2)] backdrop-blur-xl hover:shadow-[0_12px_48px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-6">
                  {STUDIO_STEPS.map((step, index) => (
                    <div key={step.id} className="relative flex flex-col items-center gap-2">
                      {/* Node */}
                      <button
                        onClick={() => handleStepChange(step.id as any)}
                        disabled={isProcessing}
                        className={`relative w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          currentStep === step.id
                            ? 'bg-violet-500/20 border-violet-400 shadow-[0_0_24px_rgba(168,85,247,0.8)] scale-110'
                            : getStepStatus(step.id) === 'completed'
                            ? 'bg-green-500/10 border-green-400/50 hover:shadow-[0_0_16px_rgba(34,197,94,0.6)]'
                            : 'bg-gray-800/50 border-gray-600 hover:border-violet-500/50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <step.icon className={`h-6 w-6 ${
                          currentStep === step.id
                            ? 'text-violet-300'
                            : getStepStatus(step.id) === 'completed'
                            ? 'text-green-400'
                            : 'text-gray-400'
                        }`} />
                        
                        {/* Pulse effect for active */}
                        {currentStep === step.id && (
                          <div className="absolute inset-0 rounded-full border-2 border-violet-400 animate-ping" />
                        )}
                      </button>
                      
                      {/* Label */}
                      <span className={`text-xs font-medium whitespace-nowrap ${
                        currentStep === step.id ? 'text-violet-300' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </span>
                      
                      {/* Connection to next node */}
                      {index < STUDIO_STEPS.length - 1 && (
                        <div className="absolute left-full top-7 w-6 h-0.5 bg-gradient-to-r from-violet-500/50 to-transparent" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Island 3: Status Command Center */}
            <div className="relative">
              <div className="glass-card p-6 rounded-2xl border border-violet-500/30 shadow-[0_8px_32px_rgba(168,85,247,0.2)] backdrop-blur-xl hover:shadow-[0_12px_48px_rgba(168,85,247,0.4)] hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Sparkles className="h-8 w-8 text-violet-400 animate-pulse" />
                    <div className="absolute inset-0 bg-violet-400 rounded-full blur-xl opacity-50 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">System Status</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                      <span className="text-sm font-bold text-green-400">Online & Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Animated Energy Flow Bottom Border */}
        <div className="absolute bottom-0 left-0 right-0 h-px">
          <div className="h-full w-full bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-pulse" style={{ animationDuration: '2s' }} />
        </div>
      </div>

      {/* Main Studio Interface */}
      <div className="max-w-7xl mx-auto px-6 py-6">
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