import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from "@/components/ui/badge";
import { ContentCardProps } from "../types";
import { Sparkles, Download, Bookmark } from "lucide-react";

export const ContentCard = ({ tile, className = "", size = 'md', onDownload, onSave }: ContentCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePosition({ x, y });
    
    // Calculate distance from center for glow intensity
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
    setGlowIntensity(1 - (distance / maxDistance));
  };

  const getTiltTransform = () => {
    if (!isHovered || !cardRef.current) return {};
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = (mousePosition.y - centerY) / centerY * -12;
    const tiltY = (mousePosition.x - centerX) / centerX * 12;
    
    return {
      transform: `perspective(1200px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${isHovered ? 1.05 : 1}, ${isHovered ? 1.05 : 1}, 1)`,
      transition: 'transform 0.1s ease-out',
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
      initial={{ opacity: 0, scale: 0.9, rotateX: -10 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative w-full h-full cursor-pointer overflow-visible ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setGlowIntensity(0);
      }}
      onMouseMove={handleMouseMove}
      style={{
        transformStyle: 'preserve-3d',
        ...getTiltTransform()
      }}
    >
      {/* Ultra-Advanced Magnetic Glow with Mouse Tracking */}
      <motion.div 
        className="absolute -inset-2 rounded-3xl blur-2xl"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, ${glowIntensity * 0.6}), rgba(217, 70, 239, ${glowIntensity * 0.4}), transparent 60%)`,
          opacity: isHovered ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Pulsing Energy Ring */}
      <motion.div
        className="absolute -inset-1 rounded-3xl border-2 border-purple-500/0 group-hover:border-purple-500/50"
        animate={{
          boxShadow: isHovered ? [
            '0 0 20px rgba(168, 85, 247, 0.3)',
            '0 0 40px rgba(168, 85, 247, 0.6)',
            '0 0 20px rgba(168, 85, 247, 0.3)',
          ] : '0 0 0px rgba(168, 85, 247, 0)',
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
        }}
      />
      
      {/* Main Card Container with 3D Transform */}
      <div 
        className="relative w-full h-full rounded-none overflow-hidden border-2 border-transparent group-hover:border-purple-500/40"
        style={{
          transform: 'translateZ(20px)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Image Container with Advanced Effects */}
        <div className="relative w-full h-full overflow-hidden">
          <motion.img
            src={tile.posterUrl}
            alt={tile.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              filter: isHovered ? 'brightness(1.2) contrast(1.1) saturate(1.2)' : 'brightness(1) contrast(1) saturate(1)',
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

          {/* Multi-Dimensional Overlay System */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-purple-900/40 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.4 }}
          />
          
          <motion.div 
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(168, 85, 247, 0.3), transparent 50%)`,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Holographic Scan Lines */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ y: '-100%' }}
                animate={{ y: '100%' }}
                exit={{ y: '100%' }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-purple-400/20 to-transparent"
              />
            )}
          </AnimatePresence>
          
          {/* Particle Burst Effect */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-purple-400 rounded-full"
                  style={{
                    left: mousePosition.x,
                    top: mousePosition.y,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [1, 0.5, 0],
                    x: [0, (Math.cos(i * 45 * Math.PI / 180)) * 50],
                    y: [0, (Math.sin(i * 45 * Math.PI / 180)) * 50],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Always-Visible Bottom Action Bar */}
        {(onDownload || onSave) && (
          <div 
            className="absolute bottom-0 left-0 right-0 z-30 bg-gradient-to-t from-black/95 via-black/90 to-transparent backdrop-blur-sm"
            style={{ transform: 'translateZ(50px)' }}
          >
            <div className="flex items-center justify-end gap-2 px-4 py-3">
              {onDownload && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onDownload(tile);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 bg-purple-600/90 hover:bg-purple-500 backdrop-blur-xl rounded-lg border border-purple-400/30 shadow-lg hover:shadow-purple-500/50 transition-all duration-300"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-white" />
                </motion.button>
              )}
              
              {onSave && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onSave(tile);
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center justify-center w-10 h-10 bg-fuchsia-600/90 hover:bg-fuchsia-500 backdrop-blur-xl rounded-lg border border-fuchsia-400/30 shadow-lg hover:shadow-fuchsia-500/50 transition-all duration-300"
                  title="Save to Library"
                >
                  <Bookmark className="w-5 h-5 text-white" />
                </motion.button>
              )}
            </div>
          </div>
        )}

        {/* Next-Gen Floating Badge with Magnetic Effect */}
        <motion.div 
          className="absolute top-3 left-3 z-20"
          animate={{
            y: isHovered ? -4 : 0,
            scale: isHovered ? 1.15 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{
            transform: 'translateZ(40px)',
          }}
        >
          <div className="relative">
            {/* Dynamic Glow Behind Badge */}
            <motion.div 
              className="absolute inset-0 rounded-full blur-xl"
              animate={{
                boxShadow: isHovered ? [
                  '0 0 20px rgba(168, 85, 247, 0.6)',
                  '0 0 40px rgba(168, 85, 247, 0.9)',
                  '0 0 20px rgba(168, 85, 247, 0.6)',
                ] : '0 0 10px rgba(168, 85, 247, 0.3)',
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            />
            
            <motion.div
              animate={{
                rotate: isHovered ? [0, 5, -5, 0] : 0,
              }}
              transition={{
                duration: 0.5,
                ease: "easeInOut"
              }}
            >
              <Badge className="relative bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 backdrop-blur-xl text-white font-black text-xs px-4 py-1.5 rounded-full border border-white/30 shadow-2xl">
                <motion.span 
                  className="relative z-10"
                  animate={{
                    textShadow: isHovered ? [
                      '0 0 10px rgba(255, 255, 255, 0.5)',
                      '0 0 20px rgba(255, 255, 255, 0.8)',
                      '0 0 10px rgba(255, 255, 255, 0.5)',
                    ] : '0 0 0px rgba(255, 255, 255, 0)',
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                >
                  {tile.tag}
                </motion.span>
              </Badge>
            </motion.div>
          </div>
        </motion.div>

        {/* Title Overlay - positioned above action bar */}
        <motion.div 
          className="absolute bottom-16 left-0 right-0 px-4 z-20 pointer-events-none"
          style={{
            transform: 'translateZ(30px)',
          }}
          animate={{
            y: isHovered ? -5 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <motion.h3 
            className="text-white font-black text-base leading-tight line-clamp-2 drop-shadow-[0_2px_12px_rgba(0,0,0,1)]"
            animate={{
              color: isHovered ? '#e9d5ff' : '#ffffff',
            }}
            transition={{ duration: 0.3 }}
          >
            {tile.title}
          </motion.h3>
        </motion.div>
      </div>

    </motion.div>
  );
};