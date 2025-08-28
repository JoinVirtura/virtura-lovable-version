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
import UpgradePage from "./UpgradePage";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
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
  MessageSquare
} from "lucide-react";

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
  const [activeView, setActiveView] = useState("overview");
  
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
  
  // AI Suggestions state
  const [promptSearch, setPromptSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [editPrompt, setEditPrompt] = useState("");
  
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

  // Mock library data with diverse avatars and enhanced brand assets
  const assets = [
    // Diverse Avatars
    {
      id: 1,
      type: "Avatar",
      title: "Business Executive",
      date: "Dec 15, 2024 2:30 PM",
      format: "JPG",
      tags: ["Professional", "Business", "Executive"],
      thumbnail: businessExecutiveImg,
      quality: 98,
      generationTime: "3.2s",
      fileSize: "2.1 MB",
      category: "Avatars"
    },
    {
      id: 2,
      type: "Avatar", 
      title: "Creative Artist",
      date: "Dec 14, 2024 4:45 PM",
      format: "PNG",
      tags: ["Creative", "Artistic", "Bohemian"],
      thumbnail: creativeArtistImg,
      quality: 96,
      generationTime: "2.8s",
      fileSize: "3.4 MB",
      category: "Avatars"
    },
    {
      id: 3,
      type: "Avatar",
      title: "Fashion Model",
      date: "Dec 13, 2024 1:20 PM",
      format: "JPG",
      tags: ["Fashion", "Luxury", "Editorial"],
      thumbnail: fashionModelImg,
      quality: 97,
      generationTime: "3.5s",
      fileSize: "2.3 MB",
      category: "Avatars"
    },
    {
      id: 4,
      type: "Avatar",
      title: "Tech Entrepreneur",
      date: "Dec 12, 2024 11:15 AM",
      format: "PNG",
      tags: ["Technology", "Startup", "Innovation"],
      thumbnail: techEntrepreneurImg,
      quality: 95,
      generationTime: "3.7s",
      fileSize: "2.7 MB",
      category: "Avatars"
    },
    {
      id: 5,
      type: "Avatar",
      title: "Healthcare Professional",
      date: "Dec 11, 2024 9:30 AM",
      format: "JPG",
      tags: ["Medical", "Healthcare", "Doctor"],
      thumbnail: healthcareProfessionalImg,
      quality: 99,
      generationTime: "2.9s",
      fileSize: "2.5 MB",
      category: "Avatars"
    },
    {
      id: 6,
      type: "Avatar",
      title: "Fitness Coach",
      date: "Dec 10, 2024 3:22 PM",
      format: "PNG",
      tags: ["Fitness", "Health", "Athletic"],
      thumbnail: fitnessCoachImg,
      quality: 94,
      generationTime: "3.1s",
      fileSize: "2.8 MB",
      category: "Avatars"
    },
    // Professional Headshots
    {
      id: 7,
      type: "Headshot",
      title: "Corporate Executive",
      date: "Dec 9, 2024 1:20 PM",
      format: "JPG",
      tags: ["Corporate", "Executive", "Professional"],
      thumbnail: corporateExecutiveImg,
      quality: 97,
      generationTime: "3.5s",
      fileSize: "2.3 MB",
      category: "Headshots"
    },
    {
      id: 8,
      type: "Headshot",
      title: "LinkedIn Profile",
      date: "Dec 8, 2024 11:15 AM",
      format: "PNG",
      tags: ["LinkedIn", "Professional", "Portrait"],
      thumbnail: linkedinProfileImg,
      quality: 99,
      generationTime: "3.7s",
      fileSize: "2.7 MB",
      category: "Headshots"
    },
    {
      id: 9,
      type: "Headshot",
      title: "Author Portrait",
      date: "Dec 7, 2024 4:45 PM",
      format: "JPG",
      tags: ["Author", "Writer", "Creative"],
      thumbnail: authorPortraitImg,
      quality: 96,
      generationTime: "3.2s",
      fileSize: "2.4 MB",
      category: "Headshots"
    },
    // Enhanced Brand Assets with Multiple Images
    {
      id: 10,
      type: "Brand Asset",
      title: "Complete Logo Suite",
      date: "Dec 6, 2024 3:22 PM",
      format: "SVG",
      tags: ["Logo", "Branding", "Identity"],
      thumbnail: avatarLogoDesignerImg,
      quality: 100,
      generationTime: "1.5s",
      fileSize: "450 KB",
      category: "Brand Assets",
      imageCount: 15,
      description: "15 logo variations including main, monochrome, icon, and social media versions"
    },
    {
      id: 11,
      type: "Brand Asset",
      title: "Marketing Campaign Pack",
      date: "Dec 5, 2024 9:30 AM",
      format: "PNG",
      tags: ["Marketing", "Campaign", "Templates"],
      thumbnail: avatarMarketingManagerImg,
      quality: 95,
      generationTime: "4.2s",
      fileSize: "12.9 MB",
      category: "Brand Assets",
      imageCount: 24,
      description: "24 marketing materials: banners, ads, social posts, email headers"
    },
    {
      id: 12,
      type: "Brand Asset",
      title: "Social Media Bundle",
      date: "Dec 4, 2024 2:15 PM",
      format: "JPG",
      tags: ["Social", "Instagram", "Facebook", "Twitter"],
      thumbnail: avatarSocialMediaManagerImg,
      quality: 94,
      generationTime: "3.8s",
      fileSize: "8.2 MB",
      category: "Brand Assets",
      imageCount: 32,
      description: "32 social media assets for all major platforms with various sizes"
    },
    {
      id: 13,
      type: "Brand Asset",
      title: "Business Presentation Kit",
      date: "Dec 3, 2024 11:45 AM",
      format: "PNG",
      tags: ["Presentation", "Business", "Professional"],
      thumbnail: avatarBusinessPresenterImg,
      quality: 98,
      generationTime: "5.1s",
      fileSize: "15.7 MB",
      category: "Brand Assets",
      imageCount: 45,
      description: "45 presentation slides, charts, and business graphics"
    },
    // Video Content (Multiple Videos)
    {
      id: 14,
      type: "Video",
      title: "Avatar Introduction Reel",
      date: "Dec 2, 2024 5:45 PM",
      format: "MP4",
      tags: ["Avatar", "Video", "Introduction", "Reel"],
      thumbnail: avatarVideoCreatorImg,
      quality: 96,
      generationTime: "45.2s",
      fileSize: "25.7 MB",
      category: "Videos",
      duration: "5s",
      description: "Short avatar introduction video for social media"
    },
    {
      id: 15,
      type: "Video",
      title: "Professional Showcase",
      date: "Dec 1, 2024 3:20 PM",
      format: "MP4",
      tags: ["Professional", "Business", "Showcase"],
      thumbnail: avatarVideoProducerImg,
      quality: 98,
      generationTime: "52.8s",
      fileSize: "31.4 MB",
      category: "Videos",
      duration: "8s",
      description: "Professional avatar showcase for corporate use"
    },
    {
      id: 16,
      type: "Video",
      title: "Creative Portfolio Demo",
      date: "Nov 30, 2024 1:10 PM",
      format: "MP4",
      tags: ["Creative", "Portfolio", "Artistic"],
      thumbnail: avatarCreativeVideoArtistImg,
      quality: 94,
      generationTime: "38.7s",
      fileSize: "22.1 MB",
      category: "Videos",
      duration: "6s",
      description: "Artistic avatar demonstration for creative portfolios"
    },
    {
      id: 17,
      type: "Video",
      title: "Social Media Story",
      date: "Nov 29, 2024 4:35 PM",
      format: "MP4",
      tags: ["Social", "Story", "Instagram", "TikTok"],
      thumbnail: avatarSocialInfluencerImg,
      quality: 92,
      generationTime: "33.5s",
      fileSize: "18.9 MB",
      category: "Videos",
      duration: "3s",
      description: "Quick avatar story content for social platforms"
    },
    // Favorites (starred items)
    {
      id: 18,
      type: "Avatar",
      title: "Award-Winning Portrait",
      date: "Nov 28, 2024 12:30 PM",
      format: "PNG",
      tags: ["Award", "Professional", "Premium"],
      thumbnail: avatarAwardPhotographerImg,
      quality: 100,
      generationTime: "3.1s",
      fileSize: "2.9 MB",
      category: "Favorites",
      starred: true,
      description: "Premium quality avatar that won creative excellence award"
    },
    {
      id: 19,
      type: "Brand Asset",
      title: "Signature Brand Kit",
      date: "Nov 27, 2024 10:15 AM",
      format: "SVG",
      tags: ["Premium", "Signature", "Complete"],
      thumbnail: avatarBrandConsultantImg,
      quality: 100,
      generationTime: "2.8s",
      fileSize: "1.2 MB",
      category: "Favorites",
      starred: true,
      imageCount: 28,
      description: "Complete signature brand kit with 28 premium assets"
    }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || asset.category === selectedCategory;
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

  // Button handlers for library
  const handleEdit = (asset: any) => {
    setSelectedAsset(asset);
    setEditPrompt(`Update this ${asset.type.toLowerCase()}: ${asset.title}`);
    setEditModalOpen(true);
  };

  const handleShare = (asset: any) => {
    setSelectedAsset(asset);
    setShareModalOpen(true);
  };

  const handleDownload = (asset: any) => {
    // Create a temporary link element for download
    const link = document.createElement('a');
    link.href = asset.thumbnail;
    link.download = `${asset.title.replace(/\s+/g, '_')}.${asset.format.toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: `${asset.title} is being downloaded.`,
    });
  };

  const handleDelete = (assetId: number) => {
    // In a real app, this would call an API to delete the asset
    toast({
      title: "Asset Deleted",
      description: "The asset has been removed from your library.",
      variant: "destructive"
    });
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
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setBrandLogo(e.target?.result as string);
                                toast({
                                  title: "Success",
                                  description: "Logo uploaded successfully!",
                                });
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <Button variant="outline" className="w-full justify-start gap-3 h-12 border-dashed relative">
                          <Upload className="w-4 h-4" />
                          {brandLogo ? "Change Logo" : "Upload Logo"}
                        </Button>
                      </div>
                      {brandLogo && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <img src={brandLogo} alt="Brand Logo" className="w-20 h-20 object-contain mx-auto" />
                        </div>
                      )}
                    </div>

                    {/* Brand Colors */}
                    <div>
                      <Label className="text-sm font-medium mb-4 block">Brand Colors</Label>
                      <div className="bg-gradient-to-br from-card via-card/95 to-card/90 p-6 rounded-xl border border-border/50 shadow-sm space-y-6">
                        
                        {/* Main Brand Colors */}
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                            <span className="text-sm font-medium text-foreground">Select Color to Modify</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(brandColors).map(([key, color]) => (
                              <div 
                                key={key} 
                                className={`group cursor-pointer transition-all duration-200 ${selectedColorSlot === key ? 'scale-105' : 'hover:scale-102'}`}
                                onClick={() => setSelectedColorSlot(key as keyof typeof brandColors)}
                              >
                                <div className="relative">
                                  <div 
                                    className={`w-16 h-16 rounded-xl border-3 shadow-lg transition-all duration-200 relative overflow-hidden ${
                                      selectedColorSlot === key 
                                        ? 'border-primary shadow-lg shadow-primary/25' 
                                        : 'border-background group-hover:border-border'
                                    }`}
                                    style={{ backgroundColor: color }}
                                  >
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200"></div>
                                    {selectedColorSlot === key && (
                                      <div className="absolute top-1 right-1">
                                        <div className="w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm"></div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="mt-2 text-center">
                                  <span className={`text-xs font-medium capitalize block transition-colors ${
                                    selectedColorSlot === key ? 'text-primary' : 'text-foreground'
                                  }`}>
                                    {key}
                                  </span>
                                  <span className="text-xs text-muted-foreground uppercase block">{color}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Color Suggestions */}
                        <div className="pt-4 border-t border-border/30">
                           <div className="flex items-center gap-2 mb-3">
                             <div className="w-2 h-2 bg-accent rounded-full"></div>
                             <span className="text-sm font-medium text-foreground">Quick Colors</span>
                           </div>
                          
                           <div className="overflow-x-auto h-14">
                             <div className="flex gap-2 pb-2 min-w-max h-full items-center">
                               {[
                                 "#FF6B35", "#FF8E53", "#FF6B6B", "#C44569", "#F8B500", "#FFD93D", 
                                 "#6BCF7F", "#4BCFFA", "#74B9FF", "#0984E3", "#A29BFE", "#6C5CE7",
                                 "#FD79A8", "#E84393", "#00B894", "#00CEC9", "#FF5722", "#E91E63",
                                 "#9C27B0", "#673AB7", "#3F51B5", "#2196F3", "#03A9F4", "#00BCD4",
                                 "#009688", "#4CAF50", "#8BC34A", "#CDDC39", "#FFEB3B", "#FFC107",
                                 "#FF9800", "#795548", "#607D8B", "#455A64", "#263238", "#37474F",
                                 "#546E7A", "#78909C", "#90A4AE", "#B0BEC5", "#CFD8DC", "#ECEFF1",
                                 "#F44336", "#E57373", "#EF5350", "#F48FB1", "#CE93D8", "#B39DDB",
                                 "#9FA8DA", "#90CAF9", "#81D4FA", "#80DEEA", "#80CBC4", "#A5D6A7",
                                 "#C8E6C9", "#DCEDC8", "#F0F4C3", "#FFF9C4", "#FFECB3", "#FFE0B2"
                               ].map((color, idx) => (
                                 <div
                                   key={idx}
                                   className="relative group cursor-pointer flex-shrink-0"
                                   onClick={() => {
                                     setBrandColors(prev => ({...prev, [selectedColorSlot]: color}));
                                     toast({
                                       title: "Color Updated",
                                       description: `Applied ${color} to ${selectedColorSlot}`,
                                     });
                                   }}
                                 >
                                   <div 
                                     className="w-10 h-10 rounded-lg border-2 border-background shadow-sm group-hover:scale-110 group-hover:shadow-md transition-all duration-200 group-hover:border-primary/30"
                                     style={{ backgroundColor: color }}
                                   />
                                 </div>
                               ))}
                             </div>
                           </div>
                        </div>
                        
                        {/* Color Harmony Suggestions */}
                        <div className="pt-4 border-t border-border/30">
                           <div className="flex items-center gap-2 mb-4">
                             <div className="w-2 h-2 bg-secondary rounded-full"></div>
                             <span className="text-sm font-medium text-foreground">Color Harmonies</span>
                           </div>
                          
                          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-border hover:scrollbar-thumb-border/80">
                            <div className="grid grid-cols-1 gap-3 pr-2">
                              {[
                                // Analogous Harmonies
                                { 
                                  name: "Ocean Analogous", 
                                  type: "Analogous",
                                  colors: { primary: "#003f5c", secondary: "#2f4b7c", accent: "#665191", support: "#a05195" }
                                },
                                { 
                                  name: "Sunset Analogous", 
                                  type: "Analogous",
                                  colors: { primary: "#ff6361", secondary: "#ff8531", accent: "#ffa600", support: "#ffc649" }
                                },
                                { 
                                  name: "Forest Analogous", 
                                  type: "Analogous",
                                  colors: { primary: "#2d5016", secondary: "#4a6741", accent: "#6b8e5a", support: "#c4d6b0" }
                                },
                                
                                // Complementary Harmonies
                                { 
                                  name: "Blue Orange Complementary", 
                                  type: "Complementary",
                                  colors: { primary: "#1f77b4", secondary: "#ff7f0e", accent: "#aec7e8", support: "#ffbb78" }
                                },
                                { 
                                  name: "Purple Yellow Complementary", 
                                  type: "Complementary",
                                  colors: { primary: "#6a4c93", secondary: "#ffca3a", accent: "#c589e8", support: "#fff3cd" }
                                },
                                { 
                                  name: "Red Green Complementary", 
                                  type: "Complementary",
                                  colors: { primary: "#d62728", secondary: "#2ca02c", accent: "#ff9896", support: "#98df8a" }
                                },
                                
                                // Triadic Harmonies
                                { 
                                  name: "Primary Triadic", 
                                  type: "Triadic",
                                  colors: { primary: "#ff4757", secondary: "#3742fa", accent: "#2ed573", support: "#ffffff" }
                                },
                                { 
                                  name: "Vibrant Triadic", 
                                  type: "Triadic",
                                  colors: { primary: "#ff3838", secondary: "#ff9500", accent: "#17c0eb", support: "#f1f2f6" }
                                },
                                { 
                                  name: "Muted Triadic", 
                                  type: "Triadic",
                                  colors: { primary: "#8395a7", secondary: "#ff6b6b", accent: "#4834d4", support: "#ddd" }
                                },
                                
                                // Monochromatic Harmonies
                                { 
                                  name: "Blue Monochromatic", 
                                  type: "Monochromatic",
                                  colors: { primary: "#0c2340", secondary: "#1e3a8a", accent: "#3b82f6", support: "#93c5fd" }
                                },
                                { 
                                  name: "Green Monochromatic", 
                                  type: "Monochromatic",
                                  colors: { primary: "#052e16", secondary: "#166534", accent: "#22c55e", support: "#86efac" }
                                },
                                { 
                                  name: "Purple Monochromatic", 
                                  type: "Monochromatic",
                                  colors: { primary: "#3c1361", secondary: "#7c3aed", accent: "#a855f7", support: "#c4b5fd" }
                                },
                                
                                // Compound Harmonies
                                { 
                                  name: "Corporate Professional", 
                                  type: "Compound",
                                  colors: { primary: "#1a365d", secondary: "#2c5282", accent: "#63b3ed", support: "#bee3f8" }
                                },
                                { 
                                  name: "Creative Agency", 
                                  type: "Compound",
                                  colors: { primary: "#d53f8c", secondary: "#ed64a6", accent: "#f687b3", support: "#fed7e2" }
                                },
                                { 
                                  name: "Tech Startup", 
                                  type: "Compound",
                                  colors: { primary: "#2d3748", secondary: "#4a5568", accent: "#68d391", support: "#c6f6d5" }
                                },
                                
                                // Seasonal Palettes
                                { 
                                  name: "Spring Bloom", 
                                  type: "Seasonal",
                                  colors: { primary: "#e91e63", secondary: "#8bc34a", accent: "#ffeb3b", support: "#f8bbd9" }
                                },
                                { 
                                  name: "Summer Vibes", 
                                  type: "Seasonal",
                                  colors: { primary: "#ff5722", secondary: "#ffc107", accent: "#03a9f4", support: "#ffe0b2" }
                                },
                                { 
                                  name: "Autumn Leaves", 
                                  type: "Seasonal",
                                  colors: { primary: "#d84315", secondary: "#ff8f00", accent: "#689f38", support: "#ffcc02" }
                                },
                                { 
                                  name: "Winter Frost", 
                                  type: "Seasonal",
                                  colors: { primary: "#263238", secondary: "#607d8b", accent: "#b0bec5", support: "#eceff1" }
                                },
                                
                                // Modern Trends
                                { 
                                  name: "Neon Dark", 
                                  type: "Modern",
                                  colors: { primary: "#0f0f23", secondary: "#00d4aa", accent: "#ff006e", support: "#8338ec" }
                                },
                                { 
                                  name: "Pastel Dream", 
                                  type: "Modern",
                                  colors: { primary: "#ffc8dd", secondary: "#bde0ff", accent: "#a2d2ff", support: "#cdb4db" }
                                },
                                { 
                                  name: "Cyberpunk", 
                                  type: "Modern",
                                  colors: { primary: "#0a0a0a", secondary: "#ff0080", accent: "#00ffff", support: "#8000ff" }
                                }
                              ].map((harmony, idx) => (
                                <div 
                                  key={idx}
                                  className="group cursor-pointer p-3 bg-muted/10 hover:bg-muted/25 rounded-lg transition-all duration-200"
                                  onClick={() => {
                                    setBrandColors(harmony.colors);
                                    toast({
                                      title: "Harmony Applied",
                                      description: `Applied ${harmony.name} (${harmony.type}) to your brand`,
                                    });
                                  }}
                                >
                                  <div className="flex gap-1.5 mb-2">
                                    {Object.values(harmony.colors).map((color, colorIdx) => (
                                      <div 
                                        key={colorIdx}
                                        className="flex-1 h-6 rounded-md shadow-sm group-hover:shadow transition-shadow"
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                   <div className="flex items-center">
                                     <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                                       {harmony.name}
                                     </span>
                                   </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Typography</Label>
                      <div className="space-y-3">
                        <Select value={primaryFont} onValueChange={setPrimaryFont}>
                          <SelectTrigger>
                            <SelectValue placeholder="Primary Font" />
                          </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="playfair" style={{ fontFamily: 'Playfair Display, serif' }}>Playfair Display</SelectItem>
                             <SelectItem value="roboto" style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto</SelectItem>
                             <SelectItem value="inter" style={{ fontFamily: 'Inter, sans-serif' }}>Inter</SelectItem>
                             <SelectItem value="montserrat" style={{ fontFamily: 'Montserrat, sans-serif' }}>Montserrat</SelectItem>
                             <SelectItem value="lato" style={{ fontFamily: 'Lato, sans-serif' }}>Lato</SelectItem>
                             <SelectItem value="opensans" style={{ fontFamily: 'Open Sans, sans-serif' }}>Open Sans</SelectItem>
                             <SelectItem value="poppins" style={{ fontFamily: 'Poppins, sans-serif' }}>Poppins</SelectItem>
                             <SelectItem value="nunito" style={{ fontFamily: 'Nunito, sans-serif' }}>Nunito</SelectItem>
                             <SelectItem value="sourcesans" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>Source Sans Pro</SelectItem>
                             <SelectItem value="raleway" style={{ fontFamily: 'Raleway, sans-serif' }}>Raleway</SelectItem>
                             <SelectItem value="oswald" style={{ fontFamily: 'Oswald, sans-serif' }}>Oswald</SelectItem>
                             <SelectItem value="merriweather" style={{ fontFamily: 'Merriweather, serif' }}>Merriweather</SelectItem>
                           </SelectContent>
                        </Select>
                        <Select value={secondaryFont} onValueChange={setSecondaryFont}>
                          <SelectTrigger>
                            <SelectValue placeholder="Secondary Font" />
                          </SelectTrigger>
                           <SelectContent>
                             <SelectItem value="lato" style={{ fontFamily: 'Lato, sans-serif' }}>Lato</SelectItem>
                             <SelectItem value="opensans" style={{ fontFamily: 'Open Sans, sans-serif' }}>Open Sans</SelectItem>
                             <SelectItem value="poppins" style={{ fontFamily: 'Poppins, sans-serif' }}>Poppins</SelectItem>
                             <SelectItem value="roboto" style={{ fontFamily: 'Roboto, sans-serif' }}>Roboto</SelectItem>
                             <SelectItem value="inter" style={{ fontFamily: 'Inter, sans-serif' }}>Inter</SelectItem>
                             <SelectItem value="nunito" style={{ fontFamily: 'Nunito, sans-serif' }}>Nunito</SelectItem>
                             <SelectItem value="sourcesans" style={{ fontFamily: 'Source Sans Pro, sans-serif' }}>Source Sans Pro</SelectItem>
                             <SelectItem value="raleway" style={{ fontFamily: 'Raleway, sans-serif' }}>Raleway</SelectItem>
                             <SelectItem value="ubuntu" style={{ fontFamily: 'Ubuntu, sans-serif' }}>Ubuntu</SelectItem>
                             <SelectItem value="worksans" style={{ fontFamily: 'Work Sans, sans-serif' }}>Work Sans</SelectItem>
                             <SelectItem value="dmsans" style={{ fontFamily: 'DM Sans, sans-serif' }}>DM Sans</SelectItem>
                             <SelectItem value="firasans" style={{ fontFamily: 'Fira Sans, sans-serif' }}>Fira Sans</SelectItem>
                           </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Brand Guidelines */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Brand Guidelines</Label>
                      <div className="space-y-3">
                        <div>
                           <Label className="text-xs text-muted-foreground mb-1 block">Brand Voice</Label>
                           <Select value={brandVoice} onValueChange={setBrandVoice}>
                             <SelectTrigger className="h-9">
                               <SelectValue placeholder="Select brand voice" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="professional-authoritative">Professional & Authoritative</SelectItem>
                               <SelectItem value="friendly-approachable">Friendly & Approachable</SelectItem>
                               <SelectItem value="innovative-forward">Innovative & Forward-thinking</SelectItem>
                               <SelectItem value="luxury-premium">Luxury & Premium</SelectItem>
                               <SelectItem value="casual-relatable">Casual & Relatable</SelectItem>
                               <SelectItem value="expert-trustworthy">Expert & Trustworthy</SelectItem>
                               <SelectItem value="creative-inspiring">Creative & Inspiring</SelectItem>
                               <SelectItem value="playful-energetic">Playful & Energetic</SelectItem>
                               <SelectItem value="minimalist-clean">Minimalist & Clean</SelectItem>
                               <SelectItem value="bold-confident">Bold & Confident</SelectItem>
                             </SelectContent>
                           </Select>
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">Target Audience</Label>
                          <Select value={targetAudience} onValueChange={setTargetAudience}>
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select target audience" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="young-professionals">Young Professionals (25-35)</SelectItem>
                              <SelectItem value="executives-leaders">Executives & Leaders (35-50)</SelectItem>
                              <SelectItem value="entrepreneurs">Entrepreneurs & Startups</SelectItem>
                              <SelectItem value="creative-professionals">Creative Professionals</SelectItem>
                              <SelectItem value="tech-industry">Tech Industry</SelectItem>
                              <SelectItem value="healthcare-professionals">Healthcare Professionals</SelectItem>
                              <SelectItem value="students-academics">Students & Academics</SelectItem>
                              <SelectItem value="retail-consumers">General Consumers</SelectItem>
                              <SelectItem value="luxury-market">Luxury Market</SelectItem>
                              <SelectItem value="b2b-enterprise">B2B Enterprise</SelectItem>
                              <SelectItem value="small-business">Small Business Owners</SelectItem>
                              <SelectItem value="consultants-coaches">Consultants & Coaches</SelectItem>
                            </SelectContent>
                          </Select>
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
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Presentation
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs h-8">
                          Website Header
                        </Button>
                      </div>
                    </div>

                    {/* Brand Assets */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Brand Assets</Label>
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between gap-3 h-10 text-sm"
                          onClick={() => {
                            const newExpanded = new Set(expandedBrandAssets);
                            if (newExpanded.has('style-guide')) {
                              newExpanded.delete('style-guide');
                            } else {
                              newExpanded.add('style-guide');
                            }
                            setExpandedBrandAssets(newExpanded);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4" />
                            Style Guide (PDF)
                          </div>
                          {expandedBrandAssets.has('style-guide') ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </Button>
                        {expandedBrandAssets.has('style-guide') && (
                          <div className="pl-7 space-y-1">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Download Complete Guide
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Color Palette Only
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Typography Guidelines
                            </Button>
                          </div>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between gap-3 h-10 text-sm"
                          onClick={() => {
                            const newExpanded = new Set(expandedBrandAssets);
                            if (newExpanded.has('logo-variations')) {
                              newExpanded.delete('logo-variations');
                            } else {
                              newExpanded.add('logo-variations');
                            }
                            setExpandedBrandAssets(newExpanded);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Tag className="w-4 h-4" />
                            Logo Variations
                          </div>
                          {expandedBrandAssets.has('logo-variations') ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </Button>
                        {expandedBrandAssets.has('logo-variations') && (
                          <div className="pl-7 space-y-1">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Full Color Logo
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Black & White
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Icon Only
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Horizontal Layout
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Vertical Layout
                            </Button>
                          </div>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          className="w-full justify-between gap-3 h-10 text-sm"
                          onClick={() => {
                            const newExpanded = new Set(expandedBrandAssets);
                            if (newExpanded.has('brand-templates')) {
                              newExpanded.delete('brand-templates');
                            } else {
                              newExpanded.add('brand-templates');
                            }
                            setExpandedBrandAssets(newExpanded);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Star className="w-4 h-4" />
                            Brand Templates
                          </div>
                          {expandedBrandAssets.has('brand-templates') ? 
                            <ChevronUp className="w-4 h-4" /> : 
                            <ChevronDown className="w-4 h-4" />
                          }
                        </Button>
                        {expandedBrandAssets.has('brand-templates') && (
                          <div className="pl-7 space-y-1">
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Social Media Templates
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Presentation Templates
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Marketing Materials
                            </Button>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs h-8">
                              Business Documents
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Save Brand Kit */}
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full"
                        onClick={() => {
                          toast({
                            title: "Success", 
                            description: "Brand Kit saved successfully!",
                          });
                        }}
                      >
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
            {/* Innovative Header with AI Stats */}
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl blur-xl"></div>
              <Card className="relative p-8 bg-gradient-to-br from-card via-card/98 to-card/95 border border-primary/10">
                <div className="flex items-start justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent">
                          AI Generation Library
                        </h1>
                        <p className="text-muted-foreground text-lg">Your complete collection of AI-generated content</p>
                      </div>
                    </div>
                    
                    {/* Real-time Stats */}
                    
                    {/* Enhanced Stats Section */}
                    <div className="mt-8 grid grid-cols-4 gap-8">
                      <div className="text-center group cursor-pointer">
                        <div className="text-3xl font-display font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">6</div>
                        <div className="text-sm text-muted-foreground font-medium">Total Assets</div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent mt-2 group-hover:via-primary transition-colors duration-300"></div>
                      </div>
                      <div className="text-center group cursor-pointer">
                        <div className="text-3xl font-display font-bold text-secondary mb-2 group-hover:scale-110 transition-transform duration-300">12</div>
                        <div className="text-sm text-muted-foreground font-medium">This Month</div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-secondary/30 to-transparent mt-2 group-hover:via-secondary transition-colors duration-300"></div>
                      </div>
                      <div className="text-center group cursor-pointer">
                        <div className="text-3xl font-display font-bold text-accent mb-2 group-hover:scale-110 transition-transform duration-300">4.2GB</div>
                        <div className="text-sm text-muted-foreground font-medium">Storage Used</div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent mt-2 group-hover:via-accent transition-colors duration-300"></div>
                      </div>
                      <div className="text-center group cursor-pointer">
                        <div className="text-3xl font-display font-bold text-green-500 mb-2 group-hover:scale-110 transition-transform duration-300">94%</div>
                        <div className="text-sm text-muted-foreground font-medium">Avg Quality</div>
                        <div className="w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent mt-2 group-hover:via-green-500 transition-colors duration-300"></div>
                      </div>
                    </div>
                  </div>
                  {/* Innovative AI Pulse Visualization */}
                  <div className="relative">
                    <div className="flex flex-col items-center space-y-4">
                      {/* AI Brain Visualization */}
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-full flex items-center justify-center relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent animate-pulse"></div>
                          <div className="absolute inset-2 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full animate-breathe"></div>
                          <div className="absolute inset-4 bg-gradient-to-br from-accent/40 to-primary/40 rounded-full animate-gentle-sway"></div>
                          <div className="relative z-10 text-primary">
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.18 0 2.34-.2 3.41-.59.3-.11.49-.4.49-.72 0-.43-.35-.78-.78-.78-.23 0-.44.1-.59.26-.87.32-1.8.49-2.77.49-3.9 0-7.13-3.13-7.13-7s3.23-7 7.13-7 7.13 3.13 7.13 7c0 .97-.17 1.9-.49 2.77-.16.15-.26.36-.26.59 0 .43.35.78.78.78.32 0 .61-.19.72-.49.39-1.07.59-2.23.59-3.41C22 6.48 17.52 2 12 2zm0 6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                            </svg>
                          </div>
                        </div>
                        {/* Floating particles */}
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/60 rounded-full animate-micro-bounce"></div>
                        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-secondary/60 rounded-full animate-micro-bounce" style={{ animationDelay: '0.5s' }}></div>
                        <div className="absolute top-1/2 -right-2 w-2 h-2 bg-accent/60 rounded-full animate-micro-bounce" style={{ animationDelay: '1s' }}></div>
                      </div>
                      
                      {/* Minimal Status Indicator */}
                      <div className="text-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mx-auto"></div>
                      </div>
                      
                      {/* Floating Action Buttons */}
                      <div className="flex gap-2">
                        <Button size="sm" className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:scale-110 transition-all duration-300">
                          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          <Sparkles className="w-4 h-4 relative z-10" />
                        </Button>
                        <Button size="sm" variant="outline" className="hover:scale-110 transition-all duration-300 border-primary/30 hover:border-primary/60">
                          <TrendingUp className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Enhanced Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3">
                <Card className="p-6 border-2 hover:border-primary/20 transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                    {/* Enhanced Search */}
                    <div className="relative flex-1">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by name, tags, AI model, or content type..."
                        className="pl-12 h-14 text-base bg-muted/30 border-0 focus:bg-background transition-colors"
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-primary/10">
                          <Filter className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* View Controls */}
                    <div className="flex border-2 border-border/50 rounded-xl overflow-hidden bg-muted/20">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-none border-0 px-4"
                      >
                        <Grid3X3 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-none border-0 px-4"
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* AI-Powered Category Tags */}
                  <div className="flex flex-wrap gap-3 mb-8">
                    {["All", "Avatars", "Headshots", "Brand Assets", "Videos", "Favorites"].map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        className="h-9 px-4 text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                        onClick={() => setSelectedCategory(category)}
                      >
                        {category === "Favorites" && <Star className="w-4 h-4 mr-2" />}
                        {category}
                        {category === "All" && <Badge variant="secondary" className="ml-2 text-xs">{assets.length}</Badge>}
                      </Button>
                    ))}
                  </div>

                  {/* Smart Grid Layout */}
                  <div className="space-y-6">
                    {viewMode === "grid" ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                         {filteredAssets.map((asset) => (
                           <Card 
                             key={asset.id} 
                             className={`group overflow-hidden transition-all duration-500 hover:-translate-y-3 border-2 bg-gradient-to-br from-card to-card/95 hover:scale-[1.02] cursor-pointer ${
                               selectedAvatarIds.has(asset.id) 
                                 ? 'border-primary shadow-2xl shadow-primary/20 ring-2 ring-primary/30' 
                                 : 'hover:shadow-2xl hover:border-primary/30'
                             }`}
                             onClick={() => handleAvatarSelect(asset.id)}
                           >
                             <div className={`${viewMode === 'grid' ? 'aspect-square' : 'aspect-video w-32 h-20'} bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden`}>
                              {/* Content Preview */}
                               <img 
                                 src={asset.thumbnail} 
                                 alt={asset.title}
                                 data-asset-id={asset.id}
                                 className="w-full h-full object-cover transition-all duration-700 hover:scale-110 hover:brightness-125 hover:rotate-1"
                                 onError={(e) => {
                                   e.currentTarget.src = "/api/placeholder/300/300";
                                 }}
                               />
                              
                              {asset.type === "video" && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <Play className="w-8 h-8 text-white ml-1" />
                                  </div>
                                </div>
                              )}
                              
                               {/* Quality Score */}
                               <div className="absolute top-3 right-3">
                                 <div className="flex items-center gap-1 bg-black/80 rounded-full px-3 py-1.5 backdrop-blur-sm">
                                   <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                   <span className="text-sm text-white font-semibold">9.2</span>
                                 </div>
                               </div>
                              
                               {/* Removed hover overlay - buttons will be below */}
                            </div>
                            
                            <div className="p-6 space-y-4">
                              <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{asset.title}</h3>
                                 <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                                   <Calendar className="w-3 h-3" />
                                   {new Date(asset.date).toLocaleDateString('en-US', { 
                                     month: 'short', 
                                     day: 'numeric', 
                                     year: 'numeric',
                                     hour: 'numeric',
                                     minute: '2-digit',
                                     hour12: true
                                   })}
                                 </p>
                              </div>
                              
                               {/* AI Tags - Always Visible */}
                               <div className="flex flex-wrap gap-1.5 mt-2">
                                 {asset.tags.map((tag, idx) => (
                                   <Badge key={idx} variant="secondary" className="text-xs py-1 px-2 bg-primary/10 text-primary border-primary/20 font-medium">
                                     {tag}
                                   </Badge>
                                 ))}
                               </div>

                               {/* Action Buttons - Always Visible */}
                               <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                                 <div className="flex gap-2">
                                   <Button 
                                     size="sm" 
                                     variant="outline"
                                     className="h-8 px-3"
                                     onClick={() => handleEdit(asset)}
                                   >
                                     <Edit className="w-3 h-3 mr-1" />
                                     Edit
                                   </Button>
                                   <Button 
                                     size="sm" 
                                     variant="outline"
                                     className="h-8 px-3"
                                     onClick={() => handleDownload(asset)}
                                   >
                                     <Download className="w-3 h-3 mr-1" />
                                     Save
                                   </Button>
                                 </div>
                                 <div className="flex gap-1">
                                   <Button 
                                     size="sm" 
                                     variant="ghost"
                                     className="h-8 w-8 p-0"
                                     onClick={() => handleShare(asset)}
                                   >
                                     <Share2 className="w-3 h-3" />
                                   </Button>
                                   <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                     <Star className="w-3 h-3" />
                                   </Button>
                                   <Button 
                                     size="sm" 
                                     variant="ghost"
                                     className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                     onClick={() => handleDelete(asset.id)}
                                   >
                                     <Trash2 className="w-3 h-3" />
                                   </Button>
                                 </div>
                               </div>
                              
                              {/* Generation Stats */}
                              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {asset.generationTime}
                                </span>
                                <span className="font-medium">{asset.fileSize}</span>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      /* Enhanced List View */
                      <div className="space-y-3">
                         {filteredAssets.map((asset) => (
                           <Card key={asset.id} className="p-5 hover:shadow-lg transition-all duration-200 hover:bg-muted/20 border-2 hover:border-primary/20">
                             <div className="flex items-center gap-6">
                               <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex-shrink-0 overflow-hidden">
                                 <img 
                                   src={asset.thumbnail} 
                                   alt={asset.title}
                                   className="w-full h-full object-cover"
                                   onError={(e) => {
                                     e.currentTarget.src = "/api/placeholder/64/64";
                                   }}
                                 />
                               </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <h3 className="font-semibold text-lg truncate">{asset.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <span className="flex items-center gap-1 font-medium">
                                        <Calendar className="w-3 h-3" />
                                        {asset.date}
                                      </span>
                                      <Badge variant="secondary" className="text-xs">{asset.format}</Badge>
                                      <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500" />
                                        9.2
                                      </span>
                                    </div>
                                    <div className="flex gap-1.5">
                                      {asset.tags.map((tag, idx) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {tag}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="hover:bg-primary/10"
                                      onClick={() => handleEdit(asset)}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="hover:bg-secondary/10"
                                      onClick={() => handleDownload(asset)}
                                    >
                                      <Download className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="hover:bg-accent/10"
                                      onClick={() => handleShare(asset)}
                                    >
                                      <Share2 className="w-4 h-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="hover:bg-destructive/10 text-destructive"
                                      onClick={() => handleDelete(asset.id)}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* AI Insights Sidebar */}
              <div className="space-y-6">
                <Card className="p-6 border-2 hover:border-secondary/20 transition-colors bg-gradient-to-br from-card via-card/98 to-card/95">
                  <div className="mb-6">
                    <h3 className="font-bold text-lg bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                      Quick Actions
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden" 
                      variant={selectedAvatarIds.size > 0 ? "default" : "outline"}
                      onClick={() => setGenerateSimilarOpen(true)}
                      disabled={selectedAvatarIds.size === 0}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <Sparkles className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Generate Similar</span>
                    </Button>
                    <Button 
                      className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden" 
                      variant={selectedAvatarIds.size > 0 ? "default" : "outline"}
                      onClick={() => setBatchProcessOpen(true)}
                      disabled={selectedAvatarIds.size === 0}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <Upload className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Batch Process</span>
                    </Button>
                    <Button 
                      className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden" 
                      variant={selectedAvatarIds.size > 0 ? "default" : "outline"}
                      onClick={() => setCreateCollectionOpen(true)}
                      disabled={selectedAvatarIds.size === 0}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <Share2 className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Create Collection</span>
                    </Button>
                    <Button 
                      className="w-full justify-start gap-3 h-12 hover:scale-[1.02] transition-all duration-300 group relative overflow-hidden" 
                      variant="outline"
                      onClick={() => setViewAnalyticsOpen(true)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <TrendingUp className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">View Analytics</span>
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 border-2 hover:border-accent/20 transition-colors bg-gradient-to-br from-card via-card/98 to-card/95">
                  <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent">
                    AI Insights
                  </h3>
                  <div className="h-[580px] overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent hover:scrollbar-thumb-muted-foreground/30 transition-colors">
                    <div className="space-y-3 pr-2">
                      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20 hover:border-primary/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-primary group-hover:text-primary/80 transition-colors">Trending Style</p>
                        <p className="text-xs text-muted-foreground mt-1">Minimalist portraits are performing 23% better this week</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20 hover:border-secondary/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-secondary group-hover:text-secondary/80 transition-colors">Optimize Quality</p>
                        <p className="text-xs text-muted-foreground mt-1">Try higher resolution settings for better engagement</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-green-500/10 to-green-500/5 rounded-lg border border-green-500/20 hover:border-green-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-green-500 group-hover:text-green-500/80 transition-colors">Popular Lighting</p>
                        <p className="text-xs text-muted-foreground mt-1">Golden hour lighting increases downloads by 34%</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-500/5 rounded-lg border border-blue-500/20 hover:border-blue-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-blue-500 group-hover:text-blue-500/80 transition-colors">Color Palette</p>
                        <p className="text-xs text-muted-foreground mt-1">Warm tones are trending in business portraits</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-purple-500/10 to-purple-500/5 rounded-lg border border-purple-500/20 hover:border-purple-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-purple-500 group-hover:text-purple-500/80 transition-colors">Background Focus</p>
                        <p className="text-xs text-muted-foreground mt-1">Blurred backgrounds improve subject focus by 41%</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-orange-500/10 to-orange-500/5 rounded-lg border border-orange-500/20 hover:border-orange-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-orange-500 group-hover:text-orange-500/80 transition-colors">Expression Analysis</p>
                        <p className="text-xs text-muted-foreground mt-1">Subtle smiles perform better than serious expressions</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-pink-500/10 to-pink-500/5 rounded-lg border border-pink-500/20 hover:border-pink-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-pink-500 group-hover:text-pink-500/80 transition-colors">Outfit Suggestions</p>
                        <p className="text-xs text-muted-foreground mt-1">Business casual outfits have 28% higher engagement</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-teal-500/10 to-teal-500/5 rounded-lg border border-teal-500/20 hover:border-teal-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-teal-500 group-hover:text-teal-500/80 transition-colors">AI Model Update</p>
                        <p className="text-xs text-muted-foreground mt-1">New model v2.1 available with 15% quality improvement</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-indigo-500/5 rounded-lg border border-indigo-500/20 hover:border-indigo-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-indigo-500 group-hover:text-indigo-500/80 transition-colors">Batch Processing</p>
                        <p className="text-xs text-muted-foreground mt-1">Process multiple avatars overnight for efficiency</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-rose-500/10 to-rose-500/5 rounded-lg border border-rose-500/20 hover:border-rose-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-rose-500 group-hover:text-rose-500/80 transition-colors">Platform Optimization</p>
                        <p className="text-xs text-muted-foreground mt-1">LinkedIn prefers 1:1 ratio, Instagram favors 4:5</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-cyan-500/5 rounded-lg border border-cyan-500/20 hover:border-cyan-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-cyan-500 group-hover:text-cyan-500/80 transition-colors">Creative Trends</p>
                        <p className="text-xs text-muted-foreground mt-1">Abstract backgrounds are gaining popularity (+18%)</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 rounded-lg border border-yellow-500/20 hover:border-yellow-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-yellow-500 group-hover:text-yellow-500/80 transition-colors">Performance Boost</p>
                        <p className="text-xs text-muted-foreground mt-1">Clear cache to improve generation speed by 12%</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-emerald-500 group-hover:text-emerald-500/80 transition-colors">Seasonal Trends</p>
                        <p className="text-xs text-muted-foreground mt-1">Winter professional looks trending this month</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-violet-500/10 to-violet-500/5 rounded-lg border border-violet-500/20 hover:border-violet-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-violet-500 group-hover:text-violet-500/80 transition-colors">Quality Metrics</p>
                        <p className="text-xs text-muted-foreground mt-1">Your average quality score improved to 9.2/10</p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-slate-500/10 to-slate-500/5 rounded-lg border border-slate-500/20 hover:border-slate-500/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-slate-500 group-hover:text-slate-500/80 transition-colors">Export Formats</p>
                        <p className="text-xs text-muted-foreground mt-1">WebP format reduces file size by 40% vs PNG</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Enhanced Empty State */}
            {filteredAssets.length === 0 && (
              <Card className="p-16 text-center border-2 border-dashed border-muted-foreground/20 bg-gradient-to-br from-muted/20 to-muted/10">
                <div className="space-y-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto flex items-center justify-center">
                    <Search className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold">No results found</h3>
                    <p className="text-muted-foreground text-lg mt-2">
                      Try adjusting your search or filters to find what you're looking for.
                    </p>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20 hover:border-accent/30 transition-colors cursor-pointer group">
                        <p className="text-sm font-medium text-accent group-hover:text-accent/80 transition-colors">Storage Tip</p>
                        <p className="text-xs text-muted-foreground mt-1">Archive older assets to free up 2.1GB space</p>
                      </div>
                  <div className="flex gap-3 justify-center">
                    <Button variant="outline" onClick={() => setSearchQuery("")} className="hover:scale-105 transition-transform">
                      Clear Search
                    </Button>
                    <Button onClick={() => setSelectedCategory("All")} className="hover:scale-105 transition-transform">
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </Card>
            )}
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
    </SidebarProvider>
  );
}