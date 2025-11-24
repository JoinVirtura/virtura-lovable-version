import { Button } from '@/components/ui/button';
import { Plus, Grid3x3, List, Sparkles, Users, TrendingUp, Clock } from 'lucide-react';
import { useState } from 'react';
import { FeedContainer } from '@/components/social/FeedContainer';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { SearchBar } from '@/components/social/SearchBar';
import { StoryRing } from '@/components/social/StoryRing';
import { FilterChip } from '@/components/social/FilterChip';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';

export default function SocialFeed() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [feedType, setFeedType] = useState<'all' | 'following' | 'trending'>('all');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <motion.div 
        className="flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Social Feed
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover and share content from creators
          </p>
        </div>
        <div className="flex gap-2">
          {/* Layout Toggle */}
          <Button
            variant={layout === 'list' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setLayout('list')}
            className="hidden md:flex"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={layout === 'grid' ? 'default' : 'ghost'}
            size="icon"
            onClick={() => setLayout('grid')}
            className="hidden md:flex"
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      {/* Stories Bar */}
      <motion.div
        className="relative"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          <StoryRing
            avatar={profile?.avatar_url}
            username={profile?.display_name || user?.email}
            isYourStory
            onClick={() => setCreateModalOpen(true)}
          />
          {/* Placeholder stories - in real app, fetch from API */}
          {[1, 2, 3, 4, 5].map((i) => (
            <StoryRing
              key={i}
              avatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
              username={`User ${i}`}
              hasStory
            />
          ))}
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <SearchBar />
      </motion.div>

      {/* Filter Chips */}
      <motion.div
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <FilterChip
          active={feedType === 'all'}
          icon={<Sparkles className="h-4 w-4" />}
          onClick={() => setFeedType('all')}
        >
          For You
        </FilterChip>
        <FilterChip
          active={feedType === 'following'}
          icon={<Users className="h-4 w-4" />}
          onClick={() => setFeedType('following')}
        >
          Following
        </FilterChip>
        <FilterChip
          active={feedType === 'trending'}
          icon={<TrendingUp className="h-4 w-4" />}
          onClick={() => setFeedType('trending')}
        >
          Trending
        </FilterChip>
      </motion.div>

      {/* Feed Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <FeedContainer filterType={feedType} onFilterChange={setFeedType} />
      </motion.div>

      {/* Floating Create Button */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 0.5, type: "spring" }}
      >
        <Button
          size="lg"
          onClick={() => setCreateModalOpen(true)}
          className="h-16 w-16 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 shadow-2xl shadow-violet-500/50"
        >
          <Plus className="h-8 w-8" />
        </Button>
      </motion.div>

      <CreatePostModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
