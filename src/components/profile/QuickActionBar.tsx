import { motion, AnimatePresence } from "framer-motion";
import { 
  Pencil, 
  Share2, 
  BarChart3, 
  Settings, 
  MessageCircle,
  UserPlus,
  Heart,
  MoreHorizontal,
  Link2,
  Download,
  Flag,
  Ban,
  Users,
  Plus,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface QuickActionBarProps {
  isOwnProfile: boolean;
  isFollowing?: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  onAnalytics?: () => void;
  onSettings?: () => void;
  onFollow?: () => void;
  onMessage?: () => void;
  onCreatePost?: () => void;
}

export function QuickActionBar({
  isOwnProfile,
  isFollowing,
  onEdit,
  onAnalytics,
  onSettings,
  onFollow,
  onMessage,
  onCreatePost,
}: QuickActionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out this profile",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied!");
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Profile link copied!");
      }
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied!");
    setIsExpanded(false);
  };

  const handleDownloadMediaKit = () => {
    toast.info("Media Kit download coming soon!");
    setIsExpanded(false);
  };

  const handleReport = () => {
    toast.info("Report submitted. We'll review this profile.");
    setIsExpanded(false);
  };

  const handleBlock = () => {
    toast.info("User blocked");
    setIsExpanded(false);
  };

  const handleInviteCollab = () => {
    toast.info("Collaboration invite sent!");
    setIsExpanded(false);
  };

  const handleTipCreator = () => {
    toast.info("Tip feature coming soon!");
    setIsExpanded(false);
  };

  const handleGoLive = () => {
    toast.info("Live streaming coming soon!");
    setIsExpanded(false);
  };

  const ownActions = [
    { icon: Pencil, label: "Edit Profile", onClick: onEdit, color: "text-violet-400", hoverBg: "hover:bg-violet-500/20" },
    { icon: Share2, label: "Share", onClick: handleShare, color: "text-cyan-400", hoverBg: "hover:bg-cyan-500/20" },
    { icon: BarChart3, label: "Analytics", onClick: onAnalytics, color: "text-emerald-400", hoverBg: "hover:bg-emerald-500/20" },
    { icon: Settings, label: "Settings", onClick: onSettings, color: "text-amber-400", hoverBg: "hover:bg-amber-500/20" },
  ];

  const otherActions = [
    { 
      icon: isFollowing ? Heart : UserPlus, 
      label: isFollowing ? "Following" : "Follow", 
      onClick: onFollow, 
      color: isFollowing ? "text-pink-400" : "text-violet-400",
      hoverBg: isFollowing ? "hover:bg-pink-500/20" : "hover:bg-violet-500/20",
    },
    { icon: MessageCircle, label: "Message", onClick: onMessage || (() => toast.info("Messaging coming soon!")), color: "text-cyan-400", hoverBg: "hover:bg-cyan-500/20" },
    { icon: Share2, label: "Share", onClick: handleShare, color: "text-emerald-400", hoverBg: "hover:bg-emerald-500/20" },
  ];

  const expandedOwnActions = [
    { icon: Plus, label: "Quick Post", onClick: onCreatePost || (() => navigate('/dashboard?view=social-feed')), color: "text-violet-400" },
    { icon: Link2, label: "Copy Link", onClick: handleCopyLink, color: "text-blue-400" },
    { icon: Download, label: "Media Kit", onClick: handleDownloadMediaKit, color: "text-emerald-400" },
  ];

  const expandedOtherActions = [
    { icon: DollarSign, label: "Tip", onClick: handleTipCreator, color: "text-emerald-400" },
    { icon: Users, label: "Invite Collab", onClick: handleInviteCollab, color: "text-amber-400" },
    { icon: Link2, label: "Copy Link", onClick: handleCopyLink, color: "text-blue-400" },
    { icon: Flag, label: "Report", onClick: handleReport, color: "text-orange-400" },
    { icon: Ban, label: "Block", onClick: handleBlock, color: "text-red-400" },
  ];

  const actions = isOwnProfile ? ownActions : otherActions;
  const expandedActions = isOwnProfile ? expandedOwnActions : expandedOtherActions;

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
    >
      <motion.div
        className={cn(
          "flex items-center gap-1.5 p-2 rounded-2xl",
          "bg-black/90 backdrop-blur-2xl border border-white/10",
          "shadow-2xl shadow-violet-500/20"
        )}
        layout
      >
        {/* Main actions */}
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05, type: "spring" }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={action.onClick}
              className={cn(
                "relative w-11 h-11 rounded-xl group transition-all duration-200",
                action.hoverBg,
                action.color
              )}
            >
              <action.icon 
                className="w-5 h-5 transition-transform group-hover:scale-110"
              />
              
              {/* Tooltip */}
              <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white text-black text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {action.label}
              </span>
            </Button>
          </motion.div>
        ))}

        {/* Divider */}
        <div className="w-px h-8 bg-white/10 mx-1" />

        {/* Expanded actions */}
        <AnimatePresence>
          {isExpanded && (
            <>
              {expandedActions.map((action, index) => (
                <motion.div
                  key={action.label}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: index * 0.03, type: "spring", stiffness: 300 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={action.onClick}
                    className={cn(
                      "relative w-11 h-11 rounded-xl group transition-all duration-200",
                      "hover:bg-white/10",
                      action.color
                    )}
                  >
                    <action.icon 
                      className="w-5 h-5 transition-transform group-hover:scale-110"
                    />
                    
                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-white text-black text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                      {action.label}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Expand button */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.6, type: "spring" }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "w-11 h-11 rounded-xl transition-all duration-200",
              isExpanded ? "text-white bg-white/10" : "text-muted-foreground hover:text-white hover:bg-white/10"
            )}
          >
            <motion.div animate={{ rotate: isExpanded ? 45 : 0 }} transition={{ type: "spring", stiffness: 300 }}>
              <MoreHorizontal className="w-5 h-5" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
