import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';

interface StudioNavigationProps {
  steps: Array<{ id: string; title: string; icon: any; color: string }>;
  currentStep: string;
  onStepChange: (stepId: string) => void;
  getStepStatus: (stepId: string) => string;
  isProcessing: boolean;
}

export const StudioNavigation: React.FC<StudioNavigationProps> = ({
  steps,
  currentStep,
  onStepChange,
  getStepStatus,
  isProcessing
}) => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isActive = currentStep === step.id;
        const isCompleted = status === 'completed';
        
        return (
          <React.Fragment key={step.id}>
            <Button
              variant={isActive ? "default" : "outline"}
              size="sm"
              onClick={() => onStepChange(step.id)}
              className="h-10 px-4"
              disabled={isProcessing}
            >
              <step.icon className="h-4 w-4 mr-2" />
              {step.title}
              {isCompleted && <CheckCircle className="h-3 w-3 ml-2 text-green-500" />}
              {status === 'processing' && <Loader2 className="h-3 w-3 ml-2 animate-spin" />}
            </Button>
            {index < steps.length - 1 && (
              <div className="w-8 h-px bg-border"></div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  </div>
);