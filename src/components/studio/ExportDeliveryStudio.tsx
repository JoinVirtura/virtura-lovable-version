import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import type { StudioProject } from '@/hooks/useStudioProject';

interface ExportDeliveryStudioProps {
  project: StudioProject;
  onUpdate: (updates: Partial<StudioProject>) => void;
  onExport: (config: any) => Promise<void>;
  isProcessing: boolean;
}

export const ExportDeliveryStudio: React.FC<ExportDeliveryStudioProps> = ({ project, onUpdate, onExport, isProcessing }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Download className="h-5 w-5" />
        Export & Delivery
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground">Export features coming soon...</p>
    </CardContent>
  </Card>
);