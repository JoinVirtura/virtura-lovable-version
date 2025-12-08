import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  Shield, 
  Pen,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';

interface Contract {
  id: string;
  campaign_id: string;
  brand_id: string;
  creator_id: string;
  contract_terms: {
    campaignTitle?: string;
    campaignDescription?: string;
    brandName?: string;
    creatorName?: string;
    deliverables?: Record<string, any>;
    requirements?: Record<string, any>;
    deadline?: string;
    paymentTerms?: {
      totalAmount: number;
      platformFee: number;
      platformFeePercentage: number;
      creatorPayout: number;
      currency: string;
    };
    usageRights?: string;
    revisionPolicy?: string;
    cancellationPolicy?: string;
    confidentiality?: string;
    generatedAt?: string;
  };
  payment_amount_cents: number;
  platform_fee_cents: number;
  creator_payout_cents: number;
  deliverables_summary: string | null;
  deadline: string | null;
  brand_signed_at: string | null;
  creator_signed_at: string | null;
  status: string;
  created_at: string;
}

interface ContractViewerProps {
  contract: Contract;
  userRole: 'brand' | 'creator';
  onClose: () => void;
  onSigned?: () => void;
}

export function ContractViewer({ contract, userRole, onClose, onSigned }: ContractViewerProps) {
  const [signing, setSigning] = useState(false);
  const terms = contract.contract_terms;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cents / 100);
  };

  const handleSign = async () => {
    setSigning(true);
    try {
      const { data, error } = await supabase.functions.invoke('sign-contract', {
        body: { 
          contractId: contract.id, 
          signerType: userRole 
        }
      });

      if (error) throw error;

      toast({
        title: 'Contract signed',
        description: data.message,
      });
      
      onSigned?.();
    } catch (error: any) {
      console.error('Error signing contract:', error);
      toast({
        title: 'Error signing contract',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSigning(false);
    }
  };

  const canSign = 
    (userRole === 'brand' && !contract.brand_signed_at) ||
    (userRole === 'creator' && !contract.creator_signed_at);

  const getStatusBadge = () => {
    switch (contract.status) {
      case 'signed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle className="w-3 h-3 mr-1" />Fully Signed</Badge>;
      case 'pending_brand':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Awaiting Brand</Badge>;
      case 'pending_creator':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Awaiting Creator</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Draft</Badge>;
    }
  };

  return (
    <Dialog open onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0 bg-gradient-to-br from-background via-background to-primary/5">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Campaign Contract</DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {terms.campaignTitle || 'Untitled Campaign'}
                </p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 pb-6">
            {/* Parties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Brand</p>
                <p className="font-medium">{terms.brandName || 'Brand'}</p>
                {contract.brand_signed_at ? (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Signed {format(new Date(contract.brand_signed_at), 'MMM dd, yyyy')}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Awaiting signature
                  </div>
                )}
              </div>
              <div className="p-4 rounded-lg bg-card/50 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Creator</p>
                <p className="font-medium">{terms.creatorName || 'Creator'}</p>
                {contract.creator_signed_at ? (
                  <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
                    <CheckCircle className="w-3 h-3" />
                    Signed {format(new Date(contract.creator_signed_at), 'MMM dd, yyyy')}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Awaiting signature
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Deliverables */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Deliverables & Requirements
              </h4>
              <div className="p-4 rounded-lg bg-card/30 border border-border/50">
                {contract.deliverables_summary ? (
                  <p className="text-sm">{contract.deliverables_summary}</p>
                ) : terms.deliverables ? (
                  <ul className="text-sm space-y-1">
                    {Object.entries(terms.deliverables).map(([key, value]) => (
                      <li key={key}>• {key}: {String(value)}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific deliverables listed</p>
                )}
              </div>
            </div>

            {/* Payment Terms */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Payment Terms
              </h4>
              <div className="p-4 rounded-lg bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/20">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(contract.payment_amount_cents)}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-yellow-400">
                      {formatCurrency(contract.platform_fee_cents)}
                    </p>
                    <p className="text-xs text-muted-foreground">Platform Fee (10%)</p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-primary">
                      {formatCurrency(contract.creator_payout_cents)}
                    </p>
                    <p className="text-xs text-muted-foreground">Creator Payout</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            {contract.deadline && (
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Timeline
                </h4>
                <div className="p-4 rounded-lg bg-card/30 border border-border/50">
                  <p className="text-sm">
                    <span className="text-muted-foreground">Deadline: </span>
                    <span className="font-medium">{format(new Date(contract.deadline), 'MMMM dd, yyyy')}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div>
              <h4 className="font-semibold mb-3">Terms & Conditions</h4>
              <div className="space-y-3 text-sm">
                {terms.usageRights && (
                  <div className="p-3 rounded-lg bg-card/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Usage Rights</p>
                    <p>{terms.usageRights}</p>
                  </div>
                )}
                {terms.revisionPolicy && (
                  <div className="p-3 rounded-lg bg-card/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Revision Policy</p>
                    <p>{terms.revisionPolicy}</p>
                  </div>
                )}
                {terms.cancellationPolicy && (
                  <div className="p-3 rounded-lg bg-card/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Cancellation Policy</p>
                    <p>{terms.cancellationPolicy}</p>
                  </div>
                )}
                {terms.confidentiality && (
                  <div className="p-3 rounded-lg bg-card/30 border border-border/50">
                    <p className="text-xs text-muted-foreground mb-1">Confidentiality</p>
                    <p>{terms.confidentiality}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Sign Button */}
        {canSign && (
          <div className="p-6 pt-0 border-t border-border/50">
            <Button 
              className="w-full bg-gradient-to-r from-primary to-primary-blue"
              size="lg"
              onClick={handleSign}
              disabled={signing}
            >
              <Pen className="w-4 h-4 mr-2" />
              {signing ? 'Signing...' : `Sign Contract as ${userRole === 'brand' ? 'Brand' : 'Creator'}`}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              By signing, you agree to all terms and conditions outlined above
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
