import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TrialStatus {
  isInTrial: boolean;
  trialStart: Date | null;
  trialEnd: Date | null;
  trialUsed: boolean;
  daysRemaining: number;
  percentComplete: number;
}

export function useCreatorTrialStatus(creatorId?: string) {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Check if user has an active trial subscription as a subscriber
        const { data, error } = await supabase
          .from('creator_subscriptions')
          .select('trial_start, trial_end, trial_used, status')
          .eq('subscriber_id', user.id)
          .eq('status', 'trialing')
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (data && data.trial_start && data.trial_end) {
          const now = new Date();
          const trialStart = new Date(data.trial_start);
          const trialEnd = new Date(data.trial_end);
          const totalDays = Math.ceil((trialEnd.getTime() - trialStart.getTime()) / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          const daysUsed = totalDays - daysRemaining;
          const percentComplete = Math.min(100, Math.round((daysUsed / totalDays) * 100));

          setTrialStatus({
            isInTrial: now < trialEnd && !data.trial_used,
            trialStart,
            trialEnd,
            trialUsed: data.trial_used || false,
            daysRemaining,
            percentComplete,
          });
        } else {
          setTrialStatus({
            isInTrial: false,
            trialStart: null,
            trialEnd: null,
            trialUsed: data?.trial_used || false,
            daysRemaining: 0,
            percentComplete: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching trial status:', error);
        setTrialStatus(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialStatus();
  }, [user, creatorId]);

  return { trialStatus, loading };
}
