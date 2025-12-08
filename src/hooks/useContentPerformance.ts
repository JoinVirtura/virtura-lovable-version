import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface ContentPost {
  id: string;
  caption: string;
  mediaUrl: string | null;
  mediaType: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  unlockCount: number;
  revenue: number;
  createdAt: string;
}

interface ContentPerformanceStats {
  posts: ContentPost[];
  topByRevenue: ContentPost[];
  topByViews: ContentPost[];
  totalViews: number;
  totalLikes: number;
  totalUnlocks: number;
  totalRevenue: number;
  engagementRate: number;
  unlockConversionRate: number;
  revenuePerThousandViews: number;
}

export function useContentPerformance() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ContentPerformanceStats>({
    posts: [],
    topByRevenue: [],
    topByViews: [],
    totalViews: 0,
    totalLikes: 0,
    totalUnlocks: 0,
    totalRevenue: 0,
    engagementRate: 0,
    unlockConversionRate: 0,
    revenuePerThousandViews: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContentPerformance = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get user's posts
        const { data: posts, error: postsError } = await supabase
          .from('social_posts')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;

        // Get content unlocks for this user's content
        const { data: unlocks, error: unlocksError } = await supabase
          .from('content_unlocks')
          .select('content_id, amount_cents')
          .eq('content_type', 'post');

        if (unlocksError) throw unlocksError;

        // Build unlock map
        const unlockMap = new Map<string, { count: number; revenue: number }>();
        unlocks?.forEach(u => {
          const existing = unlockMap.get(u.content_id) || { count: 0, revenue: 0 };
          existing.count += 1;
          existing.revenue += u.amount_cents / 100;
          unlockMap.set(u.content_id, existing);
        });

        // Map posts with unlock data
        const mappedPosts: ContentPost[] = (posts || []).map(p => {
          const unlockData = unlockMap.get(p.id) || { count: 0, revenue: 0 };
          const mediaUrls = p.media_urls as string[] | null;
          return {
            id: p.id,
            caption: p.caption || '',
            mediaUrl: mediaUrls?.[0] || null,
            mediaType: p.content_type || 'image',
            viewCount: p.view_count || 0,
            likeCount: p.like_count || 0,
            commentCount: p.comment_count || 0,
            unlockCount: unlockData.count,
            revenue: unlockData.revenue,
            createdAt: p.created_at || '',
          };
        });

        // Calculate totals
        const totalViews = mappedPosts.reduce((sum, p) => sum + p.viewCount, 0);
        const totalLikes = mappedPosts.reduce((sum, p) => sum + p.likeCount, 0);
        const totalUnlocks = mappedPosts.reduce((sum, p) => sum + p.unlockCount, 0);
        const totalRevenue = mappedPosts.reduce((sum, p) => sum + p.revenue, 0);

        // Sort for top lists
        const topByRevenue = [...mappedPosts].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
        const topByViews = [...mappedPosts].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5);

        setStats({
          posts: mappedPosts,
          topByRevenue,
          topByViews,
          totalViews,
          totalLikes,
          totalUnlocks,
          totalRevenue,
          engagementRate: totalViews > 0 ? (totalLikes / totalViews) * 100 : 0,
          unlockConversionRate: totalViews > 0 ? (totalUnlocks / totalViews) * 100 : 0,
          revenuePerThousandViews: totalViews > 0 ? (totalRevenue / totalViews) * 1000 : 0,
        });
      } catch (error) {
        console.error('Error fetching content performance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentPerformance();
  }, [user]);

  return { stats, loading };
}
