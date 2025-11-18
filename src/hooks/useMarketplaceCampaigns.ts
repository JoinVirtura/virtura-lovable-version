import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Campaign {
  id: string;
  brand_id: string;
  title: string;
  description: string | null;
  budget_cents: number;
  deliverables: any;
  requirements: any;
  deadline: string | null;
  category: string | null;
  status: string | null;
  visibility: string | null;
  creator_id: string | null;
  creator_rate_cents: number | null;
  created_at: string | null;
  brands?: {
    name: string;
    logo_url: string | null;
  };
}

interface CampaignFilters {
  category?: string;
  minBudget?: number;
  maxBudget?: number;
  search?: string;
  sortBy?: 'newest' | 'budget_high' | 'budget_low' | 'deadline';
}

export function useMarketplaceCampaigns(filters?: CampaignFilters) {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('marketplace_campaigns')
        .select(`
          *,
          brands!inner(name, logo_url)
        `)
        .eq('status', 'open')
        .eq('visibility', 'public');

      // Apply filters
      if (filters?.category) {
        query = query.eq('category', filters.category);
      }
      if (filters?.minBudget) {
        query = query.gte('budget_cents', filters.minBudget * 100);
      }
      if (filters?.maxBudget) {
        query = query.lte('budget_cents', filters.maxBudget * 100);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'budget_high':
          query = query.order('budget_cents', { ascending: false });
          break;
        case 'budget_low':
          query = query.order('budget_cents', { ascending: true });
          break;
        case 'deadline':
          query = query.order('deadline', { ascending: true, nullsFirst: false });
          break;
        default: // newest
          query = query.order('created_at', { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;

      setCampaigns(data || []);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error loading campaigns',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [filters]);

  const createCampaign = async (campaignData: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-marketplace-campaign', {
        body: campaignData,
      });

      if (error) throw error;

      toast({
        title: 'Campaign created',
        description: 'Your campaign has been published to the marketplace',
      });

      fetchCampaigns();
      return data;
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Error creating campaign',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    campaigns,
    loading,
    refetch: fetchCampaigns,
    createCampaign,
  };
}
