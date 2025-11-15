import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, DollarSign, Coins, Users, Activity } from "lucide-react";
import { AdminCostDashboard } from "@/components/AdminCostDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminTokenTransactionHistory } from "@/components/AdminTokenTransactionHistory";
import { QuickAdminActions } from "@/components/admin/QuickAdminActions";
import { UserManagementTools } from "@/components/admin/UserManagementTools";
import { FinancialReporting } from "@/components/admin/FinancialReporting";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { SystemMetrics } from "@/components/admin/SystemMetrics";
import { GalleryShowcaseManager } from "@/components/admin/GalleryShowcaseManager";
import { LandingAnalyticsDashboard } from "@/components/admin/LandingAnalyticsDashboard";

export default function UnifiedAdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTokensPurchased: 0,
    totalTokensUsed: 0,
    totalApiCosts: 0,
    totalRevenue: 0,
  });

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);

      if (data) {
        await fetchOverviewStats();
      }
    };

    checkAdmin();
  }, [user]);

  const fetchOverviewStats = async () => {
    try {
      // Fetch token stats
      const { data: tokenData } = await supabase
        .from("user_tokens")
        .select("balance, lifetime_purchased, lifetime_used");

      const totalPurchased = tokenData?.reduce((sum, u) => sum + u.lifetime_purchased, 0) || 0;
      const totalUsed = tokenData?.reduce((sum, u) => sum + u.lifetime_used, 0) || 0;

      // Fetch API costs
      const { data: costData } = await supabase
        .from("api_cost_tracking")
        .select("cost_usd");

      const totalCosts = costData?.reduce((sum, c) => sum + Number(c.cost_usd), 0) || 0;

      // Fetch total users
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      // Calculate revenue (assuming $0.01 per token)
      const revenue = totalPurchased * 0.01;

      setStats({
        totalUsers: userCount || 0,
        totalTokensPurchased: totalPurchased,
        totalTokensUsed: totalUsed,
        totalApiCosts: totalCosts,
        totalRevenue: revenue,
      });
    } catch (error) {
      console.error("Error fetching overview stats:", error);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const profitMargin = stats.totalRevenue > 0 
    ? ((stats.totalRevenue - stats.totalApiCosts) / stats.totalRevenue * 100).toFixed(1)
    : "0.0";

  return (
    <div className="w-full max-w-7xl mx-auto py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
        <Shield className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Comprehensive platform monitoring and analytics
          </p>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <QuickAdminActions onActionComplete={fetchOverviewStats} />

      {/* Overview Stats */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium flex items-center gap-2">
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">registered accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Coins className="h-4 w-4 text-green-600" />
              Tokens Sold
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">{stats.totalTokensPurchased.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">lifetime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-red-600" />
              Tokens Used
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">{stats.totalTokensUsed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-primary" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">from tokens</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2 sm:pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              Profit Margin
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">
              ${(stats.totalRevenue - stats.totalApiCosts).toFixed(2)} profit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="w-full max-w-full overflow-x-auto sm:overflow-x-visible pb-2">
          <TabsList className="inline-flex sm:grid sm:w-full sm:grid-cols-11 gap-2 h-auto flex-nowrap">
          <TabsTrigger value="overview" className="whitespace-nowrap">Overview</TabsTrigger>
          <TabsTrigger value="metrics" className="whitespace-nowrap">Metrics</TabsTrigger>
          <TabsTrigger value="users" className="whitespace-nowrap">Users</TabsTrigger>
          <TabsTrigger value="financial" className="whitespace-nowrap">Financial</TabsTrigger>
          <TabsTrigger value="costs" className="whitespace-nowrap">API Costs</TabsTrigger>
          <TabsTrigger value="tokens" className="whitespace-nowrap">Token Txns</TabsTrigger>
          <TabsTrigger value="jobs" className="whitespace-nowrap">Jobs & Activity</TabsTrigger>
          <TabsTrigger value="audit" className="whitespace-nowrap">Audit Log</TabsTrigger>
          <TabsTrigger value="recovery" className="whitespace-nowrap">Recovery</TabsTrigger>
          <TabsTrigger value="gallery" className="whitespace-nowrap">Gallery</TabsTrigger>
          <TabsTrigger value="landing" className="whitespace-nowrap">Landing</TabsTrigger>
        </TabsList>
        </div>

        <TabsContent value="metrics" className="space-y-4">
          <SystemMetrics />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserManagementTools />
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <FinancialReporting />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>
                Key performance indicators and system health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Financial Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Revenue:</span>
                      <span className="font-medium">${stats.totalRevenue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total API Costs:</span>
                      <span className="font-medium">${stats.totalApiCosts.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Net Profit:</span>
                      <span className="font-medium text-green-600">
                        ${(stats.totalRevenue - stats.totalApiCosts).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Token Economy</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Purchased:</span>
                      <span className="font-medium">{stats.totalTokensPurchased.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Used:</span>
                      <span className="font-medium">{stats.totalTokensUsed.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Utilization Rate:</span>
                      <span className="font-medium">
                        {stats.totalTokensPurchased > 0
                          ? ((stats.totalTokensUsed / stats.totalTokensPurchased) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <AdminCostDashboard />
        </TabsContent>

        <TabsContent value="tokens">
          <AdminTokenTransactionHistory />
        </TabsContent>

        <TabsContent value="jobs">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="recovery">
          <Card>
            <CardHeader>
              <CardTitle>Video Recovery Tools</CardTitle>
              <CardDescription>
                Scan storage and match orphaned videos with library items
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This tool is part of the Jobs & Users tab in the AdminDashboard component.
                Access it there for video recovery operations.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-4">
          <GalleryShowcaseManager />
        </TabsContent>

        <TabsContent value="landing" className="space-y-4">
          <LandingAnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
