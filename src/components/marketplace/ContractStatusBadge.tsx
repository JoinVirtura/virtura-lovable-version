import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, FileText, XCircle } from 'lucide-react';

interface ContractStatusBadgeProps {
  status: string | null;
  className?: string;
}

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  switch (status) {
    case 'signed':
      return (
        <Badge className={`bg-green-500/20 text-green-400 border-green-500/30 gap-1 ${className}`}>
          <CheckCircle className="w-3 h-3" />
          Contract Signed
        </Badge>
      );
    case 'pending_brand':
      return (
        <Badge className={`bg-yellow-500/20 text-yellow-400 border-yellow-500/30 gap-1 ${className}`}>
          <Clock className="w-3 h-3" />
          Awaiting Brand Signature
        </Badge>
      );
    case 'pending_creator':
      return (
        <Badge className={`bg-blue-500/20 text-blue-400 border-blue-500/30 gap-1 ${className}`}>
          <Clock className="w-3 h-3" />
          Awaiting Your Signature
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge className={`bg-red-500/20 text-red-400 border-red-500/30 gap-1 ${className}`}>
          <XCircle className="w-3 h-3" />
          Cancelled
        </Badge>
      );
    case 'draft':
      return (
        <Badge variant="secondary" className={`gap-1 ${className}`}>
          <FileText className="w-3 h-3" />
          Draft
        </Badge>
      );
    default:
      return null;
  }
}
