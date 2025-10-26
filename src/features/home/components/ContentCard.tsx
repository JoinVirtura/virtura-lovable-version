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
      style={getTiltTransform()}
    >
      {/* Magnetic Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 group-hover:scale-105" />
      
      {/* Full Container - No Gaps */}
      <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-purple-500/30 transition-all duration-300">
        {/* Image fills entire container */}
        <div className="relative w-full h-full overflow-hidden">
          <img
            src={tile.posterUrl}
            alt={tile.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:brightness-110"
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes('picsum.photos')) {
                target.src = getFallbackImage();
              }
            }}
          />

          {/* Advanced Multi-Layer Overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-purple-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-fuchsia-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Holographic scan line effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-400/10 to-transparent h-full animate-scan-matrix-1" />
          </div>
        </div>

        {/* Futuristic Floating Badge */}
        <div className="absolute top-3 left-3 z-20 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-300">
          <div className="relative">
            {/* Glow effect behind badge */}
            <div className="absolute inset-0 bg-purple-500 rounded-full blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300" />
            <Badge className="relative bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 backdrop-blur-xl text-white font-black text-xs px-4 py-1.5 rounded-full border border-white/20 shadow-2xl shadow-purple-500/50 group-hover:shadow-purple-500/80 transition-all duration-300">
              <span className="relative z-10">{tile.tag}</span>
            </Badge>
          </div>
        </div>

        {/* Enhanced Content Overlay with Glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent z-10 backdrop-blur-sm">
          <h3 className="text-white font-bold text-lg leading-tight mb-3 line-clamp-2 group-hover:text-purple-200 transition-colors duration-300">
            {tile.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-400/20 group-hover:border-purple-400/50 transition-all duration-300">
              <Eye className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
              <span className="text-white font-bold text-sm">{formatViews(tile.views)}</span>
            </div>
            
            <div className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-400/30 group-hover:border-purple-400/60 transition-all duration-300">
              <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300 animate-pulse" />
              <span className="text-purple-300 font-bold text-xs">HOT</span>
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  );
};