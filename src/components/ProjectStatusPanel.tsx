import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  Library, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  User,
  Mic,
  Video,
  Palette,
  Eye
} from 'lucide-react';
import { Job } from '@/features/talking-avatar/store';

interface ProjectStatusPanelProps {
  currentStep: number;
  job: Job | null;
  isProcessing: boolean;
  avatarData: any;
  generatedAudio: string | null;
  generatedVideo: string | null;
  voice: any;
  style: any;
  exports: any;
  onLibraryOpen: () => void;
  onReset: () => void;
}

const WORKFLOW_STEPS = [
  { id: 1, title: 'Avatar', icon: User },
  { id: 2, title: 'Audio', icon: Mic },
  { id: 3, title: 'Style', icon: Palette },
  { id: 4, title: 'Video', icon: Video },
  { id: 5, title: 'Export', icon: Eye },
];

export const ProjectStatusPanel: React.FC<ProjectStatusPanelProps> = ({
  currentStep,
  job,
  isProcessing,
  avatarData,
  generatedAudio,
  generatedVideo,
  voice,
  style,
  exports,
  onLibraryOpen,
  onReset,
}) => {
  const getStepStatus = (stepId: number) => {
    if (stepId === 1) {
      return avatarData ? 'Ready' : 'Pending';
    } else if (stepId === 2) {
      return generatedAudio ? 'Generated' : 'Pending';
    } else if (stepId === 3) {
      return currentStep >= 3 ? 'Configured' : 'Pending';
    } else if (stepId === 4) {
      if (isProcessing && currentStep === 4) return 'Generating';
      return generatedVideo ? 'Generated' : 'Pending';
    } else if (stepId === 5) {
      return generatedVideo ? 'Ready' : 'Pending';
    }
    return 'Pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ready':
      case 'Generated':
      case 'Configured':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'Generating':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30 animate-pulse';
      default:
        return 'bg-muted text-muted-foreground border-muted';
    }
  };

  const getStepIcon = (stepId: number) => {
    const StepIcon = WORKFLOW_STEPS[stepId - 1]?.icon;
    const status = getStepStatus(stepId);
    
    if (status === 'Ready' || status === 'Generated' || status === 'Configured') {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (status === 'Generating') {
      return <Clock className="h-4 w-4 text-yellow-500 animate-spin" />;
    } else if (stepId === currentStep) {
      return <StepIcon className="h-4 w-4 text-primary" />;
    } else {
      return <StepIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Project Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Progress */}
        <div className="space-y-3">
          {WORKFLOW_STEPS.map((step) => {
            const status = getStepStatus(step.id);
            return (
              <div key={step.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStepIcon(step.id)}
                  <span className="font-medium">{step.title}</span>
                </div>
                <Badge className={getStatusColor(status)} variant="outline">
                  {status}
                </Badge>
              </div>
            );
          })}
        </div>

        {/* Generation Progress */}
        {job && isProcessing && (
          <div className="space-y-3 p-3 bg-primary/5 rounded-lg border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Generation Progress</span>
              <span className="text-sm text-muted-foreground">{job.progress}%</span>
            </div>
            <Progress value={job.progress} className="h-2" />
            
            {job.steps && (
              <div className="space-y-2">
                {Object.entries(job.steps).map(([stepKey, status]) => (
                  <div key={stepKey} className="flex items-center justify-between text-xs">
                    <span className="capitalize">{stepKey.replace('-', ' ')}</span>
                    <div className="flex items-center gap-1">
                      {status === 'done' && <CheckCircle className="h-3 w-3 text-green-500" />}
                      {status === 'running' && <Clock className="h-3 w-3 text-yellow-500 animate-spin" />}
                      {status === 'error' && <AlertCircle className="h-3 w-3 text-red-500" />}
                      <span className={`
                        ${status === 'done' ? 'text-green-600' : ''}
                        ${status === 'running' ? 'text-yellow-600' : ''}
                        ${status === 'error' ? 'text-red-600' : ''}
                        ${!status || status === 'pending' ? 'text-muted-foreground' : ''}
                      `}>
                        {status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {job.logs && job.logs.length > 0 && (
              <div className="max-h-20 overflow-y-auto">
                <p className="text-xs text-muted-foreground">
                  {job.logs[job.logs.length - 1]}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Current Settings</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Voice:</span>
              <span>{voice?.voiceId === '9BWtsMINqrJLrRacOk9x' ? 'Aria' : 'Custom'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Style:</span>
              <span className="capitalize">{style?.preset || 'professional'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quality:</span>
              <span>{exports?.quality || '1080p'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ratio:</span>
              <span>{exports?.aspectRatio || '16:9'}</span>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-3">
          <h4 className="font-medium">Quick Actions</h4>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onLibraryOpen}
            >
              <Library className="h-4 w-4 mr-2" />
              Browse Library
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Project
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};