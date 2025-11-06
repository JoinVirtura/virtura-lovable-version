import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  category?: string;
  priority?: string;
}

interface NotificationPreferences {
  sound_enabled: boolean;
  sound_file: string;
  desktop_notifications: boolean;
  quiet_hours_enabled: boolean;
  quiet_hours_start: number;
  quiet_hours_end: number;
  system_enabled: boolean;
  account_enabled: boolean;
  billing_enabled: boolean;
  marketing_enabled: boolean;
  product_enabled: boolean;
  security_enabled: boolean;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (!user) return;

    fetchNotifications();
    fetchPreferences();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('notifications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNotification = payload.new as Notification;
            
            if (shouldShowNotification(newNotification)) {
              setNotifications((prev) => [newNotification, ...prev]);
              setUnreadCount((prev) => prev + 1);
              
              playNotificationSound();
              showDesktopNotification(newNotification);
              
              toast.info(newNotification.title, {
                description: newNotification.message,
              });
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedNotification = payload.new as Notification;
            setNotifications((prev) =>
              prev.map((n) => (n.id === updatedNotification.id ? updatedNotification : n))
            );
            updateUnreadCount();
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
            updateUnreadCount();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      setNotifications(data || []);
      updateUnreadCount(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const updateUnreadCount = (notifs?: Notification[]) => {
    const items = notifs || notifications;
    setUnreadCount(items.filter((n) => !n.read).length);
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const fetchPreferences = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setPreferences(data as any);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const shouldShowNotification = (notification: Notification): boolean => {
    if (!preferences) return true;
    
    // Check if category is enabled
    const category = notification.category || 'system';
    const categoryKey = `${category}_enabled` as keyof NotificationPreferences;
    if (preferences[categoryKey] === false) return false;
    
    // Check quiet hours
    if (preferences.quiet_hours_enabled) {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const { quiet_hours_start, quiet_hours_end } = preferences;
      
      if (quiet_hours_start > quiet_hours_end) {
        // Wraps midnight (e.g., 10 PM to 8 AM)
        if (currentMinutes >= quiet_hours_start || currentMinutes < quiet_hours_end) {
          return false;
        }
      } else {
        // Normal range
        if (currentMinutes >= quiet_hours_start && currentMinutes < quiet_hours_end) {
          return false;
        }
      }
    }
    
    return true;
  };

  const playNotificationSound = () => {
    if (preferences?.sound_enabled && preferences.sound_file !== 'silent') {
      try {
        const audio = new Audio(`/sounds/${preferences.sound_file}.mp3`);
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  const showDesktopNotification = (notification: Notification) => {
    if (preferences?.desktop_notifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
      }
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch: fetchNotifications,
  };
}
