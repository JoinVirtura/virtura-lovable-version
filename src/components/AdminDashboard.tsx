import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Users, Video, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

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
      // Mock data since database schema doesn't have all tables yet
      // In production, you would query the actual tables
      const mockJobs: JobData[] = [
        {
          id: '1',
          type: 'voice_generation',
          status: 'completed',
          progress: 100,
          user_id: 'user1',
          created_at: new Date().toISOString(),
          stage: 'export'
        },
        {
          id: '2',
          type: 'video_generation',
          status: 'processing',
          progress: 75,
          user_id: 'user2',
          created_at: new Date().toISOString(),
          stage: 'render'
        },
        {
          id: '3',
          type: 'avatar_upload',
          status: 'error',
          progress: 0,
          user_id: 'user1',
          created_at: new Date().toISOString(),
          error_message: 'Upload failed',
          stage: 'upload'
        }
      ];

      setJobs(mockJobs);

      // Calculate mock stats
      const today = new Date().toISOString().split('T')[0];
      const todayJobs = mockJobs.filter(job => job.created_at.startsWith(today));
      
      setStats({
        totalUsers: 2,
        activeJobs: mockJobs.filter(j => j.status === 'processing').length,
        completedToday: todayJobs.filter(j => j.status === 'completed').length,
        failedJobs: mockJobs.filter(j => j.status === 'error' || j.status === 'failed').length,
        storageUsed: 0,
        credits: {
          voice: 15,
          video: 8,
          storage: 120
        }
      });

      // Mock user activity
      const mockUsers: UserActivity[] = [
        {
          user_id: 'user1',
          email: 'user1@example.com',
          totalJobs: 5,
          creditsUsed: 23,
          lastActive: new Date().toISOString()
        },
        {
          user_id: 'user2', 
          email: 'user2@example.com',
          totalJobs: 3,
          creditsUsed: 12,
          lastActive: new Date(Date.now() - 60000).toISOString()
        }
      ];

      setUsers(mockUsers);

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

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Monitor platform usage and system health</p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Active accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeJobs}</div>
            <p className="text-xs text-muted-foreground">Currently processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground">Successful renders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Jobs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedJobs}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Credits Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Credit Usage (24h)</CardTitle>
          <CardDescription>Platform resource consumption</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Voice Generation</span>
                <span className="text-sm text-muted-foreground">{stats.credits.voice}</span>
              </div>
              <Progress value={(stats.credits.voice / 100) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Video Generation</span>
                <span className="text-sm text-muted-foreground">{stats.credits.video}</span>
              </div>
              <Progress value={(stats.credits.video / 50) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <span className="text-sm text-muted-foreground">{stats.credits.storage}</span>
              </div>
              <Progress value={(stats.credits.storage / 200) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Views */}
      <Tabs defaultValue="jobs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">Recent Jobs</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Queue</CardTitle>
              <CardDescription>Recent processing jobs and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobs.slice(0, 10).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.type}</span>
                        {getJobStatusBadge(job.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ID: {job.id.slice(0, 8)}... • {new Date(job.created_at).toLocaleString()}
                      </div>
                      {job.error_message && (
                        <div className="text-sm text-red-600">{job.error_message}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {job.status === 'processing' && (
                        <Progress value={job.progress} className="w-24" />
                      )}
                      {(job.status === 'error' || job.status === 'failed') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => retryJob(job.id)}
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

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity</CardTitle>
              <CardDescription>Most active users and their usage patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.slice(0, 10).map((user) => (
                  <div key={user.user_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{user.user_id.slice(0, 8)}...</div>
                      <div className="text-sm text-muted-foreground">
                        Last active: {new Date(user.lastActive).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="text-sm font-medium">{user.totalJobs} jobs</div>
                      <div className="text-sm text-muted-foreground">{user.creditsUsed} credits</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}