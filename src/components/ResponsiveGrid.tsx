import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: string;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  cols = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = "gap-4 sm:gap-6",
  className 
}: ResponsiveGridProps) {
  const gridClasses = cn(
    "grid",
    gap,
    cols.mobile && `grid-cols-${cols.mobile}`,
    cols.tablet && `md:grid-cols-${cols.tablet}`,
    cols.desktop && `lg:grid-cols-${cols.desktop}`,
    cols.wide && `xl:grid-cols-${cols.wide}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
}
