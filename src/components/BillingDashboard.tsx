import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  ExternalLink,
  Image,
  Mic,
  Video,
  Sparkles,
  Coins,
  Receipt,
} from "lucide-react";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { TokenHistoryDialog } from "@/components/TokenHistoryDialog";
import { useBillingData } from "@/hooks/useBillingData";
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

const RESOURCE_ICONS = {
  image_generation: Image,
  voice_generation: Mic,
  video_generation: Video,
  style_transfer: Sparkles,
};

export function BillingDashboard() {
  const {
    usageData,
    invoices,
    loading,
    loadUsageData,
    loadInvoices,
    getTotalCost,
    getCostByResourceType,
    getCostByProvider,
    openCustomerPortal,
  } = useBillingData();

  const [dateRange, setDateRange] = useState<'7d' | '30d' | 'month' | 'last-month'>('30d');
  const [showTokenHistory, setShowTokenHistory] = useState(false);
  const { balance, lifetimePurchased, lifetimeUsed } = useTokenBalance();

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    let startDate: Date;
    let endDate = new Date();

    switch (dateRange) {
      case '7d':
        startDate = subDays(new Date(), 7);
        break;
      case '30d':
        startDate = subDays(new Date(), 30);
        break;
      case 'month':
        startDate = startOfMonth(new Date());
        endDate = endOfMonth(new Date());
        break;
      case 'last-month':
        startDate = startOfMonth(subMonths(new Date(), 1));
        endDate = endOfMonth(subMonths(new Date(), 1));
        break;
    }

    loadUsageData(startDate, endDate);
  }, [dateRange, loadUsageData]);

  const totalCost = getTotalCost();
  const costsByResource = getCostByResourceType();
  const costsByProvider = getCostByProvider();

  // Prepare chart data
  const dailyCosts = usageData.reduce((acc, item) => {
    const date = format(new Date(item.created_at), 'MMM dd');
    acc[date] = (acc[date] || 0) + Number(item.cost_usd);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(dailyCosts).map(([date, cost]) => ({
    date,
    cost: Number(cost.toFixed(2)),
  }));

  const resourcePieData = Object.entries(costsByResource).map(([type, cost]) => ({
    name: type.replace('_', ' '),
    value: Number(cost.toFixed(2)),
  }));

  const providerBarData = Object.entries(costsByProvider).map(([provider, cost]) => ({
    provider,
    cost: Number(cost.toFixed(2)),
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold">Billing & Usage</h2>
          <p className="text-muted-foreground">Track your API usage and costs</p>
        </div>
        <Button onClick={openCustomerPortal} variant="outline">
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage Subscription
        </Button>
      </div>

      {/* Token Balance Section */}
      <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-500/20 rounded-lg">
              <Coins className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h3 className="text-lg font-display font-bold mb-1">Token Balance</h3>
              <p className="text-sm text-muted-foreground">
                Track your token purchases and usage
              </p>
            </div>
          </div>
          <Button 
            onClick={() => setShowTokenHistory(true)} 
            variant="outline"
            className="border-violet-500/50 hover:bg-violet-500/10"
          >
            <Receipt className="w-4 h-4 mr-2" />
            View History
          </Button>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-black/20 rounded-lg border border-violet-500/20">
            <p className="text-xs text-muted-foreground mb-1">Current Balance</p>
            <p className="text-2xl font-bold text-violet-400">{balance || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">tokens</p>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-lg border border-violet-500/20">
            <p className="text-xs text-muted-foreground mb-1">Lifetime Purchased</p>
            <p className="text-2xl font-bold text-green-400">{lifetimePurchased || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">tokens</p>
          </div>
          <div className="text-center p-4 bg-black/20 rounded-lg border border-violet-500/20">
            <p className="text-xs text-muted-foreground mb-1">Lifetime Used</p>
            <p className="text-2xl font-bold text-orange-400">{lifetimeUsed || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">tokens</p>
          </div>
        </div>
      </Card>

      {/* Token History Dialog */}
      <TokenHistoryDialog 
        open={showTokenHistory} 
        onOpenChange={setShowTokenHistory} 
      />

      {/* Date Range Selector */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Date Range:</span>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">${totalCost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Total Cost</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Image className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${(costsByResource.image_generation || 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Images</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Mic className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${(costsByResource.voice_generation || 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Voice</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <Video className="w-5 h-5 text-purple-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">${(costsByResource.video_generation || 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">Video</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Cost Over Time</CardTitle>
              <CardDescription>Daily API usage costs</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${value}`} />
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Cost by Resource Type</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={resourcePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {resourcePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `$${value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle>Cost by Provider</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={providerBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="provider" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Bar dataKey="cost" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card className="p-6">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your subscription invoices and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No billing history available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {invoices.map((invoice) => (
                    <Card key={invoice.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold">
                              ${(invoice.amount_paid / 100).toFixed(2)} {invoice.currency.toUpperCase()}
                            </p>
                            <Badge
                              variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {invoice.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(invoice.created * 1000), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {invoice.invoice_pdf && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(invoice.invoice_pdf!, '_blank')}
                            >
                              <Download className="w-4 h-4 mr-1" />
                              PDF
                            </Button>
                          )}
                          {invoice.hosted_invoice_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(invoice.hosted_invoice_url!, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
