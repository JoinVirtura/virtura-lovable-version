import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Eye, Heart, Download } from "lucide-react";

export const Gallery = () => {
  // Placeholder data for gallery items
  const galleryItems = [
    {
      id: 1,
      type: "image",
      title: "Professional Headshot",
      style: "Corporate",
      likes: 234,
      views: 1542,
      thumbnail: "https://images.unsplash.com/photo-1494790108755-2616b612b93c?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 2,
      type: "video",
      title: "Animated Character",
      style: "Cartoon",
      likes: 189,
      views: 987,
      thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 3,
      type: "image",
      title: "Fashion Portrait",
      style: "Editorial",
      likes: 356,
      views: 2103,
      thumbnail: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 4,
      type: "video",
      title: "Dynamic Presentation",
      style: "Business",
      likes: 145,
      views: 756,
      thumbnail: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 5,
      type: "image",
      title: "Creative Portrait",
      style: "Artistic",
      likes: 287,
      views: 1432,
      thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face"
    },
    {
      id: 6,
      type: "video",
      title: "Lifestyle Content",
      style: "Casual",
      likes: 201,
      views: 1089,
      thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face"
    }
  ];

  const categories = ["All", "Professional", "Creative", "Business", "Lifestyle"];

  return (
    <section id="gallery" className="py-20 bg-gradient-luxury">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
            Gallery of
            <span className="block text-primary">Amazing Creations</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Explore stunning avatars created by our community of creators and see what's possible with Virtura.
          </p>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                className={category === "All" 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                  : "border-border hover:bg-primary/10 hover:border-primary/30"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {galleryItems.map((item) => (
            <Card 
              key={item.id}
              className="group relative overflow-hidden bg-card border-border hover:border-primary/30 transition-all duration-300 hover:scale-105 hover:shadow-warm"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge 
                    variant="secondary" 
                    className="bg-background/80 text-foreground backdrop-blur-sm"
                  >
                    {item.type === "video" ? (
                      <><Play className="w-3 h-3 mr-1" /> Video</>
                    ) : (
                      "Image"
                    )}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-8 h-8 p-0 bg-background/80 hover:bg-background backdrop-blur-sm"
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    className="w-8 h-8 p-0 bg-background/80 hover:bg-background backdrop-blur-sm"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {/* Play Button for Videos */}
                {item.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      size="lg" 
                      className="w-16 h-16 rounded-full bg-primary/90 hover:bg-primary text-primary-foreground"
                    >
                      <Play className="w-6 h-6 ml-1" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <Badge variant="outline" className="text-xs">
                    {item.style}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{item.views.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-4 h-4" />
                    <span>{item.likes}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="border-primary/30 text-foreground hover:bg-primary/10 hover:border-primary/50"
          >
            Load More Creations
          </Button>
        </div>
      </div>
    </section>
  );
};