import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { VirturaNavigation } from "@/components/VirturaNavigation";
import { MotionBackground } from "@/components/MotionBackground";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Palette, Type, TrendingUp, Download, Share2, Sparkles, Plus, FolderOpen } from "lucide-react";
import { BrandsOnboardingTutorial } from "@/components/studio/BrandsOnboardingTutorial";
import { toast } from "sonner";
import { AvatarService } from "@/services/avatarService";
import { useBrandAssets } from "@/hooks/useBrandAssets";
import { CreateBrandDialog } from "@/components/CreateBrandDialog";
import { BrandKitDialog } from "@/components/BrandKitDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BrandsPage() {
  const {
    brands,
    collections,
    assets,
    loading,
    loadBrands,
    loadCollections,
    loadAssets,
    saveGeneratedAsset,
  } = useBrandAssets();

  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | undefined>(undefined);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateBrand, setShowCreateBrand] = useState(false);
  const [showBrandKit, setShowBrandKit] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check onboarding on mount
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("brandsOnboardingComplete");
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

  // Load brands on mount
  useEffect(() => {
    loadBrands();
  }, []);

  // Load collections when brand changes
  useEffect(() => {
    if (selectedBrand) {
      loadCollections(selectedBrand);
      loadAssets(selectedBrand);
    }
  }, [selectedBrand]);

  // Auto-select first brand
  useEffect(() => {
    if (brands.length > 0 && !selectedBrand) {
      setSelectedBrand(brands[0].id);
    }
  }, [brands]);

  // Reload assets when collection changes
  useEffect(() => {
    if (selectedBrand) {
      loadAssets(selectedBrand, selectedCollection === 'all' ? undefined : selectedCollection);
    }
  }, [selectedCollection]);

  const handleGenerate = async (prompt: string) => {
    if (!selectedBrand) {
      toast.error("Please select a brand first");
      return;
    }

    console.log("Generating brand content with prompt:", prompt);
    setIsGenerating(true);
    
    try {
      const studioNegative = "blurry, low quality, text, watermark, logos, distorted, unrealistic, plastic";
      const brandPrompt = `${prompt}, professional commercial photography, high quality brand content, commercial advertising style, clean composition, professional lighting, marketing ready`;
      
      console.log("About to generate brand assets with prompt:", brandPrompt);
      
      // Generate brand assets with different orientations/styles
      const results = await Promise.all([
        AvatarService.generateAvatar({
          prompt: `${brandPrompt}, professional corporate style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${brandPrompt}, modern creative campaign style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        }),
        AvatarService.generateAvatar({
          prompt: `${brandPrompt}, lifestyle marketing style`,
          negativePrompt: studioNegative,
          photoMode: true,
          resolution: "1024x1024",
          steps: 49,
          adherence: 7,
        })
      ]);

      console.log("Brand generation results:", results);

      const successfulResults = results.filter(result => result.success && result.image);
      
      if (successfulResults.length > 0) {
        // Save each generated image to the database
        const savePromises = successfulResults.map((result, index) =>
          saveGeneratedAsset(
            selectedBrand,
            result.image!,
            prompt,
            selectedCollection === 'all' ? null : selectedCollection,
            {
              style: index === 0 ? 'corporate' : index === 1 ? 'creative' : 'lifestyle',
              resolution: '1024x1024',
            }
          )
        );

        await Promise.all(savePromises);
        
        toast.success(`Generated and saved ${successfulResults.length} brand assets!`);
        
        // Reload assets to show the new ones
        if (selectedBrand) {
          await loadAssets(selectedBrand, selectedCollection === 'all' ? undefined : selectedCollection);
        }
      } else {
        const errors = results.filter(r => !r.success).map(r => r.error).join(", ");
        console.error("All brand generations failed. Errors:", errors);
        toast.error(`Failed to generate brand assets. ${errors || "Unknown error"}`);
      }
    } catch (error) {
      console.error('Brand asset generation error:', error);
      toast.error(`An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (asset: any) => {
    try {
      const response = await fetch(asset.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${asset.title || 'brand-asset'}.png`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Asset downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download asset');
    }
  };

  const handleShare = async (asset: any) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: asset.title,
          url: asset.file_url
        });
      } else {
        await navigator.clipboard.writeText(asset.file_url);
        toast.success('Asset URL copied to clipboard!');
      }
    } catch (error) {
      console.error('Share error:', error);
      toast.error('Failed to share asset');
    }
  };

  return (
    <>
      <AnimatePresence>
        {showOnboarding && (
          <BrandsOnboardingTutorial onComplete={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>
      
      <div className="min-h-screen bg-background relative overflow-hidden">
        <MotionBackground />
        <VirturaNavigation />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* Welcome Banner */}
        <Card className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-card border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="space-y-1 sm:space-y-2">
              <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                🚀 Build ready-to-use commercials and campaigns powered by AI.
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Create professional brand content, advertisements, and marketing materials
              </p>
            </div>
            <Button variant="outline" className="flex items-center gap-2 w-full sm:w-auto whitespace-nowrap">
              <TrendingUp className="w-4 h-4" />
              View Examples
            </Button>
          </div>
        </Card>

        {/* Brand & Collection Selectors */}
        {brands.length === 0 && !loading ? (
          <Card className="mb-4 sm:mb-6 p-4 sm:p-6 text-center">
            <h3 className="text-base sm:text-lg font-semibold mb-2">No Brands Yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">Create your first brand to start generating assets</p>
            <Button onClick={() => setShowCreateBrand(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Create Brand
            </Button>
          </Card>
        ) : (
          <Card className="mb-4 sm:mb-6 p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Select Brand</label>
                <Select value={selectedBrand || undefined} onValueChange={setSelectedBrand}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a brand..." />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Save to Folder</label>
                <Select value={selectedCollection || 'all'} onValueChange={setSelectedCollection}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Assets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assets</SelectItem>
                    {collections.map((collection) => (
                      <SelectItem key={collection.id} value={collection.id}>
                        <div className="flex items-center gap-2">
                          <FolderOpen className="w-4 h-4" />
                          {collection.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="pt-6">
                <Button onClick={() => setShowCreateBrand(true)} variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Brand
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterface type="brands" onGenerate={handleGenerate} />
            
            {/* Generated Previews */}
            <div className="mt-8">
              <h3 className="text-lg font-display font-bold mb-4">
                {selectedBrand ? 'Brand Assets' : 'Select a brand to view assets'}
              </h3>
              
              {isGenerating && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <div className="aspect-video bg-muted relative flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-muted-foreground animate-spin" />
                      </div>
                      <div className="p-4">
                        <div className="h-4 bg-muted rounded mb-2"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
              
              {loading && !isGenerating && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading assets...</p>
                </div>
              )}

              {!loading && !isGenerating && assets.length === 0 && selectedBrand && (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No assets yet. Generate your first brand asset above!</p>
                </Card>
              )}
              
              {assets.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {assets.map((asset) => (
                    <Card key={asset.id} className="group overflow-hidden hover-zoom">
                      <div className="aspect-video bg-muted relative">
                        <img 
                          src={asset.file_url} 
                          alt={asset.title}
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Quick Actions Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-white border-white/50"
                              onClick={() => handleDownload(asset)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-white border-white/50"
                              onClick={() => handleShare(asset)}
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <p className="text-sm font-medium truncate mb-1">
                          {asset.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(asset.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Kit */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4 flex items-center gap-2">
                <Palette className="w-5 h-5 text-primary" />
                Brand Kit
              </h3>
              <div className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => setShowBrandKit(true)}
                  disabled={!selectedBrand}
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => setShowBrandKit(true)}
                  disabled={!selectedBrand}
                >
                  <Palette className="w-4 h-4" />
                  Brand Colors
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-3"
                  onClick={() => setShowBrandKit(true)}
                  disabled={!selectedBrand}
                >
                  <Type className="w-4 h-4" />
                  Brand Fonts
                </Button>
              </div>
              
              {/* Brand Preview */}
              {selectedBrand && brands.find(b => b.id === selectedBrand) && (
                <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Current Brand</p>
                  <div className="flex items-center gap-2">
                    {brands.find(b => b.id === selectedBrand)?.logo_url ? (
                      <img 
                        src={brands.find(b => b.id === selectedBrand)!.logo_url!} 
                        alt="Brand logo"
                        className="w-8 h-8 rounded object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-primary rounded"></div>
                    )}
                    <div>
                      <p className="text-sm font-medium">
                        {brands.find(b => b.id === selectedBrand)?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {brands.find(b => b.id === selectedBrand)?.logo_url ? 'Logo set' : 'No logo uploaded'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Campaign Templates */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Campaign Templates</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Product Launch</p>
                    <p className="text-sm text-muted-foreground">
                      Complete campaign assets for new products
                    </p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Social Media Pack</p>
                    <p className="text-sm text-muted-foreground">
                      Instagram, TikTok, and LinkedIn ready content
                    </p>
                  </div>
                </Button>
                <Button variant="ghost" className="w-full justify-start text-left h-auto p-3">
                  <div>
                    <p className="font-medium">Email Campaign</p>
                    <p className="text-sm text-muted-foreground">
                      Professional email marketing visuals
                    </p>
                  </div>
                </Button>
              </div>
            </Card>

            {/* Recent Projects */}
            <Card className="p-6">
              <h3 className="text-lg font-display font-bold mb-4">Recent Assets</h3>
              <div className="space-y-3">
                {assets.slice(0, 3).map((asset) => (
                  <div key={asset.id} className="flex items-center gap-3">
                    <div className="w-12 h-8 bg-muted rounded overflow-hidden">
                      <img 
                        src={asset.thumbnail_url || asset.file_url} 
                        alt={asset.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{asset.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {assets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No recent assets
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>

      <CreateBrandDialog 
        open={showCreateBrand} 
        onOpenChange={setShowCreateBrand}
        onBrandCreated={(brandId) => {
          loadBrands();
          setSelectedBrand(brandId);
          setShowCreateBrand(false);
        }}
      />

      <BrandKitDialog
        open={showBrandKit}
        onOpenChange={setShowBrandKit}
        brand={brands.find(b => b.id === selectedBrand) || null}
        onBrandUpdated={() => {
          loadBrands();
          if (selectedBrand) {
            loadAssets(selectedBrand, selectedCollection === 'all' ? undefined : selectedCollection);
          }
        }}
      />
    </div>
    </>
  );
}
