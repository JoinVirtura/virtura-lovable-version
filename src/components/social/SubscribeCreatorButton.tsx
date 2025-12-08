import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Loader2, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SubscribeCreatorButtonProps {
  creatorId: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
  className?: string;
}

export function SubscribeCreatorButton({ 
  creatorId, 
  size = 'sm',
  variant = 'default',
  className 
}: SubscribeCreatorButtonProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    if (!user || user.id === creatorId) {
      setCheckingStatus(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        // Check if user has an active subscription to this creator
        const { data: creatorAccount } = await supabase
          .from('creator_accounts')
          .select('id')
          .eq('user_id', creatorId)
          .single();

        if (creatorAccount) {
          const { data: subscription } = await supabase
            .from('creator_subscriptions')
            .select('id')
            .eq('creator_id', creatorAccount.id)
            .eq('subscriber_id', user.id)
            .eq('status', 'active')
            .single();

          setIsSubscribed(!!subscription);
        }
      } catch (error) {
        // No subscription found
      } finally {
        setCheckingStatus(false);
      }
    };

    checkSubscription();
  }, [user, creatorId]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please sign in to subscribe');
      return;
    }

    setLoading(true);
    try {
      // Call edge function to create subscription checkout
      const { data, error } = await supabase.functions.invoke('create-creator-subscription', {
        body: { creatorUserId: creatorId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.success('Subscribed successfully!');
        setIsSubscribed(true);
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
      toast.error(error.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus || !user || user.id === creatorId) {
    return null;
  }

  if (isSubscribed) {
    return (
      <Button
        size={size}
        variant="ghost"
        disabled
        className={cn("gap-1.5 text-primary", className)}
      >
        <Check className="h-4 w-4" />
        Subscribed
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleSubscribe}
      disabled={loading}
      className={cn(
        variant === 'default' && "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0",
        "gap-1.5",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          <Star className="h-4 w-4" />
          Subscribe
        </>
      )}
    </Button>
  );
}