import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { useNavigate } from "react-router-dom";

export function NotificationsPanel() {
  const { notifications, markAllAsRead, loading } = useNotifications();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="w-80 p-4">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="w-80 p-4 text-center">
        <p className="text-sm text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="w-80">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold">Notifications</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={markAllAsRead}
          className="text-xs"
        >
          Mark all read
        </Button>
      </div>
      
      <ScrollArea className="h-96">
        <div className="divide-y divide-border">
          {notifications.slice(0, 10).map((notification) => (
            <NotificationItem 
              key={notification.id} 
              notification={notification}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => navigate('/notifications')}
        >
          See all notifications
        </Button>
      </div>
    </div>
  );
}
