import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from './use-toast';

interface MarketplaceAccessRequest {
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

export function useAdminMarketplaceAccess() {
  const [requests, setRequests] = useState<MarketplaceAccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_access')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error: any) {
      console.error('Error fetching marketplace access requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to load marketplace access requests',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const approveRequest = async (requestId: string) => {
    try {
      console.log('Approving request via edge function:', requestId);

      const { data, error } = await supabase.functions.invoke('review-marketplace-application', {
        body: {
          application_id: requestId,
          action: 'approve',
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to approve application');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('Successfully approved request:', data);

      toast({
        title: 'Request approved',
        description: data?.email_sent 
          ? 'The user has been granted marketplace access and notified via email'
          : 'The user has been granted marketplace access',
      });

      await fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error approving request',
        description: error.message || 'Failed to approve. Check console for details.',
        variant: 'destructive',
      });
    }
  };

  const denyRequest = async (requestId: string, reason: string) => {
    try {
      console.log('Denying request via edge function:', requestId);

      const { data, error } = await supabase.functions.invoke('review-marketplace-application', {
        body: {
          application_id: requestId,
          action: 'deny',
          denial_reason: reason,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to deny application');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      console.log('Successfully denied request:', data);

      toast({
        title: 'Request denied',
        description: data?.email_sent 
          ? 'The user has been notified of the decision via email'
          : 'The user has been notified of the decision',
      });

      await fetchRequests();
    } catch (error: any) {
      console.error('Error denying request:', error);
      toast({
        title: 'Error denying request',
        description: error.message || 'Failed to deny. Check console for details.',
        variant: 'destructive',
      });
    }
  };

  return {
    requests,
    loading,
    approveRequest,
    denyRequest,
    refetch: fetchRequests,
  };
}
