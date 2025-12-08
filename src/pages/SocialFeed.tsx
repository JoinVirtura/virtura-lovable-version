import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { FeedContainer } from '@/components/social/FeedContainer';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { StoryRing } from '@/components/social/StoryRing';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { motion } from 'framer-motion';
import { StoryViewer } from '@/components/social/StoryViewer';
import { useStoryViewer } from '@/hooks/useStoryViewer';
import { useStoryProfiles } from '@/hooks/useStoryProfiles';

// Story user IDs for fetching real profiles
const storyUserIds = [
  '357de30c-916f-4f54-bc2e-b32a7f7a01f0', // Jahi Bentley
  'c75cfca4-8d6f-479a-bed5-0a7362541998', // Erosynth Labs
  '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6', // Golden Gleich
];

export default function SocialFeed() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { profiles: storyProfiles } = useStoryProfiles(storyUserIds);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [feedType, setFeedType] = useState<'all' | 'following' | 'trending'>('all');
  const { isOpen, initialIndex, openStory, closeStory } = useStoryViewer();
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const stories = [
    {
      id: '1',
      userId: '357de30c-916f-4f54-bc2e-b32a7f7a01f0',
      username: storyProfiles['357de30c-916f-4f54-bc2e-b32a7f7a01f0']?.display_name || 'Jahi Bentley',
      avatar: storyProfiles['357de30c-916f-4f54-bc2e-b32a7f7a01f0']?.avatar_url || 'https://avatar.iran.liara.run/public',
      hasStory: true,
      isVerified: true,
      storyCount: 5,
      stories: [
        { id: 's1', content_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', content_type: 'image' as const },
        { id: 's2', content_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400', content_type: 'image' as const },
      ]
    },
    {
      id: '2',
      userId: 'c75cfca4-8d6f-479a-bed5-0a7362541998',
      username: storyProfiles['c75cfca4-8d6f-479a-bed5-0a7362541998']?.display_name || 'Erosynth Labs',
      avatar: storyProfiles['c75cfca4-8d6f-479a-bed5-0a7362541998']?.avatar_url || 'https://logo.clearbit.com/nike.com',
      hasStory: true,
      isBrand: storyProfiles['c75cfca4-8d6f-479a-bed5-0a7362541998']?.account_type === 'brand',
      storyCount: 3,
      stories: [
        { id: 's3', content_url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400', content_type: 'image' as const },
      ]
    },
    {
      id: '3',
      userId: '42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6',
      username: storyProfiles['42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6']?.display_name || 'Golden Gleich',
      avatar: storyProfiles['42fb3aaa-4ddb-41a1-adc4-75c9f0da99d6']?.avatar_url || 'https://api.dicebear.com/7.x/avataaars/svg?seed=golden',
      hasStory: true,
      storyCount: 2,
      stories: [
        { id: 's6', content_url: 'https://images.unsplash.com/photo-1508341591423-4347099e1f19?w=400', content_type: 'image' as const },
      ]
    }
  ];

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
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 z-50 origin-left"
        style={{ scaleX: scrollProgress / 100 }}
        initial={{ scaleX: 0 }}
      />

      {/* Sticky Header with Stories and Filters */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50">
        {/* Stories Bar - Compact */}
        <div className="px-4 py-3">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory max-w-4xl mx-auto">
            <div className="snap-start flex-shrink-0">
              <StoryRing
                avatar={profile?.avatar_url}
                username={profile?.display_name || user?.email}
                isYourStory
                onClick={() => setCreateModalOpen(true)}
              />
            </div>
            {filteredStories.map((story, index) => (
              <div key={story.id} className="snap-start flex-shrink-0">
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
        </div>

        {/* Filter Tabs - Twitter/TikTok Style */}
        <div className="flex justify-center border-t border-border/30">
          <div className="flex max-w-md w-full">
            <button
              onClick={() => setFeedType('all')}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                feedType === 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                For You
              </span>
              {feedType === 'all' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500"
                />
              )}
            </button>
            <button
              onClick={() => setFeedType('following')}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                feedType === 'following' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <Users className="h-4 w-4" />
                Following
              </span>
              {feedType === 'following' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500"
                />
              )}
            </button>
            <button
              onClick={() => setFeedType('trending')}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                feedType === 'trending' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="flex items-center justify-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </span>
              {feedType === 'trending' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Feed - Full Focus */}
      <div className="pb-24">
        <FeedContainer filterType={feedType} onFilterChange={setFeedType} />
      </div>

      {/* Floating Create Button - TikTok Style */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <Button
          size="lg"
          onClick={() => setCreateModalOpen(true)}
          className="h-14 px-8 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 hover:from-violet-600 hover:via-purple-600 hover:to-pink-600 shadow-2xl shadow-violet-500/40 text-white font-semibold gap-2"
        >
          <Plus className="h-5 w-5" />
          Create
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