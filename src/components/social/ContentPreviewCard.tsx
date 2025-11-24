import { motion } from 'framer-motion';
import { Eye } from 'lucide-react';

interface ContentPreviewCardProps {
  type: string;
  thumbnail: string;
  title: string;
  viewCount: string;
  gradient: string;
}

export function ContentPreviewCard({ type, thumbnail, title, viewCount, gradient }: ContentPreviewCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      className="relative aspect-video rounded-2xl overflow-hidden cursor-pointer group"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-80 transition-opacity`} />
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-full object-cover opacity-40"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <div className="flex items-center gap-1 text-sm">
          <Eye className="w-4 h-4" />
          <span>{viewCount} views</span>
        </div>
      </div>
    </motion.div>
  );
}
