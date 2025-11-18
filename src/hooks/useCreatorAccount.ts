import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

interface CreatorAccount {
  id: string;
  user_id: string;
  stripe_account_id: string | null;
  onboarding_complete: boolean | null;
  charges_enabled: boolean | null;
  payouts_enabled: boolean | null;
  details_submitted: boolean | null;
  platform_fee_percentage: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export function useCreatorAccount() {
  const { user } = useAuth();
  const [account, setAccount] = useState<CreatorAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchAccount = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('creator_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setAccount(data);
    } catch (error: any) {
      console.error('Error fetching creator account:', error);
      toast({
        title: 'Error loading account',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async () => {
    if (!user) return;

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-connect-account');

      if (error) throw error;

      toast({
        title: 'Account created',
        description: 'Your creator account has been created successfully.',
      });

      await fetchAccount();
      return data;
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error creating account',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setCreating(false);
    }
  };

  const getOnboardingLink = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('connect-onboarding-link');

      if (error) throw error;

      return data.url;
    } catch (error: any) {
      console.error('Error getting onboarding link:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getDashboardLink = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('connect-dashboard-link');

      if (error) throw error;

      return data.url;
    } catch (error: any) {
      console.error('Error getting dashboard link:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [user]);

  return {
    account,
    loading,
    creating,
    createAccount,
    getOnboardingLink,
    getDashboardLink,
    refetch: fetchAccount,
  };
}
