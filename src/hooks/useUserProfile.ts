import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface UserProfile {
  id: string;
  full_name: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  is_verified: boolean;
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
    if (!userId || userId.trim() === '') {
      console.log('useUserProfile: No userId provided, skipping fetch');
      setLoading(false);
      return;
    }
    
    console.log('useUserProfile: Fetching profile for userId:', userId);
    setLoading(true);
    try {
      // Fetch user profile
      let { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        // If profile doesn't exist, try to create it for existing users
        if (profileError.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({ id: userId, display_name: 'User' });
          
          if (!insertError) {
            // Retry fetching after creation
            const { data: retryData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', userId)
              .single();
            
            if (retryData) {
              profileData = retryData;
            }
          }
        }
        
        if (!profileData) throw profileError;
      }

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
        display_name: profileData.display_name || 'Unknown User',
        username: profileData.display_name?.toLowerCase().replace(/\s+/g, '') || profileData.id.substring(0, 8),
        avatar_url: profileData.avatar_url || '',
        bio: profileData.bio || '',
        is_verified: false, // TODO: Add is_verified column to profiles table
        follower_count: followersRes.count || 0,
        following_count: followingRes.count || 0,
        is_following: !!isFollowingRes.data,
      });

      // Fetch user's posts
      const { data: postsData, error: postsError } = await supabase
        .from('social_posts')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(12);

      if (postsError) {
        console.error('Posts fetch error:', postsError);
      }
      
      console.log('useUserProfile: Fetched posts:', postsData?.length || 0, 'for userId:', userId);
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
