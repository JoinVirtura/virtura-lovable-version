import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Activity,
  Clock,
  Coins,
  DollarSign,
  Gauge,
  Pause,
  Play,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { MetricsExport } from "./MetricsExport";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

interface SystemMetrics {
  activeUsers: number;
  activeUsersList: string[];
  avgResponseTime: number;
  responseTimeData: { time: string; ms: number }[];
  tokensLastHour: number;
  tokensLast24h: number;
  tokensLast7d: number;
  tokenTrend: number;
  revenueToday: number;
  revenueWeek: number;
  revenueMonth: number;
  systemHealth: number;
  dbLatency: number;
  failedJobs: number;
  queueRate: number;
}

export function SystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();

    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMetrics();
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const fetchMetrics = async () => {
    try {
      setLoading(true);

      // Measure DB latency with a real query
      const dbStartTime = performance.now();
      
      // Active users (users with activity in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentActivity } = await supabase
        .from("usage_tracking")
        .select("user_id, profiles!inner(display_name)")
        .gte("created_at", fiveMinutesAgo);

      const dbLatency = Math.round(performance.now() - dbStartTime);

      const uniqueActiveUsers = new Set(recentActivity?.map((a) => a.user_id));
      const activeUsersList = recentActivity
        ?.filter((a, i, arr) => arr.findIndex((x) => x.user_id === a.user_id) === i)
        .map((a: any) => a.profiles?.display_name || "Unknown")
        .slice(0, 5) || [];

      // Token usage
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: tokensHour } = await supabase
        .from("token_transactions")
        .select("amount")
        .eq("transaction_type", "usage")
        .gte("created_at", oneHourAgo);

      const { data: tokens24h } = await supabase
        .from("token_transactions")
        .select("amount")
        .eq("transaction_type", "usage")
        .gte("created_at", oneDayAgo);

      const { data: tokens7d } = await supabase
        .from("token_transactions")
        .select("amount")
        .eq("transaction_type", "usage")
        .gte("created_at", sevenDaysAgo);

      const tokensLastHour = Math.abs(tokensHour?.reduce((sum, t) => sum + t.amount, 0) || 0);
      const tokensLast24h = Math.abs(tokens24h?.reduce((sum, t) => sum + t.amount, 0) || 0);
      const tokensLast7d = Math.abs(tokens7d?.reduce((sum, t) => sum + t.amount, 0) || 0);

      // Revenue
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const startOfMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const { data: revenueToday } = await supabase
        .from("token_transactions")
        .select("amount")
        .eq("transaction_type", "purchase")
        .gte("created_at", startOfToday.toISOString());

      const { data: revenueWeek } = await supabase
        .from("token_transactions")
        .select("amount")
        .gte("created_at", startOfWeek.toISOString());

      const { data: revenueMonth } = await supabase
        .from("token_transactions")
        .select("amount")
        .gte("created_at", startOfMonth.toISOString());

      // Failed jobs
      const { count: failedCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("status", "failed");

      // Queue rate: jobs created in the last minute
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
      const { count: queueRateCount } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .gte("created_at", oneMinuteAgo);

      // Response time data from completed jobs in last 24 hours
      const { data: completedJobs } = await supabase
        .from("jobs")
        .select("created_at, completed_at")
        .eq("status", "completed")
        .not("completed_at", "is", null)
        .gte("created_at", oneDayAgo)
        .order("created_at", { ascending: true });

      // Group jobs by hour and calculate avg completion time
      const hourlyData: { [hour: string]: number[] } = {};
      for (let i = 0; i < 24; i++) {
        hourlyData[`${i}:00`] = [];
      }

      (completedJobs || []).forEach((job) => {
        if (job.created_at && job.completed_at) {
          const createdAt = new Date(job.created_at);
          const completedAt = new Date(job.completed_at);
          const durationMs = completedAt.getTime() - createdAt.getTime();
          const hour = `${createdAt.getHours()}:00`;
          if (hourlyData[hour]) {
            hourlyData[hour].push(Math.min(durationMs, 60000)); // Cap at 60 seconds
          }
        }
      });

      const responseTimeData = Object.entries(hourlyData).map(([time, durations]) => ({
        time,
        ms: durations.length > 0 
          ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
          : 0,
      }));

      const avgResponseTime = responseTimeData.filter(d => d.ms > 0).length > 0
        ? Math.round(responseTimeData.filter(d => d.ms > 0).reduce((sum, d) => sum + d.ms, 0) / responseTimeData.filter(d => d.ms > 0).length)
        : 0;

      // System health score (0-100)
      let healthScore = 100;
      if (avgResponseTime > 30000) healthScore -= 30;
      else if (avgResponseTime > 10000) healthScore -= 15;
      if (failedCount && failedCount > 10) healthScore -= 20;
      else if (failedCount && failedCount > 5) healthScore -= 10;
      if (dbLatency > 500) healthScore -= 10;
      else if (dbLatency > 200) healthScore -= 5;

      setMetrics({
        activeUsers: uniqueActiveUsers.size,
        activeUsersList,
        avgResponseTime: avgResponseTime > 0 ? avgResponseTime : dbLatency,
        responseTimeData,
        tokensLastHour,
        tokensLast24h,
        tokensLast7d,
        tokenTrend: tokensLast24h > 0 ? ((tokensLastHour / (tokensLast24h / 24)) * 100) - 100 : 0,
        revenueToday: (revenueToday?.reduce((sum, t) => sum + t.amount, 0) || 0) * 0.01,
        revenueWeek: (revenueWeek?.reduce((sum, t) => sum + t.amount, 0) || 0) * 0.01,
        revenueMonth: (revenueMonth?.reduce((sum, t) => sum + t.amount, 0) || 0) * 0.01,
        systemHealth: healthScore,
        dbLatency,
        failedJobs: failedCount || 0,
        queueRate: queueRateCount || 0,
      });

      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching system metrics:", error);
      toast.error("Failed to load system metrics");
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms < 100) return "text-green-600";
    if (ms < 500) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6" id="metrics-dashboard">
      {/* Controls */}
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">System Metrics Dashboard</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Real-time platform performance and analytics
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={autoRefresh}
                  onCheckedChange={setAutoRefresh}
                  id="auto-refresh"
                />
                <Label htmlFor="auto-refresh" className="text-sm">
                  {autoRefresh ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Label>
              </div>
              <Select
                value={refreshInterval.toString()}
                onValueChange={(v) => setRefreshInterval(parseInt(v))}
              >
                <SelectTrigger className="w-20 sm:w-32 h-8 sm:h-10 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="300">5m</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchMetrics} size="sm" variant="outline" className="h-8 sm:h-10 text-xs sm:text-sm">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              {metrics && (
                <MetricsExport
                  metrics={{
                    activeUsers: metrics.activeUsers,
                    avgResponseTime: metrics.avgResponseTime,
                    tokensLastHour: metrics.tokensLastHour,
                    revenueToday: metrics.revenueToday,
                    systemHealth: metrics.systemHealth.toString(),
                    failedJobs: metrics.failedJobs,
                    lowBalanceUsers: 0,
                  }}
                />
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </CardHeader>
      </Card>

      {metrics && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Active Users */}
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                  <span className="hidden sm:inline">Active Users</span>
                  <span className="sm:hidden">Active</span>
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl sm:text-3xl font-bold">{metrics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">online now</p>
                {metrics.activeUsersList.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground hidden sm:block">
                    {metrics.activeUsersList.join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Response Time */}
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Avg Response</span>
                  <span className="sm:hidden">Response</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`text-2xl sm:text-3xl font-bold ${getResponseTimeColor(metrics.avgResponseTime)}`}>
                  {metrics.avgResponseTime}ms
                </div>
                <p className="text-xs text-muted-foreground">API latency</p>
              </CardContent>
            </Card>

            {/* Token Usage */}
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  <Coins className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                  <span className="hidden sm:inline">Token Usage</span>
                  <span className="sm:hidden">Tokens</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl sm:text-3xl font-bold">{metrics.tokensLastHour.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">last hour</p>
                <div className="mt-1 flex items-center gap-1 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  <span className={metrics.tokenTrend > 0 ? "text-green-600" : "text-red-600"}>
                    {metrics.tokenTrend > 0 ? "+" : ""}{metrics.tokenTrend.toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue */}
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="text-2xl sm:text-3xl font-bold">${metrics.revenueToday.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">today</p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  Week: ${metrics.revenueWeek.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-1 sm:gap-2">
                  <Gauge className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">System Health</span>
                  <span className="sm:hidden">Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className={`text-2xl sm:text-3xl font-bold ${getHealthColor(metrics.systemHealth)}`}>
                  {metrics.systemHealth}
                </div>
                <p className="text-xs text-muted-foreground">health score</p>
                {metrics.failedJobs > 0 && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    {metrics.failedJobs} failed
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">API Response Times (24h)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[180px] sm:h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={metrics.responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="ms" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="p-3 sm:p-4">
              <CardHeader className="p-0 pb-3 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">Token Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Last Hour</span>
                    <span className="font-bold text-sm">{metrics.tokensLastHour.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Last 24 Hours</span>
                    <span className="font-bold text-sm">{metrics.tokensLast24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm">Last 7 Days</span>
                    <span className="font-bold text-sm">{metrics.tokensLast7d.toLocaleString()}</span>
                  </div>
                  <div className="pt-3 sm:pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">DB Latency</span>
                      <span className="text-xs sm:text-sm font-medium">{metrics.dbLatency}ms</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Queue Rate</span>
                      <span className="text-xs sm:text-sm font-medium">{metrics.queueRate}/min</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
