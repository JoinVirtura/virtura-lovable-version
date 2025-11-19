import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase } from 'lucide-react';

export default function MarketplacePage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Marketplace</h1>
          <p className="text-muted-foreground mt-2">
            Connect brands with creators for paid campaigns
          </p>
        </div>
      </div>

      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto space-y-4">
          <Briefcase className="h-16 w-16 mx-auto text-primary" />
          <h3 className="text-2xl font-semibold">Apply for Marketplace Access</h3>
          <p className="text-muted-foreground">
            The marketplace allows brands and creators to collaborate on campaigns.
            Apply now to get started!
          </p>
          <div className="pt-4 space-y-3">
            <Button className="w-full" size="lg">
              Apply as Creator
            </Button>
            <Button className="w-full" variant="outline" size="lg">
              Apply as Brand
            </Button>
          </div>
          <p className="text-xs text-muted-foreground pt-4">
            Applications are reviewed by our team within 24-48 hours
          </p>
        </div>
      </Card>
    </div>
  );
}
