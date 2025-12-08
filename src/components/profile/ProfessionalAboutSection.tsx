import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, 
  Globe, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Check,
  X,
  Briefcase,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface ProfessionalAboutSectionProps {
  profile: {
    id: string;
    display_name?: string;
    bio?: string;
    website_url?: string;
    account_type?: string;
    created_at?: string;
  };
  isOwnProfile: boolean;
  onUpdateProfile?: (updates: { bio?: string; website_url?: string }) => Promise<void>;
}

const defaultSkills = ["AI Art", "3D Design", "Motion Graphics", "Video Editing", "Branding"];

export function ProfessionalAboutSection({ 
  profile, 
  isOwnProfile, 
  onUpdateProfile 
}: ProfessionalAboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedBio, setEditedBio] = useState(profile.bio || "");
  const [editedWebsite, setEditedWebsite] = useState(profile.website_url || "");
  const [expandedBio, setExpandedBio] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onUpdateProfile) return;
    setSaving(true);
    try {
      await onUpdateProfile({ bio: editedBio, website_url: editedWebsite });
      setIsEditing(false);
      toast.success("Profile updated");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText("contact@example.com");
    toast.success("Email copied to clipboard");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied");
  };

  const bioText = profile.bio || "";
  const shouldTruncate = bioText.length > 200;
  const displayBio = shouldTruncate && !expandedBio ? bioText.slice(0, 200) + "..." : bioText;

  const memberSince = profile.created_at 
    ? format(new Date(profile.created_at), "MMMM yyyy")
    : "December 2024";

  const accountTypeLabel = profile.account_type === "brand" ? "Brand" : 
                           profile.account_type === "creator" ? "Creator" : "User";

  return (
    <div className="space-y-4">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-cyan-400" />
          Professional Profile
        </h3>
        {isOwnProfile && !isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-white"
          >
            <Edit3 className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
        {isEditing && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                setEditedBio(profile.bio || "");
                setEditedWebsite(profile.website_url || "");
              }}
              disabled={saving}
            >
              <X className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
            >
              <Check className="w-4 h-4 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Professional Headline Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-cyan-950/20 to-slate-900/90 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="text-xl font-bold text-white mb-1">{profile.display_name || "Creator"}</h4>
            <p className="text-cyan-400 font-medium">Digital Creator & Content Specialist</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <Sparkles className="w-3 h-3 mr-1" />
              Open to Collabs
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Remote
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-cyan-400" />
            Member since {memberSince}
          </span>
        </div>
      </motion.div>

      {/* About Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-violet-950/20 to-slate-900/90 backdrop-blur-xl"
      >
        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-3">About</h4>
        
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Textarea
                value={editedBio}
                onChange={(e) => setEditedBio(e.target.value)}
                placeholder="Tell others about yourself, your work, and what you're passionate about..."
                className="min-h-[120px] bg-white/5 border-white/10 text-white resize-none"
              />
            </motion.div>
          ) : (
            <motion.div
              key="display"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {bioText ? (
                <div>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {displayBio}
                  </p>
                  {shouldTruncate && (
                    <button
                      onClick={() => setExpandedBio(!expandedBio)}
                      className="mt-2 text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors"
                    >
                      {expandedBio ? (
                        <>See less <ChevronUp className="w-4 h-4" /></>
                      ) : (
                        <>See more <ChevronDown className="w-4 h-4" /></>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground/60 italic">
                  {isOwnProfile ? "Add a bio to tell others about yourself" : "No bio yet"}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Skills & Expertise Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-pink-950/20 to-slate-900/90 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Skills & Expertise</h4>
          {isOwnProfile && (
            <Button variant="ghost" size="sm" className="text-pink-400 hover:text-pink-300 h-7 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2">
          {defaultSkills.map((skill, index) => (
            <motion.div
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Badge
                variant="secondary"
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-all cursor-default",
                  "bg-gradient-to-r from-pink-500/10 to-violet-500/10",
                  "border border-pink-500/20 hover:border-pink-500/40",
                  "text-pink-300 hover:text-pink-200"
                )}
              >
                {skill}
              </Badge>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contact & Links Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-emerald-950/20 to-slate-900/90 backdrop-blur-xl"
      >
        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Contact & Links</h4>
        
        <div className="space-y-3">
          {/* Website */}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <Input
                value={editedWebsite}
                onChange={(e) => setEditedWebsite(e.target.value)}
                placeholder="https://yourwebsite.com"
                className="bg-white/5 border-white/10 text-white h-9"
              />
            </div>
          ) : profile.website_url ? (
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-muted-foreground">{profile.website_url}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-emerald-400 hover:text-emerald-300"
                onClick={() => window.open(profile.website_url, "_blank")}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          ) : null}

          {/* Copy Profile Link */}
          <div className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Copy className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-muted-foreground">Share Profile</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-400 hover:text-cyan-300"
              onClick={handleCopyLink}
            >
              Copy Link
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Member Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-amber-950/20 to-slate-900/90 backdrop-blur-xl"
      >
        <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">Member Info</h4>
        
        <div className="flex flex-wrap items-center gap-3">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Joined {memberSince}
          </Badge>
          
          <Badge className={cn(
            "px-3 py-1.5",
            profile.account_type === "brand" 
              ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
              : profile.account_type === "creator"
              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
          )}>
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            {accountTypeLabel} Account
          </Badge>

          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-3 py-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            Verified
          </Badge>
        </div>
      </motion.div>
    </div>
  );
}
