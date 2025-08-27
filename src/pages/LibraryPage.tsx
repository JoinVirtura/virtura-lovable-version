import { VirturaNavigation } from "@/components/VirturaNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Share2, 
  Trash2,
  Grid3X3,
  List,
  Calendar,
  Tag
} from "lucide-react";
import { useState } from "react";

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with real data
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

  return (
    <div className="min-h-screen bg-background">
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
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
            
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>

        {/* Filters Bar */}
        <Card className="p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <div className="flex gap-2">
              <Badge variant="secondary">All Types</Badge>
              <Badge variant="outline">Avatars</Badge>
              <Badge variant="outline">Brand Assets</Badge>
              <Badge variant="outline">This Week</Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              Clear All
            </Button>
          </div>
        </Card>

        {/* Content Grid/List */}
        {viewMode === "grid" ? (
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
                  
                  {/* Format Badge */}
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
        ) : (
          <Card>
            <div className="divide-y divide-border">
              {filteredAssets.map((asset) => (
                <div key={asset.id} className="p-4 flex items-center justify-between hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-lg"></div>
                    <div>
                      <h3 className="font-medium">{asset.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {asset.date}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {asset.format}
                        </Badge>
                        <div className="flex gap-1">
                          {asset.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {filteredAssets.length === 0 && (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-display font-bold">No results found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to find what you're looking for.
                </p>
              </div>
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}