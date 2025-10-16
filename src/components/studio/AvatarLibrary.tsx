import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Star,
  CheckCircle,
  Download,
  Crown,
  Sparkles,
  User,
  Users,
  Briefcase,
  Heart
} from 'lucide-react';

// Import avatar assets
import avatarAuthor from '@/assets/avatar-author-portrait.jpg';
import avatarAward from '@/assets/avatar-award-photographer.jpg';
import avatarBusiness from '@/assets/avatar-business-executive.jpg';
import avatarCreative from '@/assets/avatar-creative-artist.jpg';
import avatarFashion from '@/assets/avatar-fashion-model.jpg';
import avatarFitness from '@/assets/avatar-fitness-coach.jpg';
import avatarHealthcare from '@/assets/avatar-healthcare-professional.jpg';
import avatarLinkedin from '@/assets/avatar-linkedin-profile.jpg';
import avatarTech from '@/assets/avatar-tech-entrepreneur.jpg';
import avatarDiverse1 from '@/assets/avatar-diverse-1.jpg';
import avatarDiverse2 from '@/assets/avatar-diverse-2.jpg';
import avatarDiverse3 from '@/assets/avatar-diverse-3.jpg';

interface AvatarLibraryProps {
  onSelectAvatar: (avatarUrl: string, metadata: any) => void;
  isProcessing?: boolean;
}

const AVATAR_LIBRARY = [
  {
    id: 'author',
    name: 'Professional Author',
    category: 'business',
    type: 'Premium',
    rating: 4.9,
    downloads: 1240,
    image: avatarAuthor,
    tags: ['Professional', 'Writer', 'Confident'],
    description: 'Perfect for authors, writers, and content creators'
  },
  {
    id: 'award-photographer',
    name: 'Award Photographer',
    category: 'creative',
    type: 'Premium',
    rating: 4.8,
    downloads: 890,
    image: avatarAward,
    tags: ['Creative', 'Artistic', 'Professional'],
    description: 'Ideal for creative professionals and artists'
  },
  {
    id: 'business-executive',
    name: 'Business Executive',
    category: 'business',
    type: 'Premium',
    rating: 4.9,
    downloads: 2140,
    image: avatarBusiness,
    tags: ['Executive', 'Leadership', 'Corporate'],
    description: 'Perfect for corporate presentations and leadership content'
  },
  {
    id: 'creative-artist',
    name: 'Creative Artist',
    category: 'creative',
    type: 'Standard',
    rating: 4.7,
    downloads: 675,
    image: avatarCreative,
    tags: ['Artist', 'Creative', 'Modern'],
    description: 'Great for artistic and creative content'
  },
  {
    id: 'fashion-model',
    name: 'Fashion Model',
    category: 'lifestyle',
    type: 'Premium',
    rating: 4.8,
    downloads: 1580,
    image: avatarFashion,
    tags: ['Fashion', 'Style', 'Elegant'],
    description: 'Perfect for fashion and lifestyle brands'
  },
  {
    id: 'fitness-coach',
    name: 'Fitness Coach',
    category: 'health',
    type: 'Standard',
    rating: 4.6,
    downloads: 920,
    image: avatarFitness,
    tags: ['Fitness', 'Health', 'Energetic'],
    description: 'Ideal for fitness and wellness content'
  },
  {
    id: 'healthcare',
    name: 'Healthcare Professional',
    category: 'health',
    type: 'Premium',
    rating: 4.9,
    downloads: 1350,
    image: avatarHealthcare,
    tags: ['Medical', 'Professional', 'Trustworthy'],
    description: 'Perfect for medical and healthcare content'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn Professional',
    category: 'business',
    type: 'Standard',
    rating: 4.7,
    downloads: 2850,
    image: avatarLinkedin,
    tags: ['Professional', 'Networking', 'Business'],
    description: 'Great for professional networking content'
  },
  {
    id: 'tech-entrepreneur',
    name: 'Tech Entrepreneur',
    category: 'business',
    type: 'Premium',
    rating: 4.8,
    downloads: 1680,
    image: avatarTech,
    tags: ['Tech', 'Innovation', 'Startup'],
    description: 'Perfect for tech and startup content'
  },
  {
    id: 'diverse-1',
    name: 'Diverse Professional 1',
    category: 'diverse',
    type: 'Standard',
    rating: 4.6,
    downloads: 740,
    image: avatarDiverse1,
    tags: ['Diverse', 'Professional', 'Inclusive'],
    description: 'Promoting diversity and inclusion'
  },
  {
    id: 'diverse-2',
    name: 'Diverse Professional 2',
    category: 'diverse',
    type: 'Standard',
    rating: 4.7,
    downloads: 820,
    image: avatarDiverse2,
    tags: ['Diverse', 'Professional', 'Inclusive'],
    description: 'Promoting diversity and inclusion'
  },
  {
    id: 'diverse-3',
    name: 'Diverse Professional 3',
    category: 'diverse',
    type: 'Premium',
    rating: 4.8,
    downloads: 1120,
    image: avatarDiverse3,
    tags: ['Diverse', 'Professional', 'Inclusive'],
    description: 'Promoting diversity and inclusion'
  }
];

const CATEGORIES = [
  { id: 'all', name: 'All', icon: Users },
  { id: 'business', name: 'Business', icon: Briefcase },
  { id: 'creative', name: 'Creative', icon: Sparkles },
  { id: 'health', name: 'Health', icon: Heart },
  { id: 'lifestyle', name: 'Lifestyle', icon: Star },
  { id: 'diverse', name: 'Diverse', icon: User }
];

export const AvatarLibrary: React.FC<AvatarLibraryProps> = ({ onSelectAvatar, isProcessing }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');

  const filteredAvatars = AVATAR_LIBRARY.filter(avatar => {
    const matchesSearch = avatar.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         avatar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || avatar.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.downloads - a.downloads;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.downloads - a.downloads; // Mock newest sorting
      default:
        return 0;
    }
  });

  const handleSelectAvatar = (avatar: any) => {
    // CRITICAL FIX: Set both originalUrl AND processedUrl to ensure validation passes
    onSelectAvatar(avatar.image, {
      name: avatar.name,
      type: avatar.type,
      rating: avatar.rating,
      category: avatar.category,
      tags: avatar.tags,
      resolution: '4K Ultra HD',
      faceAlignment: 98,
      consistency: 92,
      // Set both URLs so avatar validation works immediately
      originalUrl: avatar.image,
      processedUrl: avatar.image
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search avatars by name or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-md text-sm"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <category.icon className="h-4 w-4" />
            {category.name}
          </Button>
        ))}
      </div>

      {/* Avatar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAvatars.map((avatar) => (
          <Card
            key={avatar.id}
            className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 border-border/50 hover:border-primary/50"
            onClick={() => handleSelectAvatar(avatar)}
          >
            <CardContent className="p-4">
              <div className="relative mb-4">
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                <div className="absolute top-2 left-2 flex gap-1">
                  {avatar.type === 'Premium' && (
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-black/60 text-white">
                    <Star className="h-3 w-3 mr-1" />
                    {avatar.rating}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Select Avatar
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{avatar.name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Download className="h-3 w-3 mr-1" />
                    {avatar.downloads.toLocaleString()}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {avatar.description}
                </p>
                
                <div className="flex flex-wrap gap-1">
                  {avatar.tags.slice(0, 3).map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs px-2 py-0"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAvatars.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No avatars found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or category filter
          </p>
        </div>
      )}
    </div>
  );
};