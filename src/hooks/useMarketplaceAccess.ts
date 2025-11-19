import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface MarketplaceAccess {
  id: string;
  user_id: string;
  role_requested: string;
  status: string | null;
  pitch: string | null;
  experience: string | null;
  portfolio_links: string[] | null;
  created_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  denial_reason: string | null;
}

export function useMarketplaceAccess() {
  const { user } = useAuth();
  const [access, setAccess] = useState<MarketplaceAccess | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccess = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marketplace_access')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAccess(data);
    } catch (error: any) {
      console.error('Error fetching marketplace access:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccess();
  }, [user]);

  const applyForAccess = async (data: {
    role: 'creator' | 'brand';
    pitch: string;
    experience: string;
    portfolio_links?: string[];
  }) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to apply',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('marketplace_access')
        .insert({
          user_id: user.id,
          role_requested: data.role,
          pitch: data.pitch,
          experience: data.experience,
          portfolio_links: data.portfolio_links || [],
          status: 'pending',
        });

      if (error) throw error;

      toast({
        title: 'Application submitted',
        description: 'Your application will be reviewed within 24-48 hours',
      });

      await fetchAccess();
    } catch (error: any) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error submitting application',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    access,
    loading,
    applyForAccess,
    refetch: fetchAccess,
  };
}
