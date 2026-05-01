import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { Bell, Volume2, Moon, Mail } from "lucide-react";

interface NotificationPreferences {
  system_enabled: boolean;
  account_enabled: boolean;
  billing_enabled: boolean;
  marketing_enabled: boolean;
  product_enabled: boolean;
  security_enabled: boolean;
  in_app_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sound_enabled: boolean;
  sound_file: string;
  desktop_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
  quiet_hours_timezone: string;
  daily_digest: boolean;
  weekly_digest: boolean;
  digest_time: number;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  system_enabled: true,
  account_enabled: true,
  billing_enabled: true,
  marketing_enabled: true,
  product_enabled: true,
  security_enabled: true,
  in_app_enabled: true,
  email_enabled: true,
  push_enabled: true,
  sound_enabled: true,
  sound_file: "default",
  desktop_notifications: true,
  // Silencing toggles stay off so notifications actually deliver by default.
  quiet_hours_enabled: false,
  quiet_hours_start: 1320,
  quiet_hours_end: 480,
  quiet_hours_timezone: "UTC",
  daily_digest: false,
  weekly_digest: false,
  digest_time: 540,
};

export default function NotificationPreferencesPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
    
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
    }
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          system_enabled: data.system_enabled,
          account_enabled: data.account_enabled,
          billing_enabled: data.billing_enabled,
          marketing_enabled: data.marketing_enabled,
          product_enabled: data.product_enabled,
          security_enabled: data.security_enabled,
          in_app_enabled: data.in_app_enabled,
          email_enabled: data.email_enabled,
          push_enabled: data.push_enabled,
          sound_enabled: data.sound_enabled,
          sound_file: data.sound_file,
          desktop_notifications: data.desktop_notifications,
          quiet_hours_enabled: data.quiet_hours_enabled,
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
          quiet_hours_timezone: data.quiet_hours_timezone,
          daily_digest: data.daily_digest,
          weekly_digest: data.weekly_digest,
          digest_time: data.digest_time,
        });
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
      toast({
        title: "Error",
        description: "Failed to load notification preferences",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("notification_preferences")
        .upsert({
          user_id: user?.id,
          ...preferences,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Notification preferences saved successfully",
      });
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === "granted") {
        setPreferences({ ...preferences, desktop_notifications: true });
        toast({
          title: "Success",
          description: "Desktop notifications enabled",
        });
      }
    }
  };

  const testNotification = () => {
    if (notificationPermission === "granted") {
      new Notification("Test Notification", {
        body: "This is a test notification from Virtura",
        icon: "/favicon.ico",
      });
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="p-8">Loading preferences...</div>;
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Notification Preferences</h1>
        <p className="text-muted-foreground">Customize how you receive notifications</p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="sound">Sound</TabsTrigger>
          <TabsTrigger value="quiet-hours">Quiet Hours</TabsTrigger>
          <TabsTrigger value="digests">Digests</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Categories
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose which types of notifications you want to receive
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>System Notifications</Label>
                  <p className="text-sm text-muted-foreground">Updates, maintenance, and system alerts</p>
                </div>
                <Switch
                  checked={preferences.system_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, system_enabled: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label>Account Notifications</Label>
                  <p className="text-sm text-muted-foreground">Login, security, and account changes</p>
                </div>
                <Switch
                  checked={preferences.account_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, account_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Billing Notifications</Label>
                  <p className="text-sm text-muted-foreground">Payments, subscriptions, and invoices</p>
                </div>
                <Switch
                  checked={preferences.billing_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, billing_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Marketing Notifications</Label>
                  <p className="text-sm text-muted-foreground">Promotions, features, and news</p>
                </div>
                <Switch
                  checked={preferences.marketing_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, marketing_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Product Updates</Label>
                  <p className="text-sm text-muted-foreground">New features and improvements</p>
                </div>
                <Switch
                  checked={preferences.product_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, product_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Security Alerts</Label>
                  <p className="text-sm text-muted-foreground">Critical security notifications</p>
                </div>
                <Switch
                  checked={preferences.security_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, security_enabled: checked })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="delivery" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Delivery Methods
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>In-App Notifications</Label>
                  <p className="text-sm text-muted-foreground">Show notifications in the app</p>
                </div>
                <Switch
                  checked={preferences.in_app_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, in_app_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                </div>
                <Switch
                  checked={preferences.email_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, email_enabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Desktop Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    {notificationPermission === "granted" 
                      ? "Desktop notifications are enabled"
                      : notificationPermission === "denied"
                      ? "Desktop notifications are blocked"
                      : "Click to enable desktop notifications"}
                  </p>
                </div>
                {notificationPermission !== "granted" ? (
                  <Button onClick={requestNotificationPermission} variant="outline" size="sm">
                    Enable
                  </Button>
                ) : (
                  <Button onClick={testNotification} variant="outline" size="sm">
                    Test
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="sound" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5" />
              Sound Settings
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Sound</Label>
                  <p className="text-sm text-muted-foreground">Play sound when notifications arrive</p>
                </div>
                <Switch
                  checked={preferences.sound_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, sound_enabled: checked })}
                />
              </div>

              {preferences.sound_enabled && (
                <div className="space-y-2">
                  <Label>Notification Sound</Label>
                  <Select
                    value={preferences.sound_file}
                    onValueChange={(value) => setPreferences({ ...preferences, sound_file: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="chime">Chime</SelectItem>
                      <SelectItem value="bell">Bell</SelectItem>
                      <SelectItem value="pop">Pop</SelectItem>
                      <SelectItem value="silent">Silent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="quiet-hours" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Quiet Hours
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground">Mute notifications during specific hours</p>
                </div>
                <Switch
                  checked={preferences.quiet_hours_enabled}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, quiet_hours_enabled: checked })}
                />
              </div>

              {preferences.quiet_hours_enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications muted from {formatTime(preferences.quiet_hours_start)} to {formatTime(preferences.quiet_hours_end)}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Timezone</Label>
                    <Select
                      value={preferences.quiet_hours_timezone}
                      onValueChange={(value) => setPreferences({ ...preferences, quiet_hours_timezone: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="digests" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Digest Notifications</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Receive periodic summaries instead of individual notifications
            </p>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a daily summary of notifications</p>
                </div>
                <Switch
                  checked={preferences.daily_digest}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, daily_digest: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of notifications</p>
                </div>
                <Switch
                  checked={preferences.weekly_digest}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, weekly_digest: checked })}
                />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 mt-6">
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
        <Button variant="outline" onClick={() => setPreferences(DEFAULT_PREFERENCES)}>
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}