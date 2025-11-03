import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Users, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface CostSummary {
  totalCosts: number;
  costsByProvider: { provider: string; cost: number }[];
  costsByResource: { resource: string; cost: number }[];
  topUsers: { user_id: string; email: string; cost: number; plan: string }[];
  dailyCosts: { date: string; cost: number }[];
  modelUsage: { model: string; count: number; cost: number }[];
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export function AdminCostDashboard() {
  const [summary, setSummary] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    fetchCostSummary();
  }, [timeRange]);

  const fetchCostSummary = async () => {
    setLoading(true);
    try {
      const daysAgo = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch cost tracking data
      const { data: costs } = await supabase
        .from("api_cost_tracking")
        .select("*")
        .gte("created_at", startDate.toISOString());

      if (!costs) {
        setSummary(null);
        return;
      }

      // Calculate total costs
      const totalCosts = costs.reduce((sum, c) => sum + Number(c.cost_usd), 0);

      // Costs by provider
      const providerMap = new Map<string, number>();
      costs.forEach(c => {
        const current = providerMap.get(c.api_provider) || 0;
        providerMap.set(c.api_provider, current + Number(c.cost_usd));
      });
      const costsByProvider = Array.from(providerMap.entries()).map(([provider, cost]) => ({
        provider,
        cost,
      }));

      // Costs by resource type
      const resourceMap = new Map<string, number>();
      costs.forEach(c => {
        const current = resourceMap.get(c.resource_type) || 0;
        resourceMap.set(c.resource_type, current + Number(c.cost_usd));
      });
      const costsByResource = Array.from(resourceMap.entries()).map(([resource, cost]) => ({
        resource,
        cost,
      }));

      // Top users by cost
      const userMap = new Map<string, number>();
      costs.forEach(c => {
        const current = userMap.get(c.user_id) || 0;
        userMap.set(c.user_id, current + Number(c.cost_usd));
      });

      // Fetch user details for top users
      const topUserIds = Array.from(userMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([userId]) => userId);

      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, display_name")
        .in("id", topUserIds);

      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("user_id, plan_name")
        .in("user_id", topUserIds);

      const topUsers = Array.from(userMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([user_id, cost]) => {
          const profile = profiles?.find(p => p.id === user_id);
          const subscription = subscriptions?.find(s => s.user_id === user_id);
          return {
            user_id,
            email: profile?.display_name || user_id.slice(0, 8),
            cost,
            plan: subscription?.plan_name || "free",
          };
        });

      // Daily costs
      const dailyMap = new Map<string, number>();
      costs.forEach(c => {
        const date = new Date(c.created_at).toISOString().split("T")[0];
        const current = dailyMap.get(date) || 0;
        dailyMap.set(date, current + Number(c.cost_usd));
      });
      const dailyCosts = Array.from(dailyMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, cost]) => ({ date, cost }));

      // Model usage
      const modelMap = new Map<string, { count: number; cost: number }>();
      costs.forEach(c => {
        if (c.model_used) {
          const current = modelMap.get(c.model_used) || { count: 0, cost: 0 };
          modelMap.set(c.model_used, {
            count: current.count + 1,
            cost: current.cost + Number(c.cost_usd),
          });
        }
      });
      const modelUsage = Array.from(modelMap.entries())
        .map(([model, data]) => ({ model, ...data }))
        .sort((a, b) => b.cost - a.cost);

      setSummary({
        totalCosts,
        costsByProvider,
        costsByResource,
        topUsers,
        dailyCosts,
        modelUsage,
      });
    } catch (error) {
      console.error("Error fetching cost summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading cost data...</div>;
  }

  if (!summary) {
    return <div className="p-8">No cost data available</div>;
  }

  const avgDailyCost = summary.dailyCosts.length > 0 
    ? summary.totalCosts / summary.dailyCosts.length 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Cost Tracking Dashboard</h2>
        <p className="text-muted-foreground">Monitor API costs and profit margins</p>
      </div>

      {/* Time Range Selector */}
      <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as "7d" | "30d" | "90d")}>
        <TabsList>
          <TabsTrigger value="7d">Last 7 Days</TabsTrigger>
          <TabsTrigger value="30d">Last 30 Days</TabsTrigger>
          <TabsTrigger value="90d">Last 90 Days</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total API Costs</p>
              <h3 className="text-2xl font-bold">${summary.totalCosts.toFixed(2)}</h3>
            </div>
            <DollarSign className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Daily Cost</p>
              <h3 className="text-2xl font-bold">${avgDailyCost.toFixed(2)}</h3>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Users</p>
              <h3 className="text-2xl font-bold">{summary.topUsers.length}</h3>
            </div>
            <Users className="w-8 h-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">API Calls</p>
              <h3 className="text-2xl font-bold">
                {summary.modelUsage.reduce((sum, m) => sum + m.count, 0)}
              </h3>
            </div>
            <Zap className="w-8 h-8 text-primary" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Daily Costs</TabsTrigger>
          <TabsTrigger value="providers">By Provider</TabsTrigger>
          <TabsTrigger value="resources">By Resource</TabsTrigger>
          <TabsTrigger value="models">Model Usage</TabsTrigger>
          <TabsTrigger value="users">Top Users</TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Cost Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={summary.dailyCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Line type="monotone" dataKey="cost" stroke="hsl(var(--primary))" name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="providers">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Costs by API Provider</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={summary.costsByProvider}
                  dataKey="cost"
                  nameKey="provider"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.provider}: $${entry.cost.toFixed(2)}`}
                >
                  {summary.costsByProvider.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="resources">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Costs by Resource Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={summary.costsByResource}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="resource" />
                <YAxis />
                <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="cost" fill="hsl(var(--primary))" name="Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Most Used Models</h3>
            <div className="space-y-4">
              {summary.modelUsage.map((model, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{model.model || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{model.count} calls</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${model.cost.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${(model.cost / model.count).toFixed(4)}/call
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Users by Cost</h3>
            <div className="space-y-4">
              {summary.topUsers.map((user, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium">{user.email}</p>
                    <p className="text-sm text-muted-foreground">Plan: {user.plan}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${user.cost.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
