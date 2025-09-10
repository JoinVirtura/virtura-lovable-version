import { Badge } from "@/components/ui/badge";
import { ContentCardProps } from "../types";
import { Heart, Share2, Play, Eye } from "lucide-react";

export const ContentCard = ({ tile, className = "", size = 'md' }: ContentCardProps) => {
  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  return (
    <div className={`group relative w-full h-full overflow-hidden cursor-pointer ${className}`}>
      {/* Image Container - ZERO GAPS, PURE DIV */}
      <div className="relative w-full h-full bg-card/20 overflow-hidden">
        <img
          src={tile.posterUrl}
          alt={tile.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Multiple fallback strategies
            const target = e.currentTarget;
            target.style.display = 'none';
            
            // Create a fallback element
            const fallback = document.createElement('div');
            fallback.className = 'w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary-dark flex items-center justify-center';
            fallback.innerHTML = `
              <div class="text-center p-4">
                <div class="text-2xl font-bold text-black mb-2">${tile.tag || 'CONTENT'}</div>
                <div class="text-sm text-black/80">${tile.title}</div>
              </div>
            `;
            
            if (target.parentElement) {
              target.parentElement.appendChild(fallback);
            }
          }}
        />
        
        {/* Category Badge - Top Left */}
        <div className="absolute top-3 left-3 z-10">
          <Badge 
            variant="secondary" 
            className="bg-primary text-black font-semibold px-3 py-1 text-xs uppercase tracking-wide shadow-lg"
          >
            {tile.tag || 'CONTENT'}
          </Badge>
        </div>
        
        {/* Top Right Icons */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-2 hover:bg-black/60 transition-colors cursor-pointer">
            <Heart className="w-4 h-4 text-white" />
          </div>
          <div className="bg-black/40 backdrop-blur-sm rounded-full p-2 hover:bg-black/60 transition-colors cursor-pointer">
            <Share2 className="w-4 h-4 text-white" />
          </div>
        </div>
        
        {/* Bottom Content - SINGLE INSTANCE */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-4">
          {/* Title */}
          <h3 className="text-white font-semibold text-base mb-1 line-clamp-1">
            {tile.title}
          </h3>
          
          {/* Creator/Byline */}
          {tile.byline && (
            <p className="text-white/70 text-sm mb-2">
              {tile.byline}
            </p>
          )}
          
          {/* Stats - Single Row */}
          <div className="flex items-center justify-between text-white/80 text-sm">
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatViews(tile.views)}</span>
            </div>
            {tile.duration && (
              <div className="flex items-center gap-1">
                <Play className="w-3 h-3" />
                <span>{tile.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};