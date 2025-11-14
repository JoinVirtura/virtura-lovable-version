import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { VirturaSidebar } from "@/components/VirturaSidebar";
import { OverviewPage } from "@/components/OverviewPage";
import neuralBrain from "@/assets/neural-brain.png";
import { CreateAvatar } from "@/components/CreateAvatar";
import { AvatarStudio } from "@/components/AvatarStudio";
import { AIImageStudio } from "@/components/AIImageStudio";
import { UploadSection } from "@/components/UploadSection";
import { ExportSection } from "@/components/ExportSection";
import { ChatInterface } from "@/components/ChatInterface";
import { TalkingAvatarStudio } from "@/components/TalkingAvatarStudio";
import { MotionBackground } from "@/components/MotionBackground";
import UpgradePage from "./UpgradePage";
import StudioPage from "./StudioPage";
import VideoProPage from "./VideoProPage";
import { BrandManagerView } from "@/components/BrandManagerView";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AvatarService } from "@/services/avatarService";
import { EditTitleDialog } from "@/components/EditTitleDialog";
import { DashboardLibraryView } from "@/components/DashboardLibraryView";
import { SupportPage } from "@/components/SupportPage";
import { ProjectTimeline } from "@/components/studio/ProjectTimeline";
import { useStudioProject } from "@/hooks/useStudioProject";
import { SettingsContent } from "@/components/SettingsContent";
import { StudioBackground } from "@/components/StudioBackground";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useOnboarding } from "@/hooks/useOnboarding";
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
  ChevronRight,
  Clock,
  AlertCircle,
  Lightbulb,
  Video,
  Volume2,
  TrendingUp,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageCircle,
  Mail,
  X,
  Heart,
  MessageSquare,
  Loader2,
  MoreVertical,
  Rocket,
  Wand2,
  Plus,
  Folder,
  FolderOpen,
  Image,
  FileText,
  Home
} from "lucide-react";
import { CircularProgress } from "@/components/ui/circular-progress";

// Import diverse avatar images
import businessExecutiveImg from "@/assets/avatar-business-executive.jpg";
import creativeArtistImg from "@/assets/avatar-creative-artist.jpg";
import fashionModelImg from "@/assets/avatar-fashion-model.jpg";
import techEntrepreneurImg from "@/assets/avatar-tech-entrepreneur.jpg";
import healthcareProfessionalImg from "@/assets/avatar-healthcare-professional.jpg";
import fitnessCoachImg from "@/assets/avatar-fitness-coach.jpg";
import corporateExecutiveImg from "@/assets/avatar-corporate-executive.jpg";
import linkedinProfileImg from "@/assets/avatar-linkedin-profile.jpg";
import authorPortraitImg from "@/assets/avatar-author-portrait.jpg";

// Import realistic brand asset avatars
import avatarLogoDesignerImg from "@/assets/avatar-logo-designer-realistic.jpg";
import avatarMarketingManagerImg from "@/assets/avatar-marketing-manager-realistic.jpg";
import avatarSocialMediaManagerImg from "@/assets/avatar-social-media-manager-realistic.jpg";
import avatarBusinessPresenterImg from "@/assets/avatar-business-presenter-realistic.jpg";

// Import realistic video content avatars
import avatarVideoCreatorImg from "@/assets/avatar-video-creator-realistic.jpg";
import avatarVideoProducerImg from "@/assets/avatar-video-producer-realistic.jpg";
import avatarCreativeVideoArtistImg from "@/assets/avatar-creative-video-artist-realistic.jpg";
import avatarSocialInfluencerImg from "@/assets/avatar-social-influencer-realistic.jpg";

// Import realistic favorites avatars
import avatarAwardPhotographerImg from "@/assets/avatar-award-photographer-realistic.jpg";
import avatarBrandConsultantImg from "@/assets/avatar-brand-consultant-realistic.jpg";

