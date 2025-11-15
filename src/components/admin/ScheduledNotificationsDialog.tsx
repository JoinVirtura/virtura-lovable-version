import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Calendar, Plus, Eye, X, Copy } from "lucide-react";
import { format } from "date-fns";

interface ScheduledNotification {
  id: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  target_audience: string;
  scheduled_for: string;
  status: string;
  recipient_count: number;
  created_at: string;
}

interface ScheduledNotificationsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScheduledNotificationsDialog({ 
  open: externalOpen, 
  onOpenChange: externalOnOpenChange,
  onSuccess 
}: ScheduledNotificationsDialogProps = {}) {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = externalOnOpenChange || setInternalOpen;
  const [notifications, setNotifications] = useState<ScheduledNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    category: "system",
    priority: "normal",
    target_audience: "all",
    scheduled_for: "",
    recurring: false,
    recurrence_pattern: "",
  });

  useEffect(() => {
    if (open) {
      fetchScheduledNotifications();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel("scheduled_notifications_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "scheduled_notifications",
          },
          () => {
            fetchScheduledNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [open]);

  const fetchScheduledNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("scheduled_notifications")
        .select("*")
        .order("scheduled_for", { ascending: true });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching scheduled notifications:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled notifications",
        variant: "destructive",
      });
    }
  };

  const handleScheduleNotification = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .insert([{
          admin_id: user.id,
          admin_email: user.email || "",
          subject: formData.subject,
          message: formData.message,
          category: formData.category as any,
          priority: formData.priority,
          target_audience: formData.target_audience,
          scheduled_for: formData.scheduled_for,
          recurring: formData.recurring,
          recurrence_pattern: formData.recurrence_pattern || null,
          status: "pending",
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification scheduled successfully",
      });

      onSuccess?.();
      setShowForm(false);
      setFormData({
        subject: "",
        message: "",
        category: "system",
        priority: "normal",
        target_audience: "all",
        scheduled_for: "",
        recurring: false,
        recurrence_pattern: "",
      });

      fetchScheduledNotifications();
    } catch (error) {
      console.error("Error scheduling notification:", error);
      toast({
        title: "Error",
        description: "Failed to schedule notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from("scheduled_notifications")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification cancelled",
      });

      fetchScheduledNotifications();
    } catch (error) {
      console.error("Error cancelling notification:", error);
      toast({
        title: "Error",
        description: "Failed to cancel notification",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "default",
      sent: "secondary",
      failed: "destructive",
      cancelled: "outline",
    };

    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Scheduled Notifications
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Scheduled Notifications</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!showForm ? (
            <>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  {notifications.length} scheduled notifications
                </p>
                <Button onClick={() => setShowForm(true)} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule New
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Scheduled For</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow key={notification.id}>
                      <TableCell className="font-medium">{notification.subject}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{notification.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(notification.scheduled_for), "PPp")}
                      </TableCell>
                      <TableCell>{notification.target_audience}</TableCell>
                      <TableCell>{getStatusBadge(notification.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {notification.status === "pending" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => cancelNotification(notification.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Notification subject"
                />
              </div>

              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Notification message"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="system">System</SelectItem>
                      <SelectItem value="account">Account</SelectItem>
                      <SelectItem value="billing">Billing</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select
                    value={formData.target_audience}
                    onValueChange={(value) => setFormData({ ...formData, target_audience: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="admins">Admins Only</SelectItem>
                      <SelectItem value="active">Active Users</SelectItem>
                      <SelectItem value="trial">Trial Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Scheduled Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formData.scheduled_for}
                    onChange={(e) => setFormData({ ...formData, scheduled_for: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleScheduleNotification} disabled={loading}>
                  {loading ? "Scheduling..." : "Schedule Notification"}
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}