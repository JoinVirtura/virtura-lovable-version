import { useState } from 'react';
import { useAdminMarketplaceAccess } from '@/hooks/useAdminMarketplaceAccess';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, XCircle, Clock, ExternalLink, Briefcase, Palette } from 'lucide-react';
import { format } from 'date-fns';

export function AdminMarketplaceApprovals() {
  const { requests, loading, approveRequest, denyRequest } = useAdminMarketplaceAccess();
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');

  const handleDeny = async () => {
    if (!selectedRequestId || !denyReason.trim()) return;
    await denyRequest(selectedRequestId, denyReason);
    setDenyDialogOpen(false);
    setSelectedRequestId(null);
    setDenyReason('');
  };

  const openDenyDialog = (requestId: string) => {
    setSelectedRequestId(requestId);
    setDenyDialogOpen(true);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const deniedRequests = requests.filter(r => r.status === 'denied');

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const renderRequest = (request: any) => (
    <Card key={request.id}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {request.role_requested === 'creator' ? (
              <Palette className="h-5 w-5 text-primary" />
            ) : (
              <Briefcase className="h-5 w-5 text-primary" />
            )}
            <div>
              <CardTitle className="text-lg">
                {request.role_requested === 'creator' ? 'Creator' : 'Brand'} Application
              </CardTitle>
              <CardDescription>
                Applied {format(new Date(request.created_at), 'MMM d, yyyy')}
              </CardDescription>
            </div>
          </div>
          <Badge
            variant={
              request.status === 'approved'
                ? 'default'
                : request.status === 'denied'
                ? 'destructive'
                : 'secondary'
            }
          >
            {request.status || 'pending'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="text-sm font-semibold text-foreground mb-1">Pitch</div>
          <p className="text-sm text-muted-foreground">{request.pitch}</p>
        </div>

        <div>
          <div className="text-sm font-semibold text-foreground mb-1">Experience</div>
          <p className="text-sm text-muted-foreground">{request.experience}</p>
        </div>

        {request.portfolio_links && request.portfolio_links.length > 0 && (
          <div>
            <div className="text-sm font-semibold text-foreground mb-2">Portfolio</div>
            <div className="flex flex-wrap gap-2">
              {request.portfolio_links.map((link: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <a href={link} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Link {index + 1}
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {request.denial_reason && (
          <div>
            <div className="text-sm font-semibold text-destructive mb-1">Denial Reason</div>
            <p className="text-sm text-muted-foreground">{request.denial_reason}</p>
          </div>
        )}

        {request.status === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => approveRequest(request.id)}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              onClick={() => openDenyDialog(request.id)}
              variant="destructive"
              className="flex-1"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deny
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketplace Access Requests</h2>
          <p className="text-muted-foreground mt-1">
            Review and approve marketplace access applications
          </p>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved ({approvedRequests.length})
            </TabsTrigger>
            <TabsTrigger value="denied">
              <XCircle className="h-4 w-4 mr-2" />
              Denied ({deniedRequests.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No pending requests</p>
                </CardContent>
              </Card>
            ) : (
              pendingRequests.map(renderRequest)
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No approved requests</p>
                </CardContent>
              </Card>
            ) : (
              approvedRequests.map(renderRequest)
            )}
          </TabsContent>

          <TabsContent value="denied" className="space-y-4">
            {deniedRequests.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No denied requests</p>
                </CardContent>
              </Card>
            ) : (
              deniedRequests.map(renderRequest)
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Marketplace Access</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this application. This will be shared with the applicant.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for denial..."
            value={denyReason}
            onChange={(e) => setDenyReason(e.target.value)}
            className="min-h-[120px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeny} disabled={!denyReason.trim()}>
              Deny Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
