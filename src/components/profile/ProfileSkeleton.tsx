import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto">
        {/* Header Skeleton */}
        <div className="border-b border-border bg-card p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="flex-1 space-y-4 w-full">
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-10" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-3 gap-4 p-6 border-b border-border">
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-4 w-16 mx-auto" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton className="h-6 w-12 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        </div>

        {/* Posts Grid Skeleton */}
        <div className="grid grid-cols-3 gap-1 p-6">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
