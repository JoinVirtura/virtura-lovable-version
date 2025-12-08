import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles, Upload, Mic, Film, Share2, Play } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Video Studio!',
    description: 'Create AI-powered talking videos with realistic lip-sync and voice synthesis. Let\'s get started!',
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: 'upload',
    title: 'Upload Your Image',
    description: 'Start by uploading a portrait image or selecting one from your library. Clear, front-facing photos work best!',
    icon: <Upload className="h-8 w-8" />,
  },
  {
    id: 'voice',
    title: 'Generate Voice',
    description: 'Choose from multiple AI voices or clone your own! Enter your script and our AI will generate natural-sounding speech.',
    icon: <Mic className="h-8 w-8" />,
  },
  {
    id: 'video',
    title: 'Create Your Video',
    description: 'Our AI will animate your image with realistic lip-sync matching your voice. Adjust quality settings for the perfect result.',
    icon: <Film className="h-8 w-8" />,
  },
  {
    id: 'export',
    title: 'Export & Share',
    description: 'Download your video in HD quality or save it directly to your library. Share your creation with the world!',
    icon: <Share2 className="h-8 w-8" />,
  },
];

interface VideoOnboardingTutorialProps {
  onComplete: () => void;
}

export function VideoOnboardingTutorial({ onComplete }: VideoOnboardingTutorialProps) {
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
    localStorage.setItem('videoOnboardingComplete', 'true');
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
            <div className="bg-gradient-to-br from-card via-card to-muted border border-white/10 rounded-2xl p-8 shadow-[0_0_60px_hsl(200_100%_50%/0.2)] relative overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-cyan-500/5 to-green-500/5 opacity-50" />
              
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="relative mb-6 flex justify-center"
              >
                <div className="p-4 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/10">
                  <div className="text-blue-400">
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
                        ? 'w-8 bg-gradient-to-r from-blue-500 to-cyan-500' 
                        : index < currentStep
                        ? 'w-2 bg-blue-500/50'
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
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      Get Started
                      <Play className="h-4 w-4 ml-1" />
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
