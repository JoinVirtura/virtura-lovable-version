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
      className={`group relative w-full h-full cursor-pointer overflow-hidden border-2 border-yellow-400/80 hover:border-yellow-400 transition-all duration-300 ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ 
        borderColor: "#FFD700",
        boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)",
        scale: 1.02
      }}
    >
      {/* Full Container - No Gaps */}
      <div className="relative w-full h-full">
        {/* Image fills entire container */}
        <div className="relative w-full h-full overflow-hidden">
          <motion.img
            src={tile.posterUrl}
            alt={tile.title}
            className="absolute inset-0 w-full h-full object-cover"
            animate={{
              scale: isHovered ? 1.08 : 1,
              filter: isHovered 
                ? "brightness(1.1) contrast(1.05) saturate(1.2)" 
                : "brightness(1) contrast(1) saturate(1)",
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.includes('picsum.photos')) {
                target.src = getFallbackImage();
              }
            }}
          />

          {/* Dynamic Overlay with Gold Shimmer */}
          <motion.div 
            className="absolute inset-0"
            animate={{
              background: isHovered 
                ? "linear-gradient(135deg, rgba(255,215,0,0.2) 0%, rgba(0,0,0,0.6) 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)"
            }}
            transition={{ duration: 0.5 }}
          />

          {/* Gold Shimmer Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent"
            animate={{
              x: isHovered ? ["-100%", "100%"] : ["-100%", "-100%"],
              opacity: isHovered ? [0, 0.8, 0] : 0,
            }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 2,
            }}
          />
        </div>

        {/* Animated Category Badge */}
        <motion.div 
          className="absolute top-3 left-3 z-20"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ duration: 0.2 }}
        >
          <Badge className="bg-yellow-400 text-black font-bold text-xs px-3 py-1 rounded-full shadow-lg shadow-yellow-400/50 border border-yellow-500">
            {tile.tag}
          </Badge>
        </motion.div>

        {/* Enhanced Content Overlay with Motion */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10"
          initial={{ y: 20, opacity: 0.8 }}
          animate={{ 
            y: isHovered ? 0 : 10, 
            opacity: isHovered ? 1 : 0.9,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.h3 
            className="text-white font-semibold text-lg leading-tight mb-2 line-clamp-2"
            animate={{
              textShadow: isHovered 
                ? "0 0 10px rgba(255, 215, 0, 0.8)" 
                : "0 2px 4px rgba(0, 0, 0, 0.8)"
            }}
          >
            {tile.title}
          </motion.h3>
          
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-1"
              whileHover={{ scale: 1.05 }}
            >
              <Eye className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-medium text-sm">{formatViews(tile.views)}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-1"
              animate={{ 
                rotate: isHovered ? 360 : 0,
                scale: isHovered ? [1, 1.2, 1] : 1,
              }}
              transition={{ 
                rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                scale: { duration: 1, repeat: Infinity },
              }}
            >
              <Sparkles className="w-4 h-4 text-yellow-400" />
            </motion.div>
          </div>
        </motion.div>

        {/* Corner Gold Accents */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-yellow-400"
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.5,
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-yellow-400"
            animate={{
              opacity: isHovered ? 1 : 0,
              scale: isHovered ? 1 : 0.5,
            }}
            transition={{ duration: 0.3, delay: 0.1 }}
          />
        </div>
      </div>

    </motion.div>
  );
};