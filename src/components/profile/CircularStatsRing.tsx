import { motion } from "framer-motion";
import { useState } from "react";
import { Eye, Heart, Users, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatRingProps {
  value: number;
  maxValue: number;
  label: string;
  icon: React.ReactNode;
  color: string;
  delay?: number;
}

function StatRing({ value, maxValue, label, icon, color, delay = 0 }: StatRingProps) {
  const [isHovered, setIsHovered] = useState(false);
  const percentage = Math.min((value / maxValue) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: "spring", stiffness: 100 }}
      className="relative flex flex-col items-center group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect */}
      <motion.div
        animate={{ opacity: isHovered ? 0.6 : 0.2 }}
        className={cn("absolute inset-0 blur-2xl rounded-full", color)}
        style={{ background: `conic-gradient(from 0deg, ${color.replace('bg-', 'var(--')})` }}
      />

      <div className="relative w-28 h-28 md:w-32 md:h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* Background ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-white/5"
          />
          {/* Progress ring */}
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            className={color}
            style={{
              strokeDasharray: circumference,
            }}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className={cn("mb-1", color.replace("stroke-", "text-"))}
          >
            {icon}
          </motion.div>
          <motion.span
            className="text-lg md:text-xl font-bold text-white"
            animate={{ scale: isHovered ? 1.1 : 1 }}
          >
            {formatNumber(value)}
          </motion.span>
        </div>
      </div>

      <motion.span
        className="mt-2 text-xs md:text-sm text-muted-foreground font-medium"
        animate={{ y: isHovered ? -2 : 0 }}
      >
        {label}
      </motion.span>

      {/* Hover tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 10 }}
        className="absolute -bottom-16 bg-black/90 backdrop-blur-xl rounded-lg px-3 py-2 text-xs border border-white/10 z-10 whitespace-nowrap"
      >
        <div className="text-white font-medium">{value.toLocaleString()}</div>
        <div className="text-muted-foreground">{percentage.toFixed(1)}% of goal</div>
      </motion.div>
    </motion.div>
  );
}

interface CircularStatsRingProps {
  views: number;
  likes: number;
  followers: number;
  engagement: number;
}

export function CircularStatsRing({ views, likes, followers, engagement }: CircularStatsRingProps) {
  const stats = [
    {
      value: views,
      maxValue: 1000000,
      label: "Views",
      icon: <Eye className="w-5 h-5" />,
      color: "stroke-violet-500 text-violet-400",
    },
    {
      value: likes,
      maxValue: 100000,
      label: "Likes",
      icon: <Heart className="w-5 h-5" />,
      color: "stroke-pink-500 text-pink-400",
    },
    {
      value: followers,
      maxValue: 50000,
      label: "Followers",
      icon: <Users className="w-5 h-5" />,
      color: "stroke-cyan-500 text-cyan-400",
    },
    {
      value: engagement,
      maxValue: 100,
      label: "Engagement",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "stroke-emerald-500 text-emerald-400",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-violet-950/20 to-slate-900/80 backdrop-blur-xl overflow-hidden"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative mb-6">
        <h3 className="text-lg font-semibold text-white">Performance Dashboard</h3>
        <p className="text-xs text-muted-foreground">Real-time analytics</p>
      </div>

      {/* Stats Grid */}
      <div className="relative grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
        {stats.map((stat, index) => (
          <StatRing key={stat.label} {...stat} delay={index * 0.1} />
        ))}
      </div>

      {/* Live indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-4 right-4 flex items-center gap-2"
      >
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-xs text-emerald-400 font-medium">Live</span>
      </motion.div>
    </motion.div>
  );
}
