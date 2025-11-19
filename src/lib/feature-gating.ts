import { supabase } from "@/integrations/supabase/client";

export type SubscriptionPlan = 'free' | 'individual' | 'pro' | 'enterprise';

export interface FeatureGateConfig {
  feature: string;
  requiredPlan: SubscriptionPlan;
  alternativeText?: string;
}

/**
 * Check if user has access to a premium feature based on their subscription plan
 */
export async function checkFeatureAccess(feature: string): Promise<{
  hasAccess: boolean;
  plan: SubscriptionPlan;
  isAdmin: boolean;
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { hasAccess: false, plan: 'free', isAdmin: false };
    }

    // Check if user is admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    const isAdmin = !!roleData;
    
    // Admins have unlimited access
    if (isAdmin) {
      return { hasAccess: true, plan: 'enterprise', isAdmin: true };
    }

    // Get user subscription including trial data
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_name, status, trial_end, trial_used, trial_plan_name')
      .eq('user_id', user.id)
      .maybeSingle();

    // Check if user has active trial
    if (subscription?.trial_end && !subscription.trial_used) {
      const trialEnd = new Date(subscription.trial_end);
      if (trialEnd > new Date()) {
        const trialPlan = (subscription.trial_plan_name || 'pro') as SubscriptionPlan;
        const allowedPlans = featureRules[feature] || [];
        const hasAccess = allowedPlans.includes(trialPlan);
        return { hasAccess, plan: trialPlan, isAdmin: false };
      }
    }

    const plan: SubscriptionPlan = (subscription?.status === 'active' && subscription?.plan_name) 
      ? subscription.plan_name as SubscriptionPlan 
      : 'free';

    // Feature gating rules
    const featureRules: Record<string, SubscriptionPlan[]> = {
      'heygen-video': ['pro', 'enterprise'],
      'premium-avatars': ['individual', 'pro', 'enterprise'],
      'priority-processing': ['pro', 'enterprise'],
      'commercial-license': ['pro', 'enterprise'],
      'team-collaboration': ['enterprise'],
      'white-label': ['enterprise'],
    };

    const allowedPlans = featureRules[feature] || [];
    const hasAccess = allowedPlans.includes(plan);

    return { hasAccess, plan, isAdmin };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return { hasAccess: false, plan: 'free', isAdmin: false };
  }
}

/**
 * Get plan display name
 */
export function getPlanDisplayName(plan: SubscriptionPlan): string {
  const names: Record<SubscriptionPlan, string> = {
    free: 'Free',
    individual: 'Individual',
    pro: 'Pro',
    enterprise: 'Enterprise',
  };
  return names[plan] || 'Free';
}

/**
 * Get minimum required plan for a feature
 */
export function getRequiredPlan(feature: string): SubscriptionPlan {
  const featureRules: Record<string, SubscriptionPlan> = {
    'heygen-video': 'pro',
    'premium-avatars': 'individual',
    'priority-processing': 'pro',
    'commercial-license': 'pro',
    'team-collaboration': 'enterprise',
    'white-label': 'enterprise',
  };
  return featureRules[feature] || 'free';
}
