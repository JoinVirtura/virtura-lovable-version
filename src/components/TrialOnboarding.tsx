import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Image, Mic, Video, Palette } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CHECKLIST_STEPS = [
  {
    id: "generate_image",
    title: "Generate your first AI image",
    description: "Try our powerful image generation tools",
    icon: Image,
    route: "/studio",
  },
  {
    id: "create_voice",
    title: "Create a voice synthesis",
    description: "Generate natural-sounding speech",
    icon: Mic,
    route: "/voice",
  },
  {
    id: "make_video",
    title: "Create an AI video",
    description: "Bring your content to life with video",
    icon: Video,
    route: "/video-studio",
  },
  {
    id: "setup_brand",
    title: "Set up your brand",
    description: "Configure your brand identity",
    icon: Palette,
    route: "/brands",
  },
];

export function TrialOnboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("trial_checklist_progress")
      .select("completed_steps")
      .eq("user_id", user.id)
      .single();

    if (data?.completed_steps) {
      setCompletedSteps(data.completed_steps as string[]);
    }
  };

  const completeStep = async (stepId: string) => {
    if (!user || completedSteps.includes(stepId)) return;

    setLoading(true);
    try {
      const newCompleted = [...completedSteps, stepId];

      const { error } = await supabase
        .from("trial_checklist_progress")
        .upsert({
          user_id: user.id,
          completed_steps: newCompleted,
        });

      if (error) throw error;

      setCompletedSteps(newCompleted);
      
      // Track feature usage
      await supabase.from("trial_feature_usage").upsert({
        user_id: user.id,
        feature_name: stepId,
        usage_count: 1,
      }, {
        onConflict: "user_id,feature_name,trial_id",
      });

      toast.success("Step completed! 🎉");
    } catch (error) {
      console.error("Error completing step:", error);
    } finally {
      setLoading(false);
    }
  };

  const progress = (completedSteps.length / CHECKLIST_STEPS.length) * 100;
  const allCompleted = completedSteps.length === CHECKLIST_STEPS.length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>Get Started with Your Trial</CardTitle>
          </div>
          <Badge variant="secondary">
            {completedSteps.length}/{CHECKLIST_STEPS.length} Complete
          </Badge>
        </div>
        <Progress value={progress} className="mt-2" />
      </CardHeader>
      <CardContent>
        {allCompleted ? (
          <div className="text-center py-6">
            <div className="mb-4 mx-auto w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <Check className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              Congratulations! 🎉
            </h3>
            <p className="text-muted-foreground mb-4">
              You've completed all onboarding steps. Ready to unlock unlimited
              access?
            </p>
            <Button onClick={() => navigate("/upgrade")}>
              Upgrade Now
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {CHECKLIST_STEPS.map((step) => {
              const Icon = step.icon;
              const isCompleted = completedSteps.includes(step.id);

              return (
                <div
                  key={step.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                    isCompleted
                      ? "bg-primary/5 border-primary/20"
                      : "hover:bg-accent/50 border-transparent"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      isCompleted
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  {!isCompleted && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        navigate(step.route);
                        completeStep(step.id);
                      }}
                      disabled={loading}
                    >
                      Try Now
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
