import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Upload, 
  Mic, 
  Play, 
  Download, 
  Share, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  FileVideo,
  Loader2,
  Eye,
  Save
} from 'lucide-react';

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  thumbnail_url?: string;
  metadata: any;
}

interface Job {
  id: string;
  type: string;
  status: string;
  progress: number;
  stage: string;
  error_message?: string;
  output_data?: any;
}

const WORKFLOW_STEPS = [
  { id: 1, title: 'Project Setup', description: 'Create project and upload media' },
  { id: 2, title: 'Script & Voice', description: 'Write script and select voice' },
  { id: 3, title: 'Avatar Selection', description: 'Choose or upload avatar' },
  { id: 4, title: 'Generate', description: 'Create talking avatar video' },
  { id: 5, title: 'Preview & Export', description: 'Review and download result' }
];

const VOICE_PRESETS = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria', style: 'Expressive', accent: 'American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', style: 'Professional', accent: 'British' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie', style: 'Conversational', accent: 'American' },
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', style: 'Confident', accent: 'American' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', style: 'Deep', accent: 'American' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', style: 'Warm', accent: 'American' }
];

export const ProjectWizard = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [project, setProject] = useState<Project | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [script, setScript] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(VOICE_PRESETS[0].id);
  const [uploadedAvatar, setUploadedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Results
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [finalRender, setFinalRender] = useState<any>(null);

  // Create project
  const createProject = async () => {
    if (!projectTitle.trim()) {
      toast({
        title: "Error",
        description: "Please enter a project title",
        variant: "destructive"
      });
      return;
    }

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: projectTitle,
          description: projectDescription,
          status: 'draft',
          metadata: { wizard_step: currentStep }
        })
        .select()
        .single();

      if (error) throw error;

      setProject(data);
      setCurrentStep(2);
      
      toast({
        title: "Project Created",
        description: `${projectTitle} is ready for script input`
      });
    } catch (error: any) {
      toast({
        title: "Creation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Generate audio with caching
  const generateAudio = async () => {
    if (!script.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Create job entry
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          user_id: user.id,
          project_id: project?.id,
          type: 'voice',
          status: 'processing',
          stage: 'audio_generation',
          input_data: { script, voice_id: selectedVoice }
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Call voice generation function
      const { data, error } = await supabase.functions.invoke('voice-generate', {
        body: {
          script,
          voiceId: selectedVoice,
          model: 'eleven_multilingual_v2',
          projectId: project?.id,
          useCache: true
        }
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedAudio(data.audioUrl);
        
        // Update job status
        await supabase
          .from('jobs')
          .update({
            status: 'completed',
            progress: 100,
            output_data: { audio_url: data.audioUrl, duration: data.duration }
          })
          .eq('id', jobData.id);

        setCurrentStep(3);
        toast({
          title: "Audio Generated",
          description: "Voice synthesis completed successfully"
        });
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Upload avatar
  const handleAvatarUpload = async (file: File) => {
    setUploadedAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    
    try {
      // Upload to storage
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `avatars/${project?.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('virtura-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Process with avatar service
      const { data: publicUrl } = supabase.storage
        .from('virtura-media')
        .getPublicUrl(filePath);

      const { data, error } = await supabase.functions.invoke('upload-avatar', {
        body: { 
          photoUrl: publicUrl.publicUrl,
          projectId: project?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Avatar Ready",
        description: "Avatar uploaded and processed successfully"
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Generate video
  const generateVideo = async () => {
    if (!project || !generatedAudio || !uploadedAvatar) {
      toast({
        title: "Error",
        description: "Please complete all previous steps",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create video job
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          user_id: user.id,
          project_id: project.id,
          type: 'video',
          status: 'processing',
          stage: 'video_generation',
          input_data: { audio_url: generatedAudio, script }
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Start video generation
      const { data, error } = await supabase.functions.invoke('video-generate-multi', {
        body: {
          audioUrl: generatedAudio,
          prompt: script,
          projectId: project.id,
          provider: 'heygen'
        }
      });

      if (error) throw error;

      if (data?.success) {
        setGeneratedVideo(data.videoUrl);
        
        // Update job status
        await supabase
          .from('jobs')
          .update({
            status: 'completed',
            progress: 100,
            output_data: { video_url: data.videoUrl }
          })
          .eq('id', jobData.id);

        setCurrentStep(5);
        toast({
          title: "Video Generated",
          description: "Talking avatar video created successfully!"
        });
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Save final render
  const saveRender = async () => {
    if (!generatedVideo || !project) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('renders')
        .insert({
          user_id: user.id,
          project_id: project.id,
          title: project.title,
          description: project.description,
          video_url: generatedVideo,
          format: 'mp4',
          resolution: '1920x1080',
          metadata: {
            voice_id: selectedVoice,
            script_length: script.length,
            created_with: 'project_wizard'
          }
        })
        .select()
        .single();

      if (error) throw error;

      setFinalRender(data);
      
      toast({
        title: "Render Saved",
        description: "Video saved to your library successfully"
      });
    } catch (error: any) {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Download video
  const downloadVideo = () => {
    if (!generatedVideo) return;
    
    const link = document.createElement('a');
    link.href = generatedVideo;
    link.download = `${project?.title || 'talking-avatar'}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Share video
  const shareVideo = async () => {
    if (!generatedVideo) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: project?.title || 'My Talking Avatar Video',
          text: 'Check out this amazing talking avatar video!',
          url: generatedVideo
        });
      } catch (error) {
        console.error('Share failed:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(generatedVideo);
        toast({
          title: "Link Copied",
          description: "Video link copied to clipboard"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link",
          variant: "destructive"
        });
      }
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return projectTitle.trim().length > 0;
      case 2: return script.trim().length > 0;
      case 3: return uploadedAvatar !== null;
      case 4: return generatedAudio !== null;
      case 5: return generatedVideo !== null;
      default: return false;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Project Wizard
        </h1>
        <p className="text-muted-foreground mt-2">
          Create professional talking avatar videos in 5 simple steps
        </p>
      </div>

      {/* Progress Indicator */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : step.id}
                </div>
                <span className="text-xs mt-2 text-center max-w-20">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <Progress value={(currentStep / 5) * 100} className="h-2" />
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Project Setup */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Project Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title..."
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Describe your project..."
                  />
                </div>
                <Button onClick={createProject} disabled={!canProceed()}>
                  Create Project
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Script & Voice */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Script & Voice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="script">Script</Label>
                  <Textarea
                    id="script"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Enter your script here..."
                    className="min-h-32"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    {script.length} characters
                  </p>
                </div>
                
                <div>
                  <Label>Voice Selection</Label>
                  <Select value={selectedVoice} onValueChange={setSelectedVoice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VOICE_PRESETS.map((voice) => (
                        <SelectItem key={voice.id} value={voice.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{voice.name}</span>
                            <Badge variant="outline" className="ml-2">
                              {voice.style}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {generatedAudio && (
                  <div>
                    <Label>Generated Audio</Label>
                    <audio controls className="w-full">
                      <source src={generatedAudio} type="audio/mpeg" />
                    </audio>
                  </div>
                )}

                <Button 
                  onClick={generateAudio} 
                  disabled={!canProceed() || isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Audio...
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 mr-2" />
                      Generate Voice
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Avatar Selection */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Avatar Selection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                    }}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium">Upload Avatar Image</p>
                    <p className="text-sm text-muted-foreground">
                      Click to select an image file
                    </p>
                  </label>
                </div>

                {avatarPreview && (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {uploadedAvatar && (
                  <Button onClick={() => setCurrentStep(4)} className="w-full">
                    Continue to Generation
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Generate */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="w-5 h-5" />
                  Generate Video
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Ready to Generate</h4>
                  <p className="text-sm text-muted-foreground">
                    All components are ready. Click the button below to create your talking avatar video.
                  </p>
                </div>

                <Button 
                  onClick={generateVideo}
                  disabled={!canProceed() || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Talking Avatar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Preview & Export */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Preview & Export</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {generatedVideo && (
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video 
                      controls 
                      className="w-full h-full"
                      src={generatedVideo}
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={downloadVideo} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={shareVideo} variant="outline">
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button onClick={saveRender}>
                    <Save className="w-4 h-4 mr-2" />
                    Save to Library
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Step Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {WORKFLOW_STEPS[currentStep - 1]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {WORKFLOW_STEPS[currentStep - 1]?.description}
              </p>
            </CardContent>
          </Card>

          {/* Job Status */}
          {isProcessing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Processing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Working on your request...</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Project Info */}
          {project && (
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="font-medium">{project.title}</p>
                  {project.description && (
                    <p className="text-sm text-muted-foreground">
                      {project.description}
                    </p>
                  )}
                </div>
                <Badge variant="outline">{project.status}</Badge>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};