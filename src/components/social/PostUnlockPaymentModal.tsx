import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2 } from 'lucide-react';

const stripePromise = loadStripe('pk_test_51QRIkZLHJzF3qcZzCDBU8bZPUvJX5yQZA8k8KkH3RpO5nKPFBwZ2x3d2uQKYr8nGJY4nQc3hqvLZdN7F0qEQm7vH00nBPQYQ3b');

interface PostUnlockPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  postId: string;
  amount: number;
  onSuccess: () => void;
}

function PaymentForm({ amount, onSuccess, onClose }: { amount: number; onSuccess: () => void; onClose: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: 'Payment failed',
          description: error.message,
          variant: 'destructive',
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: 'Payment successful!',
          description: 'Post unlocked successfully',
        });
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast({
        title: 'Payment error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Amount</span>
          <span className="font-semibold">${(amount / 100).toFixed(2)}</span>
        </div>
      </div>

      <PaymentElement />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={loading}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay $${(amount / 100).toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  );
}

export function PostUnlockPaymentModal({
  isOpen,
  onClose,
  clientSecret,
  postId,
  amount,
  onSuccess,
}: PostUnlockPaymentModalProps) {
  const [stripeOptions, setStripeOptions] = useState<any>(null);

  useEffect(() => {
    if (clientSecret) {
      setStripeOptions({
        clientSecret,
        appearance: {
          theme: 'stripe',
        },
      });
    }
  }, [clientSecret]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unlock Post</DialogTitle>
          <DialogDescription>
            Complete payment to unlock this exclusive content
          </DialogDescription>
        </DialogHeader>

        {stripeOptions && (
          <Elements stripe={stripePromise} options={stripeOptions}>
            <PaymentForm amount={amount} onSuccess={onSuccess} onClose={onClose} />
          </Elements>
        )}
      </DialogContent>
    </Dialog>
  );
}
