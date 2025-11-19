import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Clock, Sparkles } from "lucide-react";

interface TrialBannerProps {
  trialEnd: string;
  onUpgrade?: () => void;
}

export function TrialBanner({ trialEnd, onUpgrade }: TrialBannerProps) {
  const navigate = useNavigate();
  
  const now = new Date();
  const end = new Date(trialEnd);
  const totalDays = 7;
  const msRemaining = end.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));
  
  // Hide if trial expired
  if (daysRemaining <= 0) return null;
  
  const progressValue = ((totalDays - daysRemaining) / totalDays) * 100;
  
  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      navigate('/upgrade');
    }
  };

  return (
    <Alert className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-1">
          <Clock className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1 space-y-3">
          <AlertDescription className="text-sm">
            <span className="font-semibold text-foreground">
              {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining in your Pro trial
            </span>
            <span className="text-muted-foreground ml-1">
              – Enjoy unlimited AI generations, premium avatars, and priority processing
            </span>
          </AlertDescription>
          
          <Progress value={progressValue} className="h-2" />
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleUpgrade} 
              size="sm"
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Upgrade Now
            </Button>
            <span className="text-xs text-muted-foreground">
              Continue with Pro features after your trial
            </span>
          </div>
        </div>
      </div>
    </Alert>
  );
}
