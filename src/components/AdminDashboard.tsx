import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Activity, Video, Mic, Image, Loader2, RotateCcw, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { AdminVideoRecovery } from '@/components/AdminVideoRecovery';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardStats {
  totalUsers: number;
  activeJobs: number;
  completedToday: number;
  failedJobs: number;
  storageUsed: number;
  credits: {
    voice: number;
    video: number;
    storage: number;
  };
}

interface JobData {
  id: string;
  type: string;
  status: string;
  progress: number;
  user_id: string;
  created_at: string;
  error_message?: string;
  stage?: string;
}

interface UserActivity {
  user_id: string;
  email?: string;
  totalJobs: number;
  creditsUsed: number;
  lastActive: string;
}

export function AdminDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [users, setUsers] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch real jobs data from database
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, type, status, progress, user_id, created_at, error_message, stage')
        .order('created_at', { ascending: false })
        .limit(50);

      if (jobsError) throw jobsError;

      const fetchedJobs = jobsData || [];
      setJobs(fetchedJobs);

      // Calculate real stats
      const today = new Date().toISOString().split('T')[0];
      const todayJobs = fetchedJobs.filter(job => job.created_at.startsWith(today));
      
      // Count unique users
      const uniqueUsers = new Set(fetchedJobs.map(j => j.user_id)).size;

      // Fetch usage tracking for credits
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('resource_type, amount')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const voiceCredits = usageData?.filter(u => u.resource_type === 'voice_generation').reduce((sum, u) => sum + u.amount, 0) || 0;
      const videoCredits = usageData?.filter(u => u.resource_type === 'video_generation').reduce((sum, u) => sum + u.amount, 0) || 0;
      
      setStats({
        totalUsers: uniqueUsers,
        activeJobs: fetchedJobs.filter(j => j.status === 'processing' || j.status === 'queued').length,
        completedToday: todayJobs.filter(j => j.status === 'completed' || j.status === 'done').length,
        failedJobs: fetchedJobs.filter(j => j.status === 'error' || j.status === 'failed').length,
        storageUsed: 0,
        credits: {
          voice: voiceCredits,
          video: videoCredits,
          storage: 0
        }
      });

      // Aggregate user activity
      const userActivityMap = new Map<string, { totalJobs: number, creditsUsed: number, lastActive: string }>();
      
      fetchedJobs.forEach(job => {
        const existing = userActivityMap.get(job.user_id);
        if (!existing) {
          userActivityMap.set(job.user_id, {
            totalJobs: 1,
            creditsUsed: 0,
            lastActive: job.created_at
          });
        } else {
          existing.totalJobs++;
          if (new Date(job.created_at) > new Date(existing.lastActive)) {
            existing.lastActive = job.created_at;
          }
        }
      });

      const userActivities: UserActivity[] = Array.from(userActivityMap.entries()).map(([user_id, data]) => ({
        user_id,
        email: undefined,
        ...data
      }));

      setUsers(userActivities);

    } catch (error: any) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getJobStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
      case 'done':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>;
      case 'processing':
      case 'running':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200"><Clock className="w-3 h-3 mr-1" />Running</Badge>;
      case 'error':
      case 'failed':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><AlertTriangle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const retryJob = async (jobId: string) => {
    try {
      // Call retry function
      const { data, error } = await supabase.functions.invoke('job-retry', {
        body: { jobId }
      });

      if (error) throw error;

      toast({
        title: "Job Retried",
        description: "The job has been queued for retry",
      });

      fetchDashboardData();
    } catch (error: any) {
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading || !stats) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getJobTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video':
      case 'video_generation':
        return <Video className="w-4 h-4 text-violet-400" />;
      case 'voice':
      case 'voice_generation':
        return <Mic className="w-4 h-4 text-cyan-400" />;
      case 'image':
      case 'image_generation':
        return <Image className="w-4 h-4 text-pink-400" />;
      default:
        return <Activity className="w-4 h-4 text-amber-400" />;
    }
  };

  const filteredJobs = jobs.filter(job => {
    const statusMatch = statusFilter === 'all' || job.status === statusFilter;
    const typeMatch = typeFilter === 'all' || job.type.toLowerCase().includes(typeFilter.toLowerCase());
    return statusMatch && typeMatch;
  });

  const queuedJobs = jobs.filter(j => j.status === 'queued').length;
  const failedJobsList = jobs.filter(j => j.status === 'error' || j.status === 'failed');

  const bulkRetryFailed = async () => {
    for (const job of failedJobsList) {
      await retryJob(job.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Activity className="w-8 h-8 text-violet-400" />
            Job Queue & Processing
          </h1>
          <p className="text-muted-foreground">Monitor jobs, render queues, and processing status</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Job-Focused Stats Cards - Glassmorphic */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Queued</CardTitle>
            <Clock className="h-5 w-5 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">{queuedJobs}</div>
            <p className="text-xs text-muted-foreground">awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-400">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">currently processing</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20 backdrop-blur-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-5 w-5 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-400">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">successful renders</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br from-red-500/10 to-red-600/5 border-red-500/20 backdrop-blur-xl ${stats.failedJobs > 0 ? 'animate-pulse' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-400">{stats.failedJobs}</div>
            <p className="text-xs text-muted-foreground">need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Credits Usage - Glassmorphic */}
      <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-400" />
            Resource Usage (24h)
          </CardTitle>
          <CardDescription>Platform resource consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  Voice Generation
                </span>
                <span className="text-sm text-cyan-400 font-semibold">{stats.credits.voice}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${Math.min((stats.credits.voice / 100) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Video className="w-4 h-4 text-violet-400" />
                  Video Generation
                </span>
                <span className="text-sm text-violet-400 font-semibold">{stats.credits.video}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-500"
                  style={{ width: `${Math.min((stats.credits.video / 50) * 100, 100)}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 p-4 rounded-lg bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Image className="w-4 h-4 text-pink-400" />
                  Storage
                </span>
                <span className="text-sm text-pink-400 font-semibold">{stats.credits.storage}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-500 to-pink-400 transition-all duration-500"
                  style={{ width: `${Math.min((stats.credits.storage / 200) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Views */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList className="bg-slate-900/50 border border-white/10">
          <TabsTrigger value="jobs">Job Queue</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="recovery">Video Recovery</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-white/10 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-violet-400" />
                  Real-Time Job Queue
                </CardTitle>
                <CardDescription>Live processing status with instant updates</CardDescription>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-slate-800/50 border-white/10">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="queued">Queued</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-32 bg-slate-800/50 border-white/10">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="voice">Voice</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
                {failedJobsList.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={bulkRetryFailed}
                    className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry All Failed ({failedJobsList.length})
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredJobs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No jobs found matching filters
                  </div>
                ) : (
                  filteredJobs.slice(0, 15).map((job) => (
                    <div 
                      key={job.id} 
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-2 rounded-lg bg-slate-700/50">
                          {getJobTypeIcon(job.type)}
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{job.type}</span>
                            {getJobStatusBadge(job.status)}
                            {job.stage && (
                              <Badge variant="outline" className="text-xs bg-slate-700/50">
                                {job.stage}
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {job.id.slice(0, 8)}... • {new Date(job.created_at).toLocaleString()}
                          </div>
                          {job.error_message && (
                            <div className="text-sm text-red-400 bg-red-500/10 px-2 py-1 rounded">
                              {job.error_message}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {job.status === 'processing' && (
                          <div className="flex items-center gap-2">
                            <Progress value={job.progress} className="w-24 h-2" />
                            <span className="text-xs text-muted-foreground">{job.progress}%</span>
                          </div>
                        )}
                        {(job.status === 'error' || job.status === 'failed') && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => retryJob(job.id)}
                            className="bg-slate-700/50 hover:bg-slate-600/50"
                          >
                            <RotateCcw className="w-4 h-4 mr-1" />
                            Retry
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card className="bg-gradient-to-br from-slate-900/50 to-slate-800/50 border-white/10 backdrop-blur-xl">
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Most active users and their usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {users.slice(0, 10).map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 rounded-lg bg-slate-800/30 border border-white/5">
                    <div className="space-y-1">
                      <div className="font-medium">{user.user_id.slice(0, 8)}...</div>
                      <div className="text-sm text-muted-foreground">
                        Last active: {new Date(user.lastActive).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium text-violet-400">{user.totalJobs} jobs</div>
                      <div className="text-sm text-muted-foreground">{user.creditsUsed} credits</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recovery" className="space-y-4">
          <AdminVideoRecovery />
        </TabsContent>
      </Tabs>
    </div>
  );
}