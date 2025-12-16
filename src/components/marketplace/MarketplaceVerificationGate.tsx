import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface VerificationStatus {
  status: string | null;
  subscription_status: string | null;
}

interface MarketplaceVerificationGateProps {
  onVerified: () => void;
  onNavigateToVerification: () => void;
}

export function MarketplaceVerificationGate({ 
  onVerified, 
  onNavigateToVerification 
}: MarketplaceVerificationGateProps) {
  const { user } = useAuth();
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVerificationStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_verification')
          .select('status, subscription_status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setVerification(data);

        // Check if user is fully verified
        if (data?.status === 'approved' && data?.subscription_status === 'active') {
          onVerified();
        }
      } catch (error) {
        console.error('Error fetching verification status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationStatus();
  }, [user, onVerified]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Checking verification status...</p>
        </CardContent>
      </Card>
    );
  }

  const isIdVerified = verification?.status === 'approved';
  const hasActiveSubscription = verification?.subscription_status === 'active';

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20">
      <CardContent className="p-8 space-y-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold">Verification Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            To apply as a Creator in the Marketplace, you must be verified. This helps brands 
            trust the creators they work with.
          </p>
        </div>

        <div className="space-y-3 max-w-md mx-auto">
          <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-3">
              {isIdVerified ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <span>Government ID Verification</span>
            </div>
            <Badge variant={isIdVerified ? 'default' : 'secondary'}>
              {isIdVerified ? 'Verified' : 'Required'}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border">
            <div className="flex items-center gap-3">
              {hasActiveSubscription ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-amber-500" />
              )}
              <span>Verification Subscription ($9.99/mo)</span>
            </div>
            <Badge variant={hasActiveSubscription ? 'default' : 'secondary'}>
              {hasActiveSubscription ? 'Active' : 'Required'}
            </Badge>
          </div>
        </div>

        <div className="text-center pt-4">
          <Button 
            size="lg" 
            onClick={onNavigateToVerification}
            className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
          >
            Get Verified Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <p className="text-xs text-muted-foreground mt-3">
            Verification takes 24-48 hours after submission
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
