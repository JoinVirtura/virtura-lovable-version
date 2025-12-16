import { useState } from 'react';
import { useAdminMarketplaceAccess } from '@/hooks/useAdminMarketplaceAccess';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle, XCircle, Clock, ExternalLink, Briefcase, Palette, 
  Globe, DollarSign, Users, FileText, Instagram, Video, Zap, Tag
} from 'lucide-react';
import { format } from 'date-fns';

interface CreatorApplicationData {
  contentSpecialty?: string;
  industries?: string;
  turnaroundTime?: string;
  pitch?: string;
  profileLink?: string;
}

interface BrandApplicationData {
  websiteUrl?: string;
  campaignType?: string;
  creatorType?: string;
  budgetRange?: string;
  deliverables?: string;
}

function parseApplicationData(pitch: string | null, role: string): CreatorApplicationData | BrandApplicationData | null {
  if (!pitch) return null;
  
  try {
    return JSON.parse(pitch);
  } catch {
    // Legacy format - return pitch as-is
    if (role === 'creator') {
      return { pitch } as CreatorApplicationData;
    }
    return null;
  }
}

export function AdminMarketplaceApprovals() {
  const { requests, loading, approveRequest, denyRequest } = useAdminMarketplaceAccess();
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [denyReason, setDenyReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    await approveRequest(requestId);
    setProcessingId(null);
  };

  const handleDeny = async () => {
    if (!selectedRequestId || !denyReason.trim()) return;
    setProcessingId(selectedRequestId);
    await denyRequest(selectedRequestId, denyReason);
    setProcessingId(null);
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

  const renderCreatorFields = (data: CreatorApplicationData) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.contentSpecialty && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Video className="h-4 w-4 text-primary" />
            Content Specialty
          </div>
          <p className="text-sm text-muted-foreground pl-6">{data.contentSpecialty}</p>
        </div>
      )}
      
      {data.industries && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Tag className="h-4 w-4 text-primary" />
            Industries/Niches
          </div>
          <p className="text-sm text-muted-foreground pl-6">{data.industries}</p>
        </div>
      )}
      
      {data.turnaroundTime && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Zap className="h-4 w-4 text-primary" />
            Turnaround Time
          </div>
          <p className="text-sm text-muted-foreground pl-6">{data.turnaroundTime}</p>
        </div>
      )}
      
      {data.profileLink && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Instagram className="h-4 w-4 text-primary" />
            Social Profile
          </div>
          <a 
            href={data.profileLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline pl-6 flex items-center gap-1"
          >
            {data.profileLink}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      
      {data.pitch && (
        <div className="col-span-full space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Collaboration Pitch
          </div>
          <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">{data.pitch}</p>
        </div>
      )}
    </div>
  );

  const renderBrandFields = (data: BrandApplicationData) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {data.websiteUrl && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Globe className="h-4 w-4 text-primary" />
            Website
          </div>
          <a 
            href={data.websiteUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline pl-6 flex items-center gap-1"
          >
            {data.websiteUrl}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
      
      {data.campaignType && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Video className="h-4 w-4 text-primary" />
            Campaign Type
          </div>
          <p className="text-sm text-muted-foreground pl-6">{data.campaignType}</p>
        </div>
      )}
      
      {data.creatorType && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Users className="h-4 w-4 text-primary" />
            Creator Type Sought
          </div>
          <p className="text-sm text-muted-foreground pl-6">{data.creatorType}</p>
        </div>
      )}
      
      {data.budgetRange && (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <DollarSign className="h-4 w-4 text-primary" />
            Budget Range
          </div>
          <p className="text-sm text-muted-foreground pl-6">{data.budgetRange}</p>
        </div>
      )}
      
      {data.deliverables && (
        <div className="col-span-full space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            Deliverables Needed
          </div>
          <p className="text-sm text-muted-foreground pl-6 whitespace-pre-wrap">{data.deliverables}</p>
        </div>
      )}
    </div>
  );

  const renderRequest = (request: any) => {
    const applicationData = parseApplicationData(request.pitch, request.role_requested);
    const isProcessing = processingId === request.id;
    
    return (
      <Card key={request.id} className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {request.role_requested === 'creator' ? (
                <div className="p-2 rounded-lg bg-violet-500/10">
                  <Palette className="h-5 w-5 text-violet-500" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Briefcase className="h-5 w-5 text-blue-500" />
                </div>
              )}
              <div>
                <CardTitle className="text-lg">
                  {request.role_requested === 'creator' ? 'Creator' : 'Brand'} Application
                </CardTitle>
                <CardDescription>
                  User ID: {request.user_id.slice(0, 8)}... • Applied {format(new Date(request.created_at), 'MMM d, yyyy')}
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
              className={request.status === 'approved' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
            >
              {request.status || 'pending'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role-specific fields */}
          {applicationData && (
            <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
              {request.role_requested === 'creator' 
                ? renderCreatorFields(applicationData as CreatorApplicationData)
                : renderBrandFields(applicationData as BrandApplicationData)
              }
            </div>
          )}

          {/* Legacy experience field */}
          {request.experience && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-1">Experience</div>
              <p className="text-sm text-muted-foreground">{request.experience}</p>
            </div>
          )}

          {/* Portfolio links */}
          {request.portfolio_links && request.portfolio_links.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-foreground mb-2">Portfolio Links</div>
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

          {/* Denial reason */}
          {request.denial_reason && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="text-sm font-semibold text-destructive mb-1">Denial Reason</div>
              <p className="text-sm text-muted-foreground">{request.denial_reason}</p>
            </div>
          )}

          {/* Review info */}
          {request.reviewed_at && (
            <div className="text-xs text-muted-foreground">
              Reviewed on {format(new Date(request.reviewed_at), 'MMM d, yyyy at h:mm a')}
            </div>
          )}

          {/* Action buttons */}
          {request.status === 'pending' && (
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => handleApprove(request.id)}
                className="flex-1"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                onClick={() => openDenyDialog(request.id)}
                variant="destructive"
                className="flex-1"
                disabled={isProcessing}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Deny
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Marketplace Access Requests</h2>
          <p className="text-muted-foreground mt-1">
            Review and approve marketplace access applications. Email notifications will be sent automatically.
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
              Please provide a reason for denying this application. This will be shared with the applicant via email.
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
            <Button 
              variant="destructive" 
              onClick={handleDeny} 
              disabled={!denyReason.trim() || processingId !== null}
            >
              {processingId ? 'Processing...' : 'Deny Application'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
