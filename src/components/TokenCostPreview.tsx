import { AlertCircle, Coins } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { calculateTokenCost, getTokenCostInfo } from '@/hooks/useTokenBalance';
import { TOKEN_COSTS } from '@/hooks/useTokenBalance';

interface TokenCostPreviewProps {
  resourceType: keyof typeof TOKEN_COSTS;
  model?: string;
  quantity?: number;
  currentBalance: number;
  showWarning?: boolean;
}

export function TokenCostPreview({
  resourceType,
  model,
  quantity = 1,
  currentBalance,
  showWarning = true,
}: TokenCostPreviewProps) {
  const tokens = calculateTokenCost(resourceType, model, quantity);
  const { description } = getTokenCostInfo(resourceType, model);
  const hasEnough = currentBalance >= tokens;
  const willBeLow = (currentBalance - tokens) < 10;

  if (!showWarning && hasEnough) {
    return (
      <Badge variant="secondary" className="gap-1">
        <Coins className="h-3 w-3" />
        {tokens} {tokens === 1 ? 'token' : 'tokens'}
      </Badge>
    );
  }

  return (
    <Alert variant={hasEnough ? (willBeLow ? "default" : "default") : "destructive"}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>
        {hasEnough ? 'Token Cost' : 'Insufficient Tokens'}
      </AlertTitle>
      <AlertDescription className="space-y-2">
        <div className="flex items-center justify-between">
          <span>{description}</span>
          <Badge variant={hasEnough ? "secondary" : "destructive"} className="gap-1">
            <Coins className="h-3 w-3" />
            {tokens} {tokens === 1 ? 'token' : 'tokens'}
          </Badge>
        </div>
        <div className="text-sm">
          Your balance: <span className="font-semibold">{currentBalance}</span> tokens
          {hasEnough && (
            <>
              {' → '}
              After: <span className={willBeLow ? 'font-semibold text-warning' : 'font-semibold'}>
                {currentBalance - tokens}
              </span> tokens
            </>
          )}
        </div>
        {!hasEnough && (
          <p className="text-sm font-medium">
            You need {tokens - currentBalance} more tokens to perform this operation.
          </p>
        )}
        {willBeLow && hasEnough && (
          <p className="text-sm text-warning">
            ⚠️ This will leave you with a low token balance
          </p>
        )}
      </AlertDescription>
    </Alert>
  );
}

// Inline version for buttons/controls
export function TokenCostBadge({
  resourceType,
  model,
  quantity = 1,
}: {
  resourceType: keyof typeof TOKEN_COSTS;
  model?: string;
  quantity?: number;
}) {
  const tokens = calculateTokenCost(resourceType, model, quantity);
  
  return (
    <Badge variant="outline" className="gap-1">
      <Coins className="h-3 w-3" />
      {tokens}
    </Badge>
  );
}
