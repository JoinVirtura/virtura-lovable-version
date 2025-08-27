import { useState } from "react";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Grid3X3, 
  List, 
  Sparkles, 
  Upload, 
  Edit, 
  Download, 
  Share2, 
  Star, 
  Trophy,
  Clock,
  Filter,
  Trash2,
  Play,
  TrendingUp
} from "lucide-react";

interface Asset {
  id: number;
  type: string;
  title: string;
  date: string;
  format: string;
  tags: string[];
  thumbnail: string;
  quality?: number;
  generationTime?: string;
  fileSize?: string;
}

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Enhanced mock data for library
  const assets: Asset[] = [
    {
      id: 1,
      type: "avatar",
      title: "Professional Headshot",
      date: "2024-01-15",
      format: "PNG",
      tags: ["professional", "headshot", "business"],
      thumbnail: "/api/placeholder/300/300",
      quality: 9.2,
      generationTime: "2.3s",
      fileSize: "1.2MB"
    },
    {
      id: 2,
      type: "video",
      title: "Summer Campaign Ad",
      date: "2024-01-14",
      format: "MP4",
      tags: ["campaign", "summer", "video", "marketing"],
      thumbnail: "/api/placeholder/300/200",
      quality: 8.7,
      generationTime: "15.2s",
      fileSize: "24.5MB"
    },
    {
      id: 3,
      type: "avatar",
      title: "Casual Portrait",
      date: "2024-01-13",
      format: "JPG",
      tags: ["casual", "portrait", "lifestyle"],
      thumbnail: "/api/placeholder/300/300",
      quality: 9.0,
      generationTime: "1.8s",
      fileSize: "890KB"
    },
    {
      id: 4,
      type: "brand",
      title: "Brand Logo Variations",
      date: "2024-01-12",
      format: "SVG",
      tags: ["logo", "brand", "corporate"],
      thumbnail: "/api/placeholder/300/300",
      quality: 9.5,
      generationTime: "3.1s",
      fileSize: "45KB"
    },
    {
      id: 5,
      type: "avatar",
      title: "Creative Headshot",
      date: "2024-01-11",
      format: "PNG",
      tags: ["creative", "artistic", "headshot"],
      thumbnail: "/api/placeholder/300/300",
      quality: 8.9,
      generationTime: "2.7s",
      fileSize: "1.4MB"
    },
    {
      id: 6,
      type: "brand",
      title: "Social Media Pack",
      date: "2024-01-10",
      format: "PNG",
      tags: ["social", "instagram", "pack"],
      thumbnail: "/api/placeholder/300/300",
      quality: 9.3,
      generationTime: "5.4s",
      fileSize: "3.2MB"
    }
  ];

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || 
      (selectedCategory === "Avatars" && asset.type === "avatar") ||
      (selectedCategory === "Brand Assets" && asset.type === "brand") ||
      (selectedCategory === "Videos" && asset.type === "video") ||
      (selectedCategory === "Recent" && new Date(asset.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    
    return matchesSearch && matchesCategory;
  });

  const totalAssets = assets.length;
  const thisMonthAssets = assets.filter(asset => 
    new Date(asset.date).getMonth() === new Date().getMonth()
  ).length;
  const totalFileSize = assets.reduce((total, asset) => {
    const size = asset.fileSize || "0KB";
    const value = parseFloat(size);
    const unit = size.slice(-2);
    if (unit === "MB") return total + value;
    if (unit === "GB") return total + value * 1024;
    return total + value / 1024;
  }, 0);

  return (
    <div className="min-h-screen bg-background">
      <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Innovative Header with AI Stats */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-2xl blur-xl"></div>
          <Card className="relative p-8 bg-gradient-to-br from-card via-card/98 to-card/95 border border-primary/10">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    <Sparkles className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-foreground via-primary to-foreground/80 bg-clip-text text-transparent">
                      AI Generation Library
                    </h1>
                    <p className="text-muted-foreground text-lg">Your complete collection of AI-generated content</p>
                  </div>
                </div>
                
                {/* Real-time Stats */}
                <div className="flex items-center gap-8 mt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary">{totalAssets}</div>
                    <div className="text-sm text-muted-foreground">Total Assets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary">{thisMonthAssets}</div>
                    <div className="text-sm text-muted-foreground">This Month</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-accent">{totalFileSize.toFixed(1)}MB</div>
                    <div className="text-sm text-muted-foreground">Storage Used</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">94%</div>
                    <div className="text-sm text-muted-foreground">Avg Quality</div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button variant="outline" className="gap-2 hover:scale-105 transition-transform">
                  <Upload className="w-4 h-4" />
                  Bulk Import
                </Button>
                <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform">
                  <Sparkles className="w-4 h-4" />
                  AI Organize
                </Button>
                <Button variant="outline" className="gap-2 hover:scale-105 transition-transform">
                  <TrendingUp className="w-4 h-4" />
                  Analytics
                </Button>
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
                {["All", "Avatars", "Headshots", "Brand Assets", "Videos", "Recent", "Favorites"].map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    className="h-9 px-4 text-sm font-medium transition-all hover:scale-105 hover:shadow-md"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category === "Recent" && <Clock className="w-4 h-4 mr-2" />}
                    {category === "Favorites" && <Star className="w-4 h-4 mr-2" />}
                    {category}
                    {category === "All" && <Badge variant="secondary" className="ml-2 text-xs">{totalAssets}</Badge>}
                  </Button>
                ))}
              </div>

              {/* Smart Grid Layout */}
              <div className="space-y-6">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAssets.map((asset) => (
                      <Card key={asset.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 hover:border-primary/30 bg-gradient-to-br from-card to-card/95">
                        <div className="aspect-square bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
                          {/* Content Preview */}
                          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/20 flex items-center justify-center">
                            {asset.type === "video" && (
                              <div className="w-16 h-16 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                                <Play className="w-8 h-8 text-white ml-1" />
                              </div>
                            )}
                          </div>
                          
                          {/* Format & Model Badges */}
                          <div className="absolute top-3 left-3 flex gap-2">
                            <Badge variant="secondary" className="bg-black/80 text-white border-0 font-medium">
                              {asset.format}
                            </Badge>
                            <Badge variant="outline" className="bg-black/80 text-white border-white/30 font-medium">
                              GPT-4V
                            </Badge>
                          </div>

                          {/* Quality Score */}
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-1 bg-black/80 rounded-full px-3 py-1.5 backdrop-blur-sm">
                              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm text-white font-semibold">{asset.quality}</span>
                            </div>
                          </div>
                          
                          {/* Smart Hover Actions - Fixed spacing */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
                            <div className="space-y-2">
                              <div className="flex justify-center gap-3">
                                <Button 
                                  size="sm" 
                                  className="bg-white/20 backdrop-blur-md text-white border-white/40 hover:bg-white/30 transition-all flex-1 min-w-0"
                                  onClick={() => {
                                    console.log(`Editing avatar ${asset.id}: ${asset.title}`);
                                    // Add edit functionality here
                                  }}
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-white/20 backdrop-blur-md text-white border-white/40 hover:bg-white/30 transition-all flex-1 min-w-0"
                                  onClick={() => {
                                    // Create download link
                                    const link = document.createElement('a');
                                    link.href = asset.thumbnail;
                                    link.download = `${asset.title.replace(/\s+/g, '_')}.${asset.format.toLowerCase()}`;
                                    document.body.appendChild(link);
                                    link.click();
                                    document.body.removeChild(link);
                                    console.log(`Downloading ${asset.title}`);
                                  }}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Save
                                </Button>
                              </div>
                              <div className="flex justify-center gap-1">
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2 backdrop-blur-sm">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2 backdrop-blur-sm">
                                  <Star className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-2 backdrop-blur-sm">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="p-5 space-y-4">
                          <div>
                            <h3 className="font-semibold text-lg truncate">{asset.title}</h3>
                            <p className="text-sm text-muted-foreground">{asset.date}</p>
                          </div>
                          
                          {/* AI Tags */}
                          <div className="flex flex-wrap gap-1.5">
                            {asset.tags.slice(0, 3).map((tag, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs py-1 px-2 bg-muted/60">
                                {tag}
                              </Badge>
                            ))}
                            {asset.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs py-1 px-2">
                                +{asset.tags.length - 3}
                              </Badge>
                            )}
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
                          <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex-shrink-0 flex items-center justify-center">
                            {asset.type === "video" && <Play className="w-6 h-6 text-primary" />}
                            {asset.type === "avatar" && <Star className="w-6 h-6 text-secondary" />}
                            {asset.type === "brand" && <Sparkles className="w-6 h-6 text-accent" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="space-y-2">
                                <h3 className="font-semibold text-lg truncate">{asset.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <span>{asset.date}</span>
                                  <Badge variant="secondary" className="text-xs">{asset.format}</Badge>
                                  <span className="flex items-center gap-1">
                                    <Star className="w-3 h-3 text-yellow-500" />
                                    {asset.quality}
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
                                <Button size="sm" variant="ghost" className="hover:bg-primary/10">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="hover:bg-secondary/10">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="hover:bg-accent/10">
                                  <Share2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="hover:bg-destructive/10 text-destructive">
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
            <Card className="p-6 border-2 hover:border-primary/20 transition-colors">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                AI Insights
              </h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Avg Quality Score</span>
                    <span className="font-semibold">9.1/10</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-gradient-to-r from-primary to-secondary h-3 rounded-full transition-all duration-1000" style={{ width: '91%' }}></div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Generation Speed</span>
                    <span className="font-semibold">Fast</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-gradient-to-r from-secondary to-accent h-3 rounded-full transition-all duration-1000" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Storage Efficiency</span>
                    <span className="font-semibold">Excellent</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div className="bg-gradient-to-r from-accent to-primary h-3 rounded-full transition-all duration-1000" style={{ width: '94%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:border-secondary/20 transition-colors">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start gap-3 h-12 hover:scale-105 transition-transform" variant="outline">
                  <Sparkles className="w-5 h-5" />
                  Generate Similar
                </Button>
                <Button className="w-full justify-start gap-3 h-12 hover:scale-105 transition-transform" variant="outline">
                  <Upload className="w-5 h-5" />
                  Batch Process
                </Button>
                <Button className="w-full justify-start gap-3 h-12 hover:scale-105 transition-transform" variant="outline">
                  <Share2 className="w-5 h-5" />
                  Create Collection
                </Button>
                <Button className="w-full justify-start gap-3 h-12 hover:scale-105 transition-transform" variant="outline">
                  <TrendingUp className="w-5 h-5" />
                  View Analytics
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-2 hover:border-accent/20 transition-colors">
              <h3 className="font-semibold text-lg mb-4">AI Recommendations</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-primary">Trending Style</p>
                  <p className="text-xs text-muted-foreground mt-1">Minimalist portraits are performing 23% better this week</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg border border-secondary/20">
                  <p className="text-sm font-medium text-secondary">Optimize Quality</p>
                  <p className="text-xs text-muted-foreground mt-1">Try higher resolution settings for better engagement</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 rounded-lg border border-accent/20">
                  <p className="text-sm font-medium text-accent">Storage Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">Archive older assets to free up 2.1GB space</p>
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
      </main>
    </div>
  );
}