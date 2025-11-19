import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
}

function AnimatedCount({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <>{count.toLocaleString()}</>;
}

export function ProfileStats({ postsCount, followersCount, followingCount }: ProfileStatsProps) {
  const stats = [
    { label: 'Posts', value: postsCount },
    { label: 'Followers', value: followersCount },
    { label: 'Following', value: followingCount },
  ];

  return (
    <div className="flex gap-6 border-b border-border bg-card px-6 py-4">
      {stats.map((stat, index) => (
        <motion.div 
          key={stat.label} 
          className="text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <div className="text-2xl font-bold text-foreground">
            <AnimatedCount value={stat.value} />
          </div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
