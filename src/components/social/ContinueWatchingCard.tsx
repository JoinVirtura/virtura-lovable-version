import { motion } from 'framer-motion';
import { Play } from 'lucide-react';

interface ContinueWatchingCardProps {
  thumbnail: string;
  title: string;
  progress: number;
  duration: string;
  onClick: () => void;
}

export function ContinueWatchingCard({ thumbnail, title, progress, duration, onClick }: ContinueWatchingCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className="aspect-video relative">
        <img
          src={thumbnail}
          alt={title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl flex items-center justify-center">
            <Play className="w-8 h-8 text-white fill-white" />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <div
            className="h-full bg-violet-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Duration */}
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white">
          {duration}
        </div>
      </div>
      
      <div className="p-2">
        <p className="text-sm font-medium truncate">{title}</p>
      </div>
    </motion.div>
  );
}
