import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { Heart, MessageCircle, UserPlus, DollarSign, Unlock } from "lucide-react";

interface NotificationItemProps {
  notification: {
    id: string;
    title: string;
    message: string;
    read: boolean;
    created_at: string;
    category?: string;
    metadata?: any;
  };
}

export function NotificationItem({ notification }: NotificationItemProps) {
  const navigate = useNavigate();
  const { markAsRead } = useNotifications();

  const getIcon = () => {
    switch (notification.category) {
      case 'social':
        if (notification.message.includes('followed')) return <UserPlus className="w-4 h-4" />;
        if (notification.message.includes('liked')) return <Heart className="w-4 h-4" />;
        if (notification.message.includes('comment')) return <MessageCircle className="w-4 h-4" />;
        return <MessageCircle className="w-4 h-4" />;
      case 'monetization':
        if (notification.message.includes('unlock')) return <Unlock className="w-4 h-4" />;
        return <DollarSign className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleClick = () => {
    markAsRead(notification.id);
    
    if (notification.metadata?.postId) {
      navigate(`/social?postId=${notification.metadata.postId}`);
    } else if (notification.metadata?.userId) {
      navigate(`/profile/${notification.metadata.userId}`);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
        !notification.read ? 'bg-primary/5' : ''
      }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground line-clamp-1">
              {notification.title}
            </p>
            {!notification.read && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </button>
  );
}
