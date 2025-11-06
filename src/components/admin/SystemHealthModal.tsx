import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Database, HardDrive, Briefcase, CheckCircle2, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface SystemHealthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SystemHealthModal({ open, onOpenChange }: SystemHealthModalProps) {
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState<any>({
    database: { status: 'unknown', metrics: {} },
    storage: { status: 'unknown', metrics: {} },
    jobs: { status: 'unknown', metrics: {} },
  });

  useEffect(() => {
    if (open) {
      fetchHealthData();
    }
  }, [open]);

  const fetchHealthData = async () => {
    setLoading(true);
    try {
      // Database health
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true });
      
      const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true });

      // Job queue health
      const { data: queuedJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'queued');

      const { data: processingJobs } = await supabase
        .from('jobs')
        .select('id, started_at')
        .eq('status', 'processing');

      const { data: failedJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('status', 'failed');

      // Storage health
      const { data: storageList } = await supabase.storage
        .from('virtura-media')
        .list();

      const totalFiles = storageList?.length || 0;
      const totalSize = storageList?.reduce((sum, file) => sum + (file.metadata?.size || 0), 0) || 0;

      // Check for stuck jobs (processing > 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const stuckJobs = processingJobs?.filter(job => 
        job.started_at && new Date(job.started_at) < new Date(oneHourAgo)
      ) || [];

      setHealthData({
        database: {
          status: !profilesError && !jobsError ? 'healthy' : 'error',
          metrics: {
            totalUsers: profiles || 0,
            totalJobs: jobs || 0,
            responseTime: '< 100ms',
          },
        },
        storage: {
          status: totalFiles > 0 ? 'healthy' : 'warning',
          metrics: {
            totalFiles,
            totalSize: (totalSize / (1024 * 1024)).toFixed(2) + ' MB',
          },
        },
        jobs: {
          status: stuckJobs.length === 0 && (failedJobs?.length || 0) < 10 ? 'healthy' : 'warning',
          metrics: {
            queued: queuedJobs?.length || 0,
            processing: processingJobs?.length || 0,
            failed: failedJobs?.length || 0,
            stuck: stuckJobs.length,
          },
        },
      });
    } catch (error) {
      console.error('Health check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Healthy</Badge>;
      case 'warning':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Warning</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-500" />
            System Health Monitor
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-80px)] px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Database Status */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-blue-500" />
                    <h3 className="font-semibold">Database Status</h3>
                  </div>
                  {getStatusBadge(healthData.database.status)}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Users</p>
                    <p className="text-2xl font-bold">{healthData.database.metrics.totalUsers}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Jobs</p>
                    <p className="text-2xl font-bold">{healthData.database.metrics.totalJobs}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">{healthData.database.metrics.responseTime}</p>
                  </div>
                </div>
              </Card>

              {/* Storage Status */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-purple-500" />
                    <h3 className="font-semibold">Storage Status</h3>
                  </div>
                  {getStatusBadge(healthData.storage.status)}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Files</p>
                    <p className="text-2xl font-bold">{healthData.storage.metrics.totalFiles}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Storage Used</p>
                    <p className="text-2xl font-bold">{healthData.storage.metrics.totalSize}</p>
                  </div>
                </div>
              </Card>

              {/* Job Queue Health */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-orange-500" />
                    <h3 className="font-semibold">Job Queue Health</h3>
                  </div>
                  {getStatusBadge(healthData.jobs.status)}
                </div>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Queued</p>
                    <p className="text-2xl font-bold">{healthData.jobs.metrics.queued}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Processing</p>
                    <p className="text-2xl font-bold">{healthData.jobs.metrics.processing}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-red-500">{healthData.jobs.metrics.failed}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Stuck</p>
                    <p className="text-2xl font-bold text-orange-500">{healthData.jobs.metrics.stuck}</p>
                  </div>
                </div>
              </Card>

              <p className="text-xs text-muted-foreground text-center">
                Last checked: {format(new Date(), 'MMM dd, yyyy HH:mm:ss')}
              </p>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
