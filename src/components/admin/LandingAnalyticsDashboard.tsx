import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Users, Sparkles, MousePointer } from "lucide-react";

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
      // Get all analytics data with type assertion
      const { data: rawAnalytics, error } = await (supabase as any)
        .from('landing_analytics')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Type assertion for analytics data
      type AnalyticsEvent = {
        id: string;
        session_id: string;
        event_type: string;
        prompt?: string;
        created_at: string;
        metadata?: any;
      };
      
      const analytics = (rawAnalytics as unknown as AnalyticsEvent[]) || [];

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Landing Page Analytics</h2>
        <p className="text-muted-foreground">Track conversion rates and user engagement</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Generations</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalGenerations}</div>
            <p className="text-xs text-muted-foreground">Images generated on landing page</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">CTA Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSignupClicks}</div>
            <p className="text-xs text-muted-foreground">Sign up button clicks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalSignups}</div>
            <p className="text-xs text-muted-foreground">Completed signups from landing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Generation to signup rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Trend</CardTitle>
          <CardDescription>Generations and signups over the last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="generations" stroke="hsl(var(--primary))" name="Generations" />
              <Line type="monotone" dataKey="signups" stroke="hsl(var(--primary-blue))" name="Signups" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Performing Prompts */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Prompts</CardTitle>
          <CardDescription>Most frequently used generation prompts</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data.topPrompts} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="prompt" width={200} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}