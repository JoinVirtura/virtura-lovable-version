import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      title: 'Avatar',
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          Project Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                step.status === 'completed' ? 'bg-green-500' :
                step.status === 'processing' ? 'bg-blue-500 animate-pulse' :
                step.status === 'error' ? 'bg-red-500' :
                'bg-gray-500'
              }`} />
              <span className={currentStep === step.id ? 'text-primary font-medium' : 'text-muted-foreground'}>
                {step.title}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{step.time}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};