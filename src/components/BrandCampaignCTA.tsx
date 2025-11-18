import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Users, Shield, TrendingUp, X, Plus } from "lucide-react";

interface BrandCampaignCTAProps {
  hasCampaigns: boolean;
}

export function BrandCampaignCTA({ hasCampaigns }: BrandCampaignCTAProps) {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('brand-campaign-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('brand-campaign-cta-dismissed', 'true');
    setIsDismissed(true);
  };

  const handleCreateCampaign = () => {
    navigate('/marketplace/create');
  };

  const handleBrowseCreators = () => {
    navigate('/marketplace');
  };

  if (hasCampaigns || isDismissed) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-violet-500/10 via-blue-500/5 to-background border-violet-500/20">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
      </Button>
      
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-violet-500/10">
            <Briefcase className="h-6 w-6 text-violet-500" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Launch Your First Campaign</h3>
              <p className="text-sm text-muted-foreground">
                Connect with talented creators and bring your brand vision to life
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-violet-500" />
                <span className="text-sm">Hire top creators</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-violet-500" />
                <span className="text-sm">Secure payments</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-violet-500" />
                <span className="text-sm">Track deliverables</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-violet-500" />
                <span className="text-sm">Rate completed work</span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleCreateCampaign} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Campaign
              </Button>
              <Button onClick={handleBrowseCreators} variant="outline">
                Browse Creators
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
