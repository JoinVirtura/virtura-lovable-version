import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, Coins, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";

interface SupportTicketRow {
  id: string;
  user_id: string;
  name: string;
  email: string;
  issue_type: string;
  priority: string;
  subject: string;
  description: string;
  status: string;
  image_url?: string | null;
  prompt?: string | null;
  provider?: string | null;
  credited_amount?: number;
  credited_at?: string | null;
  created_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  is_admin: boolean;
  credited_amount: number | null;
  created_at: string;
}

interface TicketThreadProps {
  ticket: SupportTicketRow;
  isAdminView?: boolean;
  // Called whenever the thread successfully posts a message OR a credit is issued.
  // Lets parent re-fetch the ticket list (status/credited_amount may have changed).
  onChange?: () => void;
}

export function TicketThread({ ticket, isAdminView = false, onChange }: TicketThreadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);
  const [creditAmount, setCreditAmount] = useState<string>("");
  const [crediting, setCrediting] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .eq("ticket_id", ticket.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [ticket.id]);

  const postReply = async (overrideBody?: string, creditedAmount?: number) => {
    const body = (overrideBody ?? reply).trim();
    if (!body || !user) return;
    setPosting(true);
    try {
      const { error } = await supabase.from("support_ticket_messages").insert({
        ticket_id: ticket.id,
        author_id: user.id,
        body,
        is_admin: !!isAdminView,
        credited_amount: creditedAmount ?? null,
      });
      if (error) throw error;
      if (!overrideBody) setReply("");
      await fetchMessages();
      onChange?.();
    } catch (err) {
      console.error("Failed to post reply:", err);
      toast({
        title: "Couldn't post reply",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const issueCredit = async () => {
    const amount = parseInt(creditAmount, 10);
    if (!Number.isFinite(amount) || amount < 1 || amount > 10000) {
      toast({ title: "Invalid amount", description: "Pick a number between 1 and 10,000.", variant: "destructive" });
      return;
    }
    if (!reply.trim()) {
      toast({ title: "Add a reply note", description: "Tell the user why they're being credited.", variant: "destructive" });
      return;
    }
    setCrediting(true);
    try {
      // Call the existing admin-gated edge function — it verifies the caller is
      // admin and writes the audit log. We forward `reason` and `note` so the
      // credit shows up under admin_credit in the user's token history.
      const { data, error } = await supabase.functions.invoke("credit-user-tokens", {
        body: {
          targetUserId: ticket.user_id,
          amount,
          reason: "support_ticket_resolution",
          note: `Ticket #${ticket.id.slice(0, 8)}: ${reply.trim().slice(0, 200)}`,
        },
      });
      if (error || !data?.success) throw new Error(error?.message || data?.error || "Credit failed");

      // Record the credit + the admin reply as a single message in the thread,
      // and stamp the ticket itself so the UI can show "Credited Nt".
      await postReply(reply, amount);
      await supabase
        .from("support_tickets")
        .update({
          credited_amount: (ticket.credited_amount || 0) + amount,
          credited_at: new Date().toISOString(),
        })
        .eq("id", ticket.id);

      setCreditAmount("");
      toast({ title: "Credit issued", description: `${amount} tokens sent to ${ticket.email}.` });
      onChange?.();
    } catch (err) {
      console.error("Credit failed:", err);
      toast({
        title: "Credit failed",
        description: err instanceof Error ? err.message : "Try again.",
        variant: "destructive",
      });
    } finally {
      setCrediting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Ticket context */}
      {(ticket.image_url || ticket.prompt) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 space-y-2">
          {ticket.image_url && !ticket.image_url.startsWith("data:") && (
            <img src={ticket.image_url} alt="Reported generation" className="w-full max-h-56 object-contain rounded-lg" />
          )}
          {ticket.prompt && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Prompt:</span> {ticket.prompt}
            </p>
          )}
          {ticket.provider && (
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Provider:</span> {ticket.provider}
            </p>
          )}
        </div>
      )}

      {/* First message — the original ticket description */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs text-muted-foreground mb-1">{ticket.name} • {new Date(ticket.created_at).toLocaleString()}</p>
        <p className="text-sm text-foreground whitespace-pre-wrap">{ticket.description}</p>
      </div>

      {/* Conversation */}
      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-2">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`rounded-xl p-3 border ${
                m.is_admin
                  ? "bg-violet-500/10 border-violet-500/30"
                  : "bg-white/5 border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  {m.is_admin && <Shield className="w-3 h-3 text-violet-300" />}
                  {m.is_admin ? "Virtura Support" : ticket.name}
                  {" • "}
                  {new Date(m.created_at).toLocaleString()}
                </p>
                {m.credited_amount ? (
                  <span className="text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <Coins className="w-3 h-3" />
                    +{m.credited_amount} tokens
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-2">No replies yet.</p>
      )}

      {/* Reply form */}
      <div className="space-y-2">
        <Label htmlFor={`reply-${ticket.id}`}>{isAdminView ? "Reply as support" : "Add a reply"}</Label>
        <Textarea
          id={`reply-${ticket.id}`}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder={isAdminView ? "Hi, thanks for flagging this..." : "Add more context for the support team..."}
          rows={3}
          className="bg-white/5 border-white/10"
        />

        {isAdminView && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={10000}
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="Tokens to credit (optional)"
              className="bg-white/5 border-white/10 max-w-[220px]"
            />
            <Button
              type="button"
              onClick={issueCredit}
              disabled={crediting || !creditAmount || !reply.trim()}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700"
            >
              {crediting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Coins className="w-4 h-4 mr-2" />}
              Credit & reply
            </Button>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => postReply()}
            disabled={posting || !reply.trim()}
            variant={isAdminView ? "outline" : "default"}
          >
            {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            {isAdminView ? "Reply only" : "Send reply"}
          </Button>
        </div>
      </div>
    </div>
  );
}
