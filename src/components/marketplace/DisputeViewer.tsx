import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DisputeStatusBadge } from './DisputeStatusBadge';
import { useDisputeMessages, CampaignDispute } from '@/hooks/useCampaignDisputes';
import { useAuth } from '@/hooks/useAuth';
import { format, formatDistanceToNow } from 'date-fns';
import { Send, Loader2, Shield, User, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DisputeViewerProps {
  dispute: CampaignDispute;
}

export function DisputeViewer({ dispute }: DisputeViewerProps) {
  const { user } = useAuth();
  const { messages, loading, sendMessage } = useDisputeMessages(dispute.id);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    
    setSending(true);
    const result = await sendMessage(newMessage.trim());
    if (result.success) {
      setNewMessage('');
    }
    setSending(false);
  };

  const isResolved = dispute.status.startsWith('resolved') || dispute.status === 'closed';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{dispute.subject}</CardTitle>
            <CardDescription>
              {dispute.raised_by_type === 'brand' ? 'Raised by Brand' : 'Raised by Creator'} • {formatDistanceToNow(new Date(dispute.created_at), { addSuffix: true })}
            </CardDescription>
          </div>
          <DisputeStatusBadge status={dispute.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Original dispute */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {dispute.raised_by_type === 'brand' ? (
              <Building2 className="h-4 w-4" />
            ) : (
              <User className="h-4 w-4" />
            )}
            Original Complaint
          </div>
          <p className="text-sm text-muted-foreground">{dispute.description}</p>
          <p className="text-xs text-muted-foreground">
            Type: {dispute.dispute_type.replace('_', ' ')} • Priority: {dispute.priority}
          </p>
        </div>

        {/* Resolution (if resolved) */}
        {isResolved && dispute.resolution_summary && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-600">
              <Shield className="h-4 w-4" />
              Resolution
            </div>
            <p className="text-sm">{dispute.resolution_summary}</p>
            {dispute.resolved_at && (
              <p className="text-xs text-muted-foreground">
                Resolved {format(new Date(dispute.resolved_at), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        )}

        <Separator />

        {/* Messages thread */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Discussion</h4>
          
          <ScrollArea className="h-[300px] pr-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground text-sm">No messages yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Start a conversation about this dispute
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => {
                  const isOwnMessage = msg.user_id === user?.id;
                  
                  return (
                    <div 
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isOwnMessage && "flex-row-reverse"
                      )}
                    >
                      <Avatar className="h-8 w-8 shrink-0">
                        {msg.is_admin && (
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Shield className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                        {!msg.is_admin && (
                          <AvatarFallback>
                            {isOwnMessage ? 'You' : 'U'}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      
                      <div className={cn(
                        "max-w-[70%] rounded-lg px-3 py-2",
                        msg.is_admin 
                          ? "bg-primary/10 border border-primary/20" 
                          : isOwnMessage 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                      )}>
                        {msg.is_admin && (
                          <p className="text-xs font-medium text-primary mb-1">Admin</p>
                        )}
                        <p className="text-sm">{msg.message}</p>
                        <p className={cn(
                          "text-xs mt-1",
                          isOwnMessage && !msg.is_admin ? "text-primary-foreground/70" : "text-muted-foreground"
                        )}>
                          {format(new Date(msg.created_at), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message input */}
        {!isResolved && (
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="min-h-[80px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <Button 
              onClick={handleSend} 
              disabled={sending || !newMessage.trim()}
              size="icon"
              className="h-auto"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
