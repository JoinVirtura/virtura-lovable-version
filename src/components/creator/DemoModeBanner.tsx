import { AlertTriangle, Sparkles, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DemoModeBannerProps {
  isDemoMode: boolean;
  onToggle: (enabled: boolean) => void;
  onSetupStripe: () => void;
  showStripeSetup?: boolean;
}

export function DemoModeBanner({ 
  isDemoMode, 
  onToggle, 
  onSetupStripe,
  showStripeSetup = true 
}: DemoModeBannerProps) {
  return (
    <Alert className="border-amber-500/50 bg-amber-500/10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
          <div className="space-y-1">
            <AlertTitle className="text-amber-600 dark:text-amber-400 flex items-center gap-2">
              Demo Mode Active
              <span className="text-xs font-normal bg-amber-500/20 px-2 py-0.5 rounded-full">
                Sample Data
              </span>
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              You're viewing sample earnings data to preview dashboard features. 
              {showStripeSetup && " Complete Stripe setup to start receiving real payments."}
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <Switch 
              id="demo-mode" 
              checked={isDemoMode} 
              onCheckedChange={onToggle}
            />
            <Label htmlFor="demo-mode" className="text-sm cursor-pointer">
              Demo
            </Label>
          </div>
          
          {showStripeSetup && (
            <Button 
              onClick={onSetupStripe}
              size="sm"
              className="gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Setup Payments
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
