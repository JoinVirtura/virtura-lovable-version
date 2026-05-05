import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ImageGenerationSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {[1].map((index) => (
        <Card
          key={index}
          className="relative overflow-hidden group hover:shadow-xl transition-all duration-300"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className="relative aspect-square">
            {/* Image Skeleton */}
            <Skeleton className="absolute inset-0 w-full h-full" />
            
            {/* Shimmer Effect Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
            
            {/* Loading Indicator */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                <Skeleton className="h-4 w-32 mx-auto" />
              </div>
            </div>
          </div>
          
          {/* Bottom Info Skeleton */}
          <div className="p-4 space-y-2 bg-card/50 backdrop-blur-sm">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
