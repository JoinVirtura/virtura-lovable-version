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
import { Bell, Send, User, X } from "lucide-react";
import { UserSearchAutocomplete } from "./UserSearchAutocomplete";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface NotificationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface SelectedUser {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  email?: string;
  balance?: number;
}

export function NotificationDialog({ open, onOpenChange, onSuccess }: NotificationDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [targetAudience, setTargetAudience] = useState("all_users");
  const [notificationType, setNotificationType] = useState("in_app");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null);

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: "Validation Error",
        description: "Subject and message are required",
        variant: "destructive",
      });
      return;
    }

    if (targetAudience === "specific_user" && !selectedUser) {
      toast({
        title: "Validation Error",
        description: "Please select a user to notify",
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
          targetUserId: targetAudience === "specific_user" ? selectedUser?.id : undefined,
        },
      });

      if (error) throw error;

      toast({
        title: "Notification Sent",
        description: targetAudience === "specific_user" 
          ? `Successfully sent to ${selectedUser?.display_name || selectedUser?.email || 'user'}`
          : `Successfully sent to ${data.recipientCount} users`,
      });

      // Reset form
      setSubject("");
      setMessage("");
      setSelectedUser(null);
      setTargetAudience("all_users");
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

  const handleAudienceChange = (value: string) => {
    setTargetAudience(value);
    if (value !== "specific_user") {
      setSelectedUser(null);
    }
  };

  const getUserDisplayName = (user: SelectedUser) => {
    if (user.display_name && user.display_name !== "User") {
      return user.display_name;
    }
    if (user.email) {
      return user.email;
    }
    return `User ${user.id.slice(0, 8)}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-[600px]">
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
            <Select value={targetAudience} onValueChange={handleAudienceChange}>
              <SelectTrigger id="target-audience">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_users">All Users</SelectItem>
                <SelectItem value="active_users">Active Users (Last 30 Days)</SelectItem>
                <SelectItem value="low_balance_users">Low Balance Users (&lt;10 Tokens)</SelectItem>
                <SelectItem value="premium_subscribers">Premium Subscribers</SelectItem>
                <SelectItem value="specific_user">Specific User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* User Search - shown when specific_user is selected */}
          {targetAudience === "specific_user" && (
            <div className="space-y-2">
              <Label>Select User</Label>
              {selectedUser ? (
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedUser.avatar_url || ""} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">
                      {getUserDisplayName(selectedUser)}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      ID: {selectedUser.id.slice(0, 12)}...
                    </p>
                  </div>
                  {selectedUser.balance !== undefined && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedUser.balance} tokens
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedUser(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <UserSearchAutocomplete
                  onUserSelect={setSelectedUser}
                  selectedUser={selectedUser}
                  onClear={() => setSelectedUser(null)}
                />
              )}
            </div>
          )}

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

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={loading} className="w-full sm:w-auto">
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
