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

      // Active users (users with activity in last 5 minutes)
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      const { data: recentActivity } = await supabase
        .from("usage_tracking")
        .select("user_id, profiles!inner(display_name)")
        .gte("created_at", fiveMinutesAgo);

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

      // Mock data for charts (in production, get from actual API logs)
      const responseTimeData = Array.from({ length: 24 }, (_, i) => ({
        time: `${i}:00`,
        ms: Math.floor(Math.random() * 200) + 50,
      }));

      const avgResponseTime = responseTimeData.reduce((sum, d) => sum + d.ms, 0) / 24;

      // System health score (0-100)
      let healthScore = 100;
      if (avgResponseTime > 500) healthScore -= 30;
      else if (avgResponseTime > 200) healthScore -= 15;
      if (failedCount && failedCount > 10) healthScore -= 20;
      else if (failedCount && failedCount > 5) healthScore -= 10;

      setMetrics({
        activeUsers: uniqueActiveUsers.size,
        activeUsersList,
        avgResponseTime: Math.round(avgResponseTime),
        responseTimeData,
        tokensLastHour,
        tokensLast24h,
        tokensLast7d,
        tokenTrend: tokensLast24h > 0 ? ((tokensLastHour / (tokensLast24h / 24)) * 100) - 100 : 0,
        revenueToday: (revenueToday?.reduce((sum, t) => sum + t.amount, 0) || 0) * 0.01,
        revenueWeek: (revenueWeek?.reduce((sum, t) => sum + t.amount, 0) || 0) * 0.01,
        revenueMonth: (revenueMonth?.reduce((sum, t) => sum + t.amount, 0) || 0) * 0.01,
        systemHealth: healthScore,
        dbLatency: Math.floor(Math.random() * 50) + 10,
        failedJobs: failedCount || 0,
        queueRate: Math.floor(Math.random() * 100) + 50,
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
    <div className="space-y-6" id="metrics-dashboard">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Metrics Dashboard</CardTitle>
              <CardDescription>
                Real-time platform performance and analytics
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
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
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10s</SelectItem>
                  <SelectItem value="30">30s</SelectItem>
                  <SelectItem value="60">1m</SelectItem>
                  <SelectItem value="300">5m</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={fetchMetrics} size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
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

      {/* Metrics Grid */}
      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Active Users */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="h-4 w-4 text-green-600" />
                  Active Users
                  <div className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">online now</p>
                {metrics.activeUsersList.length > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {metrics.activeUsersList.join(", ")}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* API Response Time */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Avg Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getResponseTimeColor(metrics.avgResponseTime)}`}>
                  {metrics.avgResponseTime}ms
                </div>
                <p className="text-xs text-muted-foreground">API latency</p>
              </CardContent>
            </Card>

            {/* Token Usage */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-600" />
                  Token Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{metrics.tokensLastHour.toLocaleString()}</div>
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${metrics.revenueToday.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">today</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Week: ${metrics.revenueWeek.toFixed(2)}
                </p>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  System Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${getHealthColor(metrics.systemHealth)}`}>
                  {metrics.systemHealth}
                </div>
                <p className="text-xs text-muted-foreground">health score</p>
                {metrics.failedJobs > 0 && (
                  <Badge variant="destructive" className="mt-2 text-xs">
                    {metrics.failedJobs} failed jobs
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">API Response Times (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={metrics.responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ms" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Token Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Hour</span>
                    <span className="font-bold">{metrics.tokensLastHour.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last 24 Hours</span>
                    <span className="font-bold">{metrics.tokensLast24h.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last 7 Days</span>
                    <span className="font-bold">{metrics.tokensLast7d.toLocaleString()}</span>
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">DB Latency</span>
                      <span className="text-sm font-medium">{metrics.dbLatency}ms</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Queue Rate</span>
                      <span className="text-sm font-medium">{metrics.queueRate}/min</span>
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
