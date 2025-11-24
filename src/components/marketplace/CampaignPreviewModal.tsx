import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ExternalLink, Calendar, DollarSign, Users, Briefcase } from 'lucide-react';
import { format } from 'date-fns';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget_cents: number;
  deadline: string;
  category: string;
  deliverables: any;
  requirements: any;
  brands?: {
    name: string;
    logo_url: string;
    description?: string;
  };
}

interface CampaignPreviewModalProps {
  campaign: Campaign | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (campaignId: string) => void;
}

export function CampaignPreviewModal({ campaign, isOpen, onClose, onApply }: CampaignPreviewModalProps) {
  if (!campaign) return null;

  const deliverables = Array.isArray(campaign.deliverables) 
    ? campaign.deliverables 
    : typeof campaign.deliverables === 'object' && campaign.deliverables !== null
    ? Object.values(campaign.deliverables)
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Campaign Preview</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Campaign Details */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-3">{campaign.category}</Badge>
              <h2 className="text-2xl font-bold mb-2">{campaign.title}</h2>
              <p className="text-muted-foreground">{campaign.description}</p>
            </div>

            {/* Key Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Budget</span>
                </div>
                <div className="text-xl font-bold">
                  ${(campaign.budget_cents / 100).toLocaleString()}
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Deadline</span>
                </div>
                <div className="text-sm font-semibold">
                  {campaign.deadline ? format(new Date(campaign.deadline), 'MMM dd, yyyy') : 'No deadline'}
                </div>
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Deliverables
              </h3>
              <div className="space-y-2">
                {deliverables.length > 0 ? (
                  deliverables.map((deliverable: any, index: number) => (
                    <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {typeof deliverable === 'string' ? deliverable : deliverable.name || 'Deliverable'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No deliverables specified</p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Brand Info & Apply */}
          <div className="space-y-6">
            {/* Brand Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-card/50 to-card border border-border">
              <div className="flex items-start gap-4 mb-4">
                {campaign.brands?.logo_url ? (
                  <img 
                    src={campaign.brands.logo_url} 
                    alt={campaign.brands.name}
                    className="w-16 h-16 rounded-xl object-cover border border-border"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{campaign.brands?.name || 'Unknown Brand'}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {campaign.brands?.description || 'No description available'}
                  </p>
                </div>
              </div>
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href="#" target="_blank" rel="noopener noreferrer">
                  View Brand Profile
                  <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>

            {/* Budget Highlight */}
            <div className="p-6 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-2xl border border-primary/20">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Campaign Budget</p>
                <div className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-blue bg-clip-text text-transparent">
                  ${(campaign.budget_cents / 100).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Platform fee applies</p>
              </div>
            </div>

            {/* Apply Button */}
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-primary to-primary-blue"
              onClick={() => {
                onApply(campaign.id);
                onClose();
              }}
            >
              Apply to Campaign
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              You'll be able to propose your rate and timeline in the next step
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
