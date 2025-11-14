import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, MousePointer, Eye, Send, Smartphone, Monitor, Tablet } from "lucide-react";

interface AnalyticsData {
  overview: {
    totalSent: number;
    totalRead: number;
    totalClicked: number;
    avgOpenRate: number;
    avgCTR: number;
  };
  categoryPerformance: Array<{
    category: string;
    sent: number;
    read: number;
    clicked: number;
    openRate: number;
    ctr: number;
  }>;
  trendsData: Array<{
    date: string;
    openRate: number;
    ctr: number;
  }>;
  deviceBreakdown: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
}

export function NotificationAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("7");

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      const daysAgo = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch overview metrics
      const { data: notifications } = await supabase
        .from('notifications')
        .select('id, created_at')
        .gte('created_at', startDate.toISOString());

      const { data: analyticsEvents } = await (supabase as any)
        .from('notification_analytics')
        .select('notification_id, event_type, device_type')
        .gte('event_timestamp', startDate.toISOString());

      const totalSent = notifications?.length || 0;
      const readEvents = analyticsEvents?.filter((e: any) => e.event_type === 'read') || [];
      const clickEvents = analyticsEvents?.filter((e: any) => e.event_type === 'clicked') || [];
      const totalRead = new Set(readEvents.map((e: any) => e.notification_id)).size;
      const totalClicked = new Set(clickEvents.map((e: any) => e.notification_id)).size;

      const avgOpenRate = totalSent > 0 ? (totalRead / totalSent) * 100 : 0;
      const avgCTR = totalRead > 0 ? (totalClicked / totalRead) * 100 : 0;

      // Fetch category performance
      const { data: categoryData } = await supabase
        .from('notifications')
        .select('category')
        .gte('created_at', startDate.toISOString());

      const categoryStats = categoryData?.reduce((acc, notif) => {
        const category = notif.category || 'system';
        if (!acc[category]) {
          acc[category] = { sent: 0, read: 0, clicked: 0 };
        }
        acc[category].sent++;
        return acc;
      }, {} as Record<string, { sent: number; read: number; clicked: number }>);

      // Count reads and clicks per category
      for (const event of readEvents) {
        const notif = notifications?.find(n => n.id === event.notification_id);
        if (notif) {
          const cat = (notif as any).category || 'system';
          if (categoryStats?.[cat]) {
            categoryStats[cat].read++;
          }
        }
      }

      for (const event of clickEvents) {
        const notif = notifications?.find(n => n.id === event.notification_id);
        if (notif) {
          const cat = (notif as any).category || 'system';
          if (categoryStats?.[cat]) {
            categoryStats[cat].clicked++;
          }
        }
      }

      const categoryPerformance = Object.entries(categoryStats || {}).map(([category, stats]) => ({
        category,
        sent: stats.sent,
        read: stats.read,
        clicked: stats.clicked,
        openRate: stats.sent > 0 ? (stats.read / stats.sent) * 100 : 0,
        ctr: stats.read > 0 ? (stats.clicked / stats.read) * 100 : 0,
      }));

      // Device breakdown
      const deviceCounts = analyticsEvents?.reduce((acc: any, event: any) => {
        const device = event.device_type || 'unknown';
        acc[device] = (acc[device] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalEvents = analyticsEvents?.length || 0;
      const deviceBreakdown = Object.entries(deviceCounts || {}).map(([device, count]) => ({
        device,
        count: count as number,
        percentage: totalEvents > 0 ? ((count as number) / totalEvents) * 100 : 0,
      }));

      // Trends data (daily)
      const trendsData: Array<{ date: string; openRate: number; ctr: number }> = [];
      for (let i = daysAgo - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const daySent = notifications?.filter(n => n.created_at.startsWith(dateStr)).length || 0;
        const dayRead = readEvents.filter(e => {
          const notif = notifications?.find(n => n.id === e.notification_id);
          return notif?.created_at.startsWith(dateStr);
        }).length;
        const dayClicked = clickEvents.filter(e => {
          const notif = notifications?.find(n => n.id === e.notification_id);
          return notif?.created_at.startsWith(dateStr);
        }).length;

        trendsData.push({
          date: dateStr,
          openRate: daySent > 0 ? (dayRead / daySent) * 100 : 0,
          ctr: dayRead > 0 ? (dayClicked / dayRead) * 100 : 0,
        });
      }

      setAnalytics({
        overview: {
          totalSent,
          totalRead,
          totalClicked,
          avgOpenRate,
          avgCTR,
        },
        categoryPerformance,
        trendsData,
        deviceBreakdown,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      case 'desktop':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading || !analytics) {
    return <div className="p-8">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Notification Analytics</h2>
          <p className="text-muted-foreground">
            Track engagement and optimize notification performance
          </p>
        </div>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalSent}</div>
            <p className="text-xs text-muted-foreground">
              Notifications delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Read</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalRead}</div>
            <p className="text-xs text-muted-foreground">
              Notifications opened
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicked</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.totalClicked}</div>
            <p className="text-xs text-muted-foreground">
              Actions taken
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.avgOpenRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average engagement
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.overview.avgCTR.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Click-through rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Engagement Trends</CardTitle>
              <CardDescription>
                Open rate and click-through rate over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={analytics.trendsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="openRate" stroke="hsl(var(--primary))" name="Open Rate %" />
                  <Line type="monotone" dataKey="ctr" stroke="hsl(var(--accent))" name="CTR %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Category</CardTitle>
              <CardDescription>
                Compare notification effectiveness across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={analytics.categoryPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="openRate" fill="hsl(var(--primary))" name="Open Rate %" />
                  <Bar dataKey="ctr" fill="hsl(var(--accent))" name="CTR %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.categoryPerformance.map((cat) => (
                  <div key={cat.category} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium capitalize">{cat.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {cat.sent} sent • {cat.read} read • {cat.clicked} clicked
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{cat.openRate.toFixed(1)}% open</p>
                      <p className="text-sm text-muted-foreground">
                        {cat.ctr.toFixed(1)}% CTR
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>
                  Where users engage with notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.deviceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.device}: ${entry.percentage.toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {analytics.deviceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.deviceBreakdown.map((device) => (
                    <div key={device.device} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.device)}
                        <p className="font-medium capitalize">{device.device}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{device.count} events</p>
                        <p className="text-sm text-muted-foreground">
                          {device.percentage.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
