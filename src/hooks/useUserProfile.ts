import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  follower_count: number;
  following_count: number;
  is_following: boolean;
}

export function useUserProfile(userId: string) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;

        // Fetch follower/following counts
        const [followersRes, followingRes, isFollowingRes] = await Promise.all([
          supabase
            .from('follows')
            .select('id', { count: 'exact', head: true })
            .eq('following_id', userId),
          supabase
            .from('follows')
            .select('id', { count: 'exact', head: true })
            .eq('follower_id', userId),
          user ? supabase
            .from('follows')
            .select('id')
            .eq('follower_id', user.id)
            .eq('following_id', userId)
            .maybeSingle() : Promise.resolve({ data: null })
        ]);

        setProfile({
          id: profileData.id,
          full_name: profileData.display_name || 'Unknown User',
          avatar_url: profileData.avatar_url || undefined,
          follower_count: followersRes.count || 0,
          following_count: followingRes.count || 0,
          is_following: !!isFollowingRes.data
        });

        // Fetch user's posts
        const { data: postsData } = await supabase
          .from('social_posts')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(12);

        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, user?.id]);

  return { profile, posts, loading };
}
