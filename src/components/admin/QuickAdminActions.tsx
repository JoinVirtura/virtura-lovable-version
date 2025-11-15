import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { RetryJobsModal } from "./RetryJobsModal";
import { CreditTokensDialog } from "./CreditTokensDialog";
import { SystemHealthModal } from "./SystemHealthModal";
import { NotificationDialog } from "./NotificationDialog";
import { RefreshCw, Coins, Activity, Bell } from "lucide-react";

interface QuickAdminActionsProps {
  onActionComplete?: () => void;
}

export function QuickAdminActions({ onActionComplete }: QuickAdminActionsProps) {
  const [showRetryJobs, setShowRetryJobs] = useState(false);
  const [showCreditTokens, setShowCreditTokens] = useState(false);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [stats, setStats] = useState({
    failedJobs: 0,
    lowBalanceUsers: 0,
    systemHealth: 'good' as 'good' | 'warning' | 'critical',
  });

  useEffect(() => {
    fetchQuickStats();
  }, []);

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

      setStats({
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
    onActionComplete?.();
  };

  return (
    <>
      <Card className="w-full p-3 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-xs sm:text-sm font-semibold">Quick Actions</h3>
          <div className="w-full flex items-center flex-wrap gap-2 sm:gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Failed Jobs:</span>
              <Badge variant={stats.failedJobs > 0 ? "destructive" : "secondary"}>
                {stats.failedJobs}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">Low Balance:</span>
              <Badge variant="secondary">{stats.lowBalanceUsers}</Badge>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">System:</span>
              <Badge variant={
                stats.systemHealth === 'good' ? 'default' : 
                stats.systemHealth === 'warning' ? 'secondary' : 
                'destructive'
              }>
                {stats.systemHealth === 'good' ? '🟢' : stats.systemHealth === 'warning' ? '🟡' : '🔴'} 
                {stats.systemHealth}
              </Badge>
            </div>
          </div>
        </div>

        <div className="w-full flex flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRetryJobs(true)}
            className="w-full sm:w-auto h-auto sm:h-10 py-2 sm:py-2"
          >
            <RefreshCw className="h-4 w-4" />
            Retry Failed Jobs
            {stats.failedJobs > 0 && (
              <Badge variant="destructive" className="ml-1">{stats.failedJobs}</Badge>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreditTokens(true)}
            className="w-full sm:w-auto h-auto sm:h-10 py-2 sm:py-2"
          >
            <Coins className="h-4 w-4" />
            Credit Tokens
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSystemHealth(true)}
            className="w-full sm:w-auto h-auto sm:h-10 py-2 sm:py-2"
          >
            <Activity className="h-4 w-4" />
            System Health
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotification(true)}
            className="w-full sm:w-auto h-auto sm:h-10 py-2 sm:py-2"
          >
            <Bell className="h-4 w-4" />
            Send Notification
          </Button>
        </div>
      </Card>

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
    </>
  );
}
