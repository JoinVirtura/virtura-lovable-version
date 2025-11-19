import { CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function VerificationBadge() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500">
            <CheckCircle2 className="w-3 h-3 text-white" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Creator</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
