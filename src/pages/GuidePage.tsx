import { useState } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { Card } from "@/components/ui/card";
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
  Video
} from "lucide-react";
import { MotionBackground } from "@/components/MotionBackground";

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

  const [showConfetti, setShowConfetti] = useState(false);
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());

  const toggleTodo = (id: string) => {
    setTodos(prev => {
      const updated = prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      
      // Check if all are completed
      const allCompleted = updated.every(todo => todo.completed);
      if (allCompleted && !showConfetti) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
      
      return updated;
    });
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
      case "Easy": return "bg-green-500/20 text-green-700 dark:text-green-400";
      case "Medium": return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400";
      case "Advanced": return "bg-red-500/20 text-red-700 dark:text-red-400";
      default: return "bg-muted";
    }
  };

  const completedCount = todos.filter(todo => todo.completed).length;
  const progress = (completedCount / todos.length) * 100;
  const isFullyComplete = completedCount === todos.length;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MotionBackground />
      <VirturaNavigation />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            Getting Started with Virtura
          </h1>
          <p className="text-muted-foreground mb-6">
            Complete these steps to become a Virtura Creator
          </p>
          
          {/* Progress */}
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  {isFullyComplete ? (
                    <Trophy className="w-6 h-6 text-primary-foreground" />
                  ) : (
                    <span className="text-primary-foreground font-bold">
                      {completedCount}/{todos.length}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-display font-bold">
                    {isFullyComplete ? "Congratulations! 🎉" : "Your Progress"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isFullyComplete 
                      ? "You're now a certified Virtura Creator!" 
                      : `${completedCount} of ${todos.length} steps completed`
                    }
                  </p>
                </div>
              </div>
              
              {isFullyComplete && (
                <Badge className="bg-gradient-gold">
                  <Star className="w-4 h-4 mr-1" />
                  Virtura Creator Ready ✅
                </Badge>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="bg-gradient-gold h-3 rounded-full transition-all duration-500 shadow-gold"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </Card>
        </div>

        {/* Onboarding Videos Section */}
        <div className="mb-8 space-y-6">
          <h2 className="text-2xl font-display font-bold text-center">Onboarding Video Library</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Main Tutorial Video */}
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Virtura Complete Tutorial"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Video className="w-4 h-4 text-primary" />
                  <Badge className="bg-primary/20 text-primary">60s Tutorial</Badge>
                </div>
                <h3 className="font-display font-bold mb-1">Complete Virtura Guide</h3>
                <p className="text-sm text-muted-foreground">
                  Master all Virtura features in 60 seconds
                </p>
              </div>
            </Card>

            {/* Avatar Creation Video */}
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Avatar Creation Tutorial"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-green-600" />
                  <Badge className="bg-green-500/20 text-green-700">45s Tutorial</Badge>
                </div>
                <h3 className="font-display font-bold mb-1">Creating Your First Avatar</h3>
                <p className="text-sm text-muted-foreground">
                  Step-by-step avatar generation process
                </p>
              </div>
            </Card>

            {/* Enhancement Video */}
            <Card className="overflow-hidden">
              <div className="aspect-video relative">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Content Enhancement Tutorial"
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <Badge className="bg-blue-500/20 text-blue-700">30s Tutorial</Badge>
                </div>
                <h3 className="font-display font-bold mb-1">Upload & Enhance Content</h3>
                <p className="text-sm text-muted-foreground">
                  Transform existing photos with AI
                </p>
              </div>
            </Card>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-bold mb-4">Your To-Do Checklist</h2>
          
          {todos.map((todo, index) => (
            <Card 
              key={todo.id} 
              className={`p-6 transition-all duration-200 ${
                todo.completed 
                  ? "bg-primary/10 border-primary/30" 
                  : "hover:shadow-card hover-glow"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleTodo(todo.id)}
                  className={`flex-shrink-0 ${
                    todo.completed 
                      ? "text-primary hover:text-primary" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {todo.completed ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <Circle className="w-6 h-6" />
                  )}
                </Button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-display font-bold ${
                        todo.completed ? "line-through text-muted-foreground" : ""
                      }`}>
                        Step {index + 1}: {todo.title}
                      </h3>
                      <Badge className={getDifficultyColor(todo.difficulty)}>
                        {todo.difficulty}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="secondary">
                        {todo.estimatedTime}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className={`text-muted-foreground mb-4 ${
                    todo.completed ? "line-through" : ""
                  }`}>
                    {todo.description}
                  </p>

                  {/* Expandable Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(todo.videoUrl, '_blank')}
                        className="flex items-center gap-2"
                      >
                        <Play className="w-4 h-4" />
                        Watch Tutorial
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(todo.id)}
                        className="flex items-center gap-2"
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
                            // Navigate to appropriate page based on step
                            if (todo.id === "1") window.location.href = "/individuals";
                            if (todo.id === "2") window.location.href = "/brands";
                            if (todo.id === "3") window.location.href = "/library";
                            if (todo.id === "4") window.location.href = "/library";
                            if (todo.id === "5") window.location.href = "/settings";
                          }}
                          className="gap-2"
                        >
                          {todo.id === "1" && <User className="w-4 h-4" />}
                          {todo.id === "2" && <Upload className="w-4 h-4" />}
                          {todo.id === "3" && <Download className="w-4 h-4" />}
                          {todo.id === "4" && <Sparkles className="w-4 h-4" />}
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
                      <div className="space-y-4 pt-4 border-t border-border/50">
                        {/* Detailed Steps */}
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-primary" />
                            Step-by-Step Guide
                          </h4>
                          <ol className="space-y-2">
                            {todo.detailedSteps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start gap-2 text-sm">
                                <span className="flex-shrink-0 w-5 h-5 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-medium">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-muted-foreground">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Tips */}
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-500" />
                            Pro Tips
                          </h4>
                          <ul className="space-y-2">
                            {todo.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-2 text-sm">
                                <span className="flex-shrink-0 w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2"></span>
                                <span className="text-muted-foreground">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Embedded Tutorial Video */}
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-500" />
                            Tutorial Video
                          </h4>
                          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
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

        {/* Next Steps */}
        {isFullyComplete && (
          <Card className="mt-8 p-6 bg-gradient-card border-primary/30">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-bold mb-2">
                What's Next?
              </h3>
              <p className="text-muted-foreground mb-6">
                Now that you're all set up, explore advanced features and create amazing content!
              </p>
              <div className="flex gap-4 justify-center">
                <Button>
                  Explore Advanced Features
                </Button>
                <Button variant="outline">
                  Join Community
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}