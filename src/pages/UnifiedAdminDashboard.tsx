import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, DollarSign, Coins, Users, Activity,
  LayoutDashboard, BarChart3, Cpu, FileText, 
  RotateCcw, ImageIcon, Globe, BadgeCheck, Store,
  RefreshCw, Bell, Calendar
} from "lucide-react";
import { AdminCostDashboard } from "@/components/AdminCostDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminTokenTransactionHistory } from "@/components/AdminTokenTransactionHistory";
import { UserManagementTools } from "@/components/admin/UserManagementTools";
import { FinancialReporting } from "@/components/admin/FinancialReporting";
import { AuditLogViewer } from "@/components/admin/AuditLogViewer";
import { SystemMetrics } from "@/components/admin/SystemMetrics";
import { GalleryShowcaseManager } from "@/components/admin/GalleryShowcaseManager";
import { LandingAnalyticsDashboard } from "@/components/admin/LandingAnalyticsDashboard";
import { AdminVerificationReview } from "@/components/admin/AdminVerificationReview";
import { AdminMarketplaceApprovals } from "@/components/marketplace/AdminMarketplaceApprovals";
import { RetryJobsModal } from "@/components/admin/RetryJobsModal";
import { CreditTokensDialog } from "@/components/admin/CreditTokensDialog";
import { SystemHealthModal } from "@/components/admin/SystemHealthModal";
import { NotificationDialog } from "@/components/admin/NotificationDialog";
import { ScheduledNotificationsDialog } from "@/components/admin/ScheduledNotificationsDialog";

