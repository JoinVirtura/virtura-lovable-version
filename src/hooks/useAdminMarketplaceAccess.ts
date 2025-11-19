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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('marketplace_access')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request approved',
        description: 'The user has been granted marketplace access',
      });

      await fetchRequests();
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const denyRequest = async (requestId: string, reason: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('marketplace_access')
        .update({
          status: 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          denial_reason: reason,
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Request denied',
        description: 'The user has been notified of the decision',
      });

      await fetchRequests();
    } catch (error: any) {
      console.error('Error denying request:', error);
      toast({
        title: 'Error',
        description: error.message,
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
