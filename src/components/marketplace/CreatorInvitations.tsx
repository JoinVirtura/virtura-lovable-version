import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreatorInvites } from '@/hooks/useCreatorInvites';
import { Mail, Check, X, Clock, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { formatDistanceToNow, format, isPast } from 'date-fns';

export function CreatorInvitations() {
  const { invites, loading, respondToInvite } = useCreatorInvites();

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingInvites = invites.filter(i => i.status === 'pending');
  const pastInvites = invites.filter(i => i.status !== 'pending');

  if (invites.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Mail className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No invitations yet</h3>
          <p className="text-muted-foreground mt-1">
            When brands invite you to campaigns, they'll appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {pendingInvites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Pending Invitations ({pendingInvites.length})
          </h3>
          
          {pendingInvites.map(invite => {
            const isExpired = isPast(new Date(invite.expires_at));
            
            return (
              <Card key={invite.id} className={isExpired ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={invite.brand?.logo_url} />
                        <AvatarFallback>{invite.brand?.name?.[0] || 'B'}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{invite.campaign?.title}</CardTitle>
                        <CardDescription>
                          From {invite.brand?.name} • {formatDistanceToNow(new Date(invite.invited_at), { addSuffix: true })}
                        </CardDescription>
                      </div>
                    </div>
                    {isExpired ? (
                      <Badge variant="destructive">Expired</Badge>
                    ) : (
                      <Badge variant="secondary">
                        Expires {formatDistanceToNow(new Date(invite.expires_at), { addSuffix: true })}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{invite.campaign?.description}</p>
                  
                  {invite.message && (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-sm italic">"{invite.message}"</p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="h-4 w-4 text-green-500" />
                      <span>${((invite.campaign?.budget_cents || 0) / 100).toLocaleString()}</span>
                    </div>
                    {invite.campaign?.deadline && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Due {format(new Date(invite.campaign.deadline), 'MMM d, yyyy')}</span>
                      </div>
                    )}
                  </div>
                  
                  {!isExpired && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => respondToInvite(invite.id, true)}
                        className="gap-2"
                      >
                        <Check className="h-4 w-4" />
                        Accept & Apply
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => respondToInvite(invite.id, false)}
                        className="gap-2"
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {pastInvites.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">Past Invitations</h3>
          
          {pastInvites.map(invite => (
            <Card key={invite.id} className="opacity-75">
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={invite.brand?.logo_url} />
                      <AvatarFallback>{invite.brand?.name?.[0] || 'B'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{invite.campaign?.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {invite.brand?.name}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={invite.status === 'accepted' ? 'default' : 'secondary'}>
                    {invite.status === 'accepted' ? 'Accepted' : 
                     invite.status === 'declined' ? 'Declined' : 'Expired'}
                  </Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
