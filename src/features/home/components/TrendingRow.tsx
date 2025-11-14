import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Play, Eye, Sparkles, Heart, Share2, Filter, Film, Search, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ContentCard } from './ContentCard';
import { Tile } from '../types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';

interface TrendingRowProps {
  tiles: Tile[];
  className?: string;
}

export const TrendingRow: React.FC<TrendingRowProps> = ({ tiles, className }) => {
  const [shuffledTiles, setShuffledTiles] = useState(tiles);
  const [isShuffling, setIsShuffling] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [likedItems, setLikedItems] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState(false);
  const [displayCount, setDisplayCount] = useState(50);
  const [scrollY, setScrollY] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('showcaseFavorites');
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)));
    }
  }, []);

  // Filter categories for style showcase
  const filterCategories = [
    'All',
    'Fantasy',
    'Portrait',
    'Artistic',
    'Digital',
    'Unique',
    'Photography',
    'Fashion',
    'Abstract',
    'Realistic',
    'Vintage',
    'Modern',
  ];
  
  // Track scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const scrollProgress = Math.max(0, Math.min(1, (window.innerHeight - rect.top) / window.innerHeight));
        setScrollY(scrollProgress);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Track global mouse position for magnetic effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  const handleShuffle = () => {
    setIsShuffling(true);
    toast({
      title: "Regenerating Gallery",
      description: "Discovering new creative possibilities...",
    });
    setTimeout(() => {
      const shuffled = [...tiles].sort(() => Math.random() - 0.5);
      setShuffledTiles(shuffled);
      setIsShuffling(false);
    }, 600);
  };

  const handleLike = (tileId: string) => {
    setLikedItems(prev => {
      const newLiked = new Set(prev);
      if (newLiked.has(tileId)) {
        newLiked.delete(tileId);
        toast({ title: "Removed from favorites" });
      } else {
        newLiked.add(tileId);
        toast({ title: "Added to favorites" });
      }
      return newLiked;
    });
  };

  const handleShare = async (tile: Tile) => {
    try {
      const shareUrl = `${window.location.origin}?style=${tile.id}`;
      const shareText = `Check out this amazing ${tile.title} style! ${tile.prompt}`;
      
      if (navigator.share) {
        await navigator.share({
          title: `${tile.title} - Virtura AI`,
          text: shareText,
          url: shareUrl,
        });
        toast({ title: "Shared successfully!" });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleDownload = async (tile: Tile) => {
    try {
      sonnerToast.info("Downloading...");
      
      const response = await fetch(tile.posterUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${tile.title.replace(/\s+/g, '_')}_${tile.id}.${tile.kind === 'video' ? 'mp4' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      sonnerToast.success("Downloaded successfully!");
    } catch (error) {
      console.error('Download failed:', error);
      sonnerToast.error("Failed to download");
    }
  };

  const handleSaveToLibrary = async (tile: Tile) => {
    // ... existing code
  };

  const toggleFavorite = (tileId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(tileId)) {
        newFavorites.delete(tileId);
        toast({ title: "Removed from favorites ⭐" });
      } else {
        newFavorites.add(tileId);
        toast({ title: "Added to favorites ⭐" });
      }
      localStorage.setItem('showcaseFavorites', JSON.stringify([...newFavorites]));
      return newFavorites;
    });
  };

  const handleViewAll = () => {
    if (isExpanded) {
      setDisplayCount(50);
      setIsExpanded(false);
      toast({ title: "Showing curated selection" });
    } else {
      setDisplayCount(tiles.length);
      setIsExpanded(true);
      toast({ title: "Showing complete gallery" });
    }
  };

  // Update shuffled tiles when tiles prop changes
  React.useEffect(() => {
    setShuffledTiles(tiles);
  }, [tiles]);

  // Apply comprehensive filtering: category, search, and favorites
  let filteredTiles = shuffledTiles;
  
  // Category filter
  if (activeFilter !== 'All') {
    filteredTiles = filteredTiles.filter(tile => tile.tag === activeFilter);
  }
  
  // Search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredTiles = filteredTiles.filter(tile => 
      tile.title.toLowerCase().includes(query) ||
      tile.prompt?.toLowerCase().includes(query) ||
      tile.tag?.toLowerCase().includes(query)
    );
  }
  
  // Favorites filter
  if (showFavoritesOnly) {
    filteredTiles = filteredTiles.filter(tile => favorites.has(tile.id));
  }

  const displayedTiles = filteredTiles.slice(0, displayCount);

  return (
    <section className={cn('relative py-8 px-4 md:px-6 lg:px-8', className)} ref={containerRef}>
      {/* Ultra-Advanced Background System */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Deep Space Gradient with Parallax */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-background via-purple-950/10 to-background"
          style={{
            transform: `translateY(${scrollY * 50}px)`,
          }}
        />
        
        {/* Dynamic Morphing Shapes with 3D Rotation */}
        <motion.div 
          className="absolute top-1/4 left-1/6 w-96 h-96 opacity-40"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-500/30 via-violet-500/20 to-fuchsia-500/30 animate-morph-1 blur-3xl" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-1/3 right-1/6 w-[500px] h-[500px] opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <div className="w-full h-full bg-gradient-to-tl from-fuchsia-500/25 via-purple-500/15 to-cyan-500/25 animate-morph-2 blur-3xl" />
        </motion.div>
        
        {/* Advanced Particle System - More Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 200 - 100, 0],
                y: [0, Math.random() * 200 - 100, 0],
                scale: [0, 1, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        
        {/* Holographic Grid with Animation */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="absolute inset-0 bg-grid-holographic" />
        </motion.div>
        
        {/* Rotating Energy Rings with Glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div 
            className="w-[1000px] h-[1000px] border border-purple-500/20 rounded-full shadow-2xl shadow-purple-500/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute w-[700px] h-[700px] border border-violet-500/15 rounded-full shadow-2xl shadow-violet-500/10"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          />
          <motion.div 
            className="absolute w-[400px] h-[400px] border border-fuchsia-500/10 rounded-full shadow-2xl shadow-fuchsia-500/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
        </div>
        
        {/* Animated Scanning Matrix */}
        <motion.div 
          className="absolute w-full h-px bg-gradient-to-r from-transparent via-purple-400/40 to-transparent"
          animate={{
            top: ['0%', '100%'],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        <motion.div 
          className="absolute h-full w-px bg-gradient-to-b from-transparent via-purple-400/30 to-transparent"
          animate={{
            left: ['0%', '100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        
        {/* Dynamic Parallax Orbs */}
        <motion.div 
          className="absolute w-3 h-3 bg-purple-400 rounded-full blur-sm"
          style={{
            top: '10%',
            left: '10%',
            transform: `translate(${scrollY * 30}px, ${scrollY * 40}px)`,
          }}
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute w-2 h-2 bg-fuchsia-400 rounded-full blur-sm"
          style={{
            top: '30%',
            right: '15%',
            transform: `translate(${-scrollY * 40}px, ${scrollY * 30}px)`,
          }}
          animate={{
            scale: [1, 2, 1],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        
        {/* Cinematic Corner Illumination with Pulse */}
        <motion.div 
          className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 via-purple-500/10 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
        />
        <motion.div 
          className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-fuchsia-500/20 via-fuchsia-500/10 to-transparent"
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Ultra-Enhanced Header with Staggered Animation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="mb-12 space-y-8"
        >
          {/* Holographic Title System */}
          <div className="relative">
            <motion.div 
              className="flex items-center gap-6 mb-8"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Ultra-Animated Energy Bar */}
              <motion.div 
                className="relative w-2 h-24"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                    '0 0 60px rgba(168, 85, 247, 0.8)',
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-purple-400 via-violet-500 to-fuchsia-600 rounded-full"
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-cyan-400 to-purple-600 rounded-full blur-xl opacity-60 animate-pulse" />
                <motion.div
                  className="absolute inset-0 bg-white rounded-full"
                  animate={{
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                />
              </motion.div>
              
              <div className="relative">
                {/* Multi-Layer Holographic Title */}
                <div className="relative">
                  <motion.h2 
                    className="relative text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter pb-6 overflow-visible"
                    style={{ lineHeight: '1.3' }}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                  >
                    {/* Animated gradient text */}
                    <motion.span 
                      className="relative inline-block bg-gradient-to-r from-purple-400 via-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent"
                      style={{
                        backgroundSize: '200% auto',
                      }}
                      animate={{
                        backgroundPosition: ['0% center', '200% center'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      Style
                    </motion.span>
                    
                    {/* Holographic overlay with pulse */}
                    <motion.span 
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent blur-sm" 
                      aria-hidden="true"
                      animate={{
                        opacity: [0.2, 0.6, 0.2],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                      }}
                    >
                      Style
                    </motion.span>
                    
                    {/* Electric glitch effect */}
                    <motion.span 
                      className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent blur-lg" 
                      aria-hidden="true"
                      animate={{
                        opacity: [0, 0.3, 0],
                        x: [0, 2, -2, 0],
                      }}
                      transition={{
                        duration: 0.3,
                        repeat: Infinity,
                        repeatDelay: 3,
                      }}
                    >
                      Style
                    </motion.span>
                  </motion.h2>
                </div>
                
                {/* Animated Subtitle with Line Decoration */}
                <motion.div 
                  className="flex items-center gap-4 mt-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <motion.div 
                    className="h-px w-20 bg-gradient-to-r from-transparent via-purple-500 to-transparent"
                    animate={{
                      width: [80, 100, 80],
                      opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                  <p className="text-2xl md:text-3xl font-light bg-gradient-to-r from-purple-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent tracking-[0.3em] uppercase">
                    AI Capabilities
                  </p>
                  <motion.div 
                    className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"
                    animate={{
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Mind-Blowing Description */}
            <motion.div 
              className="relative max-w-5xl"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="absolute -inset-6 bg-gradient-to-r from-purple-500/10 via-transparent to-cyan-500/10 blur-3xl" />
              <motion.p 
                className="relative text-2xl md:text-3xl text-foreground/90 leading-relaxed font-light"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(168, 85, 247, 0)',
                    '0 0 20px rgba(168, 85, 247, 0.3)',
                    '0 0 20px rgba(168, 85, 247, 0)',
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                Explore 100+ diverse artistic styles powered by Virtura AI. From fantasy to photorealism, discover limitless creative possibilities.
              </motion.p>
            </motion.div>
          </div>

          {/* Search Bar and Favorites Toggle */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 pb-4 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.75 }}
          >
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
              <Input
                type="text"
                placeholder="Search styles by name, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 bg-background/40 backdrop-blur-sm border-2 border-purple-400/20 focus:border-purple-400/50 rounded-full text-foreground placeholder:text-foreground/50 transition-all duration-300"
              />
            </div>
            
            {/* Favorites Toggle Button */}
            <Button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              variant={showFavoritesOnly ? "default" : "outline"}
              size="lg"
              className={cn(
                "relative overflow-hidden px-6 py-6 rounded-full font-bold transition-all duration-300 border-2",
                showFavoritesOnly
                  ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 border-yellow-400/50 text-white shadow-lg shadow-yellow-500/50"
                  : "bg-background/40 backdrop-blur-sm border-purple-400/20 hover:border-yellow-400/40 hover:bg-yellow-500/10"
              )}
            >
              <Star className={cn("w-5 h-5 mr-2", showFavoritesOnly && "fill-white")} />
              Favorites {favorites.size > 0 && `(${favorites.size})`}
            </Button>
          </motion.div>

          {/* Advanced Filter System */}
          <motion.div 
            className="flex flex-wrap gap-2 sm:gap-3 justify-center pt-8 pb-4 px-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            {filterCategories.map((category, index) => {
              const isActive = activeFilter === category;
              
              return (
                <motion.button
                  key={category}
                  onClick={() => setActiveFilter(category)}
                  className={cn(
                    "group relative overflow-hidden px-4 sm:px-6 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base transition-all duration-300",
                    "border-2",
                    isActive 
                      ? "bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-600 border-purple-400/50 text-white shadow-lg shadow-purple-500/50 scale-105" 
                      : "bg-background/40 backdrop-blur-sm border-purple-400/20 text-foreground/70 hover:border-purple-400/40 hover:text-foreground hover:bg-purple-500/10"
                  )}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Animated shimmer on active */}
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    />
                  )}
                  
                  <span className="relative">
                    {category}
                  </span>
                  
                  {/* Glow effect on hover */}
                  {!isActive && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-violet-500/20 to-fuchsia-500/20 blur-xl" />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Innovative Masonry Grid - Mobile Responsive */}
        <div className="relative px-2 sm:px-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-1 sm:gap-2 md:gap-0 auto-rows-[180px] sm:auto-rows-[200px] md:auto-rows-[240px] lg:auto-rows-[280px]" style={{ gridAutoFlow: 'dense' }}>
            {displayedTiles.map((tile, index) => {
              // Dynamic sizing for visual interest
              const getCardSize = (index: number) => {
                const pattern = index % 20;
                if (pattern === 0) return 'col-span-2 row-span-2'; // Large featured
                if (pattern === 7 || pattern === 14) return 'col-span-2'; // Wide
                if (pattern === 3 || pattern === 10 || pattern === 17) return 'row-span-2'; // Tall
                return ''; // Standard 1x1
              };

              return (
                <motion.div
                  key={`${tile.id}-${index}`}
                  initial={{ opacity: 0, scale: 0.8, y: 40 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ 
                    duration: 0.6, 
                    delay: (index % 16) * 0.03,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  className={cn(
                    'relative group cursor-pointer overflow-hidden rounded-none',
                    getCardSize(index)
                  )}
                  whileHover={{ 
                    scale: 1.03,
                    zIndex: 50,
                    transition: { duration: 0.3, ease: "easeOut" }
                  }}
                  onHoverStart={() => {
                    setHoveredCard(tile.id);
                  }}
                  onHoverEnd={() => setHoveredCard(null)}
                >
                  <ContentCard 
                    tile={tile} 
                    className="h-full w-full border-0 rounded-none overflow-hidden bg-card/80 backdrop-blur-sm"
                    size="md"
                    onDownload={handleDownload}
                    onSave={handleSaveToLibrary}
                  />
                  
                  {/* Enhanced Hover Overlay */}
                  <AnimatePresence>
                    {hoveredCard === tile.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex flex-col items-center justify-between p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent"
                      >
                        {/* View Count Badge */}
                        <motion.div
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="absolute top-2 sm:top-4 left-2 sm:left-4 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-600/90 backdrop-blur-sm rounded-full border border-purple-400/30 pointer-events-auto"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          <span className="text-xs sm:text-sm font-bold text-white">{tile.views?.toLocaleString() || 0}</span>
                        </motion.div>
                        
                        {/* Action Buttons */}
                        <div className="absolute top-2 sm:top-4 right-2 sm:right-4 flex gap-2">
                          <motion.button
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.15 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleFavorite(tile.id);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 sm:p-2.5 bg-yellow-500/90 hover:bg-yellow-400 backdrop-blur-sm rounded-full border border-yellow-400/40 transition-all duration-200"
                          >
                            <Star 
                              className={cn(
                                "w-3.5 h-3.5 sm:w-5 sm:h-5 transition-all duration-200",
                                favorites.has(tile.id) 
                                  ? "fill-white text-white" 
                                  : "text-white hover:fill-white"
                              )} 
                            />
                          </motion.button>
                          
                          <motion.button
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(tile);
                            }}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-1.5 sm:p-2.5 bg-blue-500/90 hover:bg-blue-400 backdrop-blur-sm rounded-full border border-blue-400/40 transition-all duration-200"
                          >
                            <Share2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Floating Video Graphics - Scattered Across Grid */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`video-float-${i}`}
                className="absolute"
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0,
                  scale: 0
                }}
                animate={{ 
                  x: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                  ],
                  y: [
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                    Math.random() * 100 + '%',
                  ],
                  opacity: [0, 0.6, 0.4, 0.6, 0],
                  scale: [0, 1, 0.8, 1, 0],
                  rotate: [0, 360, 720]
                }}
                transition={{
                  duration: 15 + i * 2,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.8
                }}
              >
                {i % 3 === 0 ? (
                  <div className="relative">
                    <Film className="w-8 h-8 text-purple-400" />
                    <motion.div
                      className="absolute inset-0 blur-xl bg-purple-500/30 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </div>
                ) : i % 3 === 1 ? (
                  <div className="relative">
                    <Play className="w-10 h-10 text-fuchsia-400 fill-fuchsia-400/20" />
                    <motion.div
                      className="absolute inset-0 blur-xl bg-fuchsia-500/30 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.6, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.5
                      }}
                    />
                  </div>
                ) : (
                  <div className="relative flex gap-1">
                    {[...Array(3)].map((_, j) => (
                      <motion.div
                        key={j}
                        className="w-1.5 h-6 bg-gradient-to-t from-purple-500 to-fuchsia-500 rounded-full"
                        animate={{
                          scaleY: [1, 1.5, 0.8, 1.2, 1],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: j * 0.2
                        }}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Load More Section */}
        {!isExpanded && displayedTiles.length < tiles.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-center pt-8"
          >
            <Button
              onClick={() => setDisplayCount(prev => prev + 50)}
              size="lg"
              variant="outline"
              className="group relative overflow-hidden px-12 py-8 text-xl font-black bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 backdrop-blur-md hover:from-purple-500/20 hover:to-fuchsia-500/20 text-white transition-all duration-500 border-2 border-purple-400/40 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105"
            >
              {/* Animated background shimmer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <span className="relative flex items-center gap-3">
                Load More Creations
              </span>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};