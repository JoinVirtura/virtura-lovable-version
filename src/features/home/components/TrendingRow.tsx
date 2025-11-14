import { useState, useEffect, useRef, useCallback } from 'react';
import { ContentCard } from './ContentCard';
import type { Tile } from '../types';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { StyleLightboxModal } from '@/components/landing/StyleLightboxModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TrendingRowProps {
  tiles: Tile[];
  className?: string;
}

export function TrendingRow({ tiles, className = '' }: TrendingRowProps) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('styleFavorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [displayCount, setDisplayCount] = useState(20);
  const [selectedStyle, setSelectedStyle] = useState<Tile | null>(null);
  const [animationPreset, setAnimationPreset] = useState<'fade' | 'slide' | 'zoom'>('fade');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const toggleFavorite = (id: string) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((fav) => fav !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('styleFavorites', JSON.stringify(newFavorites));
  };

  const filteredGallery = tiles.filter((tile) => {
    const matchesFilter = activeFilter === 'All' || tile.tag === activeFilter;
    const matchesSearch = searchQuery === '' || tile.title.toLowerCase().includes(searchQuery.toLowerCase()) || tile.prompt?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || favorites.includes(tile.id);
    return matchesFilter && matchesSearch && matchesFavorites;
  });

  const filters = ['All', 'Fantasy', 'Portrait', 'Artistic', 'Digital', 'Unique', 'Photography', 'Fashion', 'Nature', 'Abstract', 'Realistic', 'Vintage', 'Modern'];

  const loadMore = useCallback(() => {
    if (displayCount < filteredGallery.length) {
      setDisplayCount(prev => Math.min(prev + 20, filteredGallery.length));
    }
  }, [displayCount, filteredGallery.length]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) loadMore();
    }, { threshold: 0.1 });
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => { if (observerRef.current) observerRef.current.disconnect(); };
  }, [loadMore]);

  const visibleGallery = filteredGallery.slice(0, displayCount);

  const getAnimationClass = (index: number) => {
    switch (animationPreset) {
      case 'fade': return 'animate-fade-in';
      case 'slide': return 'animate-slide-in-right';
      case 'zoom': return 'animate-scale-in';
      default: return '';
    }
  };

  return (
    <section className={`py-12 px-4 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-3">Style</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">Explore hundreds of diverse AI styles and templates</p>
      </div>
      <div className="space-y-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row gap-3">
          <Input type="text" placeholder="Search styles by name or description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 h-12 px-6 text-base bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary transition-colors" />
          <Select value={animationPreset} onValueChange={(v: any) => setAnimationPreset(v)}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-card/50 backdrop-blur-sm border-border/50"><SelectValue placeholder="Animation" /></SelectTrigger>
            <SelectContent><SelectItem value="fade">Fade In</SelectItem><SelectItem value="slide">Slide In</SelectItem><SelectItem value="zoom">Zoom In</SelectItem></SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 justify-center items-center">
          <Button variant={showFavoritesOnly ? "default" : "outline"} size="sm" onClick={() => setShowFavoritesOnly(!showFavoritesOnly)} className="gap-2"><Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />Favorites</Button>
          {filters.map((filter) => (<Button key={filter} variant={activeFilter === filter ? 'default' : 'outline'} size="sm" onClick={() => setActiveFilter(filter)} className="transition-all">{filter}</Button>))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {visibleGallery.map((tile, index) => (
            <div key={tile.id} className={`relative ${getAnimationClass(index)}`} style={{ animationDelay: `${(index % 20) * 50}ms` }}>
              <div onClick={() => setSelectedStyle(tile)} className="cursor-pointer"><ContentCard tile={tile} size="sm" /></div>
              <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute top-2 right-2 flex gap-2 pointer-events-auto">
                  <button onClick={(e) => { e.stopPropagation(); toggleFavorite(tile.id); }} className="bg-background/90 backdrop-blur-sm rounded-full p-2 hover:scale-110 transition-transform"><Star className={`w-4 h-4 ${favorites.includes(tile.id) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} /></button>
                </div>
                <div className="absolute bottom-2 left-2 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5"><span className="text-muted-foreground">👁</span><span>{tile.views?.toLocaleString() || 0}</span></div>
              </div>
            </div>
          ))}
        </div>
        {displayCount < filteredGallery.length && (<div ref={loadMoreRef} className="h-20 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>)}
      </div>
      <StyleLightboxModal style={selectedStyle} isOpen={!!selectedStyle} onClose={() => setSelectedStyle(null)} />
    </section>
  );
}
