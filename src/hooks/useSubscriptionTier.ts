import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type SubscriptionTier = 'free' | 'starter' | 'pro' | 'enterprise' | 'admin';

interface SubscriptionAccess {
  tier: SubscriptionTier;
  isAdmin: boolean;
  isLoading: boolean;
  // Feature access flags
  canAccessBrandTools: boolean;
  canAccessCommercialLicense: boolean;
  canAccessAPIAccess: boolean;
  canAccessWhiteLabel: boolean;
  canAccessTeamSeats: boolean;
  canAccessAdvancedAnalytics: boolean;
  canAccess4KExports: boolean;
  canAccess8KExports: boolean;
  generationLimit: number;
  planName: string;
}

export function useSubscriptionTier(): SubscriptionAccess {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTier('free');
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    const checkAccess = async () => {
      setIsLoading(true);
      
      try {
        // Check admin status first using the has_role function pattern
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        if (roleData?.role === 'admin') {
          setIsAdmin(true);
          setTier('admin');
          setIsLoading(false);
          return;
        }

        // Check subscription tier
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('plan_name, status')
          .eq('user_id', user.id)
          .in('status', ['active', 'trialing'])
          .maybeSingle();

        if (subData?.plan_name) {
          const planName = subData.plan_name.toLowerCase();
          if (planName.includes('enterprise')) {
            setTier('enterprise');
          } else if (planName.includes('pro')) {
            setTier('pro');
          } else if (planName.includes('starter') || planName.includes('individual')) {
            setTier('starter');
          } else {
            setTier('free');
          }
        } else {
          setTier('free');
        }
      } catch (error) {
        console.error('Error checking subscription tier:', error);
        setTier('free');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  // Define access based on tier
  const getAccess = (): SubscriptionAccess => {
    const tierConfig = {
      free: {
        canAccessBrandTools: false,
        canAccessCommercialLicense: false,
        canAccessAPIAccess: false,
        canAccessWhiteLabel: false,
        canAccessTeamSeats: false,
        canAccessAdvancedAnalytics: false,
        canAccess4KExports: false,
        canAccess8KExports: false,
        generationLimit: 0,
        planName: 'Free',
      },
      starter: {
        canAccessBrandTools: false,
        canAccessCommercialLicense: false,
        canAccessAPIAccess: false,
        canAccessWhiteLabel: false,
        canAccessTeamSeats: false,
        canAccessAdvancedAnalytics: false,
        canAccess4KExports: false,
        canAccess8KExports: false,
        generationLimit: 120,
        planName: 'Starter',
      },
      pro: {
        canAccessBrandTools: true,
        canAccessCommercialLicense: true,
        canAccessAPIAccess: true,
        canAccessWhiteLabel: false,
        canAccessTeamSeats: false,
        canAccessAdvancedAnalytics: false,
        canAccess4KExports: true,
        canAccess8KExports: false,
        generationLimit: 700,
        planName: 'Pro',
      },
      enterprise: {
        canAccessBrandTools: true,
        canAccessCommercialLicense: true,
        canAccessAPIAccess: true,
        canAccessWhiteLabel: true,
        canAccessTeamSeats: true,
        canAccessAdvancedAnalytics: true,
        canAccess4KExports: true,
        canAccess8KExports: true,
        generationLimit: 2200,
        planName: 'Enterprise',
      },
      admin: {
        canAccessBrandTools: true,
        canAccessCommercialLicense: true,
        canAccessAPIAccess: true,
        canAccessWhiteLabel: true,
        canAccessTeamSeats: true,
        canAccessAdvancedAnalytics: true,
        canAccess4KExports: true,
        canAccess8KExports: true,
        generationLimit: 999999,
        planName: 'Admin',
      },
    };

    return {
      tier,
      isAdmin,
      isLoading,
      ...tierConfig[tier],
    };
  };

  return getAccess();
}
