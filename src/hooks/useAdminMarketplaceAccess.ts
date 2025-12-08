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

      console.log('Attempting to approve request:', requestId, 'by admin:', user.id);

      const { data, error } = await supabase
        .from('marketplace_access')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
        })
        .eq('id', requestId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        if (error.code === '42501' || error.message.includes('row-level security')) {
          throw new Error('Permission denied. Ensure you have admin role in user_roles table.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No rows updated. Check if request exists and you have admin permissions.');
      }

      console.log('Successfully approved request:', data);

      toast({
        title: 'Request approved',
        description: 'The user has been granted marketplace access',
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('Not authenticated');

      console.log('Attempting to deny request:', requestId, 'by admin:', user.id);

      const { data, error } = await supabase
        .from('marketplace_access')
        .update({
          status: 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          denial_reason: reason,
        })
        .eq('id', requestId)
        .select();

      if (error) {
        console.error('Supabase update error:', error);
        if (error.code === '42501' || error.message.includes('row-level security')) {
          throw new Error('Permission denied. Ensure you have admin role in user_roles table.');
        }
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No rows updated. Check if request exists and you have admin permissions.');
      }

      console.log('Successfully denied request:', data);

      toast({
        title: 'Request denied',
        description: 'The user has been notified of the decision',
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
