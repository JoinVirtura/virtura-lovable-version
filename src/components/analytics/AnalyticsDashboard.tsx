import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Heart, MessageCircle, DollarSign, BarChart3, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface AnalyticsData {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalRevenue: number;
}

export function AnalyticsDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalRevenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [hasNoPosts, setHasNoPosts] = useState(false);

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
          const hasContent = posts.length > 0;
          setHasNoPosts(!hasContent);
          
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
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (hasNoPosts) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
        <BarChart3 className="w-16 h-16 text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Analytics Yet</h3>
        <p className="text-muted-foreground mb-6 max-w-md">
          Create and publish posts to see your performance metrics
        </p>
        <Button onClick={() => navigate('/social')} size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Create Your First Post
        </Button>
      </div>
    );
  }

  const stats = [
    { label: 'Total Views', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-500' },
    { label: 'Total Likes', value: analytics.totalLikes.toLocaleString(), icon: Heart, color: 'text-red-500' },
    { label: 'Total Comments', value: analytics.totalComments.toLocaleString(), icon: MessageCircle, color: 'text-green-500' },
    { label: 'Total Revenue', value: `$${analytics.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-yellow-500' },
  ];

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      if (!user) return;

      const { data: posts } = await supabase
        .from('social_posts')
        .select('view_count, like_count, comment_count')
        .eq('user_id', user.id);

      const { data: earnings } = await supabase
        .from('creator_earnings')
        .select('creator_amount_cents')
        .eq('creator_id', user.id);

      if (posts) {
        const hasContent = posts.length > 0;
        setHasNoPosts(!hasContent);
        
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

  return (
    <ErrorBoundary 
      fallbackTitle="Failed to load analytics"
      fallbackMessage="We couldn't load your analytics. Please try again."
    >
      <div className="p-6 space-y-6">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold"
        >
          Analytics Dashboard
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                    className="text-2xl font-bold"
                  >
                    {stat.value}
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}
