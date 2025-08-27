import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { VirturaSidebar } from "@/components/VirturaSidebar";
import { OverviewPage } from "@/components/OverviewPage";
import virturaLogo from "/lovable-uploads/f264298f-2877-485b-affc-d705994fc848.png";
import { CreateAvatar } from "@/components/CreateAvatar";
import { AvatarStudio } from "@/components/AvatarStudio";
import { UploadSection } from "@/components/UploadSection";
import { ExportSection } from "@/components/ExportSection";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
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
  Settings as SettingsIcon,
  ChevronDown,
  ChevronUp,
  Clock,
  AlertCircle,
  Lightbulb,
  Video
} from "lucide-react";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("overview");
  
  // Copilot Flow state
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generatedPreviews, setGeneratedPreviews] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced Options state
  const [selectedGender, setSelectedGender] = useState("Woman");
  const [selectedAge, setSelectedAge] = useState("20s");
  const [selectedBodyType, setSelectedBodyType] = useState("");
  const [selectedExpression, setSelectedExpression] = useState("");
  const [creativityLevel, setCreativityLevel] = useState(70);
  const [selectedResolution, setSelectedResolution] = useState("1024x1024");
  const [selectedHairColor, setSelectedHairColor] = useState("");
  const [selectedHairStyle, setSelectedHairStyle] = useState("");
  const [selectedEyeColor, setSelectedEyeColor] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedLighting, setSelectedLighting] = useState("");
  const [selectedPose, setSelectedPose] = useState("");
  const [selectedOutfit, setSelectedOutfit] = useState("");
  const [selectedAccessories, setSelectedAccessories] = useState("");
  
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
      description: "Transform your ideas into stunning photorealistic avatars using advanced AI technology",
      detailedSteps: [
        "Navigate to the 'Create Avatar' section from the sidebar",
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
        "Go to the 'Upload' section from the sidebar",
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

  const handleGenerate = async (prompt: string) => {
    setIsGenerating(true);
    setCurrentPrompt(prompt);
    
    // Simulate AI generation with mock data
    setTimeout(() => {
      const mockPreviews = [
        {
          id: 1,
          imageUrl: virturaLogo,
          title: "Professional Look",
          description: "Clean, professional headshot with modern lighting"
        },
        {
          id: 2,
          imageUrl: virturaLogo,
          title: "Creative Style",
          description: "Artistic portrait with dynamic composition"
        },
        {
          id: 3,
          imageUrl: virturaLogo,
          title: "Casual Vibe",
          description: "Relaxed, approachable style with warm tones"
        }
      ];
      setGeneratedPreviews(mockPreviews);
      setIsGenerating(false);
    }, 2000);
  };

  const handleQuickEdit = (previewId: number, editType: string) => {
    console.log("Quick edit:", previewId, editType);
    // Implement quick edit functionality
  };

  const handleChatRefine = (message: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    // Implement chat refinement
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
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Copilot Input */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        value={currentPrompt}
                        onChange={(e) => setCurrentPrompt(e.target.value)}
                        placeholder="Describe what you want: 'Make a smiling teacher in a bright classroom'..."
                        className="pr-12 h-12 text-base"
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate(currentPrompt)}
                      />
                      <Button 
                        onClick={() => handleGenerate(currentPrompt)}
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        disabled={isGenerating || !currentPrompt.trim()}
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Quick Presets</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { icon: User, label: "Headshot" },
                          { icon: User, label: "Family Portrait" },
                          { icon: Share2, label: "Social Post" },
                          { icon: Star, label: "Commercial" }
                        ].map((preset) => (
                          <Button
                            key={preset.label}
                            variant="outline"
                            className="h-16 flex-col gap-2"
                            onClick={() => setCurrentPrompt(`Create a ${preset.label.toLowerCase()}`)}
                          >
                            <preset.icon className="w-5 h-5" />
                            <span className="text-xs">{preset.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <Button
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Advanced Options ({showAdvanced ? 'Hide' : 'Show'})
                    </Button>

                    {showAdvanced && (
                      <div className="space-y-6 p-6 bg-muted/30 rounded-lg">
                        <h4 className="text-lg font-semibold">Advanced Customization</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Left Column */}
                          <div className="space-y-4">
                            {/* Gender */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Gender</Label>
                              <div className="flex gap-2">
                                {["Woman", "Man", "Trans"].map((gender) => (
                                  <Button
                                    key={gender}
                                    variant={selectedGender === gender ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => setSelectedGender(gender)}
                                    className="flex-1"
                                  >
                                    {gender}
                                  </Button>
                                ))}
                              </div>
                            </div>

                            {/* Age Range */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Age Range</Label>
                              <Select value={selectedAge} onValueChange={setSelectedAge}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select age range" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="teens">Teens</SelectItem>
                                  <SelectItem value="20s">20s</SelectItem>
                                  <SelectItem value="30s">30s</SelectItem>
                                  <SelectItem value="40s">40s</SelectItem>
                                  <SelectItem value="50s">50s</SelectItem>
                                  <SelectItem value="60s+">60s+</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Body Type */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Body Type</Label>
                              <Select value={selectedBodyType} onValueChange={setSelectedBodyType}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select body type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="slim">Slim</SelectItem>
                                  <SelectItem value="athletic">Athletic</SelectItem>
                                  <SelectItem value="average">Average</SelectItem>
                                  <SelectItem value="curvy">Curvy</SelectItem>
                                  <SelectItem value="plus-size">Plus Size</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Facial Expression */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Facial Expression</Label>
                              <Select value={selectedExpression} onValueChange={setSelectedExpression}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select expression" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="smile">Smile</SelectItem>
                                  <SelectItem value="serious">Serious</SelectItem>
                                  <SelectItem value="laugh">Laugh</SelectItem>
                                  <SelectItem value="neutral">Neutral</SelectItem>
                                  <SelectItem value="confident">Confident</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Creativity Level */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">
                                Creativity Level: {creativityLevel}%
                              </Label>
                              <Slider
                                value={[creativityLevel]}
                                onValueChange={(value) => setCreativityLevel(value[0])}
                                max={100}
                                step={10}
                                className="w-full"
                              />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>Conservative</span>
                                <span>Experimental</span>
                              </div>
                            </div>

                            {/* Resolution */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Resolution</Label>
                              <div className="space-y-2">
                                {["512x512", "1024x1024", "1536x1536"].map((resolution) => (
                                  <Button
                                    key={resolution}
                                    variant={selectedResolution === resolution ? "default" : "outline"}
                                    onClick={() => setSelectedResolution(resolution)}
                                    className="w-full"
                                  >
                                    {resolution}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Right Column */}
                          <div className="space-y-4">
                            {/* Hair */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Hair</Label>
                              <div className="space-y-2">
                                <Select value={selectedHairColor} onValueChange={setSelectedHairColor}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Color" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="black">Black</SelectItem>
                                    <SelectItem value="brown">Brown</SelectItem>
                                    <SelectItem value="blonde">Blonde</SelectItem>
                                    <SelectItem value="red">Red</SelectItem>
                                    <SelectItem value="gray">Gray</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select value={selectedHairStyle} onValueChange={setSelectedHairStyle}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Style" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="short">Short</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="long">Long</SelectItem>
                                    <SelectItem value="curly">Curly</SelectItem>
                                    <SelectItem value="straight">Straight</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Eyes */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Eyes</Label>
                              <Select value={selectedEyeColor} onValueChange={setSelectedEyeColor}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Eye color" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="brown">Brown</SelectItem>
                                  <SelectItem value="blue">Blue</SelectItem>
                                  <SelectItem value="green">Green</SelectItem>
                                  <SelectItem value="hazel">Hazel</SelectItem>
                                  <SelectItem value="gray">Gray</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Setting */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Setting</Label>
                              <div className="space-y-2">
                                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Location" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="studio">Studio</SelectItem>
                                    <SelectItem value="office">Office</SelectItem>
                                    <SelectItem value="outdoor">Outdoor</SelectItem>
                                    <SelectItem value="home">Home</SelectItem>
                                    <SelectItem value="cafe">Cafe</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select value={selectedLighting} onValueChange={setSelectedLighting}>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Lighting" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="natural">Natural</SelectItem>
                                    <SelectItem value="studio">Studio</SelectItem>
                                    <SelectItem value="golden-hour">Golden Hour</SelectItem>
                                    <SelectItem value="dramatic">Dramatic</SelectItem>
                                    <SelectItem value="soft">Soft</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Body Pose */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Body Pose</Label>
                              <Select value={selectedPose} onValueChange={setSelectedPose}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select pose" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="front">Front Facing</SelectItem>
                                  <SelectItem value="side">Side Profile</SelectItem>
                                  <SelectItem value="three-quarter">Three Quarter</SelectItem>
                                  <SelectItem value="dynamic">Dynamic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Clothing Style */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Clothing Style</Label>
                              <Select value={selectedOutfit} onValueChange={setSelectedOutfit}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select outfit" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="business">Business</SelectItem>
                                  <SelectItem value="casual">Casual</SelectItem>
                                  <SelectItem value="formal">Formal</SelectItem>
                                  <SelectItem value="creative">Creative</SelectItem>
                                  <SelectItem value="sporty">Sporty</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Accessories */}
                            <div>
                              <Label className="text-sm font-medium mb-2 block">Accessories</Label>
                              <Select value={selectedAccessories} onValueChange={setSelectedAccessories}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select accessories" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">None</SelectItem>
                                  <SelectItem value="glasses">Glasses</SelectItem>
                                  <SelectItem value="jewelry">Jewelry</SelectItem>
                                  <SelectItem value="watch">Watch</SelectItem>
                                  <SelectItem value="hat">Hat</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Generated Previews */}
                {isGenerating && (
                  <Card className="p-6">
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-muted-foreground">Generating your avatars...</span>
                      </div>
                    </div>
                  </Card>
                )}

                {generatedPreviews.length > 0 && !isGenerating && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Generated Previews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {generatedPreviews.map((preview) => (
                        <Card key={preview.id} className="overflow-hidden">
                          <div className="aspect-square bg-muted relative">
                            <img
                              src={preview.imageUrl}
                              alt={preview.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-4 space-y-3">
                            <h4 className="font-medium text-sm">{preview.title}</h4>
                            <p className="text-xs text-muted-foreground">{preview.description}</p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 text-xs h-8">
                                <Edit className="w-3 h-3 mr-1" />
                                Quick Edit
                              </Button>
                              <Button size="sm" className="flex-1 text-xs h-8">
                                <Download className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Chat Refinement */}
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Refine with chat</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Make hair curly, change background to blue..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleChatRefine((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Button size="sm">Send</Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar - AI Prompt Library */}
              <div className="space-y-6">
                <Card className={`p-6 flex flex-col transition-all duration-300 ${showAdvanced ? 'h-[900px]' : 'h-[600px]'}`}>
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
                          onClick={() => setCurrentPrompt(item.prompt)}
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
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">No prompts found</p>
                          <p className="text-xs text-muted-foreground">Try adjusting your search or category filter</p>
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
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Copilot Input */}
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        value={currentPrompt}
                        onChange={(e) => setCurrentPrompt(e.target.value)}
                        placeholder="Describe what you want: 'Make a smiling teacher in a bright classroom'..."
                        className="pr-12 h-12 text-base"
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate(currentPrompt)}
                      />
                      <Button 
                        onClick={() => handleGenerate(currentPrompt)}
                        className="absolute right-2 top-2 h-8 w-8 p-0"
                        disabled={isGenerating || !currentPrompt.trim()}
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Quick Presets</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { icon: Star, label: "Commercial" },
                          { icon: Sparkles, label: "Campaign" },
                          { icon: Tag, label: "Product Mockup" },
                          { icon: Star, label: "Ad Pack" }
                        ].map((preset) => (
                          <Button
                            key={preset.label}
                            variant="outline"
                            className="h-16 flex-col gap-2"
                            onClick={() => setCurrentPrompt(`Create a ${preset.label.toLowerCase()}`)}
                          >
                            <preset.icon className="w-5 h-5" />
                            <span className="text-xs">{preset.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <Button
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-muted-foreground"
                    >
                      <SettingsIcon className="w-4 h-4" />
                      Advanced Options ({showAdvanced ? 'Hide' : 'Show'})
                    </Button>

                    {showAdvanced && (
                      <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="style">Style</Label>
                            <Input id="style" placeholder="Modern, Clean" />
                          </div>
                          <div>
                            <Label htmlFor="format">Format</Label>
                            <Input id="format" placeholder="Instagram Story" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {/* Generated Previews */}
                {isGenerating && (
                  <Card className="p-6">
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="text-muted-foreground">Generating your brand content...</span>
                      </div>
                    </div>
                  </Card>
                )}

                {generatedPreviews.length > 0 && !isGenerating && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Generated Previews</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {generatedPreviews.map((preview) => (
                        <Card key={preview.id} className="overflow-hidden">
                          <div className="aspect-square bg-muted relative">
                            <img
                              src={preview.imageUrl}
                              alt={preview.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-3 space-y-2">
                            <h4 className="font-medium text-sm">{preview.title}</h4>
                            <p className="text-xs text-muted-foreground">{preview.description}</p>
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" className="text-xs">
                                <Edit className="w-3 h-3 mr-1" />
                                Quick Edit
                              </Button>
                              <Button size="sm" className="text-xs">
                                <Download className="w-3 h-3 mr-1" />
                                Save
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>

                    {/* Chat Refinement */}
                    <div className="mt-6 pt-4 border-t">
                      <p className="text-sm font-medium mb-2">Refine with chat</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Change colors to match brand, add logo..."
                          className="flex-1"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleChatRefine((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                        />
                        <Button size="sm">Send</Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Sidebar - Brand Kit */}
              <div className="space-y-6">
                <Card className="p-6 flex flex-col h-full">
                  <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-primary" />
                    Brand Kit
                  </h3>
                  
                  <div className="space-y-6 flex-1">
                    {/* Logo Upload */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Logo</Label>
                      <Button variant="outline" className="w-full justify-start gap-3 h-12 border-dashed">
                        <Upload className="w-4 h-4" />
                        Upload Logo
                      </Button>
                    </div>

                    {/* Brand Colors */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Brand Colors</Label>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start gap-3 h-12">
                          <SettingsIcon className="w-4 h-4" />
                          Brand Colors
                        </Button>
                        <div className="grid grid-cols-4 gap-3 p-4 bg-muted/30 rounded-lg">
                          {[
                            { color: "#FF6B6B", name: "Primary" },
                            { color: "#4ECDC4", name: "Secondary" },
                            { color: "#45B7D1", name: "Accent" },
                            { color: "#96CEB4", name: "Support" }
                          ].map((item) => (
                            <div key={item.color} className="text-center">
                              <div
                                className="w-10 h-10 rounded-full cursor-pointer border-3 border-white shadow-lg mx-auto mb-1 hover:scale-110 transition-transform"
                                style={{ backgroundColor: item.color }}
                              />
                              <span className="text-xs text-muted-foreground">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Typography</Label>
                      <div className="space-y-2">
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Primary Font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="montserrat">Montserrat</SelectItem>
                            <SelectItem value="opensans">Open Sans</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Secondary Font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="playfair">Playfair Display</SelectItem>
                            <SelectItem value="lora">Lora</SelectItem>
                            <SelectItem value="merriweather">Merriweather</SelectItem>
                            <SelectItem value="source-serif">Source Serif</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Brand Guidelines */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Brand Guidelines</Label>
                      <div className="space-y-2">
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <Label className="text-xs text-muted-foreground mb-1 block">Brand Voice</Label>
                          <Input placeholder="Professional, Friendly, Innovative" className="h-8 text-xs" />
                        </div>
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <Label className="text-xs text-muted-foreground mb-1 block">Target Audience</Label>
                          <Input placeholder="Young professionals, 25-35" className="h-8 text-xs" />
                        </div>
                      </div>
                    </div>

                    {/* Content Templates */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Content Templates</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Social Media
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Email Header
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Business Card
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Letterhead
                        </Button>
                      </div>
                    </div>

                    {/* Brand Assets */}
                    <div className="flex-1">
                      <Label className="text-sm font-medium mb-3 block">Brand Assets</Label>
                      <div className="space-y-2">
                        <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                          <Calendar className="w-4 h-4" />
                          Style Guide (PDF)
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                          <Tag className="w-4 h-4" />
                          Logo Variations
                        </Button>
                        <Button variant="ghost" className="w-full justify-start gap-3 h-10 text-sm">
                          <Star className="w-4 h-4" />
                          Brand Templates
                        </Button>
                      </div>
                    </div>

                    {/* Save Brand Kit */}
                    <div className="pt-4 border-t">
                      <Button className="w-full">
                        Save Brand Kit
                      </Button>
                    </div>
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

            {/* Onboarding Videos Section */}
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-bold text-center">Onboarding Video Library</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Main Tutorial Video */}
                <Card className="overflow-hidden">
                  <div className="aspect-video relative group cursor-pointer">
                    <img 
                      src={virturaLogo}
                      alt="Virtura Complete Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
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
                  <div className="aspect-video relative group cursor-pointer">
                    <img 
                      src={virturaLogo} 
                      alt="Avatar Creation Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
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
                  <div className="aspect-video relative group cursor-pointer">
                    <img 
                      src={virturaLogo} 
                      alt="Content Enhancement Tutorial"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <Play className="w-16 h-16 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                    </div>
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
                                if (todo.id === "1") setActiveView("create");
                                if (todo.id === "2") setActiveView("upload");
                                if (todo.id === "3") setActiveView("library");
                                if (todo.id === "4") setActiveView("individuals");
                                if (todo.id === "5") setActiveView("settings");
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
                              <div className="aspect-video bg-muted rounded-lg overflow-hidden relative group cursor-pointer">
                                <img 
                                  src={virturaLogo} 
                                  alt={`${todo.title} Tutorial`}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                  <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
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
              <Card className="p-6 bg-gradient-card border-primary/30">
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
                    <Button onClick={() => setActiveView("individuals")}>
                      Explore Advanced Features
                    </Button>
                    <Button variant="outline">
                      Join Community
                    </Button>
                  </div>
                </div>
              </Card>
            )}
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
      case "upload":
        return <UploadSection />;
      case "export":
        return <ExportSection />;
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