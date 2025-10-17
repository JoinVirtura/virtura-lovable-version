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
  // Advertisement Suggestions
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
    title: 'Product Showcase',
    description: 'Create compelling product demonstrations with callouts',
    category: 'ads',
    estimatedTime: '2-4 min',
    popularity: 84,
    icon: Target
  },
  {
    id: '3',
    title: 'Facebook Ad Campaign',
    description: 'Generate Facebook-optimized ads with conversion hooks',
    category: 'ads',
    platform: 'Facebook',
    estimatedTime: '1-2 min',
    popularity: 78,
    icon: Target
  },
  {
    id: '4',
    title: 'Google Ads Visual',
    description: 'Create display ads optimized for Google network',
    category: 'ads',
    platform: 'Google',
    estimatedTime: '1-3 min',
    popularity: 82,
    icon: Target
  },
  {
    id: '5',
    title: 'LinkedIn B2B Ad',
    description: 'Professional B2B advertisements for LinkedIn audience',
    category: 'ads',
    platform: 'LinkedIn',
    estimatedTime: '2-3 min',
    popularity: 73,
    icon: Target
  },
  {
    id: '6',
    title: 'YouTube Pre-roll Ad',
    description: 'Create engaging pre-roll advertisements for YouTube',
    category: 'ads',
    platform: 'YouTube',
    estimatedTime: '3-5 min',
    popularity: 85,
    icon: Video
  },
  {
    id: '7',
    title: 'Amazon Product Ad',
    description: 'E-commerce focused ads for Amazon marketplace',
    category: 'ads',
    platform: 'Amazon',
    estimatedTime: '1-2 min',
    popularity: 79,
    icon: Target
  },
  {
    id: '8',
    title: 'Shopify Store Ad',
    description: 'Direct-to-consumer ads for Shopify stores',
    category: 'ads',
    estimatedTime: '2-3 min',
    popularity: 76,
    icon: Target
  },
  {
    id: '9',
    title: 'Retargeting Campaign',
    description: 'Create compelling retargeting ads with urgency',
    category: 'ads',
    estimatedTime: '1-2 min',
    popularity: 81,
    icon: Target
  },
  {
    id: '10',
    title: 'Black Friday Promo',
    description: 'High-converting seasonal promotional advertisements',
    category: 'ads',
    estimatedTime: '2-3 min',
    popularity: 88,
    icon: Target
  },
  {
    id: '11',
    title: 'App Install Ad',
    description: 'Mobile app installation campaigns with CTAs',
    category: 'ads',
    estimatedTime: '1-2 min',
    popularity: 74,
    icon: Target
  },
  {
    id: '12',
    title: 'Local Business Ad',
    description: 'Location-based advertisements for local businesses',
    category: 'ads',
    estimatedTime: '1-3 min',
    popularity: 71,
    icon: Target
  },
  {
    id: '13',
    title: 'Influencer Brand Deal',
    description: 'Sponsored content for influencer partnerships',
    category: 'ads',
    estimatedTime: '2-4 min',
    popularity: 77,
    icon: Target
  },

  // Social Media Suggestions
  {
    id: '14',
    title: 'Instagram Reels Style',
    description: 'Convert to engaging Instagram Reels format with music sync',
    category: 'social',
    platform: 'Instagram',
    estimatedTime: '1-2 min',
    popularity: 88,
    icon: Image
  },
  {
    id: '15',
    title: 'YouTube Thumbnail',
    description: 'Create eye-catching thumbnails with dramatic effects',
    category: 'social',
    platform: 'YouTube',
    estimatedTime: '45 sec',
    popularity: 82,
    icon: TrendingUp
  },
  {
    id: '16',
    title: 'Instagram Story Pack',
    description: 'Multiple story templates with animations and text',
    category: 'social',
    platform: 'Instagram',
    estimatedTime: '1-2 min',
    popularity: 86,
    icon: Image
  },
  {
    id: '17',
    title: 'Twitter Header Design',
    description: 'Professional Twitter header with brand elements',
    category: 'social',
    platform: 'Twitter',
    estimatedTime: '30 sec',
    popularity: 68,
    icon: Image
  },
  {
    id: '18',
    title: 'Pinterest Pin Optimization',
    description: 'Pinterest-optimized pins with high engagement potential',
    category: 'social',
    platform: 'Pinterest',
    estimatedTime: '45 sec',
    popularity: 75,
    icon: Image
  },
  {
    id: '19',
    title: 'LinkedIn Post Visual',
    description: 'Professional LinkedIn post graphics with engagement hooks',
    category: 'social',
    platform: 'LinkedIn',
    estimatedTime: '1 min',
    popularity: 72,
    icon: Users
  },
  {
    id: '20',
    title: 'TikTok Trending Effect',
    description: 'Apply current trending effects and filters',
    category: 'social',
    platform: 'TikTok',
    estimatedTime: '1-2 min',
    popularity: 92,
    icon: Video
  },
  {
    id: '21',
    title: 'Snapchat Lens Style',
    description: 'Snapchat-style AR filters and effects',
    category: 'social',
    platform: 'Snapchat',
    estimatedTime: '2-3 min',
    popularity: 69,
    icon: Video
  },
  {
    id: '22',
    title: 'YouTube Shorts',
    description: 'Vertical video optimization for YouTube Shorts',
    category: 'social',
    platform: 'YouTube',
    estimatedTime: '1-2 min',
    popularity: 84,
    icon: Video
  },
  {
    id: '23',
    title: 'Discord Avatar',
    description: 'Gaming-focused avatar for Discord communities',
    category: 'social',
    platform: 'Discord',
    estimatedTime: '30 sec',
    popularity: 65,
    icon: Users
  },
  {
    id: '24',
    title: 'Twitch Overlay',
    description: 'Streaming overlay graphics for Twitch',
    category: 'social',
    platform: 'Twitch',
    estimatedTime: '2-3 min',
    popularity: 71,
    icon: Video
  },
  {
    id: '25',
    title: 'Instagram Grid Layout',
    description: 'Cohesive 9-grid Instagram feed design',
    category: 'social',
    platform: 'Instagram',
    estimatedTime: '3-5 min',
    popularity: 78,
    icon: Image
  },
  {
    id: '26',
    title: 'Facebook Cover Photo',
    description: 'Professional Facebook page cover design',
    category: 'social',
    platform: 'Facebook',
    estimatedTime: '45 sec',
    popularity: 74,
    icon: Image
  },

  // Enhancement Suggestions
  {
    id: '27',
    title: 'Professional Headshot',
    description: 'Generate corporate-quality headshots with studio lighting',
    category: 'enhancement',
    estimatedTime: '30 sec',
    popularity: 76,
    icon: Users
  },
  {
    id: '28',
    title: 'Speed Enhancement',
    description: 'AI-powered upscaling and noise reduction',
    category: 'enhancement',
    estimatedTime: '30 sec',
    popularity: 91,
    icon: Zap
  },
  {
    id: '29',
    title: '4K Upscaling',
    description: 'Enhance resolution to 4K quality with AI',
    category: 'enhancement',
    estimatedTime: '1-2 min',
    popularity: 89,
    icon: Zap
  },
  {
    id: '30',
    title: 'HDR Enhancement',
    description: 'Add high dynamic range for better contrast',
    category: 'enhancement',
    estimatedTime: '45 sec',
    popularity: 83,
    icon: Zap
  },
  {
    id: '31',
    title: 'Color Correction',
    description: 'Professional color grading and correction',
    category: 'enhancement',
    estimatedTime: '30 sec',
    popularity: 85,
    icon: Palette
  },
  {
    id: '32',
    title: 'Background Removal',
    description: 'Clean background removal with edge refinement',
    category: 'enhancement',
    estimatedTime: '20 sec',
    popularity: 94,
    icon: Zap
  },
  {
    id: '33',
    title: 'Skin Smoothing',
    description: 'Natural skin enhancement and blemish removal',
    category: 'enhancement',
    estimatedTime: '30 sec',
    popularity: 87,
    icon: Users
  },
  {
    id: '34',
    title: 'Eye Enhancement',
    description: 'Brighten and enhance eye details naturally',
    category: 'enhancement',
    estimatedTime: '25 sec',
    popularity: 81,
    icon: Users
  },
  {
    id: '35',
    title: 'Teeth Whitening',
    description: 'Natural teeth whitening and smile enhancement',
    category: 'enhancement',
    estimatedTime: '20 sec',
    popularity: 79,
    icon: Users
  },
  {
    id: '36',
    title: 'Hair Enhancement',
    description: 'Add volume and shine to hair naturally',
    category: 'enhancement',
    estimatedTime: '35 sec',
    popularity: 73,
    icon: Users
  },
  {
    id: '37',
    title: 'Lighting Correction',
    description: 'Fix under/over-exposed images with AI',
    category: 'enhancement',
    estimatedTime: '30 sec',
    popularity: 88,
    icon: Zap
  },
  {
    id: '38',
    title: 'Noise Reduction',
    description: 'Remove grain and noise from low-light photos',
    category: 'enhancement',
    estimatedTime: '25 sec',
    popularity: 84,
    icon: Zap
  },
  {
    id: '39',
    title: 'Sharpness Boost',
    description: 'Enhance image sharpness and detail clarity',
    category: 'enhancement',
    estimatedTime: '20 sec',
    popularity: 82,
    icon: Zap
  },

  // Creative Suggestions
  {
    id: '40',
    title: 'Artistic Variations',
    description: 'Generate multiple artistic styles: oil painting, watercolor, digital art',
    category: 'creative',
    estimatedTime: '1-3 min',
    popularity: 71,
    icon: Palette
  },
  {
    id: '41',
    title: 'Music Video Style',
    description: 'Add cinematic effects and sync with audio beats',
    category: 'creative',
    estimatedTime: '3-5 min',
    popularity: 69,
    icon: Music
  },
  {
    id: '42',
    title: 'Anime Style Conversion',
    description: 'Transform into anime/manga art style',
    category: 'creative',
    estimatedTime: '1-2 min',
    popularity: 85,
    icon: Palette
  },
  {
    id: '43',
    title: 'Vintage Film Look',
    description: 'Apply vintage film grain and color grading',
    category: 'creative',
    estimatedTime: '45 sec',
    popularity: 77,
    icon: Palette
  },
  {
    id: '44',
    title: 'Cyberpunk Aesthetic',
    description: 'Futuristic cyberpunk styling with neon effects',
    category: 'creative',
    estimatedTime: '2-3 min',
    popularity: 74,
    icon: Palette
  },
  {
    id: '45',
    title: 'Oil Painting Effect',
    description: 'Classical oil painting transformation',
    category: 'creative',
    estimatedTime: '1-2 min',
    popularity: 68,
    icon: Palette
  },
  {
    id: '46',
    title: 'Watercolor Art',
    description: 'Soft watercolor painting effect',
    category: 'creative',
    estimatedTime: '1-2 min',
    popularity: 72,
    icon: Palette
  },
  {
    id: '47',
    title: 'Pop Art Style',
    description: 'Andy Warhol inspired pop art transformation',
    category: 'creative',
    estimatedTime: '45 sec',
    popularity: 76,
    icon: Palette
  },
  {
    id: '48',
    title: 'Sketch Drawing',
    description: 'Convert to realistic pencil sketch',
    category: 'creative',
    estimatedTime: '30 sec',
    popularity: 79,
    icon: Palette
  },
  {
    id: '49',
    title: 'Cinematic Look',
    description: 'Hollywood movie-style color grading',
    category: 'creative',
    estimatedTime: '1-2 min',
    popularity: 83,
    icon: Video
  },
  {
    id: '50',
    title: 'Double Exposure',
    description: 'Artistic double exposure effect with landscapes',
    category: 'creative',
    estimatedTime: '2-3 min',
    popularity: 70,
    icon: Palette
  },
  {
    id: '51',
    title: 'Glitch Art Effect',
    description: 'Digital glitch and datamoshing effects',
    category: 'creative',
    estimatedTime: '1-2 min',
    popularity: 65,
    icon: Zap
  },
  {
    id: '52',
    title: 'Fantasy Portrait',
    description: 'Magical fantasy character transformation',
    category: 'creative',
    estimatedTime: '2-4 min',
    popularity: 78,
    icon: Palette
  },
  {
    id: '53',
    title: 'Steampunk Style',
    description: 'Victorian-era steampunk aesthetic',
    category: 'creative',
    estimatedTime: '2-3 min',
    popularity: 67,
    icon: Palette
  },
  {
    id: '54',
    title: 'Neon Glow Effect',
    description: 'Vibrant neon glow and lighting effects',
    category: 'creative',
    estimatedTime: '1-2 min',
    popularity: 81,
    icon: Zap
  },
  {
    id: '55',
    title: 'Gothic Dark Art',
    description: 'Dark gothic art style with dramatic shadows',
    category: 'creative',
    estimatedTime: '1-3 min',
    popularity: 63,
    icon: Palette
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
            <Sparkles className="w-5 h-5 text-violet-400" />
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
                      <Icon className="w-4 h-4 text-violet-400" />
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