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

  // Use library images for richer story content
  const libraryImages = [
    'https://ujaoziqnxhjqlmnvlxav.supabase.co/storage/v1/object/public/virtura-media/generated-avatar-1758477418197.png',
    'https://ujaoziqnxhjqlmnvlxav.supabase.co/storage/v1/object/public/virtura-media/generated-avatar-1758477480137.png',
    'https://ujaoziqnxhjqlmnvlxav.supabase.co/storage/v1/object/public/virtura-media/generated-avatar-1758487483579.png',
    'https://ujaoziqnxhjqlmnvlxav.supabase.co/storage/v1/object/public/virtura-media/generated-avatar-1758537822018.png',
    'https://ujaoziqnxhjqlmnvlxav.supabase.co/storage/v1/object/public/virtura-media/generated-avatar-1758482494489.png',
  ];

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
        { id: 's1', content_url: libraryImages[0], content_type: 'image' as const },
        { id: 's2', content_url: libraryImages[1], content_type: 'image' as const },
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
        { id: 's3', content_url: libraryImages[2], content_type: 'image' as const },
        { id: 's4', content_url: libraryImages[3], content_type: 'image' as const },
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
        { id: 's5', content_url: libraryImages[4], content_type: 'image' as const },
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

      {/* Stories Header - Premium Design */}
        <div className="px-4 pt-10 pb-4 relative">
          <div className="flex items-center gap-2 mb-4 max-w-4xl mx-auto">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
            <h2 className="text-lg font-semibold bg-gradient-to-r from-primary via-secondary to-primary-blue bg-clip-text text-transparent">
              Stories
            </h2>
          </div>
          <div className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory max-w-4xl mx-auto pb-2 px-1">
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
              { type: 'all', label: 'All Posts', icon: Sparkles, activeColor: 'from-violet-500 to-purple-500', glowColor: 'violet' },
              { type: 'following', label: 'Following', icon: Users, activeColor: 'from-blue-500 to-cyan-500', glowColor: 'blue' },
              { type: 'trending', label: 'Trending', icon: TrendingUp, activeColor: 'from-orange-500 to-amber-500', glowColor: 'orange' },
            ].map(({ type, label, icon: Icon, activeColor, glowColor }) => (
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
                  <Icon className={`h-4 w-4 transition-all ${feedType === type ? `text-${glowColor}-500` : ''}`} />
                  {label}
                </span>
                {feedType === type && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r ${activeColor} shadow-[0_0_12px_hsl(var(--primary)/0.6)]`}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {/* Hover glow effect */}
                <div className={`absolute inset-0 ${feedType === type ? `bg-${glowColor}-500/10` : 'bg-primary/5'} opacity-0 group-hover:opacity-100 transition-opacity rounded-lg`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Feed */}
      <div className="pb-24 relative z-10">
        <FeedContainer filterType={feedType} onFilterChange={setFeedType} />
      </div>

      {/* Floating Create Button - Bottom Right Position */}
      <motion.div
        className="fixed bottom-8 right-8 z-50"
        initial={{ scale: 0, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ 
            boxShadow: [
              '0 0 30px hsl(270 100% 70% / 0.4)',
              '0 0 50px hsl(270 100% 70% / 0.6)',
              '0 0 30px hsl(270 100% 70% / 0.4)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-full"
        >
          <Button
            size="lg"
            onClick={() => setCreateModalOpen(true)}
            className="h-16 w-16 rounded-full bg-gradient-to-br from-primary via-secondary to-primary-blue hover:from-primary/90 hover:via-secondary/90 hover:to-primary-blue/90 shadow-2xl text-primary-foreground border border-white/30 relative overflow-hidden group p-0"
          >
            {/* Pulsing glow ring */}
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-secondary opacity-50"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
            <Plus className="h-7 w-7 relative z-10" />
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
