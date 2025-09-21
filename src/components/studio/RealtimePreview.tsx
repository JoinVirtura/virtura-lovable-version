import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye } from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface RealtimePreviewProps {
  project: StudioProject;
  currentStep: string;
  isProcessing: boolean;
  processingPhase: string;
}

export const RealtimePreview: React.FC<RealtimePreviewProps> = ({ project, currentStep, isProcessing, processingPhase }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-sm">
        <Eye className="h-4 w-4" />
        Live Preview
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="aspect-video bg-muted/20 rounded border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Preview will appear here</p>
      </div>
    </CardContent>
  </Card>
);