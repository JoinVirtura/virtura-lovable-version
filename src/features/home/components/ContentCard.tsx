import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { ContentCardProps } from "../types";
import { Heart, Share2, Play, Eye, Sparkles } from "lucide-react";

export const ContentCard = ({ tile, className = "", size = 'md' }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.25, 0, 1] }}
      className={`group relative w-full h-full overflow-hidden cursor-pointer ${className}`}
      style={{ 
        perspective: '1000px',
        margin: 0,
        padding: 0,
        border: 'none',
        outline: 'none'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Revolutionary Glow Field */}
      <motion.div
        className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        animate={{
          background: isHovered 
            ? `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255, 215, 0, 0.3) 0%, transparent 70%)`
            : 'transparent'
        }}
        transition={{ duration: 0.3 }}
      />

      {/* Main Card Container - ZERO GAPS */}
      <motion.div
        className="relative w-full h-full overflow-hidden bg-gradient-to-br from-card/90 to-card/60 backdrop-blur-xl border border-border/20"
        style={getTiltTransform()}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Advanced Background Mesh */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%)
            `
          }}
        />

        {/* Premium Image Container */}
        <div className="relative w-full h-full overflow-hidden">
          <motion.img
            src={tile.posterUrl}
            alt={tile.title}
            className="absolute inset-0 w-full h-full object-cover"
            animate={isHovered ? {
              scale: 1.08,
              filter: 'brightness(1.1) contrast(1.05) saturate(1.2)',
            } : {
              scale: 1,
              filter: 'brightness(1) contrast(1) saturate(1)',
            }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'absolute inset-0 w-full h-full bg-gradient-to-br from-primary via-primary/80 to-primary-dark flex items-center justify-center';
              fallback.innerHTML = `
                <div class="text-center p-6">
                  <div class="text-3xl font-bold text-black mb-2">${tile.tag || 'CONTENT'}</div>
                  <div class="text-lg font-medium text-black/80">${tile.title}</div>
                </div>
              `;
              if (target.parentElement) {
                target.parentElement.appendChild(fallback);
              }
            }}
          />

          {/* Dynamic Gradient Overlays */}
          <motion.div 
            className="absolute inset-0"
            animate={isHovered ? {
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.3), transparent)'
            } : {
              background: 'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1), transparent)'
            }}
            transition={{ duration: 0.5 }}
          />
          
          {/* Holographic Effect */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />

          {/* Revolutionary Particle System */}
          <AnimatePresence>
            {isHovered && (
              <>
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-primary/70 rounded-full"
                    initial={{ 
                      opacity: 0, 
                      x: Math.random() * 300, 
                      y: Math.random() * 200,
                      scale: 0 
                    }}
                    animate={{ 
                      opacity: [0, 1, 0],
                      x: Math.random() * 300,
                      y: Math.random() * 200,
                      scale: [0, 1.5, 0]
                    }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ 
                      duration: 2 + Math.random() * 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: i * 0.15
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Ultra-Premium Badge System */}
        <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Badge className="bg-primary text-black border-none backdrop-blur-md px-4 py-2 font-bold text-sm uppercase tracking-wider shadow-2xl shadow-primary/30 hover:scale-110 transition-all duration-300">
              {tile.tag}
            </Badge>
          </motion.div>

          {/* Advanced Action Panel */}
          <motion.div
            className="flex items-center gap-2 opacity-0 group-hover:opacity-100"
            initial={{ x: 20 }}
            animate={{ x: isHovered ? 0 : 20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary/30 transition-all cursor-pointer"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="w-5 h-5 text-white" />
            </motion.div>
            <motion.div
              className="w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-primary/30 transition-all cursor-pointer"
              whileHover={{ scale: 1.1, rotate: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>
        </div>

        {/* Ultra-Sophisticated Content Footer */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 p-6 z-20"
          initial={{ y: 20, opacity: 0.8 }}
          animate={isHovered ? { y: 0, opacity: 1 } : { y: 20, opacity: 0.8 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="space-y-3">
            {/* Premium Title Design */}
            <motion.h3 
              className="text-white font-bold text-xl leading-tight line-clamp-2 tracking-wide drop-shadow-2xl"
              animate={isHovered ? { 
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                color: '#ffffff'
              } : {
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.8)',
                color: '#ffffff'
              }}
              transition={{ duration: 0.3 }}
            >
              {tile.title}
            </motion.h3>
            
            {/* Creator Badge */}
            {tile.byline && (
              <motion.p 
                className="text-primary font-semibold text-sm tracking-wide drop-shadow-lg"
                animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                by {tile.byline}
              </motion.p>
            )}
            
            {/* Advanced Stats Row */}
            <div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="text-white font-bold text-sm">{formatViews(tile.views)}</span>
                </div>
                {tile.duration && (
                  <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 ml-2">
                    <Play className="w-4 h-4 text-primary" />
                    <span className="text-white font-bold text-sm">{tile.duration}</span>
                  </div>
                )}
              </motion.div>

              {/* Floating Sparkle Effect */}
              <motion.div
                animate={isHovered ? { 
                  rotate: 360,
                  scale: [1, 1.2, 1]
                } : { rotate: 0, scale: 1 }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 1, repeat: Infinity }
                }}
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Revolutionary Edge Effects */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Corner Accent Lines */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-2 border-t-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-2 border-b-2 border-primary opacity-0 group-hover:opacity-100 transition-all duration-700" />
          
          {/* Revolutionary Shimmer Sweep */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            animate={{
              x: isHovered ? ['-100%', '100%'] : ['-100%', '-100%'],
              opacity: isHovered ? [0, 0.8, 0] : 0
            }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
              repeat: isHovered ? Infinity : 0,
              repeatDelay: 2.5
            }}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};