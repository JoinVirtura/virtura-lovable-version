import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageCircle, DollarSign } from "lucide-react";

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalRevenue: number;
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        const { data: posts } = await supabase
          .from('social_posts')
          .select('view_count, like_count, comment_count')
          .eq('user_id', user.id);

        const { data: earnings } = await supabase
          .from('creator_earnings')
          .select('creator_amount_cents')
          .eq('creator_id', user.id);

        if (posts) {
          setAnalytics({
            totalViews: posts.reduce((sum, p) => sum + (p.view_count || 0), 0),
            totalLikes: posts.reduce((sum, p) => sum + (p.like_count || 0), 0),
            totalComments: posts.reduce((sum, p) => sum + (p.comment_count || 0), 0),
            totalRevenue: earnings
              ? earnings.reduce((sum, e) => sum + e.creator_amount_cents, 0) / 100
              : 0,
          });
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user]);

  if (loading) {
    return <div className="p-6">Loading analytics...</div>;
  }

  const stats = [
    { label: 'Total Views', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-500' },
    { label: 'Total Likes', value: analytics.totalLikes.toLocaleString(), icon: Heart, color: 'text-red-500' },
    { label: 'Total Comments', value: analytics.totalComments.toLocaleString(), icon: MessageCircle, color: 'text-green-500' },
    { label: 'Total Revenue', value: `$${analytics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-500' },
  ];

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
