import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { ContentCardProps } from "../types";
import { Heart, Share2, Play, Eye, Sparkles } from "lucide-react";

export const ContentCard = ({ tile, className = "", size = 'md' }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatViews = (views?: number) => {
    if (!views) return '0';
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const getTiltTransform = () => {
    if (!isHovered || !cardRef.current) return {};
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (mousePosition.y - centerY) / centerY * -8;
    const tiltY = (mousePosition.x - centerX) / centerX * 8;
    
    return {
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(${isHovered ? 1.02 : 1})`,
    };
  };

  // Generate reliable fallback image URL
  const getFallbackImage = () => {
    const hash = tile.id.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return `https://picsum.photos/800/600?random=${Math.abs(hash)}`;
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group relative w-full h-full cursor-pointer overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Full Container - No Gaps */}
      <div className="relative w-full h-full">
        {/* Image fills entire container */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={tile.posterUrl}
            alt={tile.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes('picsum.photos')) {
                target.src = getFallbackImage();
              }
            }}
          />

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 left-3 z-20">
          <Badge className="bg-purple-500/90 backdrop-blur-md text-white font-bold text-xs px-3 py-1 rounded-full border border-purple-400/30 shadow-lg shadow-purple-500/20">
            {tile.tag}
          </Badge>
        </div>

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10">
          <h3 className="text-white font-semibold text-lg leading-tight mb-2 line-clamp-2">
            {tile.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium text-sm">{formatViews(tile.views)}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};