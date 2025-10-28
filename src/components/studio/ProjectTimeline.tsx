import React from 'react';
import { Clock } from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface ProjectTimelineProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  currentStep: string;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, onUpdate, currentStep }) => {
  const steps = [
    {
      id: 'avatar',
      title: 'Avatar Generation',
      status: project.avatar?.status || 'pending',
      time: project.avatar?.metadata?.processingTime || '—'
    },
    {
      id: 'style',
      title: 'Style Transfer',
      status: project.style?.status || 'pending',
      time: project.style?.metadata?.processingTime || '—'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.5)]';
      case 'processing':
        return 'bg-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)] animate-pulse';
      case 'error':
        return 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)]';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusBorder = (status: string, isActive: boolean) => {
    if (isActive) return 'border-violet-500/50';
    switch (status) {
      case 'completed':
        return 'border-green-500/30';
      case 'processing':
        return 'border-violet-500/30';
      case 'error':
        return 'border-red-500/30';
      default:
        return 'border-gray-700/30';
    }
  };

  return (
    <div className="glass-card rounded-2xl border border-violet-500/20 backdrop-blur-xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Clock className="h-5 w-5 text-violet-400" />
          <div className="absolute inset-0 blur-md bg-violet-400/30" />
        </div>
        <h3 className="text-lg font-semibold text-white">Project Timeline</h3>
      </div>

      {/* Timeline */}
      <div className="relative space-y-5">
        {/* Connecting vertical line */}
        <div className="absolute left-2.5 top-8 bottom-8 w-px bg-gradient-to-b from-violet-500/20 via-violet-500/40 to-violet-500/20" />

        {steps.map((step, index) => {
          const isActive = currentStep === step.id;
          const isLastStep = index === steps.length - 1;

          return (
            <div 
              key={step.id} 
              className={`relative transition-all duration-300 ${
                isActive ? 'scale-[1.02]' : ''
              }`}
            >
              {/* Step container */}
              <div className={`flex items-center gap-4 p-3 rounded-lg border ${
                getStatusBorder(step.status, isActive)
              } ${
                isActive ? 'bg-violet-500/5' : 'bg-black/20'
              } transition-all duration-300`}>
                {/* Status indicator */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={`w-5 h-5 rounded-full ${getStatusColor(step.status)} transition-all duration-300`} />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent" />
                </div>

                {/* Step info */}
                <div className="flex-1 flex items-center justify-between min-w-0">
                  <span className={`font-medium truncate transition-colors duration-300 ${
                    isActive 
                      ? 'text-violet-300' 
                      : step.status === 'completed'
                      ? 'text-green-400'
                      : step.status === 'processing'
                      ? 'text-violet-400'
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </span>
                  <span className={`text-xs font-mono ml-3 flex-shrink-0 ${
                    step.time === '—' ? 'text-gray-600' : 'text-gray-400'
                  }`}>
                    {step.time}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer info */}
      <div className="mt-6 pt-4 border-t border-violet-500/10">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Steps: {steps.filter(s => s.status === 'completed').length}/{steps.length}</span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            Live tracking
          </span>
        </div>
      </div>
    </div>
  );
};