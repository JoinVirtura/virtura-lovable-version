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
  Star
} from "lucide-react";

interface TodoItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  videoUrl?: string;
  estimatedTime: string;
}

export default function GuidePage() {
  const [todos, setTodos] = useState<TodoItem[]>([
    {
      id: "1",
      title: "Create your first avatar",
      description: "Generate a photorealistic avatar using AI prompts",
      completed: false,
      videoUrl: "#",
      estimatedTime: "2 min"
    },
    {
      id: "2", 
      title: "Upload your first video",
      description: "Upload a photo or video to repurpose with AI",
      completed: false,
      videoUrl: "#",
      estimatedTime: "1 min"
    },
    {
      id: "3",
      title: "Export your first pack",
      description: "Download content in multiple formats for different platforms",
      completed: false,
      videoUrl: "#",
      estimatedTime: "1 min"
    }
  ]);

  const [showConfetti, setShowConfetti] = useState(false);

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

  const completedCount = todos.filter(todo => todo.completed).length;
  const progress = (completedCount / todos.length) * 100;
  const isFullyComplete = completedCount === todos.length;

  return (
    <div className="min-h-screen bg-background">
      <VirturaNavigation />
      
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">🎉</div>
        </div>
      )}
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        {/* Tutorial Video */}
        <Card className="mb-8 overflow-hidden">
          <div className="aspect-video bg-gradient-to-br from-muted to-muted-foreground/20 relative flex items-center justify-center">
            <Button size="lg" className="shadow-gold">
              <Play className="w-6 h-6 mr-2" />
              Watch 60-Second Tutorial
            </Button>
          </div>
          <div className="p-4">
            <h3 className="font-display font-bold mb-2">Virtura Complete Tutorial</h3>
            <p className="text-sm text-muted-foreground">
              Learn everything you need to know about creating avatars, uploading content, and exporting packs in just 60 seconds.
            </p>
          </div>
        </Card>

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
                    <h3 className={`font-display font-bold ${
                      todo.completed ? "line-through text-muted-foreground" : ""
                    }`}>
                      Step {index + 1}: {todo.title}
                    </h3>
                    <Badge variant="secondary">
                      {todo.estimatedTime}
                    </Badge>
                  </div>
                  
                  <p className={`text-muted-foreground mb-4 ${
                    todo.completed ? "line-through" : ""
                  }`}>
                    {todo.description}
                  </p>

                  {/* Video Tutorial */}
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Watch Tutorial
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
                        }}
                        className="gap-2"
                      >
                        {todo.id === "1" && <User className="w-4 h-4" />}
                        {todo.id === "2" && <Upload className="w-4 h-4" />}
                        {todo.id === "3" && <Download className="w-4 h-4" />}
                        {todo.id === "1" && "Start Creating"}
                        {todo.id === "2" && "Upload Content"}
                        {todo.id === "3" && "Export Assets"}
                      </Button>
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