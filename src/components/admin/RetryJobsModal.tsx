import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { RefreshCw, XCircle } from "lucide-react";
import { format } from "date-fns";

interface RetryJobsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function RetryJobsModal({ open, onOpenChange, onSuccess }: RetryJobsModalProps) {
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [failedJobs, setFailedJobs] = useState<any[]>([]);
  const [selectedJobs, setSelectedJobs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      fetchFailedJobs();
    }
  }, [open]);

  const fetchFailedJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id,
          type,
          status,
          error_message,
          created_at,
          updated_at,
          retry_count,
          user_id
        `)
        .eq('status', 'failed')
        .order('updated_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Get user display names for each job - optimized query
      const userIds = [...new Set(data?.map(job => job.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
      
      const jobsWithUsers = (data || []).map(job => ({
        ...job,
        userName: profileMap.get(job.user_id) || job.user_id.slice(0, 8) + '...',
      }));

      setFailedJobs(jobsWithUsers);
    } catch (error: any) {
      console.error('Fetch failed jobs error:', error);
      toast({
        title: "Error",
        description: "Failed to load failed jobs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleJob = (jobId: string) => {
    const newSelected = new Set(selectedJobs);
    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobs(newSelected);
  };

  const selectAll = () => {
    if (selectedJobs.size === failedJobs.length) {
      setSelectedJobs(new Set());
    } else {
      setSelectedJobs(new Set(failedJobs.map(j => j.id)));
    }
  };

  const handleRetry = async (retryAll: boolean = false) => {
    setRetrying(true);
    try {
      const jobsToRetry = retryAll ? failedJobs.map(j => j.id) : Array.from(selectedJobs);
      
      if (jobsToRetry.length === 0) {
        toast({
          title: "No Jobs Selected",
          description: "Please select at least one job to retry",
          variant: "destructive",
        });
        return;
      }

      // Retry jobs in batch
      const results = await Promise.allSettled(
        jobsToRetry.map(jobId =>
          supabase.functions.invoke('job-retry', {
            body: { jobIds: [jobId] },
          })
        )
      );

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      toast({
        title: "Retry Complete",
        description: `${successful} jobs queued for retry${failed > 0 ? `, ${failed} failed` : ''}`,
      });

      setSelectedJobs(new Set());
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Retry jobs error:', error);
      toast({
        title: "Error",
        description: "Failed to retry jobs",
        variant: "destructive",
      });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Failed Jobs ({failedJobs.length})
            </DialogTitle>
            {failedJobs.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={selectAll}
              >
                {selectedJobs.size === failedJobs.length ? 'Deselect All' : 'Select All'}
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-160px)] px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : failedJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No failed jobs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {failedJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-start gap-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleJob(job.id)}
                >
                  <Checkbox
                    checked={selectedJobs.has(job.id)}
                    onCheckedChange={() => toggleJob(job.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{job.type}</p>
                      <Badge variant="outline" className="text-xs">
                        Retry: {job.retry_count}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      User: {job.userName}
                    </p>
                    <p className="text-xs text-red-500 mt-1 line-clamp-2">
                      {job.error_message || 'Unknown error'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Failed: {format(new Date(job.updated_at), 'MMM dd, yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <DialogFooter className="p-6 pt-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => handleRetry(false)}
            disabled={selectedJobs.size === 0 || retrying}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {retrying ? "Retrying..." : `Retry Selected (${selectedJobs.size})`}
          </Button>
          <Button
            onClick={() => handleRetry(true)}
            disabled={failedJobs.length === 0 || retrying}
            variant="default"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {retrying ? "Retrying..." : "Retry All"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
