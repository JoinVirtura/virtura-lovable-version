import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscribeButtonProps {
  creatorId: string;
  creatorName: string;
}

export function SubscribeButton({ creatorId, creatorName }: SubscribeButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const tiers = [
    { name: 'Basic', price: 4.99, benefits: ['Early access', 'Exclusive content'] },
    { name: 'Premium', price: 9.99, benefits: ['All Basic benefits', 'Monthly Q&A', 'Behind the scenes'] },
    { name: 'VIP', price: 24.99, benefits: ['All Premium benefits', '1-on-1 session', 'Custom requests'] },
  ];

  const handleSubscribe = async (tier: string, amount: number) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-creator-subscription', {
        body: { creator_id: creatorId, tier, amount_cents: amount * 100 },
      });
      if (error) throw error;
      toast({ title: 'Subscription started', description: `You are now subscribed to ${creatorName}` });
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Crown className="mr-2 h-4 w-4" />
        Subscribe
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Subscribe to {creatorName}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => (
              <Card key={tier.name}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-2xl font-bold">${tier.price}/mo</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {tier.benefits.map((benefit, i) => (
                      <li key={i}>✓ {benefit}</li>
                    ))}
                  </ul>
                  <Button className="w-full" onClick={() => handleSubscribe(tier.name, tier.price)} disabled={loading}>
                    Subscribe
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
