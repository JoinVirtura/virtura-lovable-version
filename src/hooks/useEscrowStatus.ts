import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type EscrowStage = 'pending_payment' | 'escrowed' | 'work_submitted' | 'approved' | 'released' | 'disputed';

export interface EscrowStatus {
  campaignId: string;
  campaignTitle: string;
  totalAmountCents: number;
  creatorPayoutCents: number;
  platformFeeCents: number;
  currentStage: EscrowStage;
  stages: {
    stage: EscrowStage;
    label: string;
    completed: boolean;
    timestamp: string | null;
  }[];
  hasDispute: boolean;
  paymentId?: string;
}

export function useEscrowStatus(campaignId?: string) {
  const [status, setStatus] = useState<EscrowStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!campaignId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch payment and campaign info
      const { data: payment } = await supabase
        .from('marketplace_payments')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();

      const { data: campaign } = await supabase
        .from('marketplace_campaigns')
        .select('title, status')
        .eq('id', campaignId)
        .single();

      const { data: deliverables } = await supabase
        .from('marketplace_deliverables')
        .select('status, submitted_at, approved_at')
        .eq('campaign_id', campaignId);

      const { data: disputes } = await supabase
        .from('campaign_disputes')
        .select('id, status')
        .eq('campaign_id', campaignId)
        .in('status', ['open', 'under_review']);

      const hasDispute = (disputes?.length || 0) > 0;
      const workSubmitted = deliverables?.some(d => d.submitted_at);
      const workApproved = deliverables?.every(d => d.status === 'approved');
      const paymentReleased = payment?.status === 'completed';

      let currentStage: EscrowStage = 'pending_payment';
      if (hasDispute) {
        currentStage = 'disputed';
      } else if (paymentReleased) {
        currentStage = 'released';
      } else if (workApproved) {
        currentStage = 'approved';
      } else if (workSubmitted) {
        currentStage = 'work_submitted';
      } else if (payment) {
        currentStage = 'escrowed';
      }

      const stages: EscrowStatus['stages'] = [
        {
          stage: 'pending_payment',
          label: 'Payment Pending',
          completed: !!payment,
          timestamp: null,
        },
        {
          stage: 'escrowed',
          label: 'Funds Escrowed',
          completed: !!payment,
          timestamp: payment?.created_at || null,
        },
        {
          stage: 'work_submitted',
          label: 'Work Submitted',
          completed: !!workSubmitted,
          timestamp: deliverables?.find(d => d.submitted_at)?.submitted_at || null,
        },
        {
          stage: 'approved',
          label: 'Deliverables Approved',
          completed: !!workApproved,
          timestamp: deliverables?.find(d => d.approved_at)?.approved_at || null,
        },
        {
          stage: 'released',
          label: 'Payment Released',
          completed: !!paymentReleased,
          timestamp: payment?.paid_at || null,
        },
      ];

      setStatus({
        campaignId,
        campaignTitle: campaign?.title || 'Unknown Campaign',
        totalAmountCents: payment?.total_amount_cents || 0,
        creatorPayoutCents: payment?.creator_amount_cents || 0,
        platformFeeCents: payment?.platform_fee_cents || 0,
        currentStage,
        stages,
        hasDispute,
        paymentId: payment?.id,
      });
    } catch (error) {
      console.error('Error fetching escrow status:', error);
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return { status, loading, refetch: fetchStatus };
}

export function useMultiCampaignEscrow(campaignIds: string[]) {
  const [statuses, setStatuses] = useState<Map<string, EscrowStatus>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (campaignIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      const statusMap = new Map<string, EscrowStatus>();
      
      const { data: payments } = await supabase
        .from('marketplace_payments')
        .select('*')
        .in('campaign_id', campaignIds);

      const { data: campaigns } = await supabase
        .from('marketplace_campaigns')
        .select('id, title, status')
        .in('id', campaignIds);

      payments?.forEach(payment => {
        const campaign = campaigns?.find(c => c.id === payment.campaign_id);
        statusMap.set(payment.campaign_id, {
          campaignId: payment.campaign_id,
          campaignTitle: campaign?.title || 'Unknown',
          totalAmountCents: payment.total_amount_cents,
          creatorPayoutCents: payment.creator_amount_cents,
          platformFeeCents: payment.platform_fee_cents,
          currentStage: payment.status === 'completed' ? 'released' : 'escrowed',
          stages: [],
          hasDispute: false,
          paymentId: payment.id,
        });
      });

      setStatuses(statusMap);
      setLoading(false);
    };

    fetchAll();
  }, [campaignIds.join(',')]);

  const totalEscrowed = Array.from(statuses.values())
    .filter(s => s.currentStage === 'escrowed')
    .reduce((sum, s) => sum + s.totalAmountCents, 0);

  return { statuses, loading, totalEscrowed };
}
