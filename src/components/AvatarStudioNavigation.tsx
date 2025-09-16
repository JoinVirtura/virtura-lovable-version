import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Mic, 
  Palette, 
  Video, 
  Eye,
  CheckCircle
} from 'lucide-react';

interface AvatarStudioNavigationProps {
  currentStep: number;
  onNext: () => void;
  onPrevious: () => void;
  onStepChange: (step: number) => void;
  canProceed: boolean;
  isProcessing: boolean;
  avatarData: any;
  generatedAudio: string | null;
  generatedVideo: string | null;
}

const WORKFLOW_STEPS = [
  { id: 1, title: 'Avatar Selection', shortTitle: 'Avatar', icon: User },
  { id: 2, title: 'Voice Configuration', shortTitle: 'Voice', icon: Mic },
  { id: 3, title: 'Style & Effects', shortTitle: 'Style', icon: Palette },
  { id: 4, title: 'Video Generation', shortTitle: 'Video', icon: Video },
  { id: 5, title: 'Preview & Export', shortTitle: 'Export', icon: Eye },
];

export const AvatarStudioNavigation: React.FC<AvatarStudioNavigationProps> = ({
  currentStep,
  onNext,
  onPrevious,
  onStepChange,
  canProceed,
  isProcessing,
  avatarData,
  generatedAudio,
  generatedVideo,
}) => {
  const isStepComplete = (stepId: number) => {
    switch (stepId) {
      case 1: return !!avatarData;
      case 2: return !!generatedAudio;
      case 3: return currentStep > 3;
      case 4: return !!generatedVideo;
      case 5: return !!generatedVideo;
      default: return false;
    }
  };

  const getStepStatus = (stepId: number) => {
    if (isStepComplete(stepId)) return 'complete';
    if (stepId === currentStep) return 'current';
    if (stepId < currentStep) return 'accessible';
    return 'disabled';
  };

  return (
    <div className="bg-background border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Previous Button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStep === 1 || isProcessing}
            className="flex items-center gap-2 min-w-24"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Step Navigation */}
          <div className="flex items-center gap-2">
            {WORKFLOW_STEPS.map((step, index) => {
              const status = getStepStatus(step.id);
              const StepIcon = step.icon;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    className={`
                      relative flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${status === 'current' 
                        ? 'bg-primary text-primary-foreground shadow-md' 
                        : status === 'complete'
                        ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                        : status === 'accessible'
                        ? 'bg-muted hover:bg-muted/80 text-foreground'
                        : 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                      }
                    `}
                    onClick={() => {
                      if (status === 'accessible' || status === 'current' || status === 'complete') {
                        onStepChange(step.id);
                      }
                    }}
                    disabled={status === 'disabled' || isProcessing}
                  >
                    <div className="flex items-center gap-2">
                      {status === 'complete' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <StepIcon className="h-4 w-4" />
                      )}
                      <span className="hidden sm:inline font-medium">
                        {step.shortTitle}
                        {status === 'current' && (
                          <span className="ml-1 text-xs opacity-80">
                            - Step {step.id} of {WORKFLOW_STEPS.length}
                          </span>
                        )}
                      </span>
                    </div>
                  </button>
                  
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <div className={`
                      w-8 h-0.5 transition-colors duration-200
                      ${step.id < currentStep ? 'bg-green-500' : 'bg-muted'}
                    `} />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            onClick={onNext}
            disabled={!canProceed || isProcessing}
            className="flex items-center gap-2 min-w-24"
          >
            {currentStep === WORKFLOW_STEPS.length ? (
              <>
                Complete
                <CheckCircle className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Current Step Title */}
        <div className="mt-4 text-center">
          <h2 className="text-xl font-semibold text-primary">
            {WORKFLOW_STEPS[currentStep - 1]?.title}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Configure your talking avatar step by step
          </p>
        </div>
      </div>
    </div>
  );
};