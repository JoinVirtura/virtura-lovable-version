import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface OnboardingState {
  isOnboardingComplete: boolean;
  signupBonusClaimed: boolean;
  currentStep: number;
  loading: boolean;
}

export function useOnboarding() {
  const { user } = useAuth();
  const [state, setState] = useState<OnboardingState>({
    isOnboardingComplete: false,
    signupBonusClaimed: false,
    currentStep: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    loadOnboardingState();
  }, [user]);

  const loadOnboardingState = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('onboarding_completed, signup_bonus_claimed, onboarding_step')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error loading onboarding state:', error);
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState({
      isOnboardingComplete: data?.onboarding_completed || false,
      signupBonusClaimed: data?.signup_bonus_claimed || false,
      currentStep: data?.onboarding_step || 0,
      loading: false,
    });
  };

  const updateOnboardingStep = async (step: number) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ onboarding_step: step })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating onboarding step:', error);
      return;
    }

    setState(prev => ({ ...prev, currentStep: step }));
  };

  const completeOnboarding = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ 
        onboarding_completed: true,
        onboarding_step: 5 
      })
      .eq('id', user.id);

    if (error) {
      console.error('Error completing onboarding:', error);
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isOnboardingComplete: true,
      currentStep: 5 
    }));
  };

  return {
    ...state,
    updateOnboardingStep,
    completeOnboarding,
    loadOnboardingState,
  };
}
