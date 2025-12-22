import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VerificationUploadForm } from '@/components/verification/VerificationUploadForm';
import { CheckCircle2, Clock, XCircle, Shield, Loader2, CreditCard, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VerificationStatus {
  status: string;
  subscription_status: string | null;
  reviewed_at: string | null;
  denial_reason: string | null;
}

export default function VerificationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_verification')
        .select('status, subscription_status, reviewed_at, denial_reason')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setStatus(data);
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Handle subscription redirect results
    const subscriptionResult = searchParams.get('verification_subscription');
    if (subscriptionResult === 'success') {
      toast({
        title: 'Subscription Activated!',
        description: 'Your verification badge is now active.',
      });
      fetchStatus();
    } else if (subscriptionResult === 'canceled') {
      toast({
        title: 'Subscription Canceled',
        description: 'You can subscribe anytime to activate your badge.',
        variant: 'destructive',
      });
    }
  }, [searchParams]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-verification-subscription', {
        body: {
          successUrl: window.location.href,
          cancelUrl: window.location.href,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to start subscription',
        variant: 'destructive',
      });
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 sm:p-6 max-w-2xl flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isApprovedButNotSubscribed = status?.status === 'approved' && status?.subscription_status !== 'active';

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-2xl space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Verification</h1>
        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
          Get verified to stand out as a trusted creator
        </p>
      </div>

      {/* Benefits Card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Benefits of Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Blue checkmark badge on your profile and posts</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Increased trust and credibility with your audience</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>Priority support and features</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
              <span>$9.99/month subscription</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Status Display */}
      {!status && <VerificationUploadForm onSuccess={fetchStatus} />}

      {status?.status === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-warning" />
              Under Review
            </CardTitle>
            <CardDescription>
              Your verification request is being reviewed by our team
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
              Pending Review
            </Badge>
            <p className="text-sm text-muted-foreground mt-4">
              We typically review verification requests within 24-48 hours. 
              You'll receive a notification once your request has been processed.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Approved but needs subscription */}
      {isApprovedButNotSubscribed && (
        <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Activate Your Verification
            </CardTitle>
            <CardDescription>
              Your identity has been verified! Subscribe to activate your badge.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 text-xs sm:text-sm">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Identity Verified
              </Badge>
              <Badge variant="outline" className="bg-muted text-muted-foreground text-xs sm:text-sm">
                Badge Inactive
              </Badge>
            </div>
            
            <div className="p-3 sm:p-4 rounded-lg bg-background/50 border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div>
                  <p className="font-semibold text-sm sm:text-base">Verified Creator Badge</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Monthly subscription</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold">$9.99</p>
                  <p className="text-xs text-muted-foreground">/month</p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSubscribe} 
              disabled={subscribing}
              className="w-full gap-2"
              size="lg"
            >
              {subscribing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              Subscribe & Activate Badge
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fully verified with active subscription */}
      {status?.status === 'approved' && status?.subscription_status === 'active' && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Verified Creator
            </CardTitle>
            <CardDescription>
              Your account is verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                Verified
              </Badge>
              <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                Subscription Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Your verification badge is now visible on your profile and posts.
              Your subscription is active and will renew monthly.
            </p>
          </CardContent>
        </Card>
      )}

      {status?.status === 'denied' && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-destructive" />
              Verification Denied
            </CardTitle>
            <CardDescription>
              Your verification request was not approved
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
              Denied
            </Badge>
            {status.denial_reason && (
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium mb-1">Reason:</p>
                <p className="text-sm text-muted-foreground">{status.denial_reason}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              You can resubmit your verification request with updated documents.
            </p>
            <VerificationUploadForm onSuccess={fetchStatus} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
