import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, LogIn, UserPlus, AlertTriangle, CheckCircle, Shield, TrendingUp } from "lucide-react";
import { format, subDays, subHours } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { toast } from "sonner";

interface AuthAttempt {
  id: string;
  email: string;
  attempt_type: string;
  success: boolean;
  failure_reason: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

interface AuthStats {
  total24h: number;
  total7d: number;
  total30d: number;
  logins24h: number;
  signups24h: number;
  failed24h: number;
  successRate: number;
}

interface TrendData {
  date: string;
  logins: number;
  signups: number;
  failed: number;
}

export function AuthAttemptsDashboard() {
  const [attempts, setAttempts] = useState<AuthAttempt[]>([]);
  const [stats, setStats] = useState<AuthStats>({
    total24h: 0,
    total7d: 0,
    total30d: 0,
    logins24h: 0,
    signups24h: 0,
    failed24h: 0,
    successRate: 0,
  });
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "login" | "signup" | "failed">("all");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d">("24h");

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const hours24Ago = subHours(now, 24).toISOString();
      const days7Ago = subDays(now, 7).toISOString();
      const days30Ago = subDays(now, 30).toISOString();

      // Fetch stats for different time ranges
      const [{ count: count24h }, { count: count7d }, { count: count30d }] = await Promise.all([
        supabase.from("auth_attempts").select("*", { count: "exact", head: true }).gte("created_at", hours24Ago),
        supabase.from("auth_attempts").select("*", { count: "exact", head: true }).gte("created_at", days7Ago),
        supabase.from("auth_attempts").select("*", { count: "exact", head: true }).gte("created_at", days30Ago),
      ]);

      // Fetch detailed 24h stats
      const { data: recent24h } = await supabase
        .from("auth_attempts")
        .select("attempt_type, success")
        .gte("created_at", hours24Ago);

      const logins24h = recent24h?.filter(a => a.attempt_type === "login").length || 0;
      const signups24h = recent24h?.filter(a => a.attempt_type === "signup").length || 0;
      const failed24h = recent24h?.filter(a => !a.success).length || 0;
      const successful24h = recent24h?.filter(a => a.success).length || 0;
      const successRate = recent24h && recent24h.length > 0 ? (successful24h / recent24h.length) * 100 : 0;

      setStats({
        total24h: count24h || 0,
        total7d: count7d || 0,
        total30d: count30d || 0,
        logins24h,
        signups24h,
        failed24h,
        successRate,
      });

      // Fetch recent attempts based on time range
      const startDate = timeRange === "24h" ? hours24Ago : timeRange === "7d" ? days7Ago : days30Ago;
      
      const { data: attemptsData } = await supabase
        .from("auth_attempts")
        .select("*")
        .gte("created_at", startDate)
        .order("created_at", { ascending: false })
        .limit(100);

      setAttempts(attemptsData || []);

      // Build trend data
      const { data: trendRaw } = await supabase
        .from("auth_attempts")
        .select("attempt_type, success, created_at")
        .gte("created_at", days7Ago)
        .order("created_at", { ascending: true });

      const dailyTrends: Record<string, TrendData> = {};
      
      (trendRaw || []).forEach(attempt => {
        const date = format(new Date(attempt.created_at), "MMM dd");
        if (!dailyTrends[date]) {
          dailyTrends[date] = { date, logins: 0, signups: 0, failed: 0 };
        }
        if (attempt.attempt_type === "login") dailyTrends[date].logins++;
        if (attempt.attempt_type === "signup") dailyTrends[date].signups++;
        if (!attempt.success) dailyTrends[date].failed++;
      });

      setTrendData(Object.values(dailyTrends));
    } catch (error) {
      console.error("Error fetching auth attempts:", error);
      toast.error("Failed to load auth attempts data");
    } finally {
      setLoading(false);
    }
  };

  const filteredAttempts = attempts.filter(a => {
    if (filter === "all") return true;
    if (filter === "login") return a.attempt_type === "login";
    if (filter === "signup") return a.attempt_type === "signup";
    if (filter === "failed") return !a.success;
    return true;
  });

  const maskEmail = (email: string) => {
    const [local, domain] = email.split("@");
    if (!domain) return email;
    const maskedLocal = local.length > 3 ? local.substring(0, 3) + "***" : "***";
    return `${maskedLocal}@${domain}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            Authentication Attempts
          </h2>
          <p className="text-sm text-muted-foreground">Monitor login and signup activity</p>
        </div>
        <Button onClick={fetchData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
            <span className="text-xs text-muted-foreground">24h Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.total24h}</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <LogIn className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
            <span className="text-xs text-muted-foreground">Logins</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.logins24h}</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <UserPlus className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
            <span className="text-xs text-muted-foreground">Signups</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.signups24h}</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            <span className="text-xs text-muted-foreground">Failed</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-red-500">{stats.failed24h}</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-500" />
            <span className="text-xs text-muted-foreground">Success Rate</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-emerald-500">{stats.successRate.toFixed(1)}%</p>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1 sm:mb-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
            <span className="text-xs text-muted-foreground">7d Total</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold">{stats.total7d}</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="p-3 sm:p-4">
          <h3 className="text-sm font-semibold mb-3 sm:mb-4">7-Day Trend</h3>
          <div className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="logins" stroke="#3b82f6" name="Logins" strokeWidth={2} />
                <Line type="monotone" dataKey="signups" stroke="#22c55e" name="Signups" strokeWidth={2} />
                <Line type="monotone" dataKey="failed" stroke="#ef4444" name="Failed" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <h3 className="text-sm font-semibold mb-3 sm:mb-4">Daily Breakdown</h3>
          <div className="h-[200px] sm:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="logins" fill="#3b82f6" name="Logins" />
                <Bar dataKey="signups" fill="#22c55e" name="Signups" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Attempts Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg">Recent Attempts</CardTitle>
              <CardDescription className="text-xs sm:text-sm">View authentication activity log</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                <SelectTrigger className="w-24 h-8 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filter} onValueChange={(v: any) => setFilter(v)}>
                <SelectTrigger className="w-24 h-8 text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="login">Logins</SelectItem>
                  <SelectItem value="signup">Signups</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Email</TableHead>
                  <TableHead className="text-xs">Type</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs hidden sm:table-cell">Reason</TableHead>
                  <TableHead className="text-xs hidden md:table-cell">IP</TableHead>
                  <TableHead className="text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttempts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No auth attempts found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttempts.slice(0, 50).map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="text-xs sm:text-sm font-mono">
                        {maskEmail(attempt.email)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {attempt.attempt_type === "login" ? (
                            <><LogIn className="h-3 w-3 mr-1" />Login</>
                          ) : (
                            <><UserPlus className="h-3 w-3 mr-1" />Signup</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attempt.success ? (
                          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />Success
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell max-w-[150px] truncate">
                        {attempt.failure_reason || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden md:table-cell font-mono">
                        {attempt.ip_address?.substring(0, 15) || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(attempt.created_at), "MMM d, HH:mm")}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
