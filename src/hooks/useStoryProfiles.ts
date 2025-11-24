import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoryProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  account_type: string | null;
}

export function useStoryProfiles(userIds: string[]) {
  const [profiles, setProfiles] = useState<Record<string, StoryProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      if (userIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, account_type')
          .in('id', userIds);

        if (error) throw error;

        const profilesMap = data.reduce((acc, profile) => {
          acc[profile.id] = profile;
          return acc;
        }, {} as Record<string, StoryProfile>);

        setProfiles(profilesMap);
      } catch (error) {
        console.error('Failed to fetch story profiles:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProfiles();
  }, [userIds.join(',')]);

  return { profiles, loading };
}
