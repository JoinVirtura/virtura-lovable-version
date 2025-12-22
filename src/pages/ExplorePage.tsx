import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { Search, Users, Heart, Grid3X3, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MotionBackground } from "@/components/MotionBackground";

interface CreatorProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  library_public: boolean | null;
}

export default function ExplorePage() {
  const navigate = useNavigate();
  const [creators, setCreators] = useState<CreatorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Explore Creators | Virtura";
    fetchCreators();
  }, []);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, bio, library_public')
        .eq('library_public', true)
        .limit(50);

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      creator.display_name?.toLowerCase().includes(query) ||
      creator.bio?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background relative">
      <MotionBackground />
      
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-text bg-clip-text text-transparent">
              Explore Creators
            </h1>
          </div>
          <Button onClick={() => navigate('/auth')} className="bg-gradient-primary">
            Join Virtura
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search creators by name or bio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 text-lg bg-card/50 border-border/50"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span>{creators.length} Public Creators</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Grid3X3 className="h-5 w-5" />
            <span>Browse Portfolios</span>
          </div>
        </div>

        {/* Creators Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No creators found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Be the first to join!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCreators.map((creator) => (
              <Card 
                key={creator.id} 
                className="p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer group"
                onClick={() => navigate(`/profile/${creator.id}`)}
              >
                <div className="flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4 ring-2 ring-primary/20 group-hover:ring-primary/50 transition-all">
                    <AvatarImage src={creator.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-lg font-bold text-white">
                      {creator.display_name?.charAt(0)?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                    {creator.display_name || 'Anonymous Creator'}
                  </h3>
                  
                  {creator.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {creator.bio}
                    </p>
                  )}
                  
                  <Badge variant="secondary" className="mt-auto">
                    <Heart className="h-3 w-3 mr-1" />
                    View Profile
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
