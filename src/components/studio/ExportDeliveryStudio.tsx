import React from 'react';
import { ExportContent } from './ExportContent';
import type { StudioProject } from '@/hooks/useStudioProject';

interface ExportDeliveryStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onExport: (config: any) => Promise<void>;
  isProcessing: boolean;
}

export const ExportDeliveryStudio: React.FC<ExportDeliveryStudioProps> = ({
  project,
  onUpdate,
  onExport,
  isProcessing
}) => (
  <ExportContent
    project={project}
    onExport={onExport}
    isProcessing={isProcessing}
  />
);