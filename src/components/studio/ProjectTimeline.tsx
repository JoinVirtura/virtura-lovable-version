import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface ProjectTimelineProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  currentStep: string;
}

export const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ project, onUpdate, currentStep }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4" />
        Timeline
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground">Timeline editor coming soon...</p>
    </CardContent>
  </Card>
);