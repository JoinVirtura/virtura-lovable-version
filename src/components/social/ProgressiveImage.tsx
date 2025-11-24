import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onError?: () => void;
}

export function ProgressiveImage({ src, alt, className = '', onError }: ProgressiveImageProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;
    
    img.onload = () => {
      setImageLoaded(true);
    };
    
    img.onerror = () => {
      setError(true);
      onError?.();
    };

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, onError]);

  if (error) {
    return (
      <div className={`flex items-center justify-center text-muted-foreground bg-muted ${className}`}>
        Failed to load image
      </div>
    );
  }

  return (
    <>
      {/* Blur placeholder */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-xl ${className}`}
        initial={{ opacity: 1 }}
        animate={{ opacity: imageLoaded ? 0 : 1 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Actual image */}
      <motion.img
        src={src}
        alt={alt}
        className={className}
        initial={{ opacity: 0 }}
        animate={{ opacity: imageLoaded ? 1 : 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        loading="lazy"
      />
    </>
  );
}
