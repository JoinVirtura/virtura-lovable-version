import { useCreatorTrialStatus } from '@/hooks/useCreatorTrialStatus';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TrialStatusBannerProps {
  creatorId?: string;
}

export function TrialStatusBanner({ creatorId }: TrialStatusBannerProps) {
  const { trialStatus, loading } = useCreatorTrialStatus(creatorId);
  const navigate = useNavigate();

  if (loading || !trialStatus?.isInTrial) {
    return null;
  }

  const urgencyLevel = trialStatus.daysRemaining <= 2 ? 'urgent' : trialStatus.daysRemaining <= 5 ? 'warning' : 'normal';
  
  return (
    <Card className={`
      border backdrop-blur-xl
      ${urgencyLevel === 'urgent' 
        ? 'border-destructive/50 bg-gradient-to-r from-destructive/10 to-destructive/5' 
        : urgencyLevel === 'warning'
        ? 'border-warning/50 bg-gradient-to-r from-warning/10 to-warning/5'
        : 'border-primary/50 bg-gradient-to-r from-primary/10 to-primary/5'}
    `}>
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`
              p-2 rounded-full
              ${urgencyLevel === 'urgent' ? 'bg-destructive/20' : urgencyLevel === 'warning' ? 'bg-warning/20' : 'bg-primary/20'}
            `}>
              {urgencyLevel === 'urgent' ? (
                <Clock className="w-5 h-5 text-destructive animate-pulse" />
              ) : (
                <Sparkles className="w-5 h-5 text-primary" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm">
                  {urgencyLevel === 'urgent' 
                    ? `Trial ends in ${trialStatus.daysRemaining} day${trialStatus.daysRemaining === 1 ? '' : 's'}!`
                    : `${trialStatus.daysRemaining} days left in your trial`}
                </h4>
              </div>
              
              <div className="space-y-1">
                <Progress 
                  value={trialStatus.percentComplete} 
                  className="h-1.5 w-full max-w-[200px]"
                />
                <p className="text-xs text-muted-foreground">
                  {urgencyLevel === 'urgent' 
                    ? 'Upgrade now to keep your benefits'
                    : 'Enjoying premium features'}
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            size="sm"
            variant={urgencyLevel === 'urgent' ? 'destructive' : 'default'}
            onClick={() => navigate('/creator-dashboard')}
            className="gap-2"
          >
            Upgrade Now
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
