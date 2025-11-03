import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UsageData {
  id: string;
  user_id: string;
  resource_type: string;
  api_provider: string;
  model_used: string | null;
  cost_usd: number;
  tokens_charged: number;
  metadata: any;
  created_at: string;
}

export interface BillingInvoice {
  id: string;
  created: number;
  amount_paid: number;
  currency: string;
  status: string;
  description: string;
  invoice_pdf: string | null;
  hosted_invoice_url: string | null;
}

export function useBillingData() {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loading, setLoading] = useState(false);

  const loadUsageData = useCallback(async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let query = supabase
        .from('api_cost_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('created_at', startDate.toISOString());
      }
      if (endDate) {
        query = query.lte('created_at', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setUsageData(data || []);
    } catch (error) {
      console.error('Error loading usage data:', error);
      toast.error('Failed to load usage data');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('get-billing-history');

      if (error) throw error;
      setInvoices(data?.invoices || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      toast.error('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  }, []);

  const getTotalCost = useCallback((data: UsageData[] = usageData) => {
    return data.reduce((sum, item) => sum + Number(item.cost_usd), 0);
  }, [usageData]);

  const getCostByResourceType = useCallback((data: UsageData[] = usageData) => {
    const costs: Record<string, number> = {};
    data.forEach((item) => {
      costs[item.resource_type] = (costs[item.resource_type] || 0) + Number(item.cost_usd);
    });
    return costs;
  }, [usageData]);

  const getCostByProvider = useCallback((data: UsageData[] = usageData) => {
    const costs: Record<string, number> = {};
    data.forEach((item) => {
      costs[item.api_provider] = (costs[item.api_provider] || 0) + Number(item.cost_usd);
    });
    return costs;
  }, [usageData]);

  const openCustomerPortal = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    }
  }, []);

  return {
    usageData,
    invoices,
    loading,
    loadUsageData,
    loadInvoices,
    getTotalCost,
    getCostByResourceType,
    getCostByProvider,
    openCustomerPortal,
  };
}
