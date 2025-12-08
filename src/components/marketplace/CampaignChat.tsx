import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  campaign_id: string;
  sender_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface CampaignChatProps {
  campaignId: string;
  onClose: () => void;
}

export function CampaignChat({ campaignId, onClose }: CampaignChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaignTitle, setCampaignTitle] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCampaignInfo();
    fetchMessages();
    
    // Subscribe to realtime messages
    const channel = supabase
      .channel(`campaign-chat-${campaignId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'marketplace_messages',
          filter: `campaign_id=eq.${campaignId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchCampaignInfo = async () => {
    const { data } = await supabase
      .from('marketplace_campaigns')
      .select('title')
      .eq('id', campaignId)
      .single();
    
    if (data) {
      setCampaignTitle(data.title);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_messages')
        .select('*')
        .eq('campaign_id', campaignId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      if (user && data && data.length > 0) {
        await supabase
          .from('marketplace_messages')
          .update({ is_read: true })
          .eq('campaign_id', campaignId)
          .neq('sender_id', user.id);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return;

    setSending(true);
    try {
      const { error } = await supabase
        .from('marketplace_messages')
        .insert({
          campaign_id: campaignId,
          sender_id: user.id,
          message: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-lg h-[600px] flex flex-col">
        <DialogHeader>
          <DialogTitle className="truncate">Chat: {campaignTitle}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className={isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                        {isOwn ? 'Y' : 'T'}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isOwn
                          ? 'bg-primary text-primary-foreground rounded-br-none'
                          : 'bg-muted rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.message}</p>
                      <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {format(new Date(msg.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={sending}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim() || sending}
            size="icon"
          >
            {sending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
