import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, ChevronRight, ChevronLeft, Sparkles, Eye, MessageCircle, Heart, Plus, Lock } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  spotlightSelector?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Virtura Feed!',
    description: 'Discover amazing content from creators around the world. Let\'s show you around!',
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: 'stories',
    title: 'Stories',
    description: 'Tap on story circles to view ephemeral content from creators you follow. Stories disappear after 24 hours!',
    icon: <Eye className="h-8 w-8" />,
  },
  {
    id: 'filters',
    title: 'Filter Your Feed',
    description: 'Switch between "For You" personalized recommendations, "Following" to see posts from people you follow, and "Trending" for viral content.',
    icon: <Sparkles className="h-8 w-8" />,
  },
  {
    id: 'engagement',
    title: 'Engage with Posts',
    description: 'Double-tap to like, leave comments, share with friends, and save posts for later. Quick reactions let you express yourself instantly!',
    icon: <Heart className="h-8 w-8" />,
  },
  {
    id: 'create',
    title: 'Create Your Content',
    description: 'Tap the Create button to share your own photos, videos, and stories. You can even monetize your content with paid posts!',
    icon: <Plus className="h-8 w-8" />,
  },
  {
    id: 'premium',
    title: 'Premium Content',
    description: 'Some creators offer exclusive paid content. Unlock it with a one-time purchase or subscribe for full access to their premium posts.',
    icon: <Lock className="h-8 w-8" />,
  },
];

interface FeedOnboardingTutorialProps {
  onComplete: () => void;
}

export function FeedOnboardingTutorial({ onComplete }: FeedOnboardingTutorialProps) {
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
    localStorage.setItem('feedOnboardingComplete', 'true');
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
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary-blue/5 opacity-50" />
              
              {/* Icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
                className="relative mb-6 flex justify-center"
              >
                <div className="p-4 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 border border-white/10">
                  <div className="text-primary">
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
                        ? 'w-8 bg-gradient-to-r from-primary to-secondary' 
                        : index < currentStep
                        ? 'w-2 bg-primary/50'
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
                  className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
                >
                  {currentStep === tutorialSteps.length - 1 ? (
                    <>
                      Get Started
                      <Sparkles className="h-4 w-4 ml-1" />
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