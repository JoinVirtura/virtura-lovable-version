import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UsageData {
  voice_generation: { used: number; limit: number; };
  video_generation: { used: number; limit: number; };
  storage: { used: number; limit: number; };
}

interface SubscriptionData {
  plan_name: string;
  status: string;
  current_period_end?: string;
}

const PLAN_LIMITS = {
  free: {
    voice_generation: 10,
    video_generation: 3,
    storage: 100, // MB
  },
  pro: {
    voice_generation: 100,
    video_generation: 25,
    storage: 1000, // MB
  },
  enterprise: {
    voice_generation: 1000,
    video_generation: 250,
    storage: 10000, // MB
  }
};

export function useUsageTracking() {
  const { toast } = useToast();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get subscription data
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_name, status, current_period_end')
        .eq('user_id', user.id)
        .single();

      setSubscription(subData || { plan_name: 'free', status: 'inactive' });

      // Get today's usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('resource_type, amount')
        .eq('user_id', user.id)
        .gte('created_at', today);

      // Calculate usage by resource type
      const usageSummary: UsageData = {
        voice_generation: { used: 0, limit: PLAN_LIMITS.free.voice_generation },
        video_generation: { used: 0, limit: PLAN_LIMITS.free.video_generation },
        storage: { used: 0, limit: PLAN_LIMITS.free.storage }
      };

      usageData?.forEach(item => {
        if (item.resource_type in usageSummary) {
          const resourceType = item.resource_type as keyof UsageData;
          usageSummary[resourceType].used += item.amount;
        }
      });

      // Apply plan limits
      const planName = subData?.plan_name || 'free';
      if (planName in PLAN_LIMITS) {
        const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS];
        usageSummary.voice_generation.limit = limits.voice_generation;
        usageSummary.video_generation.limit = limits.video_generation;
        usageSummary.storage.limit = limits.storage;
      }

      setUsage(usageSummary);
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLimit = (resource: keyof UsageData, amount = 1): boolean => {
    if (!usage) return false;
    
    const resourceUsage = usage[resource];
    return resourceUsage.used + amount <= resourceUsage.limit;
  };

  const trackUsage = async (resource: keyof UsageData, amount = 1): Promise<boolean> => {
    try {
      // Check limit first
      if (!checkLimit(resource, amount)) {
        toast({
          title: "Daily Limit Reached",
          description: `You've reached your daily limit for ${resource.replace('_', ' ')}`,
          variant: "destructive",
        });
        return false;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to continue",
          variant: "destructive",
        });
        return false;
      }

      // Track the usage
      const { error } = await supabase.from('usage_tracking').insert({
        user_id: user.id,
        resource_type: resource,
        amount,
        metadata: { tracked_at: new Date().toISOString() }
      });

      if (error) throw error;

      // Refresh usage data
      await refreshUsage();
      return true;
    } catch (error: any) {
      console.error('Error tracking usage:', error);
      toast({
        title: "Error",
        description: "Failed to track usage",
        variant: "destructive",
      });
      return false;
    }
  };

  const getRemainingCredits = (resource: keyof UsageData): number => {
    if (!usage) return 0;
    const resourceUsage = usage[resource];
    return Math.max(0, resourceUsage.limit - resourceUsage.used);
  };

  const getUsagePercentage = (resource: keyof UsageData): number => {
    if (!usage) return 0;
    const resourceUsage = usage[resource];
    return (resourceUsage.used / resourceUsage.limit) * 100;
  };

  const hasActiveSubscription = (): boolean => {
    return subscription?.status === 'active' && subscription?.plan_name !== 'free';
  };

  const canUpgrade = (): boolean => {
    return !hasActiveSubscription();
  };

  useEffect(() => {
    refreshUsage();
  }, []);

  return {
    usage,
    subscription,
    loading,
    refreshUsage,
    checkLimit,
    trackUsage,
    getRemainingCredits,
    getUsagePercentage,
    hasActiveSubscription,
    canUpgrade
  };
}