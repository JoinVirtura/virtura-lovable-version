import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';

interface Step {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface BottomStepNavigationProps {
  currentStep: string;
  steps: Step[];
  onStepChange: (stepId: string) => void;
  isProcessing?: boolean;
  getStepStatus?: (stepId: string) => string;
}

export const BottomStepNavigation: React.FC<BottomStepNavigationProps> = ({
  currentStep,
  steps,
  onStepChange,
  isProcessing = false,
  getStepStatus
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  const prevStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  
  const handleNavigation = (stepId: string) => {
    onStepChange(stepId);
    // Smooth scroll to top of new step content
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStepCompleted = (stepId: string) => {
    if (!getStepStatus) return false;
    const status = getStepStatus(stepId);
    return status === 'completed';
  };

  const canNavigateNext = () => {
    if (isProcessing) return false;
    // Allow navigation if current step is completed
    return isStepCompleted(currentStep);
  };

  return (
    <div className="relative z-50">
      <div className="pb-10">
        <div className="flex items-center justify-center gap-4 w-full">
          {/* Back Button */}
          <div className="flex-shrink-0">
            {prevStep ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleNavigation(prevStep.id)}
                disabled={isProcessing}
                className="h-12 px-3 sm:px-6 border-2 border-violet-500/30 hover:bg-violet-500/10 hover:border-violet-400 transition-all"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Back to {prevStep.title}</span>
                <span className="sm:hidden">Back</span>
              </Button>
            ) : (
              <div className="w-32" />
            )}
          </div>

          {/* Center: Progress Indicators */}
          <div className="flex items-center justify-center max-w-md mx-auto">
            <div className="flex items-center gap-3">
              {steps.map((step, index) => {
                const isActive = step.id === currentStep;
                const isCompleted = isStepCompleted(step.id);
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex items-center">
                    {/* Step Indicator */}
                    <button
                      onClick={() => handleNavigation(step.id)}
                      disabled={isProcessing}
                      className={`relative flex items-center justify-center transition-all ${
                        isActive 
                          ? 'w-12 h-12 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 animate-pulse shadow-[0_0_20px_rgba(139,92,246,0.5)]' 
                          : isCompleted
                          ? 'w-10 h-10 rounded-full bg-green-500 hover:scale-110'
                          : 'w-10 h-10 rounded-full bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      )}
                      
                      {/* Step Label */}
                      <span className={`absolute -bottom-6 whitespace-nowrap text-xs font-medium transition-colors ${
                        isActive ? 'text-violet-400' : isCompleted ? 'text-green-400' : 'text-gray-500'
                      }`}>
                        {step.title}
                      </span>
                    </button>

                    {/* Connecting Line */}
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-1 transition-colors ${
                        isStepCompleted(step.id) ? 'bg-green-500' : 'bg-gray-700'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Step Counter Text */}
            <div className="absolute -top-8 left-1/2 -translate-x-1/2">
              <Badge variant="secondary" className="bg-violet-500/20 text-violet-300 border-violet-500/30">
                Step {currentIndex + 1} of {steps.length}
              </Badge>
            </div>
          </div>

          {/* Continue/Finish Button */}
          <div className="flex-shrink-0">
            {nextStep ? (
              <Button
                size="lg"
                onClick={() => handleNavigation(nextStep.id)}
                disabled={!canNavigateNext() || isProcessing}
                className="h-12 px-4 sm:px-8 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 hover:scale-105 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="hidden sm:inline">Continue to {nextStep.title}</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="lg"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={isProcessing}
                className="h-12 px-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:scale-105 transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)]"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Finish Project</span>
                <span className="sm:hidden">Finish</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
