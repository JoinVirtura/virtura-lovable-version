import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, User, Sparkles, Crown, Loader2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Import avatar assets
import avatarBusinessExecutive from "@/assets/avatar-business-executive.jpg";
import avatarCreativeArtist from "@/assets/avatar-creative-artist.jpg";
import avatarTechEntrepreneur from "@/assets/avatar-tech-entrepreneur.jpg";
import avatarFashionModel from "@/assets/avatar-fashion-model.jpg";
import avatarHealthcareProfessional from "@/assets/avatar-healthcare-professional.jpg";
import avatarFitnessCoach from "@/assets/avatar-fitness-coach.jpg";
import avatarAwardPhotographer from "@/assets/avatar-award-photographer.jpg";
import avatarBrandConsultant from "@/assets/avatar-brand-consultant.jpg";

// Built-in avatar library data
const defaultAvatars: AvatarLibraryItem[] = [
  { id: "default-1", name: "Business Executive", category: "Professional", premium: false, url: avatarBusinessExecutive, rating: 9.2, tags: ["Professional", "Business", "Executive"] },
  { id: "default-2", name: "Creative Artist", category: "Creative", premium: false, url: avatarCreativeArtist, rating: 9.1, tags: ["Creative", "Artistic", "Bohemian"] },
  { id: "default-3", name: "Tech Entrepreneur", category: "Professional", premium: true, url: avatarTechEntrepreneur, rating: 9.3, tags: ["Professional", "Tech", "Innovation"] },
  { id: "default-4", name: "Fashion Model", category: "Creative", premium: true, url: avatarFashionModel, rating: 9.2, tags: ["Fashion", "Luxury", "Editorial"] },
  { id: "default-5", name: "Healthcare Professional", category: "Professional", premium: false, url: avatarHealthcareProfessional, rating: 8.9, tags: ["Professional", "Healthcare", "Medical"] },
  { id: "default-6", name: "Fitness Coach", category: "Lifestyle", premium: false, url: avatarFitnessCoach, rating: 8.8, tags: ["Fitness", "Health", "Active"] },
  { id: "default-7", name: "Award Photographer", category: "Creative", premium: true, url: avatarAwardPhotographer, rating: 9.4, tags: ["Creative", "Photography", "Artistic"] },
  { id: "default-8", name: "Brand Consultant", category: "Professional", premium: true, url: avatarBrandConsultant, rating: 9.0, tags: ["Professional", "Brand", "Strategy"] },
];

interface AvatarLibraryItem {
  id: string;
  name: string;
  category: string;
  premium: boolean;
  url: string;
  rating?: number;
  tags?: string[];
  created_at?: string;
}

interface AvatarLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

export const AvatarLibraryModal = ({ open, onOpenChange, onSelectAvatar }: AvatarLibraryModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTab, setSelectedTab] = useState("all");
  const [userAvatars, setUserAvatars] = useState<AvatarLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's AI-generated avatars
  useEffect(() => {
    if (open) {
      fetchUserAvatars();
    }
  }, [open]);

  const fetchUserAvatars = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('avatar_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const avatars = data?.map(item => ({
        id: item.id,
        name: item.title || 'AI Generated Avatar',
        category: 'AI Generated',
        premium: false,
        url: item.image_url,
        tags: item.tags || [],
        created_at: item.created_at,
        rating: 9.5
      })) || [];

      setUserAvatars(avatars);
    } catch (error) {
      console.error('Error fetching avatars:', error);
      toast.error('Failed to load AI avatars');
    } finally {
      setLoading(false);
    }
  };

  // Combine default avatars with user's AI avatars
  const allAvatars = selectedTab === 'ai' ? userAvatars : 
                    selectedTab === 'library' ? defaultAvatars : 
                    [...userAvatars, ...defaultAvatars];

  const filteredAvatars = allAvatars.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         avatar.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || avatar.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Professional", "Creative", "Lifestyle", "AI Generated"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Avatar Library
            <Badge variant="secondary" className="ml-auto">
              {filteredAvatars.length} avatars
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tab Navigation */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                AI Generated
              </TabsTrigger>
              <TabsTrigger value="library" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Library
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Category Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, tags, AI model, or content type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
              <TabsList className="grid grid-cols-5 w-[500px]">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2 text-muted-foreground">Loading avatars...</span>
            </div>
          )}

          {/* Avatar Grid */}
          {!loading && (
            <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredAvatars.map((avatar) => (
                <Card
                  key={avatar.id}
                  className="relative group cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
                  onClick={() => {
                    onSelectAvatar(avatar.url);
                    onOpenChange(false);
                  }}
                >
                  <div className="aspect-square relative overflow-hidden rounded-t-lg">
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {avatar.premium && (
                      <Badge className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black">
                        <Crown className="w-3 h-3 mr-1" />
                        Pro
                      </Badge>
                    )}
                    {avatar.rating && (
                      <Badge className="absolute top-2 left-2 bg-black/70 text-white">
                        <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {avatar.rating}
                      </Badge>
                    )}
                    {avatar.category === 'AI Generated' && (
                      <Badge className="absolute bottom-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm truncate">{avatar.name}</h4>
                    <p className="text-xs text-muted-foreground">{avatar.category}</p>
                    {avatar.created_at && (
                      <p className="text-xs text-muted-foreground">
                        {new Date(avatar.created_at).toLocaleDateString()}
                      </p>
                    )}
                    {avatar.tags && avatar.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {avatar.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredAvatars.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No avatars found matching your criteria</p>
              {selectedTab === 'ai' && userAvatars.length === 0 && (
                <p className="mt-2 text-sm">Generate your first AI avatar to see it here!</p>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};