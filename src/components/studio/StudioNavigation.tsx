import React from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

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
  <div className="flex items-center justify-center py-6">
    {/* Floating Navigation Container */}
    <div className="glass-card rounded-full px-3 py-2 border border-violet-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isActive = currentStep === step.id;
          const isCompleted = status === 'completed';
          
          return (
            <React.Fragment key={step.id}>
              <button
                onClick={() => onStepChange(step.id)}
                disabled={isProcessing}
                className={`
                  relative group flex items-center gap-2 px-4 py-2.5 rounded-full
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow-[0_0_20px_rgba(212,110,255,0.5)] scale-105' 
                    : 'bg-transparent text-gray-400 hover:text-violet-300 hover:bg-violet-500/10'
                  }
                  ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                {/* Icon with glow */}
                <step.icon className={`h-4 w-4 transition-all ${isActive ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]' : ''}`} />
                
                {/* Title */}
                <span className="text-sm font-medium">{step.title}</span>
                
                {/* Status Indicators */}
                {isCompleted && !isActive && (
                  <CheckCircle className="h-3.5 w-3.5 text-green-400 drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]" />
                )}
                {status === 'processing' && (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-300" />
                )}
                
                {/* Active Glow Effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/20 to-blue-500/20 blur-xl animate-pulse" />
                )}
              </button>
              
              {/* Connector Dots (not lines) */}
              {index < steps.length - 1 && (
                <div className="flex gap-1">
                  <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-violet-400' : 'bg-gray-700'}`} />
                  <div className={`w-1 h-1 rounded-full ${isCompleted ? 'bg-violet-400' : 'bg-gray-700'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  </div>
);