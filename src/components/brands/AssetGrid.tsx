import React, { useState } from 'react';
import { BrandAsset } from '@/types/brand';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Heart,
  MoreVertical,
  Search,
  Download,
  Archive,
  Edit,
  Star,
} from 'lucide-react';

interface AssetGridProps {
  assets: BrandAsset[];
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onArchive: (id: string) => void;
  onEdit: (asset: BrandAsset) => void;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  assets,
  onToggleFavorite,
  onArchive,
  onEdit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredAssets = assets?.filter((asset) => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = selectedType === 'all' || asset.asset_type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'image', 'video', 'logo', 'icon'].map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredAssets?.map((asset) => (
          <Card key={asset.id} className="group relative overflow-hidden">
            <div className="aspect-square relative">
              <img
                src={asset.thumbnail_url || asset.file_url}
                alt={asset.title}
                className="w-full h-full object-cover"
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="ghost" className="text-white">
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white"
                  onClick={() => onEdit(asset)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>

              {/* Favorite badge */}
              {asset.is_favorite && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </Badge>
                </div>
              )}

              {/* Actions dropdown */}
              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-8 w-8 bg-background/80 backdrop-blur">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onToggleFavorite(asset.id, asset.is_favorite)}>
                      <Heart className={`w-4 h-4 mr-2 ${asset.is_favorite ? 'fill-red-500' : ''}`} />
                      {asset.is_favorite ? 'Remove from Favorites' : 'Add to Favorites'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(asset)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onArchive(asset.id)} className="text-destructive">
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Asset info */}
            <div className="p-3">
              <h3 className="font-medium text-sm truncate">{asset.title}</h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {asset.asset_type}
                </Badge>
                {asset.performance_score && (
                  <Badge variant="secondary" className="text-xs">
                    {asset.performance_score.toFixed(1)}★
                  </Badge>
                )}
              </div>
              {asset.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {asset.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredAssets?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No assets found matching your filters</p>
        </div>
      )}
    </div>
  );
};
