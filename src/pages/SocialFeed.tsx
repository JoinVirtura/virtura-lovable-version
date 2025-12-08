import { Button } from '@/components/ui/button';
import { Plus, Sparkles, Users, TrendingUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { FeedContainer } from '@/components/social/FeedContainer';
import { CreatePostModal } from '@/components/social/CreatePostModal';
import { StoryRing } from '@/components/social/StoryRing';
import { FeedBackground } from '@/components/social/FeedBackground';
import { FeedOnboardingTutorial } from '@/components/social/FeedOnboardingTutorial';
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
  const [showOnboarding, setShowOnboarding] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if onboarding should be shown
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('feedOnboardingComplete');
    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

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
    <>
      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <FeedOnboardingTutorial onComplete={() => setShowOnboarding(false)} />
      )}

      <div ref={containerRef} className="min-h-screen bg-background relative">
      {/* Animated Background */}
      <FeedBackground />

      {/* Scroll Progress Indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary-blue z-50 origin-left shadow-[0_0_20px_hsl(270_100%_70%/0.5)]"
        style={{ scaleX: scrollProgress / 100 }}
        initial={{ scaleX: 0 }}
      />

      {/* Glassmorphic Sticky Header */}
      <div className="sticky top-0 z-40 backdrop-blur-2xl bg-gradient-to-b from-background/95 via-background/80 to-background/60 border-b border-white/5">
        {/* Energy Flow Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary/5 via-secondary/5 to-primary-blue/5"
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>

        {/* Stories Bar */}
        <div className="px-4 py-4 relative">
          <div className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory max-w-4xl mx-auto pb-1">
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

        {/* Filter Tabs with Neon Glow */}
        <div className="flex justify-center border-t border-white/5 relative">
          <div className="flex max-w-md w-full">
            {[
              { type: 'all', label: 'For You', icon: Sparkles },
              { type: 'following', label: 'Following', icon: Users },
              { type: 'trending', label: 'Trending', icon: TrendingUp },
            ].map(({ type, label, icon: Icon }) => (
              <button
                key={type}
                onClick={() => setFeedType(type as typeof feedType)}
                className={`flex-1 py-3 text-sm font-medium transition-all relative group ${
                  feedType === type 
                    ? 'text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Icon className={`h-4 w-4 transition-all ${feedType === type ? 'text-primary' : ''}`} />
                  {label}
                </span>
                {feedType === type && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary shadow-[0_0_10px_hsl(270_100%_70%/0.6)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="pb-24 relative z-10">
        <FeedContainer filterType={feedType} onFilterChange={setFeedType} />
      </div>

      {/* Floating Create Button with Neon Glow */}
      <motion.div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            size="lg"
            onClick={() => setCreateModalOpen(true)}
            className="h-14 px-8 rounded-full bg-gradient-to-r from-primary via-secondary to-primary-blue hover:from-primary/90 hover:via-secondary/90 hover:to-primary-blue/90 shadow-[0_0_40px_hsl(270_100%_70%/0.5)] text-primary-foreground font-semibold gap-2 border border-white/20 relative overflow-hidden group"
          >
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <Plus className="h-5 w-5 relative z-10" />
            <span className="relative z-10">Create</span>
          </Button>
        </motion.div>
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
    </>
  );
}
