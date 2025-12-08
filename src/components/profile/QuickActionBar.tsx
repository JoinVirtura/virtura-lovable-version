import { motion } from "framer-motion";
import { 
  Pencil, 
  Share2, 
  BarChart3, 
  Settings, 
  MessageCircle,
  UserPlus,
  Heart,
  MoreHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";

interface QuickActionBarProps {
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onAnalytics?: () => void;
  onSettings?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
}

export function QuickActionBar({
  isOwnProfile,
  isFollowing,
  onEdit,
  onShare,
  onAnalytics,
  onSettings,
  onFollow,
  onMessage,
}: QuickActionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.share({
        title: "Check out this profile",
        url: window.location.href,
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied!");
    }
  };

  const ownActions = [
    { icon: Pencil, label: "Edit", onClick: onEdit, color: "text-violet-400" },
    { icon: Share2, label: "Share", onClick: handleShare, color: "text-cyan-400" },
    { icon: BarChart3, label: "Analytics", onClick: onAnalytics, color: "text-emerald-400" },
    { icon: Settings, label: "Settings", onClick: onSettings, color: "text-amber-400" },
  ];

  const otherActions = [
    { 
      icon: isFollowing ? Heart : UserPlus, 
      label: isFollowing ? "Following" : "Follow", 
      onClick: onFollow, 
      color: isFollowing ? "text-pink-400" : "text-violet-400",
    },
    { icon: MessageCircle, label: "Message", onClick: onMessage, color: "text-cyan-400" },
    { icon: Share2, label: "Share", onClick: handleShare, color: "text-emerald-400" },
  ];

  const actions = isOwnProfile ? ownActions : otherActions;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        className={cn(
          "flex items-center gap-2 p-2 rounded-2xl",
          "bg-black/80 backdrop-blur-2xl border border-white/10",
          "shadow-2xl shadow-violet-500/10"
        )}
        layout
      >
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 + index * 0.05, type: "spring" }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={action.onClick}
              className={cn(
                "relative w-12 h-12 rounded-xl group transition-all",
                "hover:bg-white/10",
                action.color
              )}
            >
              <action.icon 
                className="w-5 h-5 transition-transform group-hover:scale-110"
              />
              
              {/* Tooltip */}
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white text-black text-xs font-medium whitespace-nowrap pointer-events-none"
              >
                {action.label}
              </motion.span>
            </Button>
          </motion.div>
        ))}

        {/* Expand button for more actions */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-12 h-12 rounded-xl text-muted-foreground hover:text-white hover:bg-white/10"
          >
            <motion.div animate={{ rotate: isExpanded ? 90 : 0 }}>
              <MoreHorizontal className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
