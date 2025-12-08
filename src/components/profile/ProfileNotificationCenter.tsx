import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, X, Filter, Settings, Trash2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const categoryColors: Record<string, string> = {
  social: "from-pink-500/20 to-rose-500/20 border-pink-500/30",
  system: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
  billing: "from-emerald-500/20 to-green-500/20 border-emerald-500/30",
  security: "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  marketing: "from-purple-500/20 to-violet-500/20 border-purple-500/30",
  account: "from-indigo-500/20 to-blue-500/20 border-indigo-500/30",
};

const categoryIcons: Record<string, string> = {
  social: "💬",
  system: "⚙️",
  billing: "💳",
  security: "🔐",
  marketing: "📢",
  account: "👤",
};

export function ProfileNotificationCenter() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const filteredNotifications = activeFilter
    ? notifications.filter((n) => n.category === activeFilter)
    : notifications;

  const categories = [...new Set(notifications.map((n) => n.category))];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-violet-950/30 to-slate-900/80 backdrop-blur-xl">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-pink-500/5 pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                <Bell className="w-5 h-5 text-white" />
              </div>
              {unreadCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-xs font-bold text-white"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </motion.div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white">Notifications</h3>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-xs text-violet-400 hover:text-violet-300"
              >
                <Check className="w-3 h-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-muted-foreground hover:text-white"
            >
              <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
                <ChevronRight className="w-4 h-4" />
              </motion.div>
            </Button>
          </div>
        </div>

        {/* Category Filters */}
        {isExpanded && categories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex gap-2 mt-4 overflow-x-auto pb-1"
          >
            <button
              onClick={() => setActiveFilter(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                !activeFilter
                  ? "bg-violet-500/20 text-violet-300 border border-violet-500/30"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat === activeFilter ? null : cat)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1",
                  activeFilter === cat
                    ? `bg-gradient-to-r ${categoryColors[cat || "system"]} border`
                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                )}
              >
                <span>{categoryIcons[cat || "system"]}</span>
                <span className="capitalize">{cat}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Notifications List */}
      <AnimatePresence mode="popLayout">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ScrollArea className="max-h-[400px]">
              {filteredNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-violet-500/10 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-violet-400" />
                  </div>
                  <p className="text-muted-foreground">No notifications</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">You're all caught up!</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {filteredNotifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      layout
                      className={cn(
                        "relative p-3 rounded-xl border transition-all cursor-pointer group",
                        "bg-gradient-to-r",
                        categoryColors[notification.category || "system"],
                        !notification.read && "ring-1 ring-violet-500/30"
                      )}
                      onClick={() => !notification.read && markAsRead(notification.id)}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute top-3 left-3 w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                      )}

                      <div className="flex items-start gap-3 pl-4">
                        <div className="text-lg">{categoryIcons[notification.category || "system"]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white truncate">
                              {notification.title}
                            </p>
                            {notification.priority === "high" && (
                              <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                Urgent
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(notification.created_at), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                        >
                          <X className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
