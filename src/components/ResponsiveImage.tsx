import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  style?: React.CSSProperties;
}

export function ResponsiveImage({ 
  src, 
  alt, 
  className,
  priority = false,
  style
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className={cn('bg-muted animate-pulse flex items-center justify-center', className)}>
        <span className="text-muted-foreground text-xs">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      style={style}
      className={cn(
        'transition-opacity duration-300',
        isLoaded ? 'opacity-100' : 'opacity-0',
        className
      )}
      onLoad={() => setIsLoaded(true)}
      onError={() => setError(true)}
    />
  );
}
