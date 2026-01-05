import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, TrendingDown, Percent, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { generateFinancialPDF } from "@/lib/pdf-generator";

interface DateRange {
  start: Date;
  end: Date;
}

interface RevenueMetrics {
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  profitMargin: number;
  avgOrderValue: number;
  revenuePerUser: number;
}

interface FinancialSummary {
  activeSubscriptions: number;
  mrr: number;
  churnRate: number;
  ltv: number;
  tokenUtilization: number;
  avgCostPerToken: number;
  avgRevenuePerToken: number;
  grossMarginPerToken: number;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export function FinancialReporting() {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: subDays(new Date(), 30),
    end: new Date()
  });
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    totalCosts: 0,
    netProfit: 0,
    profitMargin: 0,
    avgOrderValue: 0,
    revenuePerUser: 0
  });
  const [summary, setSummary] = useState<FinancialSummary>({
    activeSubscriptions: 0,
    mrr: 0,
    churnRate: 0,
    ltv: 0,
    tokenUtilization: 0,
    avgCostPerToken: 0,
    avgRevenuePerToken: 0.01,
    grossMarginPerToken: 0
  });
  const [revenueTrends, setRevenueTrends] = useState<any[]>([]);
  const [tokenEconomy, setTokenEconomy] = useState<any[]>([]);
  const [revenueByPack, setRevenueByPack] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinancialData();
  }, [dateRange]);

  const setPresetRange = (preset: string) => {
    const now = new Date();
    switch (preset) {
      case 'today':
        setDateRange({ start: new Date(now.setHours(0, 0, 0, 0)), end: new Date() });
        break;
      case 'yesterday':
        const yesterday = subDays(now, 1);
        setDateRange({ start: new Date(yesterday.setHours(0, 0, 0, 0)), end: new Date(yesterday.setHours(23, 59, 59, 999)) });
        break;
      case '7days':
        setDateRange({ start: subDays(new Date(), 7), end: new Date() });
        break;
      case '30days':
        setDateRange({ start: subDays(new Date(), 30), end: new Date() });
        break;
      case 'thisMonth':
        setDateRange({ start: startOfMonth(new Date()), end: new Date() });
        break;
      case 'lastMonth':
        const lastMonth = subMonths(new Date(), 1);
        setDateRange({ start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) });
        break;
    }
  };

  const fetchFinancialData = async () => {
    try {
      setLoading(true);

      // Fetch purchases
      const { data: purchases } = await supabase
        .from('token_transactions')
        .select('amount, created_at, cost_usd, metadata, user_id')
        .eq('transaction_type', 'purchase')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: true });

      // Fetch API costs
      const { data: costs } = await supabase
        .from('api_cost_tracking')
        .select('cost_usd, api_provider, resource_type, created_at, user_id')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: true });

      // Fetch usage
      const { data: usage } = await supabase
        .from('token_transactions')
        .select('amount, resource_type, created_at')
        .eq('transaction_type', 'usage')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // Calculate revenue metrics
      const revenue = (purchases || []).reduce((sum, p) => sum + (p.amount * 0.01), 0);
      const totalCosts = (costs || []).reduce((sum, c) => sum + Number(c.cost_usd), 0);
      const profit = revenue - totalCosts;
      const profitMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      
      const uniqueUsers = new Set((purchases || []).map(p => p.user_id)).size;
      const avgOrderValue = purchases && purchases.length > 0 ? revenue / purchases.length : 0;
      const revenuePerUser = uniqueUsers > 0 ? revenue / uniqueUsers : 0;

      setMetrics({
        totalRevenue: revenue,
        totalCosts,
        netProfit: profit,
        profitMargin,
        avgOrderValue,
        revenuePerUser
      });

      // Calculate revenue trends (daily aggregation)
      const dailyData: Record<string, { revenue: number; costs: number; profit: number }> = {};
      
      (purchases || []).forEach(p => {
        const date = format(new Date(p.created_at), 'MMM dd');
        if (!dailyData[date]) dailyData[date] = { revenue: 0, costs: 0, profit: 0 };
        dailyData[date].revenue += p.amount * 0.01;
      });

      (costs || []).forEach(c => {
        const date = format(new Date(c.created_at), 'MMM dd');
        if (!dailyData[date]) dailyData[date] = { revenue: 0, costs: 0, profit: 0 };
        dailyData[date].costs += Number(c.cost_usd);
      });

      const trendsData = Object.entries(dailyData).map(([date, values]) => ({
        date,
        revenue: Number(values.revenue.toFixed(2)),
        costs: Number(values.costs.toFixed(2)),
        profit: Number((values.revenue - values.costs).toFixed(2))
      }));

      setRevenueTrends(trendsData);

      // Token economy data
      const tokenDailyData: Record<string, { purchased: number; used: number; profitMargin: number }> = {};
      
      (purchases || []).forEach(p => {
        const date = format(new Date(p.created_at), 'MMM dd');
        if (!tokenDailyData[date]) tokenDailyData[date] = { purchased: 0, used: 0, profitMargin: 0 };
        tokenDailyData[date].purchased += p.amount;
      });

      (usage || []).forEach(u => {
        const date = format(new Date(u.created_at), 'MMM dd');
        if (!tokenDailyData[date]) tokenDailyData[date] = { purchased: 0, used: 0, profitMargin: 0 };
        tokenDailyData[date].used += Math.abs(u.amount);
      });

      Object.keys(tokenDailyData).forEach(date => {
        const rev = tokenDailyData[date].purchased * 0.01;
        const cost = (dailyData[date]?.costs || 0);
        tokenDailyData[date].profitMargin = rev > 0 ? ((rev - cost) / rev) * 100 : 0;
      });

      const economyData = Object.entries(tokenDailyData).map(([date, values]) => ({
        date,
        purchased: values.purchased,
        used: values.used,
        profitMargin: Number(values.profitMargin.toFixed(1))
      }));

      setTokenEconomy(economyData);

      // Revenue by pack size
      const packSizes: Record<string, number> = {};
      (purchases || []).forEach(p => {
        const size = p.amount;
        const key = size >= 10000 ? '10000+' : size >= 5000 ? '5000' : size >= 1000 ? '1000' : size >= 500 ? '500' : '100';
        packSizes[key] = (packSizes[key] || 0) + (size * 0.01);
      });

      const packData = Object.entries(packSizes).map(([name, value]) => ({
        name: `${name} tokens`,
        value: Number(value.toFixed(2))
      }));

      setRevenueByPack(packData);


      // Fetch financial summary
      const { count: activeSubs } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      const totalPurchased = (purchases || []).reduce((sum, p) => sum + p.amount, 0);
      const totalUsed = Math.abs((usage || []).reduce((sum, u) => sum + u.amount, 0));
      const tokenUtilization = totalPurchased > 0 ? (totalUsed / totalPurchased) * 100 : 0;
      const avgCostPerToken = totalUsed > 0 ? totalCosts / totalUsed : 0;
      const grossMargin = 0.01 - avgCostPerToken;

      setSummary({
        activeSubscriptions: activeSubs || 0,
        mrr: 0, // Would need subscription price data
        churnRate: 0, // Would need historical subscription data
        ltv: uniqueUsers > 0 ? revenue / uniqueUsers : 0,
        tokenUtilization,
        avgCostPerToken,
        avgRevenuePerToken: 0.01,
        grossMarginPerToken: grossMargin
      });

    } catch (error) {
      console.error('Error fetching financial data:', error);
      toast.error('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    // Export trends data
    const csv = [
      ['Date', 'Revenue', 'Costs', 'Profit'],
      ...revenueTrends.map(d => [d.date, d.revenue, d.costs, d.profit])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financial-report-${format(dateRange.start, 'yyyy-MM-dd')}-to-${format(dateRange.end, 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Financial report exported');
  };

  const exportToPDF = async () => {
    try {
      toast.info('Generating PDF report...');
      
      const transactions = await fetchTransactionsForExport();
      
      await generateFinancialPDF({
        dateRange: {
          start: format(dateRange.start, 'yyyy-MM-dd'),
          end: format(dateRange.end, 'yyyy-MM-dd'),
        },
        metrics: {
          totalRevenue: metrics.totalRevenue,
          totalCosts: metrics.totalCosts,
          netProfit: metrics.netProfit,
          profitMargin: metrics.profitMargin,
        },
        chartIds: ['revenue-trends-chart', 'token-economy-chart', 'revenue-pack-chart', 'cost-provider-chart'],
        transactions,
        summary: {
          activeSubscriptions: summary.activeSubscriptions,
          mrr: summary.mrr,
          tokenUtilization: summary.tokenUtilization,
          avgCostPerToken: summary.avgCostPerToken,
        },
      });
      
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.error('Failed to generate PDF report');
    }
  };

  const fetchTransactionsForExport = async () => {
    try {
      const { data: purchases } = await supabase
        .from('token_transactions')
        .select('*')
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      return purchases || [];
    } catch (error) {
      console.error('Fetch transactions error:', error);
      return [];
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Date Range Selector */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
          <span className="text-xs sm:text-sm font-medium">Date Range:</span>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Button variant="outline" size="sm" onClick={() => setPresetRange('today')} className="h-7 sm:h-8 text-xs px-2 sm:px-3">Today</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange('yesterday')} className="h-7 sm:h-8 text-xs px-2 sm:px-3 hidden sm:inline-flex">Yesterday</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange('7days')} className="h-7 sm:h-8 text-xs px-2 sm:px-3">7 Days</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange('30days')} className="h-7 sm:h-8 text-xs px-2 sm:px-3">30 Days</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange('thisMonth')} className="h-7 sm:h-8 text-xs px-2 sm:px-3 hidden md:inline-flex">This Month</Button>
            <Button variant="outline" size="sm" onClick={() => setPresetRange('lastMonth')} className="h-7 sm:h-8 text-xs px-2 sm:px-3 hidden md:inline-flex">Last Month</Button>
          </div>
          <div className="flex-1" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={exportToCSV} className="h-7 sm:h-8 text-xs">
              <Download className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button variant="default" size="sm" onClick={exportToPDF} className="h-7 sm:h-8 text-xs">
              <FileText className="h-3 w-3 mr-1" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
        </div>
      </Card>

      {/* Revenue Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Revenue</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold">${metrics.totalRevenue.toFixed(2)}</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">API Costs</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold">${metrics.totalCosts.toFixed(2)}</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Profit</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold">${metrics.netProfit.toFixed(2)}</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">Margin</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold">{metrics.profitMargin.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue Trends Chart */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Revenue Trends</h3>
          <div id="revenue-trends-chart" className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue" />
              <Line type="monotone" dataKey="costs" stroke="#ef4444" name="Costs" />
              <Line type="monotone" dataKey="profit" stroke="#3b82f6" name="Profit" />
            </LineChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Token Economy Chart */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Token Economy</h3>
          <div id="token-economy-chart" className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenEconomy}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 10 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Bar yAxisId="left" dataKey="purchased" fill="#10b981" name="Purchased" />
              <Bar yAxisId="left" dataKey="used" fill="#ef4444" name="Used" />
              <Line yAxisId="right" type="monotone" dataKey="profitMargin" stroke="#8b5cf6" name="Profit %" />
            </BarChart>
          </ResponsiveContainer>
          </div>
        </Card>

        {/* Revenue by Pack Size */}
        <Card className="p-3 sm:p-4">
          <h3 className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Revenue by Token Pack</h3>
          <div id="revenue-pack-chart" className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
              <Pie
                data={revenueByPack}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name}: $${entry.value}`}
                outerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {revenueByPack.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </Card>

      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4">Billing Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Active Subscriptions</span>
              <span className="font-semibold">{summary.activeSubscriptions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Average Order Value</span>
              <span className="font-semibold">${metrics.avgOrderValue.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Revenue Per User</span>
              <span className="font-semibold">${metrics.revenuePerUser.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Customer LTV</span>
              <span className="font-semibold">${summary.ltv.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-semibold mb-4">Usage Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Token Utilization Rate</span>
              <span className="font-semibold">{summary.tokenUtilization.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Cost Per Token Used</span>
              <span className="font-semibold">${summary.avgCostPerToken.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Avg Revenue Per Token</span>
              <span className="font-semibold">${summary.avgRevenuePerToken.toFixed(4)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Gross Margin Per Token</span>
              <span className="font-semibold">${summary.grossMarginPerToken.toFixed(4)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
