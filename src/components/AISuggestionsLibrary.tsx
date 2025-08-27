import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Sparkles, 
  Video, 
  Image, 
  Zap, 
  Target, 
  Palette, 
  Music,
  ArrowRight,
  Clock,
  Users,
  TrendingUp
} from "lucide-react";

interface AISuggestion {
  id: string;
  title: string;
  description: string;
  category: 'ads' | 'social' | 'enhancement' | 'creative';
  platform?: string;
  estimatedTime: string;
  popularity: number;
  icon: any;
}

const suggestions: AISuggestion[] = [
  {
    id: '1',
    title: 'TikTok Ad Creation',
    description: 'Transform into a viral TikTok advertisement with trending hooks',
    category: 'ads',
    platform: 'TikTok',
    estimatedTime: '2-3 min',
    popularity: 95,
    icon: Video
  },
  {
    id: '2',
    title: 'Instagram Reels Style',
    description: 'Convert to engaging Instagram Reels format with music sync',
    category: 'social',
    platform: 'Instagram',
    estimatedTime: '1-2 min',
    popularity: 88,
    icon: Image
  },
  {
    id: '3',
    title: 'Professional Headshot',
    description: 'Generate corporate-quality headshots with studio lighting',
    category: 'enhancement',
    estimatedTime: '30 sec',
    popularity: 76,
    icon: Users
  },
  {
    id: '4',
    title: 'Product Showcase',
    description: 'Create compelling product demonstrations with callouts',
    category: 'ads',
    estimatedTime: '2-4 min',
    popularity: 84,
    icon: Target
  },
  {
    id: '5',
    title: 'Artistic Variations',
    description: 'Generate multiple artistic styles: oil painting, watercolor, digital art',
    category: 'creative',
    estimatedTime: '1-3 min',
    popularity: 71,
    icon: Palette
  },
  {
    id: '6',
    title: 'YouTube Thumbnail',
    description: 'Create eye-catching thumbnails with dramatic effects',
    category: 'social',
    platform: 'YouTube',
    estimatedTime: '45 sec',
    popularity: 82,
    icon: TrendingUp
  },
  {
    id: '7',
    title: 'Music Video Style',
    description: 'Add cinematic effects and sync with audio beats',
    category: 'creative',
    estimatedTime: '3-5 min',
    popularity: 69,
    icon: Music
  },
  {
    id: '8',
    title: 'Speed Enhancement',
    description: 'AI-powered upscaling and noise reduction',
    category: 'enhancement',
    estimatedTime: '30 sec',
    popularity: 91,
    icon: Zap
  }
];

const categories = [
  { id: 'all', label: 'All Suggestions', icon: Sparkles },
  { id: 'ads', label: 'Advertisements', icon: Target },
  { id: 'social', label: 'Social Media', icon: Users },
  { id: 'enhancement', label: 'Enhancement', icon: Zap },
  { id: 'creative', label: 'Creative', icon: Palette }
];

export function AISuggestionsLibrary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSuggestions = suggestions.filter(suggestion => {
    const matchesSearch = suggestion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         suggestion.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || suggestion.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedSuggestions = filteredSuggestions.sort((a, b) => b.popularity - a.popularity);

  return (
    <Card className="p-6 bg-card border border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-foreground">AI Suggestions Library</h3>
          </div>
          <Badge variant="secondary" className="text-xs">
            {filteredSuggestions.length} available
          </Badge>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="text-xs"
              >
                <Icon className="w-3 h-3 mr-1" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Suggestions Grid */}
        <div className="grid gap-3 max-h-96 overflow-y-auto">
          {sortedSuggestions.map((suggestion) => {
            const Icon = suggestion.icon;
            return (
              <Card 
                key={suggestion.id} 
                className="p-4 hover:bg-accent/50 transition-colors cursor-pointer border border-border/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 rounded-lg bg-muted/50 border">
                      <Icon className="w-4 h-4 text-yellow-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-foreground">
                          {suggestion.title}
                        </h4>
                        {suggestion.platform && (
                          <Badge variant="outline" className="text-xs">
                            {suggestion.platform}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{suggestion.estimatedTime}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>{suggestion.popularity}% popular</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" className="shrink-0">
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-8">
            <Filter className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No suggestions found</p>
            <p className="text-xs text-muted-foreground">Try adjusting your search or category filter</p>
          </div>
        )}
      </div>
    </Card>
  );
}