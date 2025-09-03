import { useState, useEffect, useRef } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  Play,
  Mic,
  Video,
  Film,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Circle,
  Upload,
  Download,
  Settings,
  Loader2,
  PlayCircle,
  AlertCircle
} from "lucide-react";

interface PipelineJob {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  stage: 'voice' | 'video' | 'sync' | 'complete';
  audioUrl?: string;
  rawVideoUrl?: string;
  finalVideoUrl?: string;
  error?: string;
  logs: any[];
  createdAt: Date;
  completedAt?: Date;
}

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  required: boolean;
}

interface PipelineSection {
  id: string;
  title: string;
  icon: string;
  progress: number;
  items: ChecklistItem[];
  notes: string;
}

export default function TalkingAvatarPage() {
  const [useDefaults, setUseDefaults] = useState(true);
  const [currentJob, setCurrentJob] = useState<PipelineJob | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [sections, setSections] = useState<PipelineSection[]>([
    {
      id: 'voice',
      title: '🔊 Voice Creation',
      icon: 'Mic',
      progress: 0,
      notes: '',
      items: [
        { id: 'voice-mode', label: 'Select voice mode (Clone/Synthetic)', completed: false, required: true },
        { id: 'voice-config', label: 'Configure voice settings', completed: false, required: true },
        { id: 'voice-create', label: 'Create voice', completed: false, required: true },
        { id: 'tts-script', label: 'Enter TTS script', completed: false, required: true },
        { id: 'tts-generate', label: 'Generate MP3', completed: false, required: true },
        { id: 'voice-test', label: 'Test run (10s sample)', completed: false, required: false }
      ]
    },
    {
      id: 'video',
      title: '🎥 Video Creation',
      icon: 'Video',
      progress: 0,
      notes: '',
      items: [
        { id: 'avatar-upload', label: 'Upload/select avatar image', completed: false, required: true },
        { id: 'video-engine', label: 'Select video engine (Kling/Veo3)', completed: false, required: true },
        { id: 'video-duration', label: 'Set duration', completed: false, required: true },
        { id: 'video-prompt', label: 'Enter video prompt', completed: false, required: true },
        { id: 'video-generate', label: 'Generate video', completed: false, required: true },
        { id: 'video-test', label: 'Test run (sample assets)', completed: false, required: false }
      ]
    },
    {
      id: 'sync',
      title: '🎬 Syncing & Final Export',
      icon: 'Film',
      progress: 0,
      notes: '',
      items: [
        { id: 'assets-select', label: 'Select audio + raw video', completed: false, required: true },
        { id: 'trim-config', label: 'Configure trimming (optional)', completed: false, required: false },
        { id: 'sync-engine', label: 'Select sync engine (Pixverse/Wav2Lip)', completed: false, required: true },
        { id: 'final-generate', label: 'Create final video', completed: false, required: true },
        { id: 'sync-test', label: 'Test run (prior outputs)', completed: false, required: false }
      ]
    }
  ]);

  const [isOpen, setIsOpen] = useState<Record<string, boolean>>({
    voice: true,
    video: true,
    sync: true
  });

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const totalProgress = sections.reduce((acc, section) => {
    const completedRequired = section.items.filter(item => item.required && item.completed).length;
    const totalRequired = section.items.filter(item => item.required).length;
    return acc + (totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0);
  }, 0) / sections.length;

  const toggleItem = (sectionId: string, itemId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        const newItems = section.items.map(item => 
          item.id === itemId ? { ...item, completed: !item.completed } : item
        );
        const completedRequired = newItems.filter(item => item.required && item.completed).length;
        const totalRequired = newItems.filter(item => item.required).length;
        const newProgress = totalRequired > 0 ? (completedRequired / totalRequired) * 100 : 0;
        
        return { ...section, items: newItems, progress: newProgress };
      }
      return section;
    }));
  };

  const updateNotes = (sectionId: string, notes: string) => {
    setSections(prev => prev.map(section => 
      section.id === sectionId ? { ...section, notes } : section
    ));
  };

  const runEndToEnd = async () => {
    try {
      setCurrentJob({
        id: Date.now().toString(),
        status: 'running',
        progress: 0,
        stage: 'voice',
        logs: [],
        createdAt: new Date()
      });

      setLogs(['Starting end-to-end pipeline...']);
      
      // Simulate pipeline execution
      const stages = ['voice', 'video', 'sync'];
      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        setLogs(prev => [...prev, `Starting ${stage} generation...`]);
        
        setCurrentJob(prev => prev ? {
          ...prev,
          stage: stage as any,
          progress: ((i + 1) / stages.length) * 100
        } : null);

        // Simulate work
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setLogs(prev => [...prev, `${stage} generation completed ✅`]);
      }

      setCurrentJob(prev => prev ? {
        ...prev,
        status: 'completed',
        progress: 100,
        stage: 'complete',
        audioUrl: '/demo/sample_audio.mp3',
        rawVideoUrl: '/demo/sample_raw.mp4',
        finalVideoUrl: '/demo/sample_final.mp4',
        completedAt: new Date()
      } : null);

      setLogs(prev => [...prev, 'Pipeline completed successfully! 🎉']);
      toast.success("Talking avatar pipeline completed successfully!");

    } catch (error: any) {
      setLogs(prev => [...prev, `Error: ${error.message}`]);
      setCurrentJob(prev => prev ? { ...prev, status: 'failed', error: error.message } : null);
      toast.error("Pipeline failed. Check logs for details.");
    }
  };

  const runDemo = async () => {
    setLogs(['Running demo pipeline with sample assets...']);
    
    // Simulate demo run
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setLogs(prev => [...prev, 'Demo completed! Generated sample talking avatar.']);
    toast.success("Demo pipeline completed!");
  };

  const getMilestoneStatus = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return { completed: false, icon: Circle };
    
    const isCompleted = section.progress >= 100;
    return {
      completed: isCompleted,
      icon: isCompleted ? CheckCircle : Circle
    };
  };

  const voiceStatus = getMilestoneStatus('voice');
  const videoStatus = getMilestoneStatus('video');
  const syncStatus = getMilestoneStatus('sync');

  return (
    <div className="min-h-screen bg-background">
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">🎭 Talking Avatar Pipeline</h1>
              <p className="text-muted-foreground">Voice → Video → Lip-sync workflow</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={useDefaults}
                  onCheckedChange={setUseDefaults}
                  id="use-defaults"
                />
                <Label htmlFor="use-defaults" className="text-sm">Use defaults</Label>
              </div>
              <Button onClick={runDemo} variant="outline" size="sm">
                <PlayCircle className="w-4 h-4 mr-2" />
                Run Demo
              </Button>
            </div>
          </div>

          {/* Progress and Milestones */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Overall Progress</Label>
                <span className="text-sm text-muted-foreground">{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <voiceStatus.icon className={`w-4 h-4 ${voiceStatus.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${voiceStatus.completed ? 'text-green-500' : 'text-muted-foreground'}`}>
                  Voice Complete
                </span>
              </div>
              <div className="flex items-center gap-2">
                <videoStatus.icon className={`w-4 h-4 ${videoStatus.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${videoStatus.completed ? 'text-green-500' : 'text-muted-foreground'}`}>
                  Video Ready 🎥
                </span>
              </div>
              <div className="flex items-center gap-2">
                <syncStatus.icon className={`w-4 h-4 ${syncStatus.completed ? 'text-green-500' : 'text-muted-foreground'}`} />
                <span className={`text-sm ${syncStatus.completed ? 'text-green-500' : 'text-muted-foreground'}`}>
                  Pipeline Finished 🎬
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Checklists */}
          <div className="lg:col-span-2 space-y-4">
            {sections.map((section) => {
              const IconComponent = section.icon === 'Mic' ? Mic : section.icon === 'Video' ? Video : Film;
              
              return (
                <Card key={section.id} className="p-6">
                  <Collapsible
                    open={isOpen[section.id]}
                    onOpenChange={(open) => setIsOpen(prev => ({ ...prev, [section.id]: open }))}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <IconComponent className="w-5 h-5 text-primary" />
                        <h3 className="text-lg font-display font-bold">{section.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(section.progress)}%
                        </Badge>
                      </div>
                      {isOpen[section.id] ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4">
                      <div className="space-y-3">
                        {section.items.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <Checkbox
                              checked={item.completed}
                              onCheckedChange={() => toggleItem(section.id, item.id)}
                              id={item.id}
                            />
                            <Label
                              htmlFor={item.id}
                              className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                            >
                              {item.label}
                              {item.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                          </div>
                        ))}

                        <Separator className="my-4" />

                        <div>
                          <Label htmlFor={`notes-${section.id}`} className="text-sm font-medium">📝 Notes</Label>
                          <Textarea
                            id={`notes-${section.id}`}
                            placeholder="Add notes for this section..."
                            value={section.notes}
                            onChange={(e) => updateNotes(section.id, e.target.value)}
                            className="mt-2 min-h-[80px]"
                          />
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              );
            })}
          </div>

          {/* Right: Controls and Outputs */}
          <div className="space-y-6">
            {/* Run Controls */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Pipeline Controls</h3>
              <div className="space-y-3">
                <Button onClick={runEndToEnd} className="w-full" size="lg">
                  {currentJob?.status === 'running' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run End-to-End
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button variant="outline" size="sm">
                    <Mic className="w-4 h-4 mr-2" />
                    Voice Only
                  </Button>
                  <Button variant="outline" size="sm">
                    <Video className="w-4 h-4 mr-2" />
                    Video Only
                  </Button>
                  <Button variant="outline" size="sm">
                    <Film className="w-4 h-4 mr-2" />
                    Export Only
                  </Button>
                </div>
              </div>
            </Card>

            {/* Live Logs */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Live Console</h3>
              <ScrollArea className="h-48 w-full border rounded-md p-3 bg-muted/50">
                <div className="space-y-1 font-mono text-xs">
                  {logs.length === 0 ? (
                    <div className="text-muted-foreground">No logs yet...</div>
                  ) : (
                    logs.map((log, index) => (
                      <div key={index} className="text-foreground">
                        <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span> {log}
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </ScrollArea>
            </Card>

            {/* Outputs */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Outputs</h3>
              <div className="space-y-4">
                {currentJob?.audioUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">🔊 Audio (MP3)</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                )}

                {currentJob?.rawVideoUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">🎥 Raw Video (MP4)</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                )}

                {currentJob?.finalVideoUrl && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">🎬 Final Video (MP4)</Label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <PlayCircle className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </div>
                )}

                {!currentJob?.audioUrl && !currentJob?.rawVideoUrl && !currentJob?.finalVideoUrl && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No outputs yet. Run the pipeline to generate assets.
                  </div>
                )}
              </div>
            </Card>

            {/* Current Job Status */}
            {currentJob && (
              <Card className="p-6">
                <h3 className="text-lg font-display font-bold mb-4">Job Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Status</Label>
                    <Badge variant={currentJob.status === 'completed' ? 'default' : currentJob.status === 'failed' ? 'destructive' : 'secondary'}>
                      {currentJob.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Stage</Label>
                    <Badge variant="outline">{currentJob.stage}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Progress</Label>
                    <span className="text-sm">{Math.round(currentJob.progress)}%</span>
                  </div>
                  <Progress value={currentJob.progress} className="h-2" />
                </div>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}