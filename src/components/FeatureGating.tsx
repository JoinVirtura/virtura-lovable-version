import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Lock, 
  Crown, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp
} from 'lucide-react';

interface SubscriptionPlan {
  name: string;
  status: string;
  limits: {
    audioGenerations: number;
    videoGenerations: number;
    storageGB: number;
    projects: number;
  };
  features: string[];
}

interface UsageLimits {
  audioGenerations: number;
  videoGenerations: number;
  storage: number;
  projects: number;
}

interface FeatureGatingProps {
  feature: 'audio_generation' | 'video_generation' | 'storage' | 'projects';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PLAN_CONFIGS = {
  free: {
    name: 'Free',
    status: 'inactive',
    limits: {
      audioGenerations: 5,
      videoGenerations: 2,
      storageGB: 1,
      projects: 3
    },
    features: ['Basic voice synthesis', 'Standard quality videos', '1GB storage']
  },
  pro: {
    name: 'Pro',
    status: 'active',
    limits: {
      audioGenerations: 100,
      videoGenerations: 50,
      storageGB: 10,
      projects: 25
    },
    features: ['Premium voices', 'HD video quality', '10GB storage', 'Priority processing']
  },
  enterprise: {
    name: 'Enterprise',
    status: 'active',
    limits: {
      audioGenerations: -1, // unlimited
      videoGenerations: -1,
      storageGB: 100,
      projects: -1
    },
    features: ['Unlimited generations', '4K video quality', '100GB storage', 'Custom branding', 'API access']
  }
};

export const FeatureGating: React.FC<FeatureGatingProps> = ({ 
  feature, 
  children, 
  fallback 
}) => {
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UsageLimits>({
    audioGenerations: 0,
    videoGenerations: 0,
    storage: 0,
    projects: 0
  });
  const [loading, setLoading] = useState(true);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    checkAccess();
  }, [feature]);

  const checkAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setCanAccess(false);
        setLoading(false);
        return;
      }

      // Get subscription info
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const planName = subData?.plan_name || 'free';
      const currentPlan = PLAN_CONFIGS[planName as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.free;
      setSubscription(currentPlan);

      // Get current usage
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('resource_type, amount')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      const currentUsage = {
        audioGenerations: usageData?.filter(u => u.resource_type === 'audio_generation')
          .reduce((sum, u) => sum + u.amount, 0) || 0,
        videoGenerations: usageData?.filter(u => u.resource_type === 'video_generation')
          .reduce((sum, u) => sum + u.amount, 0) || 0,
        storage: usageData?.filter(u => u.resource_type === 'storage')
          .reduce((sum, u) => sum + u.amount, 0) || 0,
        projects: 0 // Will be calculated from projects table
      };

      // Get project count
      const { count: projectCount } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      currentUsage.projects = projectCount || 0;
      setUsage(currentUsage);

      // Check if user can access feature
      const limit = currentPlan.limits[feature.replace('_generation', 'Generations') as keyof typeof currentPlan.limits];
      const used = currentUsage[feature.replace('_generation', 'Generations') as keyof typeof currentUsage];
      
      setCanAccess(limit === -1 || used < limit);
    } catch (error) {
      console.error('Access check failed:', error);
      setCanAccess(false);
    } finally {
      setLoading(false);
    }
  };

  const trackUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          resource_type: feature,
          amount: 1
        });

      // Refresh usage data
      checkAccess();
    } catch (error) {
      console.error('Usage tracking failed:', error);
    }
  };

  const upgradeTooltip = () => {
    return (
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Upgrade Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              You've reached your {feature.replace('_', ' ')} limit for this month.
            </p>
            
            {subscription && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Current Plan:</span>
                  <Badge variant="outline">{subscription.name}</Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Usage:</span>
                    <span>
                      {usage[feature.replace('_generation', 'Generations') as keyof typeof usage]} / {
                        subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits] === -1 
                          ? '∞' 
                          : subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits]
                      }
                    </span>
                  </div>
                  
                  {subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits] !== -1 && (
                    <Progress 
                      value={(usage[feature.replace('_generation', 'Generations') as keyof typeof usage] / 
                        subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits]) * 100} 
                      className="h-2"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => window.location.href = '/upgrade'} 
            className="w-full"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Plan
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!canAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Card className="border-dashed border-2">
        <CardContent className="p-8 text-center">
          <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Feature Locked</h3>
          <p className="text-muted-foreground mb-4">
            You've reached your {feature.replace('_', ' ')} limit for this month.
          </p>
          
          {subscription && (
            <div className="bg-muted p-4 rounded-lg mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Current Usage</span>
                <Badge variant="outline">{subscription.name}</Badge>
              </div>
              <div className="flex justify-between text-sm mb-1">
                <span>Used:</span>
                <span>
                  {usage[feature.replace('_generation', 'Generations') as keyof typeof usage]} / {
                    subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits] === -1 
                      ? '∞' 
                      : subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits]
                  }
                </span>
              </div>
              {subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits] !== -1 && (
                <Progress 
                  value={(usage[feature.replace('_generation', 'Generations') as keyof typeof usage] / 
                    subscription.limits[feature.replace('_generation', 'Generations') as keyof typeof subscription.limits]) * 100} 
                  className="h-2"
                />
              )}
            </div>
          )}
          
          <Button onClick={() => window.location.href = '/upgrade'}>
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Wrap children with usage tracking
  return (
    <div onClick={trackUsage}>
      {children}
    </div>
  );
};

