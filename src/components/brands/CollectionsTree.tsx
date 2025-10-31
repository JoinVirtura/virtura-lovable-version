import React from 'react';
import { BrandCollection } from '@/types/brand';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Folder,
  FolderOpen,
  Star,
  Target,
  Users,
  Tag,
  BarChart3,
  Plus,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

interface CollectionsTreeProps {
  collections: BrandCollection[];
  selectedCollectionId?: string;
  onSelectCollection: (collectionId?: string) => void;
  onCreateCollection: () => void;
}

export const CollectionsTree: React.FC<CollectionsTreeProps> = ({
  collections,
  selectedCollectionId,
  onSelectCollection,
  onCreateCollection,
}) => {
  const [expandedFolders, setExpandedFolders] = React.useState<Set<string>>(new Set());

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'campaign': return Target;
      case 'product': return Tag;
      case 'character': return Users;
      default: return Folder;
    }
  };

  const rootCollections = collections?.filter(c => !c.parent_collection_id) || [];
  const getChildren = (parentId: string) => 
    collections?.filter(c => c.parent_collection_id === parentId) || [];

  const renderCollection = (collection: BrandCollection, level = 0) => {
    const Icon = getIcon(collection.collection_type);
    const isExpanded = expandedFolders.has(collection.id);
    const children = getChildren(collection.id);
    const hasChildren = children.length > 0;

    return (
      <div key={collection.id}>
        <Button
          variant={selectedCollectionId === collection.id ? 'secondary' : 'ghost'}
          className="w-full justify-start text-left mb-1"
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => onSelectCollection(collection.id)}
        >
          {hasChildren && (
            <span
              className="mr-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(collection.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>
          )}
          <Icon className="w-4 h-4 mr-2" />
          <span className="flex-1 truncate">{collection.name}</span>
          {collection.color_label && (
            <span
              className="w-3 h-3 rounded-full ml-2"
              style={{ backgroundColor: collection.color_label }}
            />
          )}
        </Button>
        {hasChildren && isExpanded && (
          <div>
            {children.map(child => renderCollection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 border-r bg-muted/30">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Collections</h2>
          <Button size="icon" variant="ghost" onClick={onCreateCollection}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Quick filters */}
        <div className="space-y-1">
          <Button
            variant={!selectedCollectionId ? 'secondary' : 'ghost'}
            className="w-full justify-start"
            onClick={() => onSelectCollection(undefined)}
          >
            <Folder className="w-4 h-4 mr-2" />
            All Assets
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onSelectCollection('favorites')}
          >
            <Star className="w-4 h-4 mr-2" />
            Favorites
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => onSelectCollection('analytics')}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        <div className="p-4 space-y-1">
          {rootCollections.map(collection => renderCollection(collection))}
        </div>
      </ScrollArea>
    </div>
  );
};
