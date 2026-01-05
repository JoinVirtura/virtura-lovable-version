import { useEffect, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { 
  Activity, Database, HardDrive, Briefcase, CheckCircle2, XCircle, Clock, 
  RefreshCw, Wifi, Server, Zap
} from "lucide-react";
import { format } from "date-fns";

interface SystemHealthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ApiHealth {
  replicate: 'healthy' | 'error' | 'unknown';
  openai: 'healthy' | 'error' | 'unknown';
  elevenlabs: 'healthy' | 'error' | 'unknown';
  heygen: 'healthy' | 'error' | 'unknown';
}

export function SystemHealthModal({ open, onOpenChange }: SystemHealthModalProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [apiHealth, setApiHealth] = useState<ApiHealth>({
    replicate: 'unknown',
    openai: 'unknown',
    elevenlabs: 'unknown',
    heygen: 'unknown',
  });
  const [healthData, setHealthData] = useState<any>({
    database: { status: 'unknown', metrics: {} },
    storage: { status: 'unknown', metrics: {} },
    jobs: { status: 'unknown', metrics: {} },
    realtime: { status: 'unknown', metrics: {} },
  });

  const fetchHealthData = useCallback(async () => {
    try {
      // Measure DB latency
      const dbStartTime = performance.now();
      
      // Database health - use proper count extraction
      const { count: profileCount, error: profilesError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      const { count: jobCount, error: jobsError } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true });

      const dbLatency = Math.round(performance.now() - dbStartTime);

      // Job queue health
      const { count: queuedCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'queued');

      const { data: processingJobs } = await supabase
        .from('jobs')
        .select('id, started_at')
        .eq('status', 'processing');

      const { count: failedCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'failed');

      // Storage health
      const { data: storageList } = await supabase.storage
        .from('virtura-media')
        .list('', { limit: 100 });

      const totalFiles = storageList?.length || 0;

      // Check for stuck jobs (processing > 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const stuckJobs = processingJobs?.filter(job => 
        job.started_at && new Date(job.started_at) < new Date(oneHourAgo)
      ) || [];

      // Token transactions rate (last hour)
      const oneHourAgoTime = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count: txnCount } = await supabase
        .from('token_transactions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgoTime);

      // Active users (last 30 minutes)
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data: recentActivity } = await supabase
        .from('token_transactions')
        .select('user_id')
        .gte('created_at', thirtyMinAgo);
      
      const activeUsers = new Set(recentActivity?.map(a => a.user_id) || []).size;

      setHealthData({
        database: {
          status: !profilesError && !jobsError ? 'healthy' : 'error',
          metrics: {
            totalUsers: profileCount || 0,
            totalJobs: jobCount || 0,
            latency: `${dbLatency}ms`,
            txnRate: `${txnCount || 0}/hr`,
          },
        },
        storage: {
          status: 'healthy',
          metrics: {
            totalFiles,
            buckets: 4,
          },
        },
        jobs: {
          status: stuckJobs.length === 0 && (failedCount || 0) < 10 ? 'healthy' : 
                  (failedCount || 0) >= 10 ? 'error' : 'warning',
          metrics: {
            queued: queuedCount || 0,
            processing: processingJobs?.length || 0,
            failed: failedCount || 0,
            stuck: stuckJobs.length,
          },
        },
        realtime: {
          status: activeUsers > 0 ? 'healthy' : 'warning',
          metrics: {
            activeUsers,
            latency: dbLatency,
          },
        },
      });

      setLastChecked(new Date());
    } catch (error) {
      console.error('Health check error:', error);
    }
  }, []);

  const checkApiHealth = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-api-integrations', {
        body: { quick: true },
      });

      if (!error && data) {
        setApiHealth({
          replicate: data.replicate?.success ? 'healthy' : 'error',
          openai: data.openai?.success ? 'healthy' : 'error',
          elevenlabs: data.elevenlabs?.success ? 'healthy' : 'error',
          heygen: data.heygen?.success ? 'healthy' : 'error',
        });
      }
    } catch (error) {
      console.error('API health check error:', error);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setLoading(true);
      Promise.all([fetchHealthData(), checkApiHealth()]).finally(() => setLoading(false));

      // Set up realtime subscription
      const channel = supabase
        .channel('health-monitor')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => fetchHealthData())
        .subscribe();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchHealthData, 30000);

      return () => {
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [open, fetchHealthData, checkApiHealth]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchHealthData(), checkApiHealth()]);
    setRefreshing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="h-3 w-3 mr-1" /> Healthy</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30"><Clock className="h-3 w-3 mr-1" /> Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline" className="text-muted-foreground">Unknown</Badge>;
    }
  };

  const getApiStatusDot = (status: string) => {
    switch (status) {
      case 'healthy':
        return <span className="w-2 h-2 rounded-full bg-green-500" />;
      case 'error':
        return <span className="w-2 h-2 rounded-full bg-red-500" />;
      default:
        return <span className="w-2 h-2 rounded-full bg-gray-400" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-4 sm:p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              System Health Monitor
              <Badge variant="outline" className="ml-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-1.5" />
                Live
              </Badge>
            </DialogTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-4 sm:px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Database Status */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold text-sm sm:text-base">Database Status</h3>
                  </div>
                  {getStatusBadge(healthData.database.status)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Total Users</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.database.metrics.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Total Jobs</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.database.metrics.totalJobs}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">DB Latency</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.database.metrics.latency}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Txn Rate</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.database.metrics.txnRate}</p>
                  </div>
                </div>
              </Card>

              {/* API Health */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-sm sm:text-base">API Integrations</h3>
                  </div>
                  <Badge variant="outline" className="text-xs">External Services</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    {getApiStatusDot(apiHealth.replicate)}
                    <span className="text-sm">Replicate</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    {getApiStatusDot(apiHealth.openai)}
                    <span className="text-sm">OpenAI</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    {getApiStatusDot(apiHealth.elevenlabs)}
                    <span className="text-sm">ElevenLabs</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    {getApiStatusDot(apiHealth.heygen)}
                    <span className="text-sm">HeyGen</span>
                  </div>
                </div>
              </Card>

              {/* Storage Status */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold text-sm sm:text-base">Storage Status</h3>
                  </div>
                  {getStatusBadge(healthData.storage.status)}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Recent Files</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.storage.metrics.totalFiles}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Buckets</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.storage.metrics.buckets}</p>
                  </div>
                </div>
              </Card>

              {/* Job Queue Health */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold text-sm sm:text-base">Job Queue Health</h3>
                  </div>
                  {getStatusBadge(healthData.jobs.status)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Queued</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.jobs.metrics.queued}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Processing</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.jobs.metrics.processing}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Failed</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-500">{healthData.jobs.metrics.failed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Stuck</p>
                    <p className="text-xl sm:text-2xl font-bold text-orange-500">{healthData.jobs.metrics.stuck}</p>
                  </div>
                </div>
              </Card>

              {/* Realtime Status */}
              <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <h3 className="font-semibold text-sm sm:text-base">Realtime Activity</h3>
                  </div>
                  {getStatusBadge(healthData.realtime.status)}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Active Users (30m)</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.realtime.metrics.activeUsers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Response Time</p>
                    <p className="text-xl sm:text-2xl font-bold">{healthData.realtime.metrics.latency}ms</p>
                  </div>
                </div>
              </Card>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Last checked: {format(lastChecked, 'MMM dd, yyyy HH:mm:ss')}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
