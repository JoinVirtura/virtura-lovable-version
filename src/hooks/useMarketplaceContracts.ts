import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface Contract {
  id: string;
  campaign_id: string;
  brand_id: string;
  creator_id: string;
  contract_terms: Record<string, any>;
  payment_amount_cents: number;
  platform_fee_cents: number;
  creator_payout_cents: number;
  deliverables_summary: string | null;
  deadline: string | null;
  brand_signed_at: string | null;
  creator_signed_at: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useMarketplaceContracts() {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContracts = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch contracts (RLS will filter based on user's brand/creator associations)
      const { data, error } = await supabase
        .from('marketplace_contracts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContracts((data as Contract[]) || []);
    } catch (error: any) {
      console.error('Error fetching contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [user]);

  const getContractForCampaign = (campaignId: string): Contract | undefined => {
    return contracts.find(c => c.campaign_id === campaignId);
  };

  const generateContract = async (campaignId: string, creatorId: string, agreedRateCents: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-contract', {
        body: { campaignId, creatorId, agreedRateCents }
      });

      if (error) throw error;

      toast({
        title: 'Contract generated',
        description: 'Contract is ready for signatures',
      });

      await fetchContracts();
      return data.contract;
    } catch (error: any) {
      console.error('Error generating contract:', error);
      toast({
        title: 'Error generating contract',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const signContract = async (contractId: string, signerType: 'brand' | 'creator') => {
    try {
      const { data, error } = await supabase.functions.invoke('sign-contract', {
        body: { contractId, signerType }
      });

      if (error) throw error;

      toast({
        title: 'Contract signed',
        description: data.message,
      });

      await fetchContracts();
      return data.contract;
    } catch (error: any) {
      console.error('Error signing contract:', error);
      toast({
        title: 'Error signing contract',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    contracts,
    loading,
    refetch: fetchContracts,
    getContractForCampaign,
    generateContract,
    signContract,
  };
}
