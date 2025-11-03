import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Download, Share2, Star, Eye } from 'lucide-react';
import { format } from 'date-fns';
import type { BrandAsset } from '@/hooks/useBrandAssets';

interface BrandAnalyticsDashboardProps {
  brandId: string;
  assets: BrandAsset[];
}

interface AnalyticsData {
  totalDownloads: number;
  totalShares: number;
  totalUsage: number;
  topAssets: Array<{ id: string; title: string; score: number; downloads: number }>;
  assetTypeDistribution: Array<{ name: string; value: number }>;
  engagementTimeline: Array<{ date: string; downloads: number; shares: number }>;
}

const COLORS = ['#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe', '#ede9fe'];

export function BrandAnalyticsDashboard({ brandId, assets }: BrandAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDownloads: 0,
    totalShares: 0,
    totalUsage: 0,
    topAssets: [],
    assetTypeDistribution: [],
    engagementTimeline: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [brandId, assets]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      // Calculate metrics from assets
      const totalDownloads = assets.reduce((sum, asset) => {
        const downloads = asset.metadata?.downloads || 0;
        return sum + downloads;
      }, 0);

      const totalShares = assets.reduce((sum, asset) => {
        const shares = asset.metadata?.shares || 0;
        return sum + shares;
      }, 0);

      const totalUsage = assets.reduce((sum, asset) => sum + (asset.usage_count || 0), 0);

      // Top performing assets
      const topAssets = assets
        .filter(a => (a.performance_score || 0) > 0)
        .sort((a, b) => (b.performance_score || 0) - (a.performance_score || 0))
        .slice(0, 5)
        .map(asset => ({
          id: asset.id,
          title: asset.title,
          score: asset.performance_score || 0,
          downloads: asset.metadata?.downloads || 0,
        }));

      // Asset type distribution
      const typeMap = new Map<string, number>();
      assets.forEach(asset => {
        const type = asset.asset_type || 'other';
        typeMap.set(type, (typeMap.get(type) || 0) + 1);
      });
      const assetTypeDistribution = Array.from(typeMap.entries()).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));

      // Engagement timeline (last 7 days)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return format(date, 'MMM dd');
      });

      const engagementTimeline = last7Days.map(date => ({
        date,
        downloads: Math.floor(Math.random() * 10), // Mock data - replace with actual analytics
        shares: Math.floor(Math.random() * 5),
      }));

      setAnalytics({
        totalDownloads,
        totalShares,
        totalUsage,
        topAssets,
        assetTypeDistribution,
        engagementTimeline,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-violet-500/20 rounded w-1/4"></div>
          <div className="h-32 bg-violet-500/20 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-violet-500/20">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Downloads</span>
              <Download className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.totalDownloads}</p>
            <p className="text-xs text-green-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% from last week
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Shares</span>
              <Share2 className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.totalShares}</p>
            <p className="text-xs text-green-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +8% from last week
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Campaign Usage</span>
              <Eye className="w-4 h-4 text-violet-400" />
            </div>
            <p className="text-2xl font-bold text-white">{analytics.totalUsage}</p>
            <p className="text-xs text-green-400 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +15% from last week
            </p>
          </Card>
        </div>

        {/* Asset Type Distribution */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Asset Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics.assetTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.assetTypeDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </TabsContent>

      <TabsContent value="performance" className="space-y-4">
        {/* Top Performing Assets */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Top Performing Assets</h3>
          {analytics.topAssets.length > 0 ? (
            <div className="space-y-3">
              {analytics.topAssets.map((asset, index) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-4 p-3 bg-black/40 rounded-lg border border-violet-500/20"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-600 text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white truncate">{asset.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Score: {asset.score.toFixed(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {asset.downloads} downloads
                      </span>
                    </div>
                  </div>
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No performance data available yet</p>
              <p className="text-xs mt-2">Assets will appear here as they gain engagement</p>
            </div>
          )}
        </Card>

        {/* Performance Chart */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Performance by Asset</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={analytics.topAssets}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="title" stroke="#888" tick={{ fill: '#888' }} />
              <YAxis stroke="#888" tick={{ fill: '#888' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #8b5cf6',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="score" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </TabsContent>

      <TabsContent value="engagement" className="space-y-4">
        {/* Engagement Timeline */}
        <Card className="p-6 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
          <h3 className="text-lg font-semibold text-white mb-4">Engagement Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.engagementTimeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} />
              <YAxis stroke="#888" tick={{ fill: '#888' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #8b5cf6',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="downloads" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="shares" stroke="#a78bfa" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Engagement Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Download Rate</h4>
            <p className="text-3xl font-bold text-white">
              {assets.length > 0 ? ((analytics.totalDownloads / assets.length) || 0).toFixed(1) : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Average per asset</p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-gray-900/80 to-gray-800/80 border-violet-500/20">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Share Rate</h4>
            <p className="text-3xl font-bold text-white">
              {assets.length > 0 ? ((analytics.totalShares / assets.length) || 0).toFixed(1) : 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Average per asset</p>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
