import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { TrendingUp, Users, Sparkles, MousePointer } from "lucide-react";

// Type for landing analytics records
interface LandingAnalytic {
  id: string;
  event_type: string;
  session_id?: string;
  prompt?: string;
  metadata?: any;
  created_at: string;
}

interface AnalyticsData {
  totalGenerations: number;
  totalSignupClicks: number;
  totalSignups: number;
  conversionRate: number;
  topPrompts: Array<{ prompt: string; count: number }>;
  dailyTrend: Array<{ date: string; generations: number; signups: number }>;
}

export function LandingAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData>({
    totalGenerations: 0,
    totalSignupClicks: 0,
    totalSignups: 0,
    conversionRate: 0,
    topPrompts: [],
    dailyTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Get all analytics data with explicit any type until Supabase types regenerate
      const { data, error } = await supabase
        .from('landing_analytics' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Cast to proper type using 'any' as intermediate
      const analytics = (data || []) as any[] as LandingAnalytic[];

      // Process data
      const generations = analytics.filter(a => a.event_type === 'images_generated');
      const signupClicks = analytics.filter(a => a.event_type === 'signup_clicked' || a.event_type === 'gallery_cta_clicked');
      const signups = analytics.filter(a => a.event_type === 'signup_completed');

      // Top prompts
      const promptCounts: Record<string, number> = {};
      generations.forEach(g => {
        if (g.prompt) {
          promptCounts[g.prompt] = (promptCounts[g.prompt] || 0) + 1;
        }
      });
      const topPrompts = Object.entries(promptCounts)
        .map(([prompt, count]) => ({ prompt, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Daily trend (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const dailyTrend = last7Days.map(date => {
        const dayGenerations = generations.filter(g => 
          g.created_at.startsWith(date)
        ).length;
        const daySignups = signups.filter(s => 
          s.created_at.startsWith(date)
        ).length;
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          generations: dayGenerations,
          signups: daySignups
        };
      });

      const conversionRate = generations.length > 0 
        ? (signups.length / generations.length * 100).toFixed(2)
        : 0;

      setData({
        totalGenerations: generations.length,
        totalSignupClicks: signupClicks.length,
        totalSignups: signups.length,
        conversionRate: Number(conversionRate),
        topPrompts,
        dailyTrend
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const trendChartConfig = {
    generations: { label: "Generations", color: "hsl(var(--primary))" },
    signups: { label: "Signups", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const promptChartConfig = {
    count: { label: "Count", color: "hsl(var(--primary))" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold">Landing Page Analytics</h2>
        <p className="text-sm text-muted-foreground">Track conversion rates and user engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{data.totalGenerations}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Images generated on landing page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">CTA Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{data.totalSignupClicks}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Sign up button clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{data.totalSignups}</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Completed signups from landing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground hidden sm:block">Generation to signup rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">7-Day Trend</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Generations and signups over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <ChartContainer config={trendChartConfig} className="h-[200px] sm:h-[300px]">
            <LineChart data={data.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="generations" stroke="var(--color-generations)" name="Generations" strokeWidth={2} />
              <Line type="monotone" dataKey="signups" stroke="var(--color-signups)" name="Signups" strokeWidth={2} />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Performing Prompts */}
      <Card>
        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="text-sm sm:text-base">Top Performing Prompts</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Most frequently used generation prompts</CardDescription>
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
          <ChartContainer config={promptChartConfig} className="h-[300px] sm:h-[400px]">
            <BarChart data={data.topPrompts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis type="number" tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <YAxis type="category" dataKey="prompt" width={150} tick={{ fontSize: 10 }} className="text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}