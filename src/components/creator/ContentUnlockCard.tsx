import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ContentUnlockCardProps {
  contentId: string;
  price: number;
  previewUrl?: string;
  isLocked: boolean;
  children: React.ReactNode;
}

export function ContentUnlockCard({ contentId, price, previewUrl, isLocked, children }: ContentUnlockCardProps) {
  const [loading, setLoading] = useState(false);

  const handleUnlock = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-content-unlock', {
        body: { contentId, amountCents: price * 100 },
      });
      if (error) throw error;
      toast({ title: 'Content unlocked!', description: 'You now have access to this content' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!isLocked) return <>{children}</>;

  return (
    <Card className="relative overflow-hidden">
      <div className="blur-sm">{children}</div>
      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
        <div className="text-center text-white space-y-4">
          <Lock className="mx-auto h-12 w-12" />
          <p className="font-semibold">Unlock for ${price}</p>
          <Button onClick={handleUnlock} disabled={loading}>
            Unlock Content
          </Button>
        </div>
      </div>
    </Card>
  );
}
