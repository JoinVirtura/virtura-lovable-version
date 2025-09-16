import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Lock, Crown, Zap, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface UsageLimits {
  voice_generation: { used: number; limit: number; };
  video_generation: { used: number; limit: number; };
  storage: { used: number; limit: number; };
}

interface SubscriptionPlan {
  name: string;
  status: 'active' | 'inactive' | 'canceled';
  current_period_end?: string;
}

interface FeatureGateProps {
  feature: 'voice_generation' | 'video_generation' | 'storage' | 'premium_voices' | 'hd_video';
  children: React.ReactNode;
  fallback?: React.ReactNode;
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

const PREMIUM_FEATURES = {
  premium_voices: ['pro', 'enterprise'],
  hd_video: ['pro', 'enterprise'],
  voice_generation: ['free', 'pro', 'enterprise'],
  video_generation: ['free', 'pro', 'enterprise'],
  storage: ['free', 'pro', 'enterprise']
};

export function FeatureGate({ feature, children, fallback }: FeatureGateProps) {
  const { toast } = useToast();
  const [usage, setUsage] = useState<UsageLimits | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUsageAndSubscription();
  }, []);

  const checkUsageAndSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      setSubscription(subData || { name: 'free', status: 'inactive' });

      // Check today's usage
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('resource_type, amount')
        .eq('user_id', user.id)
        .gte('created_at', today);

      const usageSummary: UsageLimits = {
        voice_generation: { used: 0, limit: PLAN_LIMITS.free.voice_generation },
        video_generation: { used: 0, limit: PLAN_LIMITS.free.video_generation },
        storage: { used: 0, limit: PLAN_LIMITS.free.storage }
      };

      // Calculate current usage
      usageData?.forEach(usage => {
        if (usage.resource_type in usageSummary) {
          usageSummary[usage.resource_type as keyof UsageLimits].used += usage.amount;
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
      console.error('Failed to check usage:', error);
    } finally {
      setLoading(false);
    }
  };

  const trackUsage = async (resource: string, amount = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      await supabase.from('usage_tracking').insert({
        user_id: user.id,
        resource_type: resource,
        amount
      });

      // Refresh usage
      await checkUsageAndSubscription();
      return true;
    } catch (error) {
      console.error('Failed to track usage:', error);
      return false;
    }
  };

  const canUseFeature = () => {
    if (loading) return false;

    // Check if feature requires subscription
    const requiredPlans = PREMIUM_FEATURES[feature];
    const currentPlan = subscription?.plan_name || 'free';
    
    if (!requiredPlans.includes(currentPlan)) {
      return false;
    }

    // Check usage limits for metered features
    if (feature in (usage || {}) && usage) {
      const featureUsage = usage[feature as keyof UsageLimits];
      return featureUsage.used < featureUsage.limit;
    }

    return true;
  };

  const getUpgradeCard = () => (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-orange-600" />
          <CardTitle className="text-orange-900">Upgrade Required</CardTitle>
        </div>
        <CardDescription className="text-orange-700">
          This feature requires a Pro or Enterprise plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-orange-900">Pro Plan Includes:</div>
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• 100 voice generations/day</li>
            <li>• 25 video generations/day</li>
            <li>• Premium voice library</li>
            <li>• HD video quality</li>
            <li>• 1GB storage</li>
          </ul>
        </div>
        <Button className="w-full bg-orange-600 hover:bg-orange-700">
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      </CardContent>
    </Card>
  );

  const getLimitCard = () => {
    if (!usage) return null;
    
    const featureUsage = usage[feature as keyof UsageLimits];
    const percentage = (featureUsage.used / featureUsage.limit) * 100;
    
    return (
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <CardTitle className="text-red-900">Daily Limit Reached</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            You've used all your {feature.replace('_', ' ')} credits for today
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-red-700">Usage</span>
              <span className="text-red-900 font-medium">
                {featureUsage.used} / {featureUsage.limit}
              </span>
            </div>
            <Progress value={percentage} className="h-2 bg-red-100" />
          </div>
          <Button className="w-full bg-red-600 hover:bg-red-700">
            <Zap className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  const hasAccess = canUseFeature();

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;
    
    // Check why access is denied
    const requiredPlans = PREMIUM_FEATURES[feature];
    const currentPlan = subscription?.plan_name || 'free';
    
    if (!requiredPlans.includes(currentPlan)) {
      return getUpgradeCard();
    }
    
    // Must be a usage limit issue
    return getLimitCard();
  }

  return <>{children}</>;
}

// Hook for tracking usage
export function useFeatureGating() {
  const { toast } = useToast();

  const trackAndCheck = async (feature: 'voice_generation' | 'video_generation' | 'storage', amount = 1) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to use this feature",
          variant: "destructive",
        });
        return false;
      }

      // Check current usage first
      const today = new Date().toISOString().split('T')[0];
      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('amount')
        .eq('user_id', user.id)
        .eq('resource_type', feature)
        .gte('created_at', today);

      const currentUsage = usageData?.reduce((sum, u) => sum + u.amount, 0) || 0;

      // Get user's plan limits
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('plan_name')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      const planName = subData?.plan_name || 'free';
      const limits = PLAN_LIMITS[planName as keyof typeof PLAN_LIMITS];
      const limit = limits[feature];

      if (currentUsage + amount > limit) {
        toast({
          title: "Daily Limit Reached",
          description: `You've reached your daily limit for ${feature.replace('_', ' ')}. Upgrade to continue.`,
          variant: "destructive",
        });
        return false;
      }

      // Track the usage
      const { error } = await supabase.from('usage_tracking').insert({
        user_id: user.id,
        resource_type: feature,
        amount
      });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Usage tracking error:', error);
      return false;
    }
  };

  return { trackAndCheck };
}

export { FeatureGate };