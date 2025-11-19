import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Users,
  Clock,
  Target,
  Calendar,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface AnalyticsSummary {
  total_trials: number;
  converted_trials: number;
  conversion_rate: number;
  avg_time_to_convert_hours: number;
  trials_last_7_days: number;
  trials_last_30_days: number;
}

interface FeatureUsage {
  feature_name: string;
  usage_count: number;
  unique_users: number;
}

interface TrialUser {
  user_id: string;
  email: string;
  trial_start: string;
  trial_end: string;
  days_remaining: number;
  status: string;
}

export default function TrialAnalytics() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [activeTrials, setActiveTrials] = useState<TrialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [extendDays, setExtendDays] = useState(7);
  const [extendReason, setExtendReason] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load summary
      const { data: summaryData } = await supabase
        .from("trial_analytics_summary")
        .select("*")
        .single();

      if (summaryData) setSummary(summaryData);

      // Load feature usage
      const { data: usageData } = await supabase
        .from("trial_feature_usage")
        .select("feature_name, usage_count, user_id")
        .order("usage_count", { ascending: false });

      if (usageData) {
        const aggregated = usageData.reduce((acc, item) => {
          const existing = acc.find((f) => f.feature_name === item.feature_name);
          if (existing) {
            existing.usage_count += item.usage_count;
            existing.unique_users++;
          } else {
            acc.push({
              feature_name: item.feature_name,
              usage_count: item.usage_count,
              unique_users: 1,
            });
          }
          return acc;
        }, [] as FeatureUsage[]);

        setFeatureUsage(aggregated);
      }

      // Load active trials
      const { data: trialsData } = await supabase
        .from("subscriptions")
        .select("user_id, trial_start, trial_end, status")
        .eq("status", "trialing");

      if (trialsData) {
        const enriched = await Promise.all(
          trialsData.map(async (trial) => {
            const { data: userData } = await supabase.auth.admin.getUserById(
              trial.user_id
            );
            const daysRemaining = Math.ceil(
              (new Date(trial.trial_end).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24)
            );

            return {
              user_id: trial.user_id,
              email: userData.user?.email || "Unknown",
              trial_start: trial.trial_start,
              trial_end: trial.trial_end,
              days_remaining: daysRemaining,
              status: trial.status,
            };
          })
        );

        setActiveTrials(enriched.sort((a, b) => a.days_remaining - b.days_remaining));
      }
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendTrial = async () => {
    if (!selectedUser || !extendReason) {
      toast.error("Please provide a reason for extension");
      return;
    }

    try {
      const trial = activeTrials.find((t) => t.user_id === selectedUser);
      if (!trial) return;

      const newEndDate = new Date(trial.trial_end);
      newEndDate.setDate(newEndDate.getDate() + extendDays);

      // Update subscription
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({ trial_end: newEndDate.toISOString() })
        .eq("user_id", selectedUser);

      if (updateError) throw updateError;

      // Record extension
      const { error: recordError } = await supabase
        .from("trial_extensions")
        .insert({
          user_id: selectedUser,
          extended_by: (await supabase.auth.getUser()).data.user?.id,
          original_end_date: trial.trial_end,
          new_end_date: newEndDate.toISOString(),
          reason: extendReason,
        });

      if (recordError) throw recordError;

      toast.success(`Trial extended by ${extendDays} days`);
      setExtendReason("");
      setSelectedUser(null);
      loadAnalytics();
    } catch (error: any) {
      console.error("Error extending trial:", error);
      toast.error(error.message || "Failed to extend trial");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trial Analytics</h1>
          <p className="text-muted-foreground">
            Monitor trial performance and user engagement
          </p>
        </div>
        <Button onClick={loadAnalytics} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Trials</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.total_trials || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary?.trials_last_7_days || 0} in last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary?.conversion_rate || 0}%
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              {(summary?.conversion_rate || 0) > 20 ? (
                <ArrowUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <ArrowDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              {summary?.converted_trials || 0} conversions
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Time to Convert
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((summary?.avg_time_to_convert_hours || 0) / 24)} days
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(summary?.avg_time_to_convert_hours || 0)} hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeTrials.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {activeTrials.filter((t) => t.days_remaining <= 1).length} expiring
              soon
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="features" className="space-y-4">
        <TabsList>
          <TabsTrigger value="features">Feature Usage</TabsTrigger>
          <TabsTrigger value="trials">Active Trials</TabsTrigger>
        </TabsList>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Used Features During Trial</CardTitle>
              <CardDescription>
                Track which features trial users engage with most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureUsage.map((feature) => (
                  <div
                    key={feature.feature_name}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium capitalize">
                        {feature.feature_name.replace(/_/g, " ")}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {feature.unique_users} unique users
                      </p>
                    </div>
                    <Badge variant="secondary">{feature.usage_count} uses</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trials" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Trial Users</CardTitle>
              <CardDescription>
                Manage and monitor active trial subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {activeTrials.map((trial) => (
                  <div
                    key={trial.user_id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{trial.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Expires: {new Date(trial.trial_end).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          trial.days_remaining <= 1
                            ? "destructive"
                            : trial.days_remaining <= 3
                            ? "secondary"
                            : "default"
                        }
                      >
                        {trial.days_remaining} days left
                      </Badge>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedUser(trial.user_id)}
                          >
                            Extend
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Extend Trial Period</DialogTitle>
                            <DialogDescription>
                              Add more days to {trial.email}'s trial
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div>
                              <Label htmlFor="days">Days to Add</Label>
                              <Input
                                id="days"
                                type="number"
                                value={extendDays}
                                onChange={(e) =>
                                  setExtendDays(parseInt(e.target.value))
                                }
                                min={1}
                                max={30}
                              />
                            </div>
                            <div>
                              <Label htmlFor="reason">Reason</Label>
                              <Textarea
                                id="reason"
                                value={extendReason}
                                onChange={(e) => setExtendReason(e.target.value)}
                                placeholder="Why are you extending this trial?"
                                required
                              />
                            </div>
                            <Button
                              onClick={handleExtendTrial}
                              className="w-full"
                            >
                              Extend Trial
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
