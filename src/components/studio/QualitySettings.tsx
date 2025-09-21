import React from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

interface QualitySettingsProps {
  settings: any;
  onUpdate: (settings: any) => void;
}

export const QualitySettings: React.FC<QualitySettingsProps> = ({ settings, onUpdate }) => (
  <Button variant="outline" size="sm">
    <Settings className="h-4 w-4 mr-2" />
    Quality
  </Button>
);