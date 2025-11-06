import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { RetryJobsModal } from "./RetryJobsModal";
import { CreditTokensDialog } from "./CreditTokensDialog";
import { SystemHealthModal } from "./SystemHealthModal";
import { RefreshCw, Coins, Activity, AlertCircle } from "lucide-react";

interface QuickAdminActionsProps {
  onActionComplete?: () => void;
}

export function QuickAdminActions({ onActionComplete }: QuickAdminActionsProps) {
  const [showRetryJobs, setShowRetryJobs] = useState(false);
  const [showCreditTokens, setShowCreditTokens] = useState(false);
  const [showSystemHealth, setShowSystemHealth] = useState(false);
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
      const { data: failedJobs } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'failed');

      const { data: lowBalance } = await supabase
        .from('user_tokens')
        .select('id', { count: 'exact', head: true })
        .lt('balance', 10);

      setStats({
        failedJobs: failedJobs || 0,
        lowBalanceUsers: lowBalance || 0,
        systemHealth: (failedJobs || 0) > 20 ? 'critical' : (failedJobs || 0) > 5 ? 'warning' : 'good',
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
      <Card className="p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Quick Actions</h3>
          <div className="flex items-center gap-4 text-xs">
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

        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRetryJobs(true)}
            className="flex items-center gap-2"
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
            className="flex items-center gap-2"
          >
            <Coins className="h-4 w-4" />
            Credit Tokens
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSystemHealth(true)}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            System Health
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
    </>
  );
}
