import { ReactNode } from "react";

interface StudioBackgroundProps {
  children: ReactNode;
}

export function StudioBackground({ children }: StudioBackgroundProps) {
  return (
    <div className="w-full bg-gradient-to-br from-[#0F0F1A] via-[#1a1a2e] to-[#0F0F1A] relative overflow-hidden pb-8">
      {/* Ambient particles */}
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full opacity-20 animate-float"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, rgba(139, 92, 246, 0.4) 50%, transparent 100%)`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        />
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
