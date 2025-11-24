import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

interface RecommendationCardProps {
  thumbnail: string;
  title: string;
  creator: string;
  matchScore: number;
  reason: string;
  onClick: () => void;
}

export function RecommendationCard({ thumbnail, title, creator, matchScore, reason, onClick }: RecommendationCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden cursor-pointer bg-card/30 backdrop-blur-xl border border-primary/10 hover:border-primary/30 transition-all"
    >
      <div className="aspect-square relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-2 right-2 bg-gradient-to-r from-cyan-500 to-blue-500">
          <Sparkles className="w-3 h-3 mr-1" />
          {matchScore}% match
        </Badge>
      </div>
      
      <div className="p-3">
        <h4 className="font-semibold text-sm mb-1 truncate">{title}</h4>
        <p className="text-xs text-muted-foreground mb-2">{creator}</p>
        <p className="text-xs text-cyan-400 italic truncate">{reason}</p>
      </div>
    </motion.div>
  );
}
