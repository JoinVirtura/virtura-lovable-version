import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Sparkles, 
  Upload, 
  Palette, 
  Wand2, 
  Download,
  ChevronRight,
  ChevronLeft,
  X,
  MessageCircle
} from "lucide-react";

interface CopilotOnboardingTutorialProps {
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Copilot",
    description: "Your AI-powered image editing and generation studio. Create stunning visuals with natural language commands.",
    icon: Sparkles,
    color: "from-violet-500 to-purple-500"
  },
  {
    title: "Describe Your Vision",
    description: "Type a detailed description of what you want to create. Be specific about style, mood, colors, and composition.",
    icon: MessageCircle,
    color: "from-blue-500 to-cyan-500"
  },
  {
    title: "Upload Reference Images",
    description: "Optionally upload an image to edit or use as reference. Copilot can transform, enhance, or reimagine your photos.",
    icon: Upload,
    color: "from-emerald-500 to-teal-500"
  },
  {
    title: "Choose Style & Settings",
    description: "Select content type, artistic style, and quality settings. Fine-tune adherence and enhancement options.",
    icon: Palette,
    color: "from-orange-500 to-amber-500"
  },
  {
    title: "Generate Variants",
    description: "AI creates 3 unique variations for you to choose from. Select your favorite or generate more options.",
    icon: Wand2,
    color: "from-pink-500 to-rose-500"
  },
  {
    title: "Save & Download",
    description: "Save your creations to your library or download them directly. Share your AI art with the world!",
    icon: Download,
    color: "from-violet-500 to-purple-500"
  }
];

export const CopilotOnboardingTutorial = ({ onComplete }: CopilotOnboardingTutorialProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("copilotOnboardingComplete", "true");
      onComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("copilotOnboardingComplete", "true");
    onComplete();
  };

  const step = steps[currentStep];
  const Icon = step.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <Card className="relative w-full max-w-lg overflow-hidden border-white/10 bg-gradient-to-br from-card via-card to-muted shadow-2xl">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/5 to-pink-500/5" />
        
        {/* Skip button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 z-10 text-muted-foreground hover:text-foreground"
          onClick={handleSkip}
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="relative p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="space-y-6"
            >
              {/* Icon */}
              <div className="flex justify-center">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} p-0.5`}>
                  <div className="w-full h-full rounded-2xl bg-card flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="text-center space-y-3">
                <h2 className="text-2xl font-bold">{step.title}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Progress dots */}
          <div className="flex justify-center gap-2 mt-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? "w-8 bg-gradient-to-r from-violet-500 to-purple-500"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                }`}
              />
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              className="gap-2 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600"
            >
              {currentStep === steps.length - 1 ? "Get Started" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
