import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { CheckCircle2, XCircle, Eye, User, FileText, Loader2, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface VerificationRequest {
  id: string;
  user_id: string;
  status: string | null;
  id_document_type: string | null;
  id_document_url: string | null;
  created_at: string | null;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

export function AdminVerificationReview() {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null);
  const [denialReason, setDenialReason] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_verification')
        .select('id, user_id, status, id_document_type, id_document_url, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const userIds = data?.map(d => d.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', userIds);
      
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);
      
      const requestsWithProfiles = (data || []).map(req => ({
        ...req,
        profiles: profileMap.get(req.user_id) || null
      }));
      
      setRequests(requestsWithProfiles);
    } catch (error: any) {
      console.error('Error fetching verification requests:', error);
      toast({ title: 'Error', description: 'Failed to load verification requests', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const channel = supabase
      .channel('verification-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_verification' }, () => fetchRequests())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleApprove = async (request: VerificationRequest) => {
    setProcessing(request.id);
    try {
      const { error } = await supabase.functions.invoke('admin-review-verification', {
        body: { user_id: request.user_id, action: 'approve' },
      });
      if (error) throw error;
      toast({ title: 'Approved', description: 'Verification request has been approved' });
      fetchRequests();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to approve', variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const handleDeny = async () => {
    if (!selectedRequest) return;
    setProcessing(selectedRequest.id);
    try {
      const { error } = await supabase.functions.invoke('admin-review-verification', {
        body: { user_id: selectedRequest.user_id, action: 'deny', denial_reason: denialReason },
      });
      if (error) throw error;
      toast({ title: 'Denied', description: 'Verification request has been denied' });
      setDenyDialogOpen(false);
      setDenialReason('');
      setSelectedRequest(null);
      fetchRequests();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to deny', variant: 'destructive' });
    } finally {
      setProcessing(null);
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const deniedRequests = requests.filter(r => r.status === 'denied');

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32 w-full" />)}</div>;
  }

  const renderRequest = (request: VerificationRequest, showActions = false) => (
    <Card key={request.id}>
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {request.profiles?.avatar_url ? (
                <img src={request.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <User className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="font-medium">{request.profiles?.display_name || 'Unknown User'}</p>
              <p className="text-xs text-muted-foreground">
                {request.created_at ? format(new Date(request.created_at), 'MMM d, yyyy') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex-1 flex items-center gap-4">
            <Badge variant="outline" className="capitalize">
              <FileText className="w-3 h-3 mr-1" />
              {request.id_document_type?.replace('_', ' ') || 'Unknown'}
            </Badge>
            {request.id_document_url && (
              <Button size="sm" variant="outline" onClick={() => setPreviewUrl(request.id_document_url)} className="gap-1">
                <Eye className="w-3 h-3" /> View
              </Button>
            )}
          </div>
          {showActions ? (
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => handleApprove(request)} disabled={processing === request.id}>
                {processing === request.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                Approve
              </Button>
              <Button size="sm" variant="destructive" onClick={() => { setSelectedRequest(request); setDenyDialogOpen(true); }} disabled={processing === request.id}>
                <XCircle className="w-4 h-4" /> Deny
              </Button>
            </div>
          ) : (
            <Badge variant="outline" className={request.status === 'approved' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}>
              {request.status}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-warning" />
          <h3 className="font-semibold">Pending Requests</h3>
          <Badge variant="secondary">{pendingRequests.length}</Badge>
        </div>
        {pendingRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No pending verification requests</CardContent></Card>
        ) : (
          <div className="space-y-3">{pendingRequests.map(r => renderRequest(r, true))}</div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
          <h3 className="font-semibold">Approved</h3>
          <Badge variant="secondary">{approvedRequests.length}</Badge>
        </div>
        {approvedRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No approved verifications</CardContent></Card>
        ) : (
          <div className="space-y-3">{approvedRequests.slice(0, 5).map(r => renderRequest(r))}</div>
        )}
      </div>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <XCircle className="w-5 h-5 text-destructive" />
          <h3 className="font-semibold">Denied</h3>
          <Badge variant="secondary">{deniedRequests.length}</Badge>
        </div>
        {deniedRequests.length === 0 ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">No denied verifications</CardContent></Card>
        ) : (
          <div className="space-y-3">{deniedRequests.slice(0, 5).map(r => renderRequest(r))}</div>
        )}
      </div>
      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Verification</DialogTitle>
            <DialogDescription>Please provide a reason for denying this request.</DialogDescription>
          </DialogHeader>
          <Textarea placeholder="Enter denial reason..." value={denialReason} onChange={(e) => setDenialReason(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeny} disabled={!denialReason.trim() || processing !== null}>Deny</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && <img src={previewUrl} alt="Document" className="max-w-full max-h-[60vh] object-contain rounded" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
