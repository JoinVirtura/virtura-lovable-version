import { Button } from '@/components/ui/button';
import { Plus, Grid3x3, List, Sparkles, Users, TrendingUp, Clock, Play } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { FeedContainer } from '@/components/social/FeedContainer';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { SearchBar } from '@/components/social/SearchBar';
import { StoryRing } from '@/components/social/StoryRing';
import { FilterChip } from '@/components/social/FilterChip';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { StoryViewer } from '@/components/social/StoryViewer';
import { useStoryViewer } from '@/hooks/useStoryViewer';
import { ContentPreviewCard } from '@/components/social/ContentPreviewCard';
import { CreatorCard } from '@/components/social/CreatorCard';
import { ContinueWatchingCard } from '@/components/social/ContinueWatchingCard';
import { RecommendationCard } from '@/components/social/RecommendationCard';
import { ContinueWatchingSection } from '@/components/social/ContinueWatchingSection';
import { AIRecommendations } from '@/components/social/AIRecommendations';

const stories = [
  {
    id: '1',
    userId: 'c75cfca4-8d6f-479a-bed5-0a7362541998', // Erosynth Labs - Real profile
    username: 'Erosynth Labs',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    hasStory: true,
    isVerified: true,
    storyCount: 3,
    stories: [
      { id: 's1', content_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400', content_type: 'image' as const },
      { id: 's2', content_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400', content_type: 'image' as const },
      { id: 's3', content_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400', content_type: 'image' as const },
    ]
  },
  {
    id: '2',
    userId: '357de30c-916f-4f54-bc2e-b32a7f7a01f0', // Jahi Bentley - Real profile
    username: 'Jahi Bentley',
    avatar: 'https://logo.clearbit.com/nike.com',
    hasStory: true,
    isBrand: true,
    storyCount: 5,
    stories: [
      { id: 's4', content_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', content_type: 'image' as const },
      { id: 's5', content_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400', content_type: 'image' as const },
    ]
  },
  {
    id: '3',
    userId: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6', // Golden Gleich - Real profile
    username: 'Golden Gleich',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    hasStory: true,
    storyCount: 2,
    stories: [
      { id: 's6', content_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', content_type: 'image' as const },
    ]
  }
];

const featuredCreators = [
  {
    id: '1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
    name: 'Emma Wilson',
    category: 'Fashion',
    followers: '245K',
    isFollowing: false
  },
  {
    id: '2',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&h=100&fit=crop',
    name: 'Marcus Chen',
    category: 'Tech Reviews',
    followers: '892K',
    isFollowing: false
  },
  {
    id: '3',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop',
    name: 'Sofia Garcia',
    category: 'Travel',
    followers: '567K',
    isFollowing: true
  },
  {
    id: '4',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=100&h=100&fit=crop',
    name: 'James Parker',
    category: 'Fitness',
    followers: '423K',
    isFollowing: false
  }
];

export default function SocialFeed() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [feedType, setFeedType] = useState<'all' | 'following' | 'trending'>('all');
  const [layout, setLayout] = useState<'list' | 'grid'>('list');
  const { isOpen, initialIndex, openStory, closeStory } = useStoryViewer();
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Filter out the current user's story since they appear as "Your Story"
  const filteredStories = stories.filter(story => story.userId !== user?.id);

  return (
    <div ref={containerRef} className="container mx-auto px-4 md:px-6 py-4 md:py-6 space-y-4 md:space-y-6 max-w-5xl scroll-smooth">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 z-50 origin-left"
        style={{ scaleX: scrollProgress / 100 }}
        initial={{ scaleX: 0 }}
      />

      {/* Header */}
      <motion.div 
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Social Feed
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Discover and share content from creators
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
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
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 px-1 scrollbar-hide snap-x snap-mandatory">
          <div className="snap-start">
            <StoryRing
              avatar={profile?.avatar_url}
              username={profile?.display_name || user?.email}
              isYourStory
              onClick={() => setCreateModalOpen(true)}
            />
          </div>
          {filteredStories.map((story, index) => (
            <div key={story.id} className="snap-start">
              <StoryRing
                avatar={story.avatar}
                username={story.username}
                hasStory={story.hasStory}
                isVerified={story.isVerified}
                isBrand={story.isBrand}
                storyCount={story.storyCount}
                onClick={() => openStory(index)}
              />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Content Preview Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-6">
          <ContentPreviewCard
            type="video"
            thumbnail="https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400"
            title="Tech Reviews"
            viewCount="2.4M"
            gradient="from-blue-500 to-cyan-500"
          />
          <ContentPreviewCard
            type="animation"
            thumbnail="https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400"
            title="Motion Graphics"
            viewCount="1.8M"
            gradient="from-purple-500 to-pink-500"
          />
          <ContentPreviewCard
            type="photography"
            thumbnail="https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400"
            title="Visual Stories"
            viewCount="3.2M"
            gradient="from-orange-500 to-red-500"
          />
        </div>
      </motion.div>

      {/* Continue Watching Section */}
      <ContinueWatchingSection />

      {/* AI Recommendations */}
      <AIRecommendations />

      {/* Featured Creators Section */}
      <motion.div
        className="mb-8 p-6 rounded-3xl bg-gradient-to-br from-violet-900/30 to-purple-900/30 backdrop-blur-xl border border-primary/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
          <h3 className="font-semibold text-lg">Featured Creators</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {featuredCreators.map(creator => (
            <CreatorCard
              key={creator.id}
              avatar={creator.avatar}
              name={creator.name}
              category={creator.category}
              followers={creator.followers}
              isFollowing={creator.isFollowing}
              onFollow={() => console.log('Follow', creator.id)}
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
        className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <FilterChip
          className="snap-start whitespace-nowrap"
          active={feedType === 'all'}
          icon={<Sparkles className="h-4 w-4" />}
          onClick={() => setFeedType('all')}
        >
          For You
        </FilterChip>
        <FilterChip
          className="snap-start whitespace-nowrap"
          active={feedType === 'following'}
          icon={<Users className="h-4 w-4" />}
          onClick={() => setFeedType('following')}
        >
          Following
        </FilterChip>
        <FilterChip
          className="snap-start whitespace-nowrap"
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

      {/* Story Viewer */}
      <StoryViewer
        isOpen={isOpen}
        onClose={closeStory}
        stories={filteredStories}
        initialStoryIndex={initialIndex}
      />
    </div>
  );
}
