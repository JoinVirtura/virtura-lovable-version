import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Application {
  id: string;
  campaign_id: string;
  creator_id: string;
  pitch: string;
  proposed_rate_cents: number;
  portfolio_links: string[] | null;
  status: string | null;
  applied_at: string | null;
  reviewed_at: string | null;
  campaign?: {
    title: string;
    budget_cents: number;
    deadline: string | null;
  };
}

export function useMarketplaceApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get creator account
      const { data: creatorAccount } = await supabase
        .from('creator_accounts')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!creatorAccount) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('marketplace_applications')
        .select(`
          *,
          campaign:marketplace_campaigns(title, budget_cents, deadline)
        `)
        .eq('creator_id', creatorAccount.id)
        .order('applied_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error loading applications',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [user]);

  const applyToCampaign = async (applicationData: {
    campaign_id: string;
    pitch: string;
    proposed_rate_cents: number;
    portfolio_links?: string[];
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('apply-to-campaign', {
        body: applicationData,
      });

      if (error) throw error;

      toast({
        title: 'Application submitted',
        description: 'Your application has been sent to the brand',
      });

      fetchApplications();
      return data;
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

  const acceptApplication = async (applicationId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('accept-campaign-application', {
        body: { application_id: applicationId },
      });

      if (error) throw error;

      toast({
        title: 'Application accepted',
        description: 'The creator has been notified',
      });

      fetchApplications();
      return data;
    } catch (error: any) {
      console.error('Error accepting application:', error);
      toast({
        title: 'Error accepting application',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    applications,
    loading,
    refetch: fetchApplications,
    applyToCampaign,
    acceptApplication,
  };
}
