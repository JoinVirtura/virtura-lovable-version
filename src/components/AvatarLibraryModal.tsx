import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, User, Sparkles, Crown } from "lucide-react";

// Mock avatar library data
const avatarLibrary = [
  { id: 1, name: "Business Executive", category: "Professional", premium: false, url: "/src/assets/avatar-business-executive.jpg" },
  { id: 2, name: "Creative Artist", category: "Creative", premium: false, url: "/src/assets/avatar-creative-artist.jpg" },
  { id: 3, name: "Tech Entrepreneur", category: "Professional", premium: true, url: "/src/assets/avatar-tech-entrepreneur.jpg" },
  { id: 4, name: "Fashion Model", category: "Creative", premium: true, url: "/src/assets/avatar-fashion-model.jpg" },
  { id: 5, name: "Healthcare Professional", category: "Professional", premium: false, url: "/src/assets/avatar-healthcare-professional.jpg" },
  { id: 6, name: "Fitness Coach", category: "Lifestyle", premium: false, url: "/src/assets/avatar-fitness-coach.jpg" },
  { id: 7, name: "Award Photographer", category: "Creative", premium: true, url: "/src/assets/avatar-award-photographer.jpg" },
  { id: 8, name: "Brand Consultant", category: "Professional", premium: true, url: "/src/assets/avatar-brand-consultant.jpg" },
];

interface AvatarLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAvatar: (avatarUrl: string) => void;
}

export const AvatarLibraryModal = ({ open, onOpenChange, onSelectAvatar }: AvatarLibraryModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredAvatars = avatarLibrary.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || avatar.category.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["all", "professional", "creative", "lifestyle"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Avatar Library
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search avatars..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-auto">
              <TabsList className="grid grid-cols-4 w-80">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category} className="capitalize">
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Avatar Grid */}
          <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
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
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-sm truncate">{avatar.name}</h4>
                  <p className="text-xs text-muted-foreground">{avatar.category}</p>
                </div>
              </Card>
            ))}
          </div>

          {filteredAvatars.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No avatars found matching your criteria</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};