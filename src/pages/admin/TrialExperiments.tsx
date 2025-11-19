import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Play, Pause, Plus, TrendingUp, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  status: string;
  variants: Array<{ name: string; trial_days: number; weight: number }>;
  success_metric: string;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
}

interface ExperimentStats {
  variant_name: string;
  total_users: number;
  conversions: number;
  conversion_rate: number;
}

export default function TrialExperiments() {
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(null);
  const [experimentStats, setExperimentStats] = useState<ExperimentStats[]>([]);
  const { toast } = useToast();

  const [newExperiment, setNewExperiment] = useState({
    name: "",
    description: "",
    hypothesis: "",
    variants: [
      { name: "7-day", trial_days: 7, weight: 50 },
      { name: "14-day", trial_days: 14, weight: 50 },
    ],
  });

  useEffect(() => {
    loadExperiments();
  }, []);

  useEffect(() => {
    if (selectedExperiment) {
      loadExperimentStats(selectedExperiment);
    }
  }, [selectedExperiment]);

  const loadExperiments = async () => {
    try {
      const { data, error } = await supabase
        .from("trial_experiments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExperiments((data || []).map(exp => ({
        ...exp,
        variants: exp.variants as Array<{ name: string; trial_days: number; weight: number }>
      })));
    } catch (error: any) {
      toast({
        title: "Error loading experiments",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExperimentStats = async (experimentId: string) => {
    try {
      const { data, error } = await supabase
        .from("trial_experiment_assignments")
        .select("variant_name, converted")
        .eq("experiment_id", experimentId);

      if (error) throw error;

      const stats = data.reduce((acc: any, assignment: any) => {
        const existing = acc.find((s: any) => s.variant_name === assignment.variant_name);
        if (existing) {
          existing.total_users++;
          if (assignment.converted) existing.conversions++;
        } else {
          acc.push({
            variant_name: assignment.variant_name,
            total_users: 1,
            conversions: assignment.converted ? 1 : 0,
            conversion_rate: 0,
          });
        }
        return acc;
      }, []);

      stats.forEach((s: any) => {
        s.conversion_rate = s.total_users > 0 ? (s.conversions / s.total_users) * 100 : 0;
      });

      setExperimentStats(stats);
    } catch (error: any) {
      console.error("Error loading experiment stats:", error);
    }
  };

  const createExperiment = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("trial_experiments").insert({
        name: newExperiment.name,
        description: newExperiment.description,
        hypothesis: newExperiment.hypothesis,
        variants: newExperiment.variants,
        created_by: user.id,
        status: "draft",
      });

      if (error) throw error;

      toast({
        title: "Experiment created",
        description: "Your trial experiment has been created successfully.",
      });

      setShowCreateDialog(false);
      setNewExperiment({
        name: "",
        description: "",
        hypothesis: "",
        variants: [
          { name: "7-day", trial_days: 7, weight: 50 },
          { name: "14-day", trial_days: 14, weight: 50 },
        ],
      });
      loadExperiments();
    } catch (error: any) {
      toast({
        title: "Error creating experiment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const toggleExperimentStatus = async (experimentId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "active" ? "paused" : "active";
      const updates: any = { status: newStatus };

      if (newStatus === "active" && currentStatus === "draft") {
        updates.start_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from("trial_experiments")
        .update(updates)
        .eq("id", experimentId);

      if (error) throw error;

      toast({
        title: `Experiment ${newStatus}`,
        description: `The experiment has been ${newStatus}.`,
      });

      loadExperiments();
    } catch (error: any) {
      toast({
        title: "Error updating experiment",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Trial A/B Experiments</h1>
          <p className="text-muted-foreground">Test different trial lengths to optimize conversions</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Experiment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Trial Experiment</DialogTitle>
              <DialogDescription>
                Set up an A/B test to compare different trial lengths
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Experiment Name</Label>
                <Input
                  id="name"
                  value={newExperiment.name}
                  onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                  placeholder="e.g., 7-day vs 14-day trial"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newExperiment.description}
                  onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                  placeholder="What are you testing?"
                />
              </div>
              <div>
                <Label htmlFor="hypothesis">Hypothesis</Label>
                <Textarea
                  id="hypothesis"
                  value={newExperiment.hypothesis}
                  onChange={(e) => setNewExperiment({ ...newExperiment, hypothesis: e.target.value })}
                  placeholder="e.g., Longer trials lead to better conversion rates"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={createExperiment}>Create Experiment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {experiments.map((experiment) => (
          <Card key={experiment.id} className={experiment.status === "active" ? "border-primary" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{experiment.name}</CardTitle>
                  <CardDescription>{experiment.description}</CardDescription>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    experiment.status === "active"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {experiment.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Variants:</p>
                <div className="space-y-1">
                  {experiment.variants.map((variant, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{variant.name}</span>
                      <span className="text-muted-foreground">
                        {variant.trial_days} days ({variant.weight}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {selectedExperiment === experiment.id && experimentStats.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Results:</p>
                  <div className="space-y-2">
                    {experimentStats.map((stat, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">{stat.variant_name}</span>
                          <span className="text-sm font-medium">
                            {stat.conversion_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="w-3 h-3" />
                          <span>{stat.total_users} users</span>
                          <TrendingUp className="w-3 h-3 ml-2" />
                          <span>{stat.conversions} conversions</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleExperimentStatus(experiment.id, experiment.status)}
                  className="flex-1"
                >
                  {experiment.status === "active" ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedExperiment(
                    selectedExperiment === experiment.id ? null : experiment.id
                  )}
                  className="flex-1"
                >
                  {selectedExperiment === experiment.id ? "Hide Stats" : "View Stats"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {experiments.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No experiments yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first A/B test to optimize trial conversions
            </p>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Experiment
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