// Usage indicator component
export const UsageIndicator = () => {
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [usage, setUsage] = useState<UsageLimits>({
    audioGenerations: 0,
    videoGenerations: 0,
    storage: 0,
    projects: 0
  });

  useEffect(() => {
    loadUsageData();
  }, []);

  const loadUsageData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const planName = subData?.plan_name || 'free';
      const currentPlan = PLAN_CONFIGS[planName as keyof typeof PLAN_CONFIGS] || PLAN_CONFIGS.free;
      setSubscription(currentPlan);

      // Get usage
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('resource_type, amount')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth.toISOString());

      const currentUsage = {
        audioGenerations: usageData?.filter(u => u.resource_type === 'audio_generation')
          .reduce((sum, u) => sum + u.amount, 0) || 0,
        videoGenerations: usageData?.filter(u => u.resource_type === 'video_generation')
          .reduce((sum, u) => sum + u.amount, 0) || 0,
        storage: usageData?.filter(u => u.resource_type === 'storage')
          .reduce((sum, u) => sum + u.amount, 0) || 0,
        projects: 0
      };

      setUsage(currentUsage);
    } catch (error) {
      console.error('Failed to load usage data:', error);
    }
  };

  if (!subscription) return null;

  const getUsageColor = (used: number, limit: number) => {
    if (limit === -1) return 'text-green-600';
    const percentage = (used / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Monthly Usage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Plan</span>
          <Badge variant="outline">{subscription.name}</Badge>
        </div>

        <div className="space-y-3">
          {/* Audio Generations */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Audio Generations</span>
              <span className={getUsageColor(usage.audioGenerations, subscription.limits.audioGenerations)}>
                {usage.audioGenerations} / {subscription.limits.audioGenerations === -1 ? '∞' : subscription.limits.audioGenerations}
              </span>
            </div>
            {subscription.limits.audioGenerations !== -1 && (
              <Progress value={(usage.audioGenerations / subscription.limits.audioGenerations) * 100} className="h-2" />
            )}
          </div>

          {/* Video Generations */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Video Generations</span>
              <span className={getUsageColor(usage.videoGenerations, subscription.limits.videoGenerations)}>
                {usage.videoGenerations} / {subscription.limits.videoGenerations === -1 ? '∞' : subscription.limits.videoGenerations}
              </span>
            </div>
            {subscription.limits.videoGenerations !== -1 && (
              <Progress value={(usage.videoGenerations / subscription.limits.videoGenerations) * 100} className="h-2" />
            )}
          </div>
        </div>

        <Button 
          onClick={() => window.location.href = '/upgrade'} 
          variant="outline" 
          size="sm" 
          className="w-full"
        >
          <Crown className="w-4 h-4 mr-2" />
          Manage Plan
        </Button>
      </CardContent>
    </Card>
  );
};