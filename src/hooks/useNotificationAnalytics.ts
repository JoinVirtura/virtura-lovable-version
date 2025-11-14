import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNotificationAnalytics(userId: string | undefined) {
  useEffect(() => {
    if (!userId) return;

    // Track when notifications are received (via realtime)
    const channel = supabase
      .channel('notifications-analytics')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, async (payload) => {
        const notification = payload.new;
        await trackEvent(notification.id, 'received');
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const trackEvent = async (
    notificationId: string,
    eventType: 'received' | 'read' | 'clicked' | 'dismissed' | 'action_taken',
    eventData: Record<string, any> = {}
  ) => {
    if (!userId) return;

    try {
      await supabase.from('notification_analytics').insert({
        notification_id: notificationId,
        user_id: userId,
        event_type: eventType,
        event_data: eventData,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        event_timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error tracking notification event:', error);
    }
  };

  const trackRead = (notificationId: string) => trackEvent(notificationId, 'read');
  const trackClick = (notificationId: string, action?: string) => 
    trackEvent(notificationId, 'clicked', { action });
  const trackDismiss = (notificationId: string) => trackEvent(notificationId, 'dismissed');
  const trackAction = (notificationId: string, actionData: Record<string, any>) => 
    trackEvent(notificationId, 'action_taken', actionData);

  return {
    trackRead,
    trackClick,
    trackDismiss,
    trackAction,
  };
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
  return 'Other';
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'Windows';
  if (ua.includes('Mac')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  return 'Other';
}
