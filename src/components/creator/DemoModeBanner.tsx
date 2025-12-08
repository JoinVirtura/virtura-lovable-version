import { Sparkles, CreditCard, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

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
    <Alert 
      className={cn(
        "transition-all duration-300",
        isDemoMode 
          ? "border-green-500/50 bg-green-500/10 animate-pulse" 
          : "border-amber-500/50 bg-amber-500/10"
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {isDemoMode ? (
            <Eye className="h-5 w-5 text-green-500 mt-0.5" />
          ) : (
            <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
          )}
          <div className="space-y-1">
            <AlertTitle className={cn(
              "flex items-center gap-2",
              isDemoMode ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"
            )}>
              {isDemoMode ? 'Demo Mode Active' : 'Setup Required'}
              <span className={cn(
                "text-xs font-normal px-2 py-0.5 rounded-full",
                isDemoMode 
                  ? "bg-green-500/20 text-green-600 dark:text-green-400" 
                  : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
              )}>
                {isDemoMode ? 'Sample Data' : 'Real Data'}
              </span>
            </AlertTitle>
            <AlertDescription className="text-muted-foreground">
              {isDemoMode 
                ? "You're viewing sample earnings data to preview dashboard features."
                : showStripeSetup 
                  ? "Complete Stripe setup to start receiving real payments. Toggle demo mode to preview features."
                  : "Your real-time earnings data is displayed below."
              }
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
            <Label htmlFor="demo-mode" className="text-sm cursor-pointer flex items-center gap-1">
              {isDemoMode ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              Demo
            </Label>
          </div>
          
          {showStripeSetup && !isDemoMode && (
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
