import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileResponsiveContainerProps {
  children: ReactNode;
  className?: string;
}

export function MobileResponsiveContainer({ children, className }: MobileResponsiveContainerProps) {
  return (
    <div className={cn(
      "container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 w-full",
      className
    )}>
      {children}
    </div>
  );
}
