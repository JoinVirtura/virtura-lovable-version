import { motion } from 'framer-motion';
import { RecommendationCard } from './RecommendationCard';
import { Sparkles } from 'lucide-react';

const mockRecommendations = [
  {
    id: '1',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    title: 'Advanced Motion Design',
    creator: 'Alex Rivera',
    matchScore: 94,
    reason: 'Because you liked Motion Design Basics'
  },
  {
    id: '2',
    thumbnail: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    title: 'Street Fashion Photography',
    creator: 'Emma Chen',
    matchScore: 89,
    reason: 'Popular with creators you follow'
  },
  {
    id: '3',
    thumbnail: 'https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400',
    title: 'Creative Workflow 2024',
    creator: 'Marcus Tech',
    matchScore: 87,
    reason: 'Trending in your interests'
  },
  {
    id: '4',
    thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    title: 'Product Photography Mastery',
    creator: 'Sarah Johnson',
    matchScore: 85,
    reason: 'Based on your recent searches'
  },
  {
    id: '5',
    thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400',
    title: 'Tech Review: Latest Gear',
    creator: 'David Park',
    matchScore: 82,
    reason: 'Similar to videos you saved'
  },
  {
    id: '6',
    thumbnail: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400',
    title: 'Fashion Week Backstage',
    creator: 'Lisa Wong',
    matchScore: 80,
    reason: 'New from creators you follow'
  },
];

export function AIRecommendations() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500">
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Recommendations</h2>
          <p className="text-sm text-muted-foreground">Curated just for you</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {mockRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <RecommendationCard
              thumbnail={rec.thumbnail}
              title={rec.title}
              creator={rec.creator}
              matchScore={rec.matchScore}
              reason={rec.reason}
              onClick={() => console.log('View recommendation:', rec.id)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
