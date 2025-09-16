import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ProjectWizard } from '@/components/ProjectWizard';
import { FeatureGating } from '@/components/FeatureGating';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Play,
  Clock,
  CheckCircle,
  AlertTriangle,
  Folder
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  thumbnail_url?: string;
  metadata: any;
  created_at: string;
  updated_at: string;
}

interface Job {
  id: string;
  project_id: string;
  type: string;
  status: string;
  progress: number;
  stage: string;
}

export default function ProjectsPage() {
  const { toast } = useToast();
  const [projects, setProjects] = useState<Project[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showWizard, setShowWizard] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    loadProjects();
    loadJobs();
    
    // Set up real-time subscriptions
    const projectsSubscription = supabase
      .channel('projects')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'projects' }, 
        () => loadProjects()
      )
      .subscribe();

    const jobsSubscription = supabase
      .channel('jobs')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'jobs' }, 
        () => loadJobs()
      )
      .subscribe();

    return () => {
      projectsSubscription.unsubscribe();
      jobsSubscription.unsubscribe();
    };
  }, []);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Failed to load projects",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['queued', 'processing'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error: any) {
      console.error('Failed to load jobs:', error);
    }
  };

  const createNewProject = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('project-create', {
        body: {
          title: `New Project ${new Date().toLocaleDateString()}`,
          description: 'Created from projects page',
          metadata: { created_from: 'projects_page' }
        }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Project Created",
          description: "New project created successfully"
        });
        loadProjects();
      }
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast({
        title: "Project Deleted",
        description: "Project removed successfully"
      });
      
      loadProjects();
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4 text-gray-500" />;
      case 'processing': return <Clock className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Folder className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      draft: 'secondary',
      processing: 'default',
      completed: 'default',
      failed: 'destructive'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getProjectJobs = (projectId: string) => {
    return jobs.filter(job => job.project_id === projectId);
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your talking avatar projects
          </p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showWizard} onOpenChange={setShowWizard}>
            <DialogTrigger asChild>
              <FeatureGating feature="projects">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </FeatureGating>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
              </DialogHeader>
              <ProjectWizard />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={createNewProject}>
            <Folder className="w-4 h-4 mr-2" />
            Quick Create
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {['all', 'draft', 'processing', 'completed', 'failed'].map((status) => (
            <Button
              key={status}
              variant={filterStatus === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterStatus(status)}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Active Jobs Banner */}
      {jobs.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600 animate-spin" />
                <span className="font-medium text-blue-900">
                  {jobs.length} active job{jobs.length !== 1 ? 's' : ''} running
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={loadJobs}>
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Folder className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Projects Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first project to get started'
              }
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Dialog open={showWizard} onOpenChange={setShowWizard}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Project
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <ProjectWizard />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const projectJobs = getProjectJobs(project.id);
            const hasActiveJobs = projectJobs.length > 0;
            
            return (
              <Card key={project.id} className="group hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(project.status)}
                      <CardTitle className="text-lg truncate">{project.title}</CardTitle>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Thumbnail placeholder */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    {project.thumbnail_url ? (
                      <img 
                        src={project.thumbnail_url} 
                        alt={project.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Play className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>

                  {/* Status and Jobs */}
                  <div className="flex items-center justify-between">
                    {getStatusBadge(project.status)}
                    <span className="text-xs text-muted-foreground">
                      {new Date(project.updated_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Active Jobs */}
                  {hasActiveJobs && (
                    <div className="space-y-2">
                      {projectJobs.map((job) => (
                        <div key={job.id} className="flex items-center justify-between text-sm">
                          <span className="capitalize">{job.type} {job.stage}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-muted rounded-full h-1">
                              <div 
                                className="bg-primary h-1 rounded-full transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-xs">{job.progress}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setSelectedProject(project)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => deleteProject(project.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}