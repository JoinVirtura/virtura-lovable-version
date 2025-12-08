import { Badge } from '@/components/ui/badge';
import { DisputeStatus } from '@/hooks/useCampaignDisputes';
import { AlertCircle, Clock, CheckCircle, XCircle, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisputeStatusBadgeProps {
  status: DisputeStatus;
  className?: string;
}

const statusConfig: Record<DisputeStatus, {
  label: string;
  icon: React.ReactNode;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className: string;
}> = {
  open: {
    label: 'Open',
    icon: <AlertCircle className="h-3.5 w-3.5" />,
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-600 border-red-500/20',
  },
  under_review: {
    label: 'Under Review',
    icon: <Clock className="h-3.5 w-3.5" />,
    variant: 'secondary',
    className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  },
  resolved_brand_favor: {
    label: 'Resolved (Brand)',
    icon: <Scale className="h-3.5 w-3.5" />,
    variant: 'default',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  },
  resolved_creator_favor: {
    label: 'Resolved (Creator)',
    icon: <Scale className="h-3.5 w-3.5" />,
    variant: 'default',
    className: 'bg-green-500/10 text-green-600 border-green-500/20',
  },
  resolved_mutual: {
    label: 'Resolved (Mutual)',
    icon: <CheckCircle className="h-3.5 w-3.5" />,
    variant: 'default',
    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
  },
  closed: {
    label: 'Closed',
    icon: <XCircle className="h-3.5 w-3.5" />,
    variant: 'outline',
    className: 'bg-muted text-muted-foreground',
  },
};

export function DisputeStatusBadge({ status, className }: DisputeStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge 
      variant={config.variant}
      className={cn('gap-1', config.className, className)}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
}
