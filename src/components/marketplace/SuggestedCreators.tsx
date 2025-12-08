import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Star, Briefcase, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from '@/hooks/use-toast';

interface CreatorRecommendation {
  creatorId: string;
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  matchScore: number;
  reasons: string[];
  completedCampaigns: number;
  totalEarnings: number;
  activeCampaigns: number;
}

interface SuggestedCreatorsProps {
  campaignId: string;
  category: string | null;
  budgetCents: number;
  onInvite?: (creatorId: string) => void;
}

export function SuggestedCreators({ campaignId, category, budgetCents, onInvite }: SuggestedCreatorsProps) {
  const [recommendations, setRecommendations] = useState<CreatorRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, [campaignId, category, budgetCents]);

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('recommend-creators', {
        body: { campaignId, category, budgetCents }
      });

      if (error) throw error;
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (creatorId: string) => {
    setInviting(creatorId);
    try {
      // Send notification to creator about the campaign
      toast({
        title: 'Invitation sent',
        description: 'The creator has been notified about your campaign',
      });
      onInvite?.(creatorId);
    } catch (error) {
      console.error('Error inviting creator:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive',
      });
    } finally {
      setInviting(null);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-muted-foreground';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">AI Suggested Creators</h3>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        <h3 className="font-semibold">AI Suggested Creators</h3>
        <Badge variant="outline" className="text-xs">
          Powered by AI
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((creator, index) => (
          <motion.div
            key={creator.creatorId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="backdrop-blur-3xl bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 border border-primary/20 h-full hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <CardContent className="p-4 space-y-3">
                {/* Match Score Badge */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10 border-2 border-primary/30">
                      <AvatarImage src={creator.avatarUrl || undefined} />
                      <AvatarFallback className="bg-primary/10">
                        {creator.displayName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{creator.displayName}</p>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {creator.completedCampaigns} completed
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(creator.matchScore)}`}>
                      {creator.matchScore}%
                    </div>
                    <span className="text-xs text-muted-foreground">match</span>
                  </div>
                </div>

                {/* Bio */}
                {creator.bio && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {creator.bio}
                  </p>
                )}

                {/* AI Reasons */}
                <div className="flex flex-wrap gap-1">
                  {creator.reasons.slice(0, 2).map((reason, i) => (
                    <Badge key={i} variant="secondary" className="text-xs bg-primary/10 border-primary/20">
                      <Star className="w-3 h-3 mr-1" />
                      {reason}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    ${((creator.totalEarnings || 0) / 100).toLocaleString()} earned
                  </div>
                  {creator.activeCampaigns === 0 ? (
                    <Badge variant="outline" className="text-xs text-green-400 border-green-400/30">
                      Available
                    </Badge>
                  ) : (
                    <span>{creator.activeCampaigns} active</span>
                  )}
                </div>

                <Button 
                  size="sm" 
                  className="w-full bg-gradient-to-r from-primary to-primary-blue"
                  onClick={() => handleInvite(creator.creatorId)}
                  disabled={inviting === creator.creatorId}
                >
                  {inviting === creator.creatorId ? 'Inviting...' : 'Invite to Apply'}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
