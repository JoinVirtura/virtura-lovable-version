import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useEscrowStatus, EscrowStage } from '@/hooks/useEscrowStatus';
import { Check, Clock, AlertTriangle, DollarSign, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface EscrowStatusTrackerProps {
  campaignId: string;
  compact?: boolean;
}

const stageIcons: Record<EscrowStage, React.ReactNode> = {
  pending_payment: <Clock className="h-4 w-4" />,
  escrowed: <DollarSign className="h-4 w-4" />,
  work_submitted: <Loader2 className="h-4 w-4" />,
  approved: <Check className="h-4 w-4" />,
  released: <Check className="h-4 w-4" />,
  disputed: <AlertTriangle className="h-4 w-4" />,
};

export function EscrowStatusTracker({ campaignId, compact = false }: EscrowStatusTrackerProps) {
  const { status, loading } = useEscrowStatus(campaignId);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge 
          variant={status.hasDispute ? 'destructive' : status.currentStage === 'released' ? 'default' : 'secondary'}
          className="gap-1"
        >
          {stageIcons[status.currentStage]}
          {status.currentStage === 'released' ? 'Paid' : 
           status.currentStage === 'disputed' ? 'Disputed' :
           status.currentStage === 'escrowed' ? 'In Escrow' : 
           status.currentStage.replace('_', ' ')}
        </Badge>
        <span className="text-sm font-medium">
          ${(status.creatorPayoutCents / 100).toLocaleString()}
        </span>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Payment Status</CardTitle>
            <CardDescription>{status.campaignTitle}</CardDescription>
          </div>
          {status.hasDispute && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Dispute Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Amount breakdown */}
        <div className="grid grid-cols-3 gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="font-semibold">${(status.totalAmountCents / 100).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Platform Fee</p>
            <p className="font-semibold text-muted-foreground">-${(status.platformFeeCents / 100).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Your Payout</p>
            <p className="font-semibold text-green-600">${(status.creatorPayoutCents / 100).toLocaleString()}</p>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {status.stages.map((stage, index) => (
            <div key={stage.stage} className="flex gap-3 pb-4 last:pb-0">
              {/* Connector line */}
              {index < status.stages.length - 1 && (
                <div 
                  className={cn(
                    "absolute left-[11px] w-0.5 h-[calc(100%-16px)] top-6",
                    stage.completed ? "bg-primary" : "bg-muted"
                  )}
                  style={{ top: `${index * 48 + 24}px`, height: '32px' }}
                />
              )}
              
              {/* Status indicator */}
              <div 
                className={cn(
                  "relative z-10 flex h-6 w-6 items-center justify-center rounded-full border-2",
                  stage.completed 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : "bg-background border-muted"
                )}
              >
                {stage.completed ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-muted" />
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "font-medium text-sm",
                  !stage.completed && "text-muted-foreground"
                )}>
                  {stage.label}
                </p>
                {stage.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(stage.timestamp), 'MMM d, yyyy h:mm a')}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
