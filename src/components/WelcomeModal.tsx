import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Sparkles,
  Coins,
  Image,
  Video,
  Wand2,
  CheckCircle,
  Clock,
  Zap,
  Shield,
  Trophy,
} from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

const STEPS = [
  {
    id: 1,
    title: "Welcome to Virtura! 🎉",
    subtitle: "You've received 30 FREE tokens to get started",
  },
  {
    id: 2,
    title: "What are tokens?",
    subtitle: "Your creative fuel for AI generation",
  },
  {
    id: 3,
    title: "Try your first generation",
    subtitle: "Start creating amazing content",
  },
  {
    id: 4,
    title: "Need more tokens?",
    subtitle: "We've got you covered",
  },
  {
    id: 5,
    title: "Quick tips",
    subtitle: "Get the most out of Virtura",
  },
];

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WelcomeModal({ open, onOpenChange }: WelcomeModalProps) {
  const navigate = useNavigate();
  const { updateOnboardingStep, completeOnboarding } = useOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  const [tokenCount, setTokenCount] = useState(0);

  useEffect(() => {
    if (open && currentStep === 1) {
      // Animate token counter
      const interval = setInterval(() => {
        setTokenCount(prev => {
          if (prev >= 30) {
            clearInterval(interval);
            return 30;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [open, currentStep]);

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      await updateOnboardingStep(nextStep);
    } else {
      await completeOnboarding();
      onOpenChange(false);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    onOpenChange(false);
  };

  const handleNavigate = async (path: string) => {
    await completeOnboarding();
    onOpenChange(false);
    navigate(path);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mb-2">
            <DialogTitle className="text-2xl bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
              {STEPS[currentStep - 1].title}
            </DialogTitle>
            <Badge variant="outline" className="ml-auto">
              {currentStep}/{STEPS.length}
            </Badge>
          </div>
          <DialogDescription>{STEPS[currentStep - 1].subtitle}</DialogDescription>
        </DialogHeader>

        <div className="py-6">
          {/* Step 1: Welcome + Token Gift */}
          {currentStep === 1 && (
            <div className="space-y-6 text-center">
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-blue rounded-full opacity-20 animate-pulse" />
                <div className="absolute inset-4 bg-gradient-to-r from-primary to-primary-blue rounded-full flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-primary-foreground" />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <Coins className="w-8 h-8 text-primary" />
                  <span className="text-5xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
                    {tokenCount}
                  </span>
                  <span className="text-2xl text-muted-foreground">tokens</span>
                </div>
                <p className="text-sm text-muted-foreground">Yours to keep — start creating right away!</p>
              </div>

              <Card className="p-4 bg-muted/50 border-primary/20">
                <p className="text-sm text-foreground">
                  Create amazing AI avatars, images, and videos without spending a dime.
                  Your 30 free tokens are ready to use right now!
                </p>
              </Card>
            </div>
          )}

          {/* Step 2: Token System Explanation */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <Card className="p-4 bg-gradient-to-br from-card to-muted/50">
                <p className="text-center mb-6 text-foreground">
                  Tokens are your creative currency. Each AI generation costs a specific amount based on complexity.
                </p>
                
                <div className="grid gap-4">
                  <div className="flex items-start gap-4 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Image className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Generate an Image</h4>
                      <p className="text-sm text-muted-foreground">1-8 tokens per image</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-primary-blue/10 flex items-center justify-center flex-shrink-0">
                      <Video className="w-5 h-5 text-primary-blue" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Create a Video</h4>
                      <p className="text-sm text-muted-foreground">3-8 tokens per video</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-3 rounded-lg bg-background/50">
                    <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <Wand2 className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">Style Transfer</h4>
                      <p className="text-sm text-muted-foreground">2-4 tokens per transform</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm text-center text-foreground">
                    <strong>Your 30 tokens ≈ 6+ images</strong> or <strong>4-5 videos</strong> or <strong>15 style transfers</strong>
                  </p>
                </div>
              </Card>
            </div>
          )}

          {/* Step 3: Try Your First Generation */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground mb-6">
                Choose what you'd like to create first
              </p>

              <div className="grid gap-4">
                <Card
                  className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-neon"
                  onClick={() => handleNavigate('/individuals')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-blue flex items-center justify-center flex-shrink-0">
                      <Image className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-foreground">Generate an Avatar</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Create professional AI avatars from text descriptions
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        <Coins className="w-3 h-3 mr-1" />
                        2-5 tokens
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-neon"
                  onClick={() => handleNavigate('/ai-studio')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-blue to-secondary flex items-center justify-center flex-shrink-0">
                      <Wand2 className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-foreground">Create an Image</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Generate any image you can imagine with AI
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        <Coins className="w-3 h-3 mr-1" />
                        1-8 tokens
                      </Badge>
                    </div>
                  </div>
                </Card>

                <Card
                  className="p-6 cursor-pointer hover:border-primary transition-all hover:shadow-neon"
                  onClick={() => handleNavigate('/studio')}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                      <Video className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 text-foreground">Make a Video</h3>
                      <p className="text-sm text-muted-foreground mb-2">
                        Bring your avatars to life with AI video
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        <Coins className="w-3 h-3 mr-1" />
                        3-8 tokens
                      </Badge>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* Step 4: Need More Tokens */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <p className="text-center text-muted-foreground">
                When you need more tokens, we've got flexible options
              </p>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center bg-muted/50">
                  <div className="text-sm font-semibold text-foreground">Starter</div>
                  <div className="text-xs text-muted-foreground mb-2">30 images + 3 videos</div>
                  <div className="text-lg font-semibold text-primary">$19</div>
                </Card>

                <Card className="p-4 text-center bg-gradient-to-br from-primary/10 to-primary-blue/10 border-primary">
                  <Badge className="mb-2 text-xs">Most Popular</Badge>
                  <div className="text-sm font-semibold text-foreground">Creator</div>
                  <div className="text-xs text-muted-foreground mb-2">70 images + 7 videos</div>
                  <div className="text-lg font-semibold text-primary">$39</div>
                </Card>

                <Card className="p-4 text-center bg-muted/50">
                  <div className="text-sm font-semibold text-foreground">Power</div>
                  <div className="text-xs text-muted-foreground mb-2">150 images + 15 videos</div>
                  <div className="text-lg font-semibold text-primary">$79</div>
                </Card>
              </div>

              <Card className="p-4 bg-gradient-to-br from-card to-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <h4 className="font-semibold text-foreground">Need even more? We've got you.</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ultra ($149) and Elite ($249) packs available too. Or subscribe monthly for bigger savings — tokens never expire!
                </p>
              </Card>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleNavigate('/upgrade')}
              >
                View All Pricing Options
              </Button>
            </div>
          )}

          {/* Step 5: Quick Tips */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4 bg-muted/50 border-l-4 border-l-primary">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1 text-foreground">Tokens never expire</h4>
                      <p className="text-sm text-muted-foreground">
                        Use your tokens whenever you want. No rush, no pressure.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50 border-l-4 border-l-primary-blue">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-primary-blue flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1 text-foreground">Automatic provider fallback</h4>
                      <p className="text-sm text-muted-foreground">
                        If one AI model is busy, we automatically try another — so your generations almost never fail.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50 border-l-4 border-l-secondary">
                  <div className="flex items-start gap-3">
                    <Coins className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1 text-foreground">Track your usage</h4>
                      <p className="text-sm text-muted-foreground">
                        View your token history anytime in your dashboard.
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-muted/50 border-l-4 border-l-accent">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold mb-1 text-foreground">Need help? We're here!</h4>
                      <p className="text-sm text-muted-foreground">
                        Check our Tutorial page or contact support anytime.
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="pt-4 text-center">
                <CheckCircle className="w-12 h-12 text-primary mx-auto mb-3" />
                <p className="text-lg font-semibold text-foreground">You're all set!</p>
                <p className="text-sm text-muted-foreground">
                  Start creating amazing content with your 30 free tokens
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-muted-foreground"
          >
            Skip Tutorial
          </Button>

          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentStep(prev => prev - 1);
                  updateOnboardingStep(currentStep - 1);
                }}
              >
                Back
              </Button>
            )}
            <Button onClick={handleNext}>
              {currentStep === STEPS.length ? "Start Creating" : "Next"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
