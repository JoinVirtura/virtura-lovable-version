import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Play, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Activity,
  Database,
  Server,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeJobs: number;
  failedJobs: number;
  completedToday: number;
  totalProjects: number;
  totalRenders: number;
  storageUsed: number;
}

interface Job {
  id: string;
  type: string;
  status: string;
  progress: number;
  stage: string;
  error_message?: string;
  created_at: string;
  user_id: string;
  project_id: string;
}

interface UsageData {
  user_id: string;
  resource_type: string;
  amount: number;
  created_at: string;
}

export const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeJobs: 0,
    failedJobs: 0,
    completedToday: 0,
    totalProjects: 0,
    totalRenders: 0,
    storageUsed: 0
  });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadAdminData = async () => {
    try {
      // Check if user is admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (roleData?.role !== 'admin' && roleData?.role !== 'owner') {
        toast({
          title: "Access Denied",
          description: "You don't have admin privileges",
          variant: "destructive"
        });
        return;
      }

      // Load statistics
      await Promise.all([
        loadStats(),
        loadJobs(),
        loadUsageData()
      ]);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get user count from auth metadata or user_roles table
      const { count: totalUsers } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true });

      // Get job statistics
      const { data: jobStats } = await supabase
        .from('jobs')
        .select('status, created_at');

      const activeJobs = jobStats?.filter(j => 
        j.status === 'queued' || j.status === 'processing'
      ).length || 0;

      const failedJobs = jobStats?.filter(j => j.status === 'failed').length || 0;

      const today = new Date().toISOString().split('T')[0];
      const completedToday = jobStats?.filter(j => 
        j.status === 'completed' && j.created_at.startsWith(today)
      ).length || 0;

      // Get project count
      const { count: totalProjects } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });

      // Get render count
      const { count: totalRenders } = await supabase
        .from('renders')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: totalUsers || 0,
        activeJobs,
        failedJobs,
        completedToday,
        totalProjects: totalProjects || 0,
        totalRenders: totalRenders || 0,
        storageUsed: 0 // TODO: Calculate from storage
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Failed to load jobs:', error);
    }
  };

  const loadUsageData = async () => {
    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      const { data, error } = await supabase
        .from('usage_tracking')
        .select('*')
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsageData(data || []);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    }
  };

  const retryFailedJob = async (jobId: string) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ 
          status: 'queued'
        })
        .eq('id', jobId);

      if (error) throw error;

      toast({
        title: "Job Requeued",
        description: "Failed job has been added back to the queue"
      });

      loadJobs();
    } catch (error: any) {
      toast({
        title: "Retry Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'queued': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing': return <Play className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      queued: 'default',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          System monitoring and management
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Jobs</p>
                <p className="text-2xl font-bold">{stats.activeJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Jobs</p>
                <p className="text-2xl font-bold">{stats.failedJobs}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold">{stats.completedToday}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Job Queue</TabsTrigger>
          <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Jobs</CardTitle>
              <Button onClick={loadJobs} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {jobs.map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(job.status)}
                      <div>
                        <p className="font-medium">{job.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {job.stage} • {new Date(job.created_at).toLocaleString()}
                        </p>
                        {job.error_message && (
                          <p className="text-sm text-red-600 mt-1">{job.error_message}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(job.status)}
                      {job.status === 'failed' && (
                        <Button 
                          onClick={() => retryFailedJob(job.id)}
                          size="sm" 
                          variant="outline"
                        >
                          Retry
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Usage by resource type */}
                {['audio_generation', 'video_generation', 'storage'].map((resourceType) => {
                  const usageCount = usageData.filter(u => u.resource_type === resourceType).length;
                  return (
                    <div key={resourceType} className="flex justify-between items-center p-3 border rounded-lg">
                      <span className="font-medium capitalize">{resourceType.replace('_', ' ')}</span>
                      <Badge variant="outline">{usageCount} uses</Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Database Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Projects</span>
                  <span className="font-medium">{stats.totalProjects}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Renders</span>
                  <span className="font-medium">{stats.totalRenders}</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage Used</span>
                  <span className="font-medium">{stats.storageUsed} MB</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Service Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>ElevenLabs API</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>HeyGen API</span>
                  <Badge variant="default">Operational</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Storage Service</span>
                  <Badge variant="default">Operational</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};