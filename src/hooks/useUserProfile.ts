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

  const fetchProfile = async () => {
    if (!userId) return;
    
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
        is_following: !!isFollowingRes.data,
        bio: profileData.bio,
        website_url: profileData.website_url,
      } as any);

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

  useEffect(() => {
    fetchProfile();
  }, [userId, user?.id]);

  const updateProfile = async (updates: {
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    website_url?: string;
  }) => {
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    
    // Refetch profile to update UI
    fetchProfile();
    return data;
  };

  const uploadAvatar = async (file: File) => {
    if (!user) throw new Error('User not authenticated');
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const refetch = () => {
    if (userId) fetchProfile();
  };

  return { profile, posts, loading, updateProfile, uploadAvatar, refetch };
}
