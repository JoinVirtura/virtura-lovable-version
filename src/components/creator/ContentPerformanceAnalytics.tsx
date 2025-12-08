import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContentPerformance } from '@/hooks/useContentPerformance';
import { Eye, Heart, Unlock, DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

export function ContentPerformanceAnalytics() {
  const { stats, loading } = useContentPerformance();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  const metricCards = [
    {
      label: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-500',
    },
    {
      label: 'Total Likes',
      value: stats.totalLikes.toLocaleString(),
      icon: Heart,
      color: 'text-pink-500',
    },
    {
      label: 'Content Unlocks',
      value: stats.totalUnlocks.toLocaleString(),
      icon: Unlock,
      color: 'text-purple-500',
    },
    {
      label: 'Content Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-500',
    },
  ];

  const performanceMetrics = [
    {
      label: 'Engagement Rate',
      value: `${stats.engagementRate.toFixed(2)}%`,
      description: 'Likes / Views',
    },
    {
      label: 'Unlock Rate',
      value: `${stats.unlockConversionRate.toFixed(3)}%`,
      description: 'Unlocks / Views',
    },
    {
      label: 'Revenue per 1K Views',
      value: `$${stats.revenuePerThousandViews.toFixed(2)}`,
      description: 'RPM',
    },
  ];

  // Prepare chart data from posts
  const chartData = stats.posts
    .slice(0, 30)
    .reverse()
    .map(p => ({
      date: p.createdAt ? format(new Date(p.createdAt), 'MMM d') : '',
      views: p.viewCount,
      revenue: p.revenue,
    }));

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${metric.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Rates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>Key performance indicators for your content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-3">
            {performanceMetrics.map((metric) => (
              <div key={metric.label} className="text-center p-4 rounded-lg bg-muted/50">
                <div className="text-3xl font-bold">{metric.value}</div>
                <div className="text-sm font-medium mt-1">{metric.label}</div>
                <div className="text-xs text-muted-foreground">{metric.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Performing Content
          </CardTitle>
          <CardDescription>Your best content by revenue</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.topByRevenue.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No content data available yet. Start posting to see your performance!
            </div>
          ) : (
            <div className="space-y-3">
              {stats.topByRevenue.map((post, index) => (
                <div 
                  key={post.id}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
                      {post.caption || 'Untitled post'}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.viewCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {post.likeCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Unlock className="w-3 h-3" />
                        {post.unlockCount}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-500">
                      ${post.revenue.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trends Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Trends</CardTitle>
            <CardDescription>Views and revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="date" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="left"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Views"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(142 76% 36%)" 
                    strokeWidth={2}
                    name="Revenue ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
