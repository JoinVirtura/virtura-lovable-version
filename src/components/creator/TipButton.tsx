import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TipButtonProps {
  creatorId: string;
  creatorName: string;
}

export function TipButton({ creatorId, creatorName }: TipButtonProps) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(5);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const quickAmounts = [5, 10, 25, 50];

  const handleTip = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-creator-tip', {
        body: { creatorId, amountCents: amount * 100, message },
      });
      if (error) throw error;
      toast({ title: 'Tip sent!', description: `You tipped ${creatorName} $${amount}` });
      setOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <DollarSign className="mr-2 h-4 w-4" />
        Tip
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tip {creatorName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              {quickAmounts.map((amt) => (
                <Button key={amt} variant={amount === amt ? 'default' : 'outline'} onClick={() => setAmount(amt)}>
                  ${amt}
                </Button>
              ))}
            </div>
            <Input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value))} />
            <Textarea placeholder="Add a message (optional)" value={message} onChange={(e) => setMessage(e.target.value)} />
            <Button className="w-full" onClick={handleTip} disabled={loading}>
              Send ${amount} Tip
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
