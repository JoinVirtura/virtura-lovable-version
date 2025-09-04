import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';
import { Job } from '@/features/talking-avatar/store';

interface TalkingAvatarWorkflowProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  job: Job | null;
  isProcessing: boolean;
  onNext: () => void;
  onPrevious: () => void;
  canProceed: boolean;
}

const WORKFLOW_STEPS = [
  { id: 1, title: 'Avatar Selection', description: 'Choose or upload your avatar image' },
  { id: 2, title: 'Voice Configuration', description: 'Select voice and generate audio' },
  { id: 3, title: 'Style & Effects', description: 'Configure visual style and effects' },
  { id: 4, title: 'Video Generation', description: 'Generate your talking avatar video' },
  { id: 5, title: 'Preview & Export', description: 'Review and export your video' },
];

const GENERATION_STEPS = [
  { key: 'voice', label: 'Voice Generation' },
  { key: 'lip-sync', label: 'Lip Synchronization' },
  { key: 'style', label: 'Style Application' },
  { key: 'render', label: 'Video Rendering' },
  { key: 'export', label: 'Final Export' },
];

export const TalkingAvatarWorkflow: React.FC<TalkingAvatarWorkflowProps> = ({
  currentStep,
  onStepChange,
  job,
  isProcessing,
  onNext,
  onPrevious,
  canProceed,
}) => {
  const getStepIcon = (stepId: number) => {
    if (stepId < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepId === currentStep) {
      return <Circle className="h-5 w-5 text-primary fill-primary" />;
    } else {
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getGenerationStepIcon = (stepKey: string) => {
    if (!job?.steps) return <Circle className="h-4 w-4 text-muted-foreground" />;
    
    const status = job.steps[stepKey];
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div 
                  className={`flex flex-col items-center cursor-pointer transition-all duration-200 ${
                    step.id <= currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => step.id <= currentStep && onStepChange(step.id)}
                >
                  {getStepIcon(step.id)}
                  <span className="text-xs mt-1 text-center max-w-16">{step.title}</span>
                </div>
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-2 ${
                    step.id < currentStep ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
          
          <div className="text-center">
            <h3 className="font-medium">{WORKFLOW_STEPS[currentStep - 1]?.title}</h3>
            <p className="text-sm text-muted-foreground">{WORKFLOW_STEPS[currentStep - 1]?.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Generation Progress (only show when processing) */}
      {job && (
        <Card>
          <CardHeader>
            <CardTitle>Generation Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{job.progress}%</span>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>
              
              <div className="space-y-2">
                {GENERATION_STEPS.map((step) => (
                  <div key={step.key} className="flex items-center gap-3">
                    {getGenerationStepIcon(step.key)}
                    <span className="text-sm">{step.label}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {job.steps?.[step.key] || 'pending'}
                    </span>
                  </div>
                ))}
              </div>

              {job.status === 'error' && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                  {job.logs?.[job.logs.length - 1] || 'An error occurred during generation'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={currentStep === 1 || isProcessing}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={onNext}
          disabled={!canProceed || isProcessing}
          className="flex items-center gap-2"
        >
          {currentStep === WORKFLOW_STEPS.length ? 'Complete' : 'Next'}
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};