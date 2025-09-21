import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Palette } from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface StyleTransferStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  isProcessing: boolean;
}

export const StyleTransferStudio: React.FC<StyleTransferStudioProps> = ({ project, onUpdate, isProcessing }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Palette className="h-5 w-5" />
        Style Transfer Studio
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Style transfer features coming soon...</p>
    </CardContent>
  </Card>
);