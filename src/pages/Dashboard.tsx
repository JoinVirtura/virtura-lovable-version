import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { VirturaSidebar } from "@/components/VirturaSidebar";
import { OverviewPage } from "@/components/OverviewPage";
import { CreateAvatar } from "@/components/CreateAvatar";
import { AvatarStudio } from "@/components/AvatarStudio";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Play, 
  Sparkles, 
  Edit, 
  Share2,
  Search, 
  Filter, 
  Download, 
  Trash2,
  Grid3X3,
  List,
  Calendar,
  Tag,
  CheckCircle2, 
  Circle, 
  Trophy,
  Star,
  User,
  Upload,
  Bell, 
  Shield, 
  CreditCard,
  Settings as SettingsIcon
} from "lucide-react";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("overview");
  
  // Library page state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  // AI Suggestions state
  const [promptSearch, setPromptSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Guide page state
  const [todos, setTodos] = useState([
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

  // Comprehensive AI Prompt Library
  const promptLibrary = [
    // Professional Business
    { category: "Professional", title: "Executive Portrait", prompt: "Professional executive in navy suit with confident expression, modern office" },
    { category: "Professional", title: "Business Headshot", prompt: "Professional headshot with golden hour lighting, business attire" },
    { category: "Professional", title: "Corporate Leader", prompt: "Corporate leader presenting in boardroom with confidence" },
    { category: "Professional", title: "Entrepreneur", prompt: "Young entrepreneur in modern coworking space with laptop" },
    { category: "Professional", title: "Sales Professional", prompt: "Sales representative with confident handshake pose, office setting" },
    { category: "Professional", title: "Consultant", prompt: "Business consultant with strategic documents and charts" },
    { category: "Professional", title: "Team Leader", prompt: "Team leader in collaborative meeting room environment" },
    { category: "Professional", title: "Manager Portrait", prompt: "Professional manager in corner office with city view" },
    
    // Healthcare & Medical
    { category: "Healthcare", title: "Doctor Portrait", prompt: "Doctor in white coat with stethoscope, hospital background" },
    { category: "Healthcare", title: "Nurse Professional", prompt: "Caring nurse in scrubs with medical equipment, bright clinic" },
    { category: "Healthcare", title: "Surgeon", prompt: "Surgeon in operating room with surgical mask and cap" },
    { category: "Healthcare", title: "Therapist", prompt: "Mental health professional in calming office with plants" },
    { category: "Healthcare", title: "Veterinarian", prompt: "Veterinarian with friendly animals in modern clinic" },
    { category: "Healthcare", title: "Dentist", prompt: "Dentist in dental office with modern equipment" },
    { category: "Healthcare", title: "Pharmacist", prompt: "Pharmacist in pharmacy with medicine shelves background" },
    
    // Technology & Innovation
    { category: "Technology", title: "Software Developer", prompt: "Software developer with multiple coding screens in tech office" },
    { category: "Technology", title: "Data Scientist", prompt: "Data scientist analyzing complex charts and algorithms" },
    { category: "Technology", title: "UX Designer", prompt: "UX designer with wireframes and design mockups" },
    { category: "Technology", title: "Tech Startup Founder", prompt: "Tech entrepreneur in Silicon Valley style office" },
    { category: "Technology", title: "Cybersecurity Expert", prompt: "Cybersecurity professional with network diagrams" },
    { category: "Technology", title: "AI Researcher", prompt: "AI researcher in futuristic laboratory with advanced technology" },
    { category: "Technology", title: "Mobile App Developer", prompt: "Mobile developer testing apps on multiple devices" },
    
    // Creative & Arts
    { category: "Creative", title: "Graphic Designer", prompt: "Graphic designer with creative tools and colorful artwork" },
    { category: "Creative", title: "Photographer", prompt: "Professional photographer with camera equipment in studio" },
    { category: "Creative", title: "Artist Studio", prompt: "Artist in creative studio with paintings and art supplies" },
    { category: "Creative", title: "Fashion Designer", prompt: "Fashion designer with sketches and fabric samples" },
    { category: "Creative", title: "Interior Designer", prompt: "Interior designer with mood boards and material samples" },
    { category: "Creative", title: "Architect", prompt: "Architect with blueprints in modern design studio" },
    { category: "Creative", title: "Video Editor", prompt: "Video editor with multiple monitors and editing software" },
    { category: "Creative", title: "Music Producer", prompt: "Music producer in professional recording studio" },
    
    // Education & Academia
    { category: "Education", title: "Teacher Portrait", prompt: "Warm approachable teacher in bright classroom" },
    { category: "Education", title: "Professor", prompt: "University professor in academic office with books" },
    { category: "Education", title: "Researcher", prompt: "Research scientist in laboratory with equipment" },
    { category: "Education", title: "Librarian", prompt: "Friendly librarian surrounded by books and knowledge" },
    { category: "Education", title: "Principal", prompt: "School principal in welcoming educational environment" },
    { category: "Education", title: "Tutor", prompt: "Personal tutor helping students with learning materials" },
    
    // Finance & Legal
    { category: "Finance", title: "Financial Advisor", prompt: "Financial advisor with charts and professional demeanor" },
    { category: "Finance", title: "Lawyer", prompt: "Professional lawyer in traditional law office with books" },
    { category: "Finance", title: "Accountant", prompt: "Accountant with financial documents and calculator" },
    { category: "Finance", title: "Investment Banker", prompt: "Investment banker in Wall Street style office" },
    { category: "Finance", title: "Insurance Agent", prompt: "Insurance professional explaining policies to clients" },
    
    // Service & Hospitality
    { category: "Service", title: "Chef Portrait", prompt: "Professional chef in modern kitchen with culinary tools" },
    { category: "Service", title: "Restaurant Manager", prompt: "Restaurant manager in elegant dining establishment" },
    { category: "Service", title: "Hotel Manager", prompt: "Hotel manager in luxury lobby with welcoming smile" },
    { category: "Service", title: "Event Planner", prompt: "Event coordinator with elegant venue background" },
    { category: "Service", title: "Real Estate Agent", prompt: "Real estate professional with property listings" },
    
    // Fitness & Wellness
    { category: "Fitness", title: "Personal Trainer", prompt: "Personal trainer in modern gym with fitness equipment" },
    { category: "Fitness", title: "Yoga Instructor", prompt: "Yoga teacher in peaceful studio with natural light" },
    { category: "Fitness", title: "Nutritionist", prompt: "Nutritionist with healthy foods and meal plans" },
    { category: "Fitness", title: "Sports Coach", prompt: "Sports coach with athletic equipment and motivational energy" },
    
    // Marketing & Media
    { category: "Marketing", title: "Marketing Manager", prompt: "Marketing professional with laptop in bright creative office" },
    { category: "Marketing", title: "Social Media Manager", prompt: "Social media expert with multiple screens and content" },
    { category: "Marketing", title: "Content Creator", prompt: "Content creator with camera and creative setup" },
    { category: "Marketing", title: "PR Specialist", prompt: "Public relations professional in corporate communications" },
    { category: "Marketing", title: "Brand Manager", prompt: "Brand manager presenting creative campaigns" },
    
    // Lifestyle & Personal
    { category: "Lifestyle", title: "Life Coach", prompt: "Life coach in inspiring motivational setting with books" },
    { category: "Lifestyle", title: "Travel Blogger", prompt: "Travel influencer with world map and adventure gear" },
    { category: "Lifestyle", title: "Wellness Expert", prompt: "Wellness expert in serene spa-like environment" },
    { category: "Lifestyle", title: "Personal Stylist", prompt: "Fashion stylist with clothing and accessories" },
    { category: "Lifestyle", title: "Home Organizer", prompt: "Organization expert in beautifully arranged space" },
    
    // Casual & Creative Portraits
    { category: "Portrait", title: "Outdoor Natural", prompt: "Natural outdoor portrait with soft golden lighting" },
    { category: "Portrait", title: "Urban Professional", prompt: "Urban professional against city skyline backdrop" },
    { category: "Portrait", title: "Artistic Portrait", prompt: "Artistic portrait with dramatic lighting and shadows" },
    { category: "Portrait", title: "Casual Friendly", prompt: "Casual friendly portrait in comfortable home setting" },
    { category: "Portrait", title: "Vintage Style", prompt: "Vintage inspired portrait with classic styling" },
    { category: "Portrait", title: "Minimalist", prompt: "Clean minimalist portrait with simple background" }
  ];

  const categories = ["All", "Professional", "Healthcare", "Technology", "Creative", "Education", "Finance", "Service", "Fitness", "Marketing", "Lifestyle", "Portrait"];

  const filteredPrompts = promptLibrary.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(promptSearch.toLowerCase()) || 
                         prompt.prompt.toLowerCase().includes(promptSearch.toLowerCase()) ||
                         prompt.category.toLowerCase().includes(promptSearch.toLowerCase());
    const matchesCategory = selectedCategory === "All" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Mock data for library
  const assets = [
    {
      id: 1,
      type: "avatar",
      title: "Professional Headshot",
      date: "2024-01-15",
      format: "PNG",
      tags: ["professional", "headshot"],
      thumbnail: "/api/placeholder/300/300"
    },
    {
      id: 2,
      type: "brand",
      title: "Summer Campaign Ad",
      date: "2024-01-14",
      format: "MP4",
      tags: ["campaign", "summer", "video"],
      thumbnail: "/api/placeholder/300/200"
    },
    {
      id: 3,
      type: "avatar",
      title: "Casual Portrait",
      date: "2024-01-13",
      format: "JPG",
      tags: ["casual", "portrait"],
      thumbnail: "/api/placeholder/300/300"
    }
  ];

  const filteredAssets = assets.filter(asset =>
    asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const toggleTodo = (id: string) => {
    setTodos(prev => {
      const updated = prev.map(todo => 
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      );
      
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

  const handleGenerate = (prompt: string) => {
    console.log("Generating with prompt:", prompt);
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <OverviewPage />;
      case "create":
        return <CreateAvatar />;
      case "studio":
        return <AvatarStudio />;
      case "individuals":
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <Card className="p-6 bg-gradient-card border-primary/20">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    🎉 New here? Watch how to create your first avatar in 30 seconds.
                  </h2>
                  <p className="text-muted-foreground">
                    Generate photorealistic avatars, headshots, and social content with AI
                  </p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chat Interface */}
              <div className="lg:col-span-2">
                <ChatInterface type="individuals" onGenerate={handleGenerate} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* AI Suggestions Library */}
                <Card className="p-6 h-[600px] flex flex-col">
                  <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI Prompt Library
                  </h3>
                  
                  {/* Search Bar */}
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      value={promptSearch}
                      onChange={(e) => setPromptSearch(e.target.value)}
                      placeholder="Search prompts..."
                      className="pl-10"
                    />
                  </div>

                  {/* Category Filters */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="text-xs h-8"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Results Count */}
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground">
                      {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  
                  {/* Scrollable Prompts */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {filteredPrompts.length > 0 ? (
                      filteredPrompts.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => {
                            const textarea = document.getElementById('main-prompt-textarea') as HTMLTextAreaElement;
                            if (textarea) {
                              const event = new Event('input', { bubbles: true });
                              textarea.value = item.prompt;
                              textarea.dispatchEvent(event);
                              textarea.focus();
                            }
                          }}
                          className="p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group border border-border/30 hover:border-primary/50"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors">
                              {item.title}
                            </p>
                            <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed break-words">
                            "{item.prompt}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center h-32 text-center">
                        <div>
                          <Search className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No prompts found</p>
                          <p className="text-xs text-muted-foreground">Try a different search term or category</p>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      case "brands":
        return (
          <div className="space-y-6">
            {/* Welcome Banner */}
            <Card className="p-6 bg-gradient-card border-primary/20">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <h2 className="text-xl font-display font-bold text-foreground">
                    🚀 Build ready-to-use commercials and campaigns powered by AI.
                  </h2>
                  <p className="text-muted-foreground">
                    Create professional brand content, advertisements, and marketing materials
                  </p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  View Examples
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Chat Interface */}
              <div className="lg:col-span-2">
                <ChatInterface type="brands" onGenerate={handleGenerate} />
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Brand Kit */}
                <Card className="p-6">
                  <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    Brand Kit
                  </h3>
                  <div className="space-y-4">
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3">
                      <SettingsIcon className="w-4 h-4" />
                      Brand Colors
                    </Button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        );
      case "library":
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">My Library</h1>
                <p className="text-muted-foreground">Manage all your generated content</p>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your library..."
                    className="pl-10 w-64"
                  />
                </div>
                
                {/* View Toggle */}
                <div className="flex border border-border rounded-lg">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredAssets.map((asset) => (
                <Card key={asset.id} className="group overflow-hidden hover-zoom">
                  <div className="aspect-square bg-muted relative">
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20"></div>
                    
                    {/* Hover Actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-white border-white/50">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-white/50">
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-white border-white/50">
                          <Share2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Badge className="absolute top-2 right-2">
                      {asset.format}
                    </Badge>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-medium truncate mb-1">{asset.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{asset.date}</p>
                    <div className="flex gap-1 flex-wrap">
                      {asset.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      case "guide":
        return (
          <div className="space-y-6">
            {/* Confetti Effect */}
            {showConfetti && (
              <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                <div className="text-6xl animate-bounce">🎉</div>
              </div>
            )}
            
            {/* Header */}
            <div className="text-center">
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

                      {/* Action Button */}
                      {!todo.completed && (
                        <Button 
                          size="sm"
                          onClick={() => {
                            if (todo.id === "1") setActiveView("create");
                            if (todo.id === "2") setActiveView("individuals");
                            if (todo.id === "3") setActiveView("library");
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
                </Card>
              ))}
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>

            {/* Profile Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-bold">Profile</h2>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                
                <Button>Save Changes</Button>
              </div>
            </Card>

            {/* Notification Settings */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-bold">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive updates about your generations</p>
                  </div>
                  <Switch />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Generation Complete</Label>
                    <p className="text-sm text-muted-foreground">Get notified when avatars finish generating</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </Card>

            {/* Billing & Usage */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-display font-bold">Billing & Usage</h2>
              </div>
              
              <div className="space-y-6">
                {/* Current Plan */}
                <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                  <div>
                    <h3 className="font-display font-bold">Free Plan</h3>
                    <p className="text-sm text-muted-foreground">50 generations per month</p>
                  </div>
                  <Badge className="bg-gradient-gold">Active</Badge>
                </div>
                
                {/* Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>This Month's Usage</Label>
                    <span className="text-sm text-muted-foreground">12 / 50</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-gold h-2 rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button>Upgrade Plan</Button>
                  <Button variant="outline">View Billing History</Button>
                </div>
              </div>
            </Card>
          </div>
        );
      default:
        return <OverviewPage />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <VirturaSidebar activeView={activeView} onViewChange={setActiveView} />
        
        <div className="flex-1 flex flex-col">
          {/* Main Content */}
          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}