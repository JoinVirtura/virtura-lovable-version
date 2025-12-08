import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles, Upload, Palette, Sliders, Download, Wand2 } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Style Studio!',
    description: 'Transform your images with AI-powered artistic styles. Create stunning artwork in seconds!',
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: 'upload',
    title: 'Upload or Generate',
    description: 'Start by uploading your own image or generate a new AI avatar. You can also select from your library!',
    icon: <Upload className="h-8 w-8" />,
  },
  {
    id: 'styles',
    title: 'Choose Your Style',
    description: 'Browse 27+ artistic styles including Oil Painting, Cyberpunk, Watercolor, Anime, and more. Each style transforms your image uniquely!',
    icon: <Palette className="h-8 w-8" />,
  },
  {
    id: 'settings',
    title: 'Fine-Tune Settings',
    description: 'Adjust style strength, face preservation, and enhancement options to get the perfect result.',
    icon: <Sliders className="h-8 w-8" />,
  },
  {
    id: 'apply',
    title: 'Apply & Download',
    description: 'Apply the style transfer and download your masterpiece. Save it to your library for future use!',
    icon: <Download className="h-8 w-8" />,
  },
];

interface StyleOnboardingTutorialProps {
  onComplete: () => void;
}

export function StyleOnboardingTutorial({ onComplete }: StyleOnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsVisible(false);
    localStorage.setItem('styleOnboardingComplete', 'true');
    setTimeout(onComplete, 300);
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = tutorialSteps[currentStep];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          {/* Skip Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
          >
            Skip <X className="h-4 w-4 ml-1" />
          </Button>

          {/* Tutorial Card */}
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="max-w-md w-full"
          >
            <div className="bg-gradient-to-br from-card via-card to-muted border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_hsl(270_100%_70%/0.2)] relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-purple-500/5 to-pink-500/5 opacity-50" />
              
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="relative mb-6 flex justify-center"
              >
                <div className="p-4 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-white/10">
                  <div className="text-violet-400">
                    {step.icon}
                  </div>
                </div>
              </motion.div>

              {/* Content */}
              <div className="text-center relative">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                >
                  {step.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-muted-foreground leading-relaxed"
                >
                  {step.description}
                </motion.p>
              </div>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 mt-8 mb-6">
                {tutorialSteps.map((_, index) => (
                  <motion.div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'w-8 bg-gradient-to-r from-violet-500 to-purple-500' 
                        : index < currentStep
                        ? 'w-2 bg-violet-500/50'
                        : 'w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>

              {/* Navigation */}
              <div className="flex gap-3 relative">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex-1 border-white/10 hover:bg-white/5 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      Get Started
                      <Wand2 className="h-4 w-4 ml-1" />
                    </>
                  ) : (
                    <>
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
