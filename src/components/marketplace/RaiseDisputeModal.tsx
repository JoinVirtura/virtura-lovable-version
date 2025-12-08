import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCampaignDisputes, DisputeType } from '@/hooks/useCampaignDisputes';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface RaiseDisputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  campaignTitle: string;
  userType: 'brand' | 'creator';
}

const disputeTypes: { value: DisputeType; label: string; description: string }[] = [
  { value: 'deliverable_quality', label: 'Deliverable Quality', description: 'Work doesn\'t meet agreed standards' },
  { value: 'payment_issue', label: 'Payment Issue', description: 'Problems with payment or escrow' },
  { value: 'deadline_missed', label: 'Deadline Missed', description: 'Work not delivered on time' },
  { value: 'communication', label: 'Communication Problem', description: 'Unresponsive or poor communication' },
  { value: 'scope_disagreement', label: 'Scope Disagreement', description: 'Dispute about project requirements' },
  { value: 'other', label: 'Other', description: 'Other issues not listed above' },
];

export function RaiseDisputeModal({ 
  open, 
  onOpenChange, 
  campaignId, 
  campaignTitle,
  userType 
}: RaiseDisputeModalProps) {
  const { raiseDispute } = useCampaignDisputes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    disputeType: '' as DisputeType | '',
    subject: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.disputeType || !formData.subject || !formData.description) return;

    setLoading(true);
    const result = await raiseDispute({
      campaignId,
      disputeType: formData.disputeType,
      subject: formData.subject,
      description: formData.description,
      raisedByType: userType,
    });

    setLoading(false);
    if (result.success) {
      onOpenChange(false);
      setFormData({ disputeType: '', subject: '', description: '' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Report an Issue
          </DialogTitle>
          <DialogDescription>
            Raise a dispute for "{campaignTitle}". Our team will review and help mediate.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dispute-type">Issue Type</Label>
            <Select 
              value={formData.disputeType} 
              onValueChange={(value: DisputeType) => setFormData(prev => ({ ...prev, disputeType: value }))}
            >
              <SelectTrigger id="dispute-type">
                <SelectValue placeholder="Select the type of issue" />
              </SelectTrigger>
              <SelectContent>
                {disputeTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <span className="font-medium">{type.label}</span>
                      <span className="text-muted-foreground ml-2 text-xs">{type.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief summary of the issue"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Provide details about the issue, including any relevant context or timeline..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={5}
            />
            <p className="text-xs text-muted-foreground">
              Be specific and include dates, communications, or other relevant details.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.disputeType || !formData.subject || !formData.description}
              className="gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Dispute
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
