import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Users, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function BecomeCreatorCTA() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasCreatorAccount, setHasCreatorAccount] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    checkCreatorStatus();
    
    // Check if previously dismissed
    const dismissed = localStorage.getItem('creator-cta-dismissed');
    if (dismissed) {
      setIsDismissed(true);
    }
  }, [user]);

  const checkCreatorStatus = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('creator_accounts')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setHasCreatorAccount(!!data);
  };

  const handleDismiss = () => {
    localStorage.setItem('creator-cta-dismissed', 'true');
    setIsDismissed(true);
  };

  const handleGetStarted = () => {
    navigate('/creator/dashboard');
  };

  if (hasCreatorAccount || isDismissed) {
    return null;
  }

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20">
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
          <div className="p-3 rounded-lg bg-primary/10">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Become a Creator</h3>
              <p className="text-sm text-muted-foreground">
                Start earning from your content and collaborate with brands
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm">Earn from content</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-sm">Brand collaborations</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm">Track earnings</span>
              </div>
            </div>
            
            <Button onClick={handleGetStarted} className="w-full sm:w-auto">
              Get Started
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