export default function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const { isOnboardingComplete, loading: onboardingLoading } = useOnboarding();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  
  // Import admin dashboard
  const [AdminDashboardComponent, setAdminDashboardComponent] = useState<any>(null);
  
  useEffect(() => {
    if (activeView === "admin-dashboard") {
      import("./UnifiedAdminDashboard").then((module) => {
        setAdminDashboardComponent(() => module.default);
      });
    }
  }, [activeView]);
  
  // Brand Manager state
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['all']));
  const [sortBy, setSortBy] = useState('name');
  const [filterType, setFilterType] = useState('all');

  // Fetch saved avatars from Supabase for Library view
  const fetchSavedAvatars = async () => {
    try {
      setLibraryLoading(true);
      setLibraryError(null);
      
      const { data, error: fetchError } = await supabase
        .from('avatar_library')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (fetchError) {
        console.error('Error fetching avatars:', fetchError);
        setLibraryError('Failed to load library items');
        return;
      }

      const formattedAssets = data?.map((item, index) => ({
        id: item.id,
        dbId: item.id, // Keep reference to database ID
        type: "Avatar",
        title: item.title || `Generated Avatar ${new Date(item.created_at).toLocaleDateString()}`,
        date: new Date(item.created_at).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        format: "PNG",
        tags: item.tags || ["ai-generated"],
        thumbnail: item.image_url,
        imageUrl: item.image_url,
        prompt: item.prompt,
        isFavorite: item.tags?.includes("favorite") || false,
        quality: Math.floor(Math.random() * 10 + 90), // 90-99%
        generationTime: `${(Math.random() * 2 + 1.5).toFixed(1)}s`,
        fileSize: `${(Math.random() * 1.5 + 1.5).toFixed(1)} MB`,
        category: "Avatars"
      })) || [];

      setLibraryAssets(formattedAssets);
    } catch (err) {
      console.error('Error in fetchSavedAvatars:', err);
      setLibraryError('Failed to load library items');
    } finally {
      setLibraryLoading(false);
    }
  };

  // Load avatars on component mount
  useEffect(() => {
    fetchSavedAvatars();
  }, []);

  // Set up real-time subscription for new avatars
  useEffect(() => {
    const channel = supabase
      .channel('dashboard-avatar-library-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'avatar_library'
        },
        () => {
          fetchSavedAvatars(); // Refresh the list when new avatars are added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Check if user needs to see onboarding
  useEffect(() => {
    if (!onboardingLoading && !isOnboardingComplete) {
      setShowWelcomeModal(true);
    }
  }, [isOnboardingComplete, onboardingLoading]);
  
  // Copilot Flow state
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [generatedPreviews, setGeneratedPreviews] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Brand Kit state
  const [brandLogo, setBrandLogo] = useState<string | null>(null);
  const [brandColors, setBrandColors] = useState({
    primary: "#E74C3C",
    secondary: "#48CAE4", 
    accent: "#4A90E2",
    support: "#A8E6CF"
  });
  const [primaryFont, setPrimaryFont] = useState("");
  const [secondaryFont, setSecondaryFont] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [expandedBrandAssets, setExpandedBrandAssets] = useState<Set<string>>(new Set());
  const [selectedColorSlot, setSelectedColorSlot] = useState<keyof typeof brandColors>("primary");
  
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
  const [libraryAssets, setLibraryAssets] = useState<any[]>([]);
  const [libraryLoading, setLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [editTitleDialog, setEditTitleDialog] = useState<{ open: boolean; asset: any } | null>(null);
  const [deletingAssetId, setDeletingAssetId] = useState<string | null>(null);
  
  // AI Suggestions state
  const [promptSearch, setPromptSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [selectedEditImage, setSelectedEditImage] = useState<any>(null);
  
  // Avatar selection state
  const [selectedAvatarIds, setSelectedAvatarIds] = useState<Set<number>>(new Set());
  
  // Quick Actions modals
  const [generateSimilarOpen, setGenerateSimilarOpen] = useState(false);
  const [batchProcessOpen, setBatchProcessOpen] = useState(false);
  const [createCollectionOpen, setCreateCollectionOpen] = useState(false);
  const [viewAnalyticsOpen, setViewAnalyticsOpen] = useState(false);
  
  // Avatar selection handler
  const handleAvatarSelect = (avatarId: number) => {
    setSelectedAvatarIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(avatarId)) {
        newSet.delete(avatarId);
      } else {
        newSet.add(avatarId);
      }
      return newSet;
    });
  };
  
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

  // All library data now comes from real database via libraryAssets state

  // Calculate dynamic stats from real library assets
  const calculateStats = () => {
    const totalAssets = libraryAssets.length;
    
    // Calculate this month's assets (current month)
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthAssets = libraryAssets.filter(asset => {
      const assetDate = new Date(asset.created_at);
      return assetDate.getMonth() === currentMonth && assetDate.getFullYear() === currentYear;
    }).length;
    
    return {
      totalAssets,
      thisMonthAssets,
      storageUsed: '0GB', // Calculate from actual file sizes if available
      avgQuality: '95%' // Default quality indicator
    };
  };

  const stats = calculateStats();

  // Filter real library assets
  const filteredAssets = libraryAssets.filter(asset => {
    const matchesSearch = asset.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || (selectedCategory === "Favorites" && asset.is_favorite);
    return matchesSearch && matchesCategory;
  });

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
      case "Easy": return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "Medium": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      case "Advanced": return "bg-red-500/20 text-red-400 border border-red-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  const handleGenerate = async (prompt: string) => {
    console.log("Generating avatars with prompt:", prompt);
    setIsGenerating(true);
    setCurrentPrompt(prompt);
    
    try {
      // Avatar Studio workflow parameters
      const studioNegative = "blurry fingers, extra limbs, distorted faces, unrealistic body proportions, text, watermark, low quality, plastic skin, CGI, doll-like";
      const enhancedPrompt = `${prompt}, professional studio headshot, realistic natural lighting, high quality, professional photography, 8k resolution, sharp focus, realistic skin texture, detailed hair, photorealistic, single person`;
      
      console.log("About to generate avatars with enhanced prompt:", enhancedPrompt);
      
      // Generate 3 variations
      const results = await Promise.all([
        AvatarService.generateAvatar({
          prompt: `${enhancedPrompt}, professional headshot style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${enhancedPrompt}, creative artistic portrait`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${enhancedPrompt}, casual lifestyle portrait`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        })
      ]);

      console.log("Generation results:", results);

      const newPreviews = results
        .filter(result => result.success && result.image)
        .map((result, index) => ({
          id: `${Date.now()}_${index}`,
          imageUrl: result.image!,
          title: index === 0 ? "Professional Style" : index === 1 ? "Creative Style" : "Casual Style",
          description: prompt
        }));

      console.log("Filtered previews:", newPreviews);

      if (newPreviews.length > 0) {
        setGeneratedPreviews(newPreviews);
        toast({
          title: "Success!",
          description: `Generated ${newPreviews.length} high-quality avatars!`,
        });
      } else {
        // Show more detailed error information
        const errors = results.filter(r => !r.success).map(r => r.error).join(", ");
        console.error("All generations failed. Errors:", errors);
        toast({
          title: "Generation Failed",
          description: `Failed to generate avatars. Errors: ${errors || "Unknown error"}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Avatar generation error:', error);
      toast({
        title: "Error",
        description: `An error occurred while generating avatars: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleQuickEdit = (previewId: number, editType: string) => {
    console.log("Quick edit:", previewId, editType);
    // Implement quick edit functionality
  };

  const handleChatRefine = (message: string) => {
    setChatMessages(prev => [...prev, { role: 'user', content: message }]);
    // Implement chat refinement
  };

  const playVoicePreview = (voiceType: string) => {
    // Sample text for voice preview
    const sampleTexts = {
      "professional-authoritative": "We deliver excellence through innovation and expertise.",
      "friendly-approachable": "Hi there! We're excited to work with you on your next project.",
      "innovative-forward": "Revolutionizing the future with cutting-edge technology.",
      "luxury-premium": "Experience unparalleled quality and sophistication.",
      "casual-relatable": "Hey! Let's create something amazing together."
    };

    const text = sampleTexts[voiceType as keyof typeof sampleTexts] || "This is a sample of your brand voice.";
    
    // Use browser's speech synthesis for preview
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to select an appropriate voice based on brand voice type
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        // You could map different voice types to different voices here
        utterance.voice = voices[0];
      }
      
      speechSynthesis.speak(utterance);
      
      toast({
        title: "Voice Preview",
        description: `Playing "${voiceType}" brand voice sample`,
      });
    } else {
      toast({
        title: "Voice Preview",
        description: "Speech synthesis not supported in this browser",
        variant: "destructive"
      });
    }
  };

  // Enhanced button handlers for library
  const handleEdit = (asset: any) => {
    // Switch to studio view with the selected image for editing
    if (asset.imageUrl) {
      setSelectedEditImage({
        imageUrl: asset.imageUrl,
        prompt: asset.prompt || '',
        title: asset.title,
        dbId: asset.dbId
      });
      setActiveView('studio');
    }
  };

  const handleShare = async (asset: any) => {
    try {
      // Check if Web Share API is available (native sharing)
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: asset.title,
          text: `Check out this AI-generated avatar: ${asset.title}`,
          url: asset.imageUrl
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast({
            title: "Shared Successfully",
            description: "Avatar shared via native sharing.",
          });
          return;
        }
      }

      // Fallback: Copy to clipboard
      await navigator.clipboard.writeText(asset.imageUrl);
      toast({
        title: "Link Copied",
        description: "Avatar link copied to clipboard. You can now share it anywhere!",
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Secondary fallback - show share modal
      setSelectedAsset(asset);
      setShareModalOpen(true);
    }
  };

  const handleDownload = async (asset: any) => {
    try {
      // Fetch the image as blob for proper download
      const response = await fetch(asset.imageUrl);
      if (!response.ok) throw new Error('Failed to fetch image');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${asset.title.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Complete",
        description: `${asset.title} has been saved to your device.`,
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download the image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleFavorite = async (asset: any) => {
    try {
      const newTags = asset.isFavorite 
        ? asset.tags.filter((tag: string) => tag !== "favorite")
        : [...asset.tags, "favorite"];

      const { error } = await supabase
        .from('avatar_library')
        .update({ tags: newTags })
        .eq('id', asset.dbId);

      if (error) throw error;

      // Update local state
      setLibraryAssets(prev => prev.map(a => 
        a.dbId === asset.dbId 
          ? { ...a, tags: newTags, isFavorite: !asset.isFavorite }
          : a
      ));

      toast({
        title: asset.isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: `${asset.title} ${asset.isFavorite ? 'removed from' : 'added to'} your favorites.`,
      });
    } catch (error) {
      console.error('Error updating favorites:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (asset: any) => {
    setDeletingAssetId(asset.dbId);
    try {
      // Delete from Supabase database
      const { error: dbError } = await supabase
        .from('avatar_library')
        .delete()
        .eq('id', asset.dbId);

      if (dbError) throw dbError;

      // Extract the file path from the URL for storage deletion
      const url = new URL(asset.imageUrl);
      const pathParts = url.pathname.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // Delete from Supabase storage
      const { error: storageError } = await supabase.storage
        .from('avatars')
        .remove([fileName]);

      if (storageError) {
        console.warn('Storage deletion warning:', storageError);
        // Don't throw here as the database deletion was successful
      }

      // Update local state
      setLibraryAssets(prev => prev.filter(a => a.dbId !== asset.dbId));

      toast({
        title: "Avatar Deleted",
        description: `${asset.title} has been permanently deleted.`,
      });
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete Failed",
        description: "Unable to delete the avatar. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingAssetId(null);
    }
  };

  const handleEditTitle = async (asset: any) => {
    setEditTitleDialog({ open: true, asset });
  };

  const handleSaveTitle = async (newTitle: string) => {
    if (!editTitleDialog?.asset) return;

    try {
      const { error } = await supabase
        .from('avatar_library')
        .update({ title: newTitle })
        .eq('id', editTitleDialog.asset.dbId);

      if (error) throw error;

      // Update local state
      setLibraryAssets(prev => prev.map(a => 
        a.dbId === editTitleDialog.asset.dbId 
          ? { ...a, title: newTitle }
          : a
      ));

      toast({
        title: "Title Updated",
        description: "Avatar title has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update title. Please try again.",
        variant: "destructive"
      });
      throw error; // Re-throw to let dialog handle it
    }
  };

  const handleSaveEdit = () => {
    if (selectedAsset && editPrompt.trim()) {
      toast({
        title: "Avatar Updated",
        description: `${selectedAsset.title} has been updated with your changes.`,
      });
      setEditModalOpen(false);
      setEditPrompt("");
      setSelectedAsset(null);
    }
  };

  const handleSocialShare = (platform: string) => {
    const shareText = `Check out this amazing ${selectedAsset?.type} I created with Virtura AI!`;
    const shareUrl = window.location.href;
    
    let url = '';
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'linkedin':
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'instagram':
        // Instagram doesn't support direct URL sharing, so copy to clipboard
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to Clipboard",
          description: "Share text copied! You can paste it on Instagram.",
        });
        return;
    }
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
    
    setShareModalOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case "overview":
        return <OverviewPage onViewChange={setActiveView} />;
      case "settings":
        return <SettingsContent onRewatchTutorial={() => setShowWelcomeModal(true)} />;
      case "talking-avatar":
        return (
          <div className="h-screen overflow-y-auto">
            <StudioPage />
          </div>
        );
      case "video-pro":
        return (
          <div className="h-screen overflow-y-auto">
            <VideoProPage />
          </div>
        );
      case "create":
        return <CreateAvatar />;
      case "studio":
        return (
          <StudioBackground>
            <AIImageStudio 
              editImage={selectedEditImage} 
              onBackToLibrary={() => { 
                setSelectedEditImage(null); 
                setActiveView('library'); 
              }} 
            />
          </StudioBackground>
        );
      case "individuals":
        return (
          <StudioBackground>
            <div className="space-y-6">
              {/* Welcome Banner */}
              <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h2 className="text-xl font-display font-bold text-white">
                      🎉 New here? Watch how to create your first avatar in 30 seconds.
                    </h2>
                    <p className="text-violet-200">
                      Generate photorealistic avatars, headshots, and social content with AI
                    </p>
                  </div>
                  <Button variant="outline" className="flex items-center gap-2 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10">
                    <Play className="w-4 h-4" />
                    Watch Demo
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                {/* Copilot Input */}
                <Card className="p-6 border-violet-500/20 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        value={currentPrompt}
                        onChange={(e) => setCurrentPrompt(e.target.value)}
                        placeholder="Describe what you want: 'Make a smiling teacher in a bright classroom'..."
                        className="pr-12 h-12 text-base bg-black/40 backdrop-blur-md border-2 border-violet-500/30 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        onKeyPress={(e) => e.key === 'Enter' && handleGenerate(currentPrompt)}
                      />
                      <Button 
                        onClick={() => handleGenerate(currentPrompt)}
                        className="absolute right-2 top-2 h-8 w-8 p-0 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                        disabled={isGenerating || !currentPrompt.trim()}
                      >
                        <Sparkles className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-violet-300">Quick Presets</p>
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
                            className="h-16 flex-col gap-2 border-violet-500/30 hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300"
                            onClick={() => setCurrentPrompt(`Create a ${preset.label.toLowerCase()}`)}
                          >
                            <preset.icon className="w-5 h-5 text-violet-400" />
                            <span className="text-xs">{preset.label}</span>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Advanced Options */}
                    <Button
                      variant="ghost"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="flex items-center gap-2 text-violet-300 hover:text-violet-200 hover:bg-violet-500/10"
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
                            <div className="flex gap-1.5">
                              <Button size="sm" variant="outline" className="flex-1 text-xs h-8 px-2">
                                <Edit className="w-3 h-3 mr-1" />
                                <span className="truncate">Quick Edit</span>
                              </Button>
                              <Button size="sm" className="flex-1 text-xs h-8 px-2">
                                <Download className="w-3 h-3 mr-1" />
                                <span className="truncate">Save</span>
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
                          className="p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group border border-border/30 hover:border-primary/50"
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <p className="font-medium text-sm group-hover:text-primary transition-colors flex-1 min-w-0">
                              {item.title}
                            </p>
                            <Badge variant="secondary" className="text-xs flex-shrink-0 whitespace-nowrap">
                              {item.category}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed break-words min-h-[3rem] overflow-hidden">
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
          </StudioBackground>
        );
      case "brands":
        return <BrandManagerView />;
      case "library":
        return <DashboardLibraryView onEdit={handleEdit} />;
      case "guide":
        return (
          <div className="space-y-6 min-h-screen px-4">
            {/* Onboarding Videos Section */}
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-display font-bold">
                  Video Library
                </h2>
                <CircularProgress 
                  value={progress} 
                  size={80} 
                  strokeWidth={6}
                  className="relative"
                />
              </div>
              
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
                To-Do Checklist
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
                                  if (todo.id === "1") setActiveView("individuals");
                                  if (todo.id === "2") setActiveView("brands");
                                  if (todo.id === "3") setActiveView("library");
                                  if (todo.id === "4") setActiveView("library");
                                  if (todo.id === "5") setActiveView("settings");
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
                                <div className="aspect-video rounded-xl overflow-hidden border border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.2)] relative group cursor-pointer">
                                  <img 
                                    src={neuralBrain} 
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
                      onClick={() => setActiveView("individuals")}
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
          </div>
        );
      case "support":
        return <SupportPage />;
      case "settings":
        return (
          <div className="space-y-8 min-h-screen">
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
                  <Badge className="bg-gradient-primary">Active</Badge>
                </div>
                
                {/* Usage */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>This Month's Usage</Label>
                    <span className="text-sm text-muted-foreground">12 / 50</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <Button onClick={() => setActiveView("upgrade")}>Upgrade Plan</Button>
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
      case "upgrade":
        return <UpgradePage />;
      case "admin-dashboard":
        return AdminDashboardComponent ? <AdminDashboardComponent /> : (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        );
      default:
        return <OverviewPage onViewChange={setActiveView} />;
    }
  };

  return (
    <>
      <WelcomeModal 
        open={showWelcomeModal} 
        onOpenChange={setShowWelcomeModal}
      />
      
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background relative overflow-hidden">
          <MotionBackground />
          
          {/* Fixed Mobile Header */}
          <header className="fixed top-0 left-0 right-0 z-50 md:hidden bg-black/90 backdrop-blur-xl border-b border-violet-500/20">
            <div className="flex items-center justify-between px-4 h-14">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Virtura AI
              </h1>
              <SidebarTrigger className="h-8 w-8 text-violet-400 hover:text-violet-300" />
            </div>
          </header>
          
          <VirturaSidebar 
            activeView={activeView} 
            onViewChange={setActiveView}
            onClearEditState={() => setSelectedEditImage(null)}
          />
        
        <div className="flex-1 flex flex-col relative z-10">
          {/* Add padding top on mobile to account for fixed header */}
          <main className="flex-1 p-6 md:pt-6 pt-20">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit {selectedAsset?.type}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-prompt">Update Description</Label>
              <Textarea
                id="edit-prompt"
                placeholder="Describe the changes you want to make..."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={!editPrompt.trim()}>
                Apply Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share {selectedAsset?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Share your creation on social media platforms
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12"
                onClick={() => handleSocialShare('twitter')}
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12"
                onClick={() => handleSocialShare('facebook')}
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12"
                onClick={() => handleSocialShare('linkedin')}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2 h-12"
                onClick={() => handleSocialShare('instagram')}
              >
                <Instagram className="h-4 w-4" />
                Instagram
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShareModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate Similar Modal */}
      <Dialog open={generateSimilarOpen} onOpenChange={setGenerateSimilarOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate Similar Avatars
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Create variations of your selected avatar{selectedAvatarIds.size > 1 ? 's' : ''} with AI-powered generation
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Style Variation</Label>
                <Select defaultValue="similar">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="similar">Keep Similar Style</SelectItem>
                    <SelectItem value="professional">More Professional</SelectItem>
                    <SelectItem value="artistic">More Artistic</SelectItem>
                    <SelectItem value="casual">More Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Number of Variations</Label>
                <Select defaultValue="4">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 Variations</SelectItem>
                    <SelectItem value="4">4 Variations</SelectItem>
                    <SelectItem value="6">6 Variations</SelectItem>
                    <SelectItem value="8">8 Variations</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setGenerateSimilarOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => { 
                toast({ description: "Generating similar avatars..." });
                setGenerateSimilarOpen(false);
              }} className="flex-1">
                Generate {selectedAvatarIds.size > 1 ? `${selectedAvatarIds.size} Sets` : 'Variations'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Batch Process Modal */}
      <Dialog open={batchProcessOpen} onOpenChange={setBatchProcessOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-secondary" />
              Batch Process ({selectedAvatarIds.size} items)
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Process Type</Label>
                <Select defaultValue="enhance">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enhance">Quality Enhancement</SelectItem>
                    <SelectItem value="resize">Bulk Resize</SelectItem>
                    <SelectItem value="format">Format Conversion</SelectItem>
                    <SelectItem value="background">Remove Background</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Output Format</Label>
                <Select defaultValue="png">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="webp">WebP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setBatchProcessOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => { 
                toast({ description: `Processing ${selectedAvatarIds.size} avatars...` });
                setBatchProcessOpen(false);
              }} className="flex-1">
                Start Processing
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Collection Modal */}
      <Dialog open={createCollectionOpen} onOpenChange={setCreateCollectionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-accent" />
              Create Collection
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Collection Name</Label>
              <Input placeholder="e.g., Business Avatars, Creative Portfolio" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea placeholder="Optional description for your collection..." rows={3} />
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedAvatarIds.size} avatar{selectedAvatarIds.size > 1 ? 's' : ''} will be added to this collection
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setCreateCollectionOpen(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => { 
                toast({ description: "Collection created successfully!" });
                setCreateCollectionOpen(false);
              }} className="flex-1">
                Create Collection
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Analytics Modal */}
      <Dialog open={viewAnalyticsOpen} onOpenChange={setViewAnalyticsOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Analytics Dashboard
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">847</div>
                <div className="text-sm text-muted-foreground">Total Generations</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">2.1s</div>
                <div className="text-sm text-muted-foreground">Avg Speed</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-accent">94%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </Card>
            </div>
            <div className="space-y-4">
              <h4 className="font-semibold">Popular Styles</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Professional Business</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full">
                      <div className="w-3/4 h-2 bg-primary rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">75%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Creative Artistic</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full">
                      <div className="w-1/2 h-2 bg-secondary rounded-full"></div>
                    </div>
                    <span className="text-sm text-muted-foreground">50%</span>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => setViewAnalyticsOpen(false)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Title Dialog */}
      {editTitleDialog && (
        <EditTitleDialog
          open={editTitleDialog.open}
          onOpenChange={(open) => setEditTitleDialog(open ? editTitleDialog : null)}
          currentTitle={editTitleDialog.asset?.title || ''}
          onSave={handleSaveTitle}
        />
      )}
    </SidebarProvider>
    </>
  );
}