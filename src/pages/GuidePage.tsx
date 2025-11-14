import { useState } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { Card } from "@/components/ui/card";
import neuralBrain from "@/assets/neural-brain.png";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  Trophy, 
  Sparkles,
  User,
  Upload,
  Download,
  Star,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Lightbulb,
  Video,
  Rocket,
  Wand2
} from "lucide-react";
import { StudioBackground } from "@/components/StudioBackground";
import { CircularProgress } from "@/components/ui/circular-progress";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  detailedSteps: string[];
  tips: string[];
  completed: boolean;
  videoUrl: string;
  estimatedTime: string;
  difficulty: "Easy" | "Medium" | "Advanced";
  category: string;
}

export default function GuidePage() {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: "1",
      title: "Create your first avatar",
      description: "Transform your ideas into stunning photorealistic avatars using advanced AI technology",
      detailedSteps: [
        "Navigate to the 'Individuals' section from the sidebar",
        "Choose your preferred avatar style (Realistic, Anime, or Artistic)",
        "Write a detailed prompt describing your avatar (appearance, clothing, setting)",
        "Select additional parameters like gender, age range, and pose",
        "Click 'Generate Avatar' and wait for AI processing",
        "Review and refine your result using the enhancement tools"
      ],
      tips: [
        "Be specific in your prompts - include details about hair color, clothing style, and background",
        "Use descriptive adjectives for better results (e.g., 'professional', 'casual', 'elegant')",
        "Try different lighting conditions like 'golden hour' or 'studio lighting'",
        "If the first result isn't perfect, use the 'Enhance' feature to improve quality"
      ],
      completed: false,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      estimatedTime: "3-5 min",
      difficulty: "Easy",
      category: "Creation"
    },
    {
      id: "2", 
      title: "Upload and enhance your content",
      description: "Transform existing photos and videos with AI-powered enhancement and repurposing tools",
      detailedSteps: [
        "Go to the 'Brands' section or 'Upload' page",
        "Drag and drop your image or video file (supports JPG, PNG, MP4, MOV)",
        "Wait for the upload to complete and preview to load",
        "Choose an enhancement option (Background Removal, Style Transfer, Quality Boost)",
        "Apply AI transformations using the suggestion library",
        "Preview your enhanced content in real-time",
        "Save your enhanced version to your library"
      ],
      tips: [
        "Upload high-quality source material for best results (at least 1080p for videos)",
        "Use the background removal tool to create professional product shots",
        "Try different style transfers to match your brand aesthetic",
        "Batch upload multiple files to save time",
        "Keep original files as backup before applying transformations"
      ],
      completed: false,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      estimatedTime: "2-4 min",
      difficulty: "Easy",
      category: "Enhancement"
    },
    {
      id: "3",
      title: "Export and organize your assets",
      description: "Package your creations into organized, platform-ready content packs for easy distribution",
      detailedSteps: [
        "Navigate to the 'Library' section to view all your created content",
        "Select multiple assets using the checkbox selection tool",
        "Click 'Create Export Pack' or go to the 'Export' page",
        "Choose your export format (Social Media Pack, Print Pack, Web Pack)",
        "Select platforms and sizes (Instagram, TikTok, LinkedIn, Custom dimensions)",
        "Configure quality settings and file formats (JPG, PNG, MP4, GIF)",
        "Add metadata and organize into folders",
        "Download your complete asset pack as a ZIP file"
      ],
      tips: [
        "Create platform-specific packs to optimize for different social media requirements",
        "Use the batch export feature to save time when working with multiple assets",
        "Include multiple formats of the same content for maximum flexibility",
        "Organize exports by project or campaign for easy client delivery",
        "Preview all sizes before exporting to ensure quality across formats"
      ],
      completed: false,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      estimatedTime: "2-3 min",
      difficulty: "Medium",
      category: "Organization"
    },
    {
      id: "4",
      title: "Master advanced AI features",
      description: "Explore powerful AI tools for background replacement, style transfer, and batch processing",
      detailedSteps: [
        "Access the AI Suggestions Library from any creation page",
        "Experiment with different prompt categories (Commercial, Artistic, Professional)",
        "Try background replacement with custom environments",
        "Use style transfer to match brand guidelines",
        "Learn batch processing for multiple assets",
        "Explore advanced prompt engineering techniques"
      ],
      tips: [
        "Save your most successful prompts for future use",
        "Combine multiple AI features for unique results",
        "Use the prompt history to track what works best",
        "Experiment with negative prompts to avoid unwanted elements"
      ],
      completed: false,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      estimatedTime: "5-8 min",
      difficulty: "Advanced",
      category: "Advanced"
    },
    {
      id: "5",
      title: "Set up your workspace and preferences",
      description: "Customize your Virtura workspace for optimal productivity and workflow efficiency",
      detailedSteps: [
        "Visit the 'Settings' page from the sidebar",
        "Configure your default export settings and preferred formats",
        "Set up custom prompt templates for your brand",
        "Organize your library with custom tags and folders",
        "Configure notification preferences",
        "Set up integrations with cloud storage services"
      ],
      tips: [
        "Create custom prompt templates for consistent branding",
        "Use tags and folders to keep your library organized",
        "Enable notifications for completed generations",
        "Back up your work regularly using cloud integrations"
      ],
      completed: false,
      videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
      estimatedTime: "3-4 min",
      difficulty: "Easy",
      category: "Setup"
    }
  ]);

  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());

  const toggleTodo = (id: string) => {
    setTodos(prev => 
      prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const toggleExpanded = (id: string) => {
    setExpandedTodos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "Advanced": return "bg-red-500/20 text-red-400 border border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const progress = (completedCount / todos.length) * 100;
  const isFullyComplete = completedCount === todos.length;

  return (
    <StudioBackground>
      <VirturaNavigation />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
            Getting Started with Virtura
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground px-4">
            Complete these steps to become a Virtura Creator
          </p>
        </div>

          {/* Progress Card */}
          <Card className="mb-8 sm:mb-12 bg-[#1a1a2e]/80 border-violet-500/20 backdrop-blur-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 lg:p-8 gap-4 sm:gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">Your Progress</h2>
                <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
                  {isFullyComplete 
                    ? "🎉 All tasks completed! You're ready to create amazing content!" 
                    : `Complete ${todos.length - completedCount} more ${todos.length - completedCount === 1 ? 'task' : 'tasks'} to finish your onboarding`
                  }
                </p>
              </div>
              <div className="flex-shrink-0">
                <CircularProgress 
                  value={progress} 
                  size={100} 
                  strokeWidth={8}
                  className="relative sm:w-[120px] sm:h-[120px]"
                />
              </div>
            </div>
          </Card>

        {/* Onboarding Videos Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <Video className="w-8 h-8 text-violet-400" />
            Onboarding Video Library
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Main Tutorial Video */}
            <Card className="group overflow-hidden bg-[#1a1a2e]/80 border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              <div className="aspect-video relative group cursor-pointer bg-gradient-to-br from-violet-900/50 to-pink-900/50">
                <img 
                  src={neuralBrain}
                  alt="Virtura Complete Tutorial"
                  className="w-full h-full object-cover relative z-10"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center z-20">
                  <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute top-3 right-3 z-30">
                  <Badge className="bg-violet-500/80 text-white backdrop-blur-sm">60s Tutorial</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold mb-1 text-lg">Complete Virtura Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Master all Virtura features in 60 seconds
                </p>
              </div>
            </Card>

            {/* Avatar Creation Video */}
            <Card className="group overflow-hidden bg-[#1a1a2e]/80 border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              <div className="aspect-video relative group cursor-pointer bg-gradient-to-br from-blue-900/50 to-purple-900/50">
                <img 
                  src={neuralBrain} 
                  alt="Avatar Creation Tutorial"
                  className="w-full h-full object-cover relative z-10"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center z-20">
                  <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute top-3 right-3 z-30">
                  <Badge className="bg-green-500/80 text-white backdrop-blur-sm">45s Tutorial</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold mb-1 text-lg">Creating Your First Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  Step-by-step avatar generation process
                </p>
              </div>
            </Card>

            {/* Enhancement Video */}
            <Card className="group overflow-hidden bg-[#1a1a2e]/80 border-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.3)]">
              <div className="aspect-video relative group cursor-pointer bg-gradient-to-br from-pink-900/50 to-blue-900/50">
                <img 
                  src={neuralBrain} 
                  alt="Content Enhancement Tutorial"
                  className="w-full h-full object-cover relative z-10"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center z-20">
                  <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute top-3 right-3 z-30">
                  <Badge className="bg-blue-500/80 text-white backdrop-blur-sm">30s Tutorial</Badge>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold mb-1 text-lg">Upload & Enhance Content</h3>
                <p className="text-sm text-muted-foreground">
                  Transform existing photos with AI
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Checklist */}
        <div>
          <h2 className="text-3xl font-display font-bold mb-8 flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
            Your To-Do Checklist
          </h2>
          
          <div className="space-y-6">
            {todos.map((todo, index) => (
              <Card 
                key={todo.id} 
                className={`group transition-all duration-300 ${
                  todo.completed 
                    ? 'bg-green-900/20 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]' 
                    : 'bg-[#1a1a2e]/80 border-violet-500/20 hover:border-violet-500/40 hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]'
                }`}
              >
                <div className="p-8">
                  <div className="flex items-start gap-6">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className={`flex-shrink-0 mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                        todo.completed 
                          ? "bg-green-500 border-green-500" 
                          : "border-violet-500/50 hover:border-violet-500"
                      }`}
                    >
                      {todo.completed && (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <span className="text-sm font-semibold text-violet-400 mb-1 block">
                            Step {index + 1}
                          </span>
                          <h3 className={`text-2xl font-display font-bold ${
                            todo.completed ? "line-through text-muted-foreground" : ""
                          }`}>
                            {todo.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Badge className={getDifficultyColor(todo.difficulty)}>
                            {todo.difficulty}
                          </Badge>
                          <span className="flex items-center gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                            <Clock className="w-4 h-4" />
                            {todo.estimatedTime}
                          </span>
                        </div>
                      </div>
                      
                      <p className={`text-base mb-6 text-muted-foreground ${
                        todo.completed ? "line-through" : ""
                      }`}>
                        {todo.description}
                      </p>

                      {/* Buttons */}
                      <div className="flex flex-wrap gap-3 mb-6">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(todo.videoUrl, '_blank')}
                          className="gap-2 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10"
                        >
                          <Play className="w-4 h-4" />
                          Watch Tutorial
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(todo.id)}
                          className="gap-2 hover:bg-violet-500/10"
                        >
                          {expandedTodos.has(todo.id) ? (
                            <>
                              <ChevronUp className="w-4 h-4" />
                              Hide Details
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4" />
                              Show Details
                            </>
                          )}
                        </Button>
                        
                        {/* Action Button */}
                        {!todo.completed && (
                          <Button 
                            size="sm"
                            onClick={() => {
                              if (todo.id === "1") window.location.href = "/individuals";
                              if (todo.id === "2") window.location.href = "/brands";
                              if (todo.id === "3") window.location.href = "/library";
                              if (todo.id === "4") window.location.href = "/library";
                              if (todo.id === "5") window.location.href = "/settings";
                            }}
                            className="ml-auto gap-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                          >
                            {todo.id === "1" && <Sparkles className="w-4 h-4" />}
                            {todo.id === "2" && <Upload className="w-4 h-4" />}
                            {todo.id === "3" && <Download className="w-4 h-4" />}
                            {todo.id === "4" && <Wand2 className="w-4 h-4" />}
                            {todo.id === "5" && <Star className="w-4 h-4" />}
                            {todo.id === "1" && "Start Creating"}
                            {todo.id === "2" && "Upload Content"}
                            {todo.id === "3" && "Export Assets"}
                            {todo.id === "4" && "Try AI Features"}
                            {todo.id === "5" && "Open Settings"}
                          </Button>
                        )}
                      </div>

                      {/* Expanded Details */}
                      {expandedTodos.has(todo.id) && (
                        <div className="space-y-6 pt-6 border-t border-violet-500/20 animate-fade-in">
                          {/* Detailed Steps */}
                          <div>
                            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                              <CheckCircle2 className="w-5 h-5 text-violet-400" />
                              Detailed Steps
                            </h4>
                            <ul className="space-y-3 ml-7">
                              {todo.detailedSteps.map((step, stepIndex) => (
                                <li key={stepIndex} className="text-muted-foreground flex items-start gap-3">
                                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center text-xs font-semibold text-violet-400 mt-0.5">
                                    {stepIndex + 1}
                                  </span>
                                  <span className="pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tips */}
                          <div>
                            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-yellow-400" />
                              Pro Tips
                            </h4>
                            <ul className="space-y-3 ml-7">
                              {todo.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-muted-foreground flex items-start gap-3">
                                  <Sparkles className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-1" />
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Embedded Tutorial Video */}
                          <div>
                            <h4 className="font-display font-semibold text-lg mb-4 flex items-center gap-2">
                              <Video className="w-5 h-5 text-blue-400" />
                              Tutorial Video
                            </h4>
                            <div className="aspect-video rounded-xl overflow-hidden border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
                              <iframe
                                src={todo.videoUrl}
                                title={`${todo.title} Tutorial`}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Next Steps */}
        {isFullyComplete && (
          <Card className="mt-12 bg-gradient-to-br from-violet-900/40 via-purple-900/40 to-blue-900/40 border-violet-500/30 shadow-[0_0_40px_rgba(139,92,246,0.3)] animate-fade-in">
            <div className="p-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.4)]">
                  <Rocket className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-3xl font-display font-bold mb-4">
                  You're All Set! 🎉
                </h3>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Congratulations on completing the onboarding! You're now ready to create amazing content with Virtura.
                </p>
                <div className="space-y-6 mb-8">
                  <p className="text-lg font-semibold">Here's what you can do next:</p>
                  <ul className="space-y-3 max-w-md mx-auto text-left">
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      Explore advanced features and settings
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      Join our community to share your creations
                    </li>
                    <li className="flex items-center gap-3 text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-violet-400" />
                      Check out our blog for tips and inspiration
                    </li>
                  </ul>
                </div>
                <Button 
                  className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(139,92,246,0.3)] px-8 py-6 text-lg" 
                  size="lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Start Creating
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </StudioBackground>
  );
}