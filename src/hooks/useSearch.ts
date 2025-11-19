import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface SearchResults {
  users: any[];
  posts: any[];
  hashtags: string[];
}

export function useSearch() {
  const [results, setResults] = useState<SearchResults>({
    users: [],
    posts: [],
    hashtags: [],
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent_searches');
    return saved ? JSON.parse(saved) : [];
  });

  const search = async (query: string, type: 'all' | 'users' | 'posts' | 'hashtags' = 'all') => {
    if (!query.trim()) {
      setResults({ users: [], posts: [], hashtags: [] });
      return;
    }

    setLoading(true);
    try {
      const searchTerm = `%${query.toLowerCase()}%`;

      // Search users
      let users: any[] = [];
      if (type === 'all' || type === 'users') {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .or(`display_name.ilike.${searchTerm},username.ilike.${searchTerm}`)
          .limit(10);

        if (!error) users = data || [];
      }

      // Search posts
      let posts: any[] = [];
      if (type === 'all' || type === 'posts') {
        const { data, error } = await supabase
          .from('social_posts')
          .select(`
            id,
            caption,
            media_url,
            media_type,
            like_count,
            comment_count,
            created_at,
            user_id,
            profiles!social_posts_user_id_fkey (
              display_name,
              avatar_url
            )
          `)
          .ilike('caption', searchTerm)
          .eq('status', 'published')
          .order('created_at', { ascending: false })
          .limit(20);

        if (!error) posts = data || [];
      }

      // Search hashtags (extract from posts)
      let hashtags: string[] = [];
      if (type === 'all' || type === 'hashtags') {
        const { data, error} = await supabase
          .from('social_posts')
          .select('caption')
          .eq('status', 'published')
          .ilike('caption', `%#${query}%`)
          .limit(100);

        if (!error && data) {
          const hashtagSet = new Set<string>();
          data.forEach(post => {
            const matches = post.caption?.match(/#[a-zA-Z0-9_]+/g);
            if (matches) {
              matches.forEach(tag => {
                if (tag.toLowerCase().includes(query.toLowerCase())) {
                  hashtagSet.add(tag);
                }
              });
            }
          });
          hashtags = Array.from(hashtagSet).slice(0, 10);
        }
      }

      setResults({ users, posts, hashtags });
      
      // Save to recent searches
      addToRecentSearches(query);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToRecentSearches = (query: string) => {
    const updated = [query, ...recentSearches.filter(q => q !== query)].slice(0, 10);
    setRecentSearches(updated);
    localStorage.setItem('recent_searches', JSON.stringify(updated));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
  };

  return {
    results,
    loading,
    search,
    recentSearches,
    clearRecentSearches,
  };
}