export default function UnifiedAdminDashboard() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const adminCheckCompleted = useRef(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTokensPurchased: 0,
    totalTokensUsed: 0,
    totalApiCosts: 0,
    totalRevenue: 0,
  });

  // Quick Actions state (inlined from QuickAdminActions)
  const [showRetryJobs, setShowRetryJobs] = useState(false);
  const [showCreditTokens, setShowCreditTokens] = useState(false);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showScheduledNotifications, setShowScheduledNotifications] = useState(false);
  const [quickStats, setQuickStats] = useState({
    failedJobs: 0,
    lowBalanceUsers: 0,
    systemHealth: 'good' as 'good' | 'warning' | 'critical',
  });

  const fetchQuickStats = async () => {
    try {
      const { count: failedJobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      const { count: lowBalanceCount } = await supabase
        .from('user_tokens')
        .select('*', { count: 'exact', head: true })
        .lt('balance', 10);

      const failedJobs = failedJobsCount || 0;
      const lowBalance = lowBalanceCount || 0;

      setQuickStats({
        failedJobs,
        lowBalanceUsers: lowBalance,
        systemHealth: failedJobs > 20 ? 'critical' : failedJobs > 5 ? 'warning' : 'good',
      });
    } catch (error) {
      console.error('Fetch quick stats error:', error);
    }
  };

  const handleActionComplete = () => {
    fetchQuickStats();
    fetchOverviewStats();
  };

  useEffect(() => {
    const checkAdmin = async () => {
      console.log('[UnifiedAdminDashboard] Starting admin check...');
      console.log('[UnifiedAdminDashboard] User object:', user ? { id: user.id, email: user.email } : 'NO USER');
      
      if (!user) {
        console.log('[UnifiedAdminDashboard] No user found, setting isAdmin to false');
        setIsAdmin(false);
        adminCheckCompleted.current = true;
        return;
      }

      console.log('[UnifiedAdminDashboard] Querying user_roles for user_id:', user.id);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      console.log('[UnifiedAdminDashboard] Query result:', { data, error });
      
      const isUserAdmin = !!data;
      console.log('[UnifiedAdminDashboard] Setting isAdmin to:', isUserAdmin);
      setIsAdmin(isUserAdmin);
      adminCheckCompleted.current = true;

      if (data) {
        console.log('[UnifiedAdminDashboard] Fetching overview stats...');
        await fetchOverviewStats();
        await fetchQuickStats();
      }
    };

    checkAdmin();
    
    // Fallback timeout: if check doesn't complete in 5 seconds, force to false
    const timeout = setTimeout(() => {
      if (!adminCheckCompleted.current) {
        console.error('[UnifiedAdminDashboard] Admin check timed out after 5s, setting to false');
        setIsAdmin(false);
      }
    }, 5000);
    
    return () => clearTimeout(timeout);
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
    <div className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 sm:max-w-7xl">
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

      {/* Unified Command Center */}
      <div className="bg-gradient-to-r from-slate-900/90 via-violet-950/50 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-violet-500/10 p-4 sm:p-6">
        
        {/* Header: Status Badges + Quick Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-5 border-b border-white/10">
          
          {/* Left: Status Indicators */}
          <div className="flex flex-wrap items-center gap-3">
            <Badge 
              className={`px-3 py-1.5 border ${
                quickStats.failedJobs > 0 
                  ? 'bg-pink-500/20 text-pink-300 border-pink-500/30 shadow-lg shadow-pink-500/20 animate-pulse' 
                  : 'bg-slate-700/50 text-slate-400 border-slate-600/30'
              }`}
            >
              <RefreshCw className="w-3 h-3 mr-1.5" />
              Failed: {quickStats.failedJobs}
            </Badge>
            <Badge className="px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Coins className="w-3 h-3 mr-1.5" />
              Low Balance: {quickStats.lowBalanceUsers}
            </Badge>
            <Badge 
              className={`px-3 py-1.5 border flex items-center gap-1.5 ${
                quickStats.systemHealth === 'good' 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-lg shadow-emerald-500/20' 
                  : quickStats.systemHealth === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : 'bg-red-500/20 text-red-300 border-red-500/30 animate-pulse'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${
                quickStats.systemHealth === 'good' ? 'bg-emerald-400 animate-pulse' :
                quickStats.systemHealth === 'warning' ? 'bg-amber-400' : 'bg-red-400'
              }`} />
              System: {quickStats.systemHealth}
            </Badge>
          </div>
          
          {/* Right: Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setShowRetryJobs(true)}
            >
              <RefreshCw className="w-4 h-4 mr-1.5" /> Retry
              {quickStats.failedJobs > 0 && (
                <Badge variant="destructive" className="ml-1.5 px-1.5 py-0 text-xs">{quickStats.failedJobs}</Badge>
              )}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setShowCreditTokens(true)}
            >
              <Coins className="w-4 h-4 mr-1.5" /> Credit
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setShowSystemHealth(true)}
            >
              <Activity className="w-4 h-4 mr-1.5" /> Health
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setShowNotification(true)}
            >
              <Bell className="w-4 h-4 mr-1.5" /> Notify
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-slate-300 hover:text-white hover:bg-white/10"
              onClick={() => setShowScheduledNotifications(true)}
            >
              <Calendar className="w-4 h-4 mr-1.5" /> Scheduled
            </Button>
          </div>
        </div>

        {/* Overview Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5 pb-5 border-b border-white/10">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
              <Users className="w-3 h-3" /> Users
            </div>
            <div className="text-xl font-bold text-white">{stats.totalUsers}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs mb-1">
              <Coins className="w-3 h-3" /> Sold
            </div>
            <div className="text-xl font-bold text-white">{stats.totalTokensPurchased.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 text-pink-400 text-xs mb-1">
              <Activity className="w-3 h-3" /> Used
            </div>
            <div className="text-xl font-bold text-white">{stats.totalTokensUsed.toLocaleString()}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 text-violet-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" /> Revenue
            </div>
            <div className="text-xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-1">
              <DollarSign className="w-3 h-3" /> Profit
            </div>
            <div className="text-xl font-bold text-white">{profitMargin}%</div>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          {/* Tab Navigation Rows */}
          <div className="flex flex-col gap-3 w-full">
            {/* Row 1: Core Analytics + Financial + Jobs */}
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto p-2 bg-white/5 rounded-xl border border-white/5 w-full">
            {/* Core Analytics Group */}
            <TabsTrigger 
              value="overview" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <LayoutDashboard className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Overview</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="metrics" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <BarChart3 className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Metrics</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="users" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-violet-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <Users className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Users</span>
            </TabsTrigger>
            
            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 self-center" />
            
            {/* Financial Group */}
            <TabsTrigger 
              value="financial" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <DollarSign className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Financial</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="costs" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <Cpu className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">API Costs</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="tokens" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <Coins className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Token Txns</span>
            </TabsTrigger>
            
            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 self-center" />
            
            {/* Jobs */}
            <TabsTrigger 
              value="jobs" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <Activity className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Jobs</span>
            </TabsTrigger>
          </TabsList>

          {/* Row 2: Operations + Tools */}
          <TabsList className="flex flex-wrap justify-center gap-2 h-auto p-2 bg-white/5 rounded-xl border border-white/5 w-full">
            {/* Operations Group */}
            <TabsTrigger 
              value="verification" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <BadgeCheck className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Verification</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="marketplace" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-amber-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <Store className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Marketplace</span>
            </TabsTrigger>
            
            {/* Divider */}
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent mx-1 self-center" />
            
            {/* Tools Group */}
            <TabsTrigger 
              value="audit" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <FileText className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Audit</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="recovery" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <RotateCcw className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Recovery</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="gallery" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <ImageIcon className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Gallery</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="landing" 
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-slate-400 transition-all duration-300 hover:text-white hover:bg-white/5 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-rose-500/40 data-[state=active]:border data-[state=active]:border-white/20"
            >
              <Globe className="w-4 h-4 transition-transform group-hover:scale-110 group-data-[state=active]:scale-110" />
              <span className="text-sm font-medium">Landing</span>
            </TabsTrigger>
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

        <TabsContent value="verification" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Verification Requests</CardTitle>
              <CardDescription>
                Review and manage user verification requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminVerificationReview />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="marketplace" className="space-y-4">
          <AdminMarketplaceApprovals />
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

      {/* Quick Action Modals */}
      <RetryJobsModal
        open={showRetryJobs}
        onOpenChange={setShowRetryJobs}
        onSuccess={handleActionComplete}
      />

      <CreditTokensDialog
        open={showCreditTokens}
        onOpenChange={setShowCreditTokens}
        onSuccess={handleActionComplete}
      />

      <SystemHealthModal
        open={showSystemHealth}
        onOpenChange={setShowSystemHealth}
      />

      <NotificationDialog
        open={showNotification}
        onOpenChange={setShowNotification}
        onSuccess={handleActionComplete}
      />

      <ScheduledNotificationsDialog
        open={showScheduledNotifications}
        onOpenChange={setShowScheduledNotifications}
        onSuccess={handleActionComplete}
      />
    </div>
  );
}
