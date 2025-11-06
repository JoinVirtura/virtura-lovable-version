import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, Send } from "lucide-react";

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NotificationDialog({ open, onOpenChange, onSuccess }: NotificationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [targetAudience, setTargetAudience] = useState("all_users");
  const [notificationType, setNotificationType] = useState("in_app");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and message are required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-admin-notification', {
        body: {
          targetAudience,
          notificationType,
          subject,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: "Notification Sent",
        description: `Successfully sent to ${data.recipientCount} users`,
      });

      setSubject("");
      setMessage("");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error('Send notification error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Send Platform Notification
          </DialogTitle>
          <DialogDescription>
            Send notifications to users across the platform. Choose your audience and notification type.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="target-audience">Target Audience</Label>
            <Select value={targetAudience} onValueChange={setTargetAudience}>
              <SelectTrigger id="target-audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_users">All Users</SelectItem>
                <SelectItem value="active_users">Active Users (Last 30 Days)</SelectItem>
                <SelectItem value="low_balance_users">Low Balance Users (&lt;10 Tokens)</SelectItem>
                <SelectItem value="premium_subscribers">Premium Subscribers</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-type">Notification Type</Label>
            <Select value={notificationType} onValueChange={setNotificationType}>
              <SelectTrigger id="notification-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in_app">In-App Only</SelectItem>
                <SelectItem value="email">Email Only</SelectItem>
                <SelectItem value="both">Both In-App & Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              placeholder="Notification subject line"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Your notification message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {message.length}/1000 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
