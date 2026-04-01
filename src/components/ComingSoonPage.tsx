import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles,
  Bell,
  ArrowLeft,
  Loader2,
  Image,
  Video,
  Command,
  Home,
  Building2,
  Briefcase,
  DollarSign,
  BadgeCheck,
  Zap,
  Layers,
  Wand2,
  BarChart3,
  ShoppingBag,
  CheckCircle,
  Users,
  Palette,
  Film,
  Brain,
  Shield,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FeatureInfo {
  title: string;
  description: string;
  icon: React.ElementType;
  bullets: string[];
  progress: number;
}

const featureMap: Record<string, FeatureInfo> = {
  "talking-avatar": {
    title: "Photo Editor",
    description: "Advanced AI-powered photo editing with intelligent tools that understand your creative vision.",
    icon: Image,
    bullets: [
      "AI-powered retouching & enhancement",
      "Smart background removal & replacement",
      "One-click style transfer & filters",
    ],
    progress: 65,
  },
  "video-pro": {
    title: "Video Editor",
    description: "Professional video editing powered by AI — cut, enhance, and publish faster than ever.",
    icon: Video,
    bullets: [
      "AI scene detection & auto-editing",
      "Text-to-video transitions & effects",
      "Multi-track timeline with smart audio sync",
    ],
    progress: 55,
  },
  studio: {
    title: "Copilot",
    description: "Your AI creative assistant that helps you ideate, generate, and refine content in real-time.",
    icon: Command,
    bullets: [
      "Natural language creative direction",
      "Real-time suggestions & iterations",
      "Multi-format content generation",
    ],
    progress: 45,
  },
  "social-feed": {
    title: "Feed",
    description: "Discover and share AI-generated content with the Virtura creator community.",
    icon: Home,
    bullets: [
      "Curated creator showcase & trending content",
      "Like, comment & share with the community",
      "Personalized content recommendations",
    ],
    progress: 70,
  },
  brands: {
    title: "Brand Manager",
    description: "Build and manage consistent brand identities across all your AI-generated content.",
    icon: Building2,
    bullets: [
      "Brand kit with colors, fonts & guidelines",
      "Consistent brand voice across content",
      "Multi-brand management & switching",
    ],
    progress: 60,
  },
  marketplace: {
    title: "Marketplace",
    description: "Buy, sell, and trade AI-generated assets, templates, and creative services.",
    icon: Briefcase,
    bullets: [
      "Sell your AI creations to the community",
      "Premium templates & style packs",
      "Creator storefronts & analytics",
    ],
    progress: 40,
  },
  "creator-dashboard": {
    title: "Creator Dashboard",
    description: "Track your growth, earnings, and engagement across the Virtura platform.",
    icon: DollarSign,
    bullets: [
      "Real-time earnings & payout tracking",
      "Audience analytics & growth metrics",
      "Content performance insights",
    ],
    progress: 50,
  },
  verification: {
    title: "Verification",
    description: "Get verified as an official Virtura creator and unlock exclusive benefits.",
    icon: BadgeCheck,
    bullets: [
      "Verified creator badge & profile",
      "Priority support & early access",
      "Enhanced visibility in search & feed",
    ],
    progress: 75,
  },
  "admin-dashboard": {
    title: "Admin Dashboard",
    description: "Platform administration and analytics for managing Virtura operations.",
    icon: Shield,
    bullets: [
      "User management & moderation tools",
      "Platform analytics & revenue tracking",
      "Content moderation & policy enforcement",
    ],
    progress: 35,
  },
};

interface ComingSoonPageProps {
  featureId: string;
  onBackToDashboard: () => void;
}

export function ComingSoonPage({ featureId, onBackToDashboard }: ComingSoonPageProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const feature = featureMap[featureId] || {
    title: "New Feature",
    description: "Something amazing is in the works.",
    icon: Sparkles,
    bullets: ["AI-powered capabilities", "Seamless integration", "Premium experience"],
    progress: 50,
  };

  const FeatureIcon = feature.icon;

  // Pre-fill email from logged-in user and check if already on waitlist
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setEmail(user.email);
        // Check if already signed up for this feature
        const { data } = await (supabase as any)
          .from("feature_waitlist")
          .select("id")
          .eq("email", user.email)
          .eq("feature_id", featureId)
          .maybeSingle();
        if (data) setSubmitted(true);
      }
    };
    init();
  }, [featureId]);

  const handleNotify = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await (supabase as any)
        .from("feature_waitlist")
        .insert({
          email: trimmed,
          feature_id: featureId,
          user_id: user?.id || null,
        });

      if (error) {
        // Unique constraint violation = already signed up
        if (error.code === "23505") {
          setSubmitted(true);
          toast({
            title: "Already on the list!",
            description: `You're already signed up for ${feature.title} early access.`,
          });
          return;
        }
        throw error;
      }

      setSubmitted(true);
      toast({
        title: "You're on the list!",
        description: `We'll notify you when ${feature.title} launches.`,
      });
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0F0F1A] via-[#1a1a2e] to-[#0F0F1A]" />

      {/* Animated glow orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.6), transparent 70%)" }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-20 blur-[100px]"
        style={{ background: "radial-gradient(circle, rgba(59,130,246,0.6), transparent 70%)" }}
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.12, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 right-1/3 w-[300px] h-[300px] rounded-full opacity-15 blur-[80px]"
        style={{ background: "radial-gradient(circle, rgba(236,72,153,0.5), transparent 70%)" }}
        animate={{ x: [0, 50, 0], y: [0, -30, 0], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${Math.random() * 4 + 2}px`,
            height: `${Math.random() * 4 + 2}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `radial-gradient(circle, ${
              i % 3 === 0 ? "rgba(168,85,247,0.8)" : i % 3 === 1 ? "rgba(59,130,246,0.8)" : "rgba(236,72,153,0.8)"
            }, transparent)`,
          }}
          animate={{
            y: [0, -100 - Math.random() * 200],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: 8 + Math.random() * 8,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full text-center space-y-8">
        {/* Pulsing icon */}
        <motion.div
          className="mx-auto w-24 h-24 rounded-full flex items-center justify-center relative"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Outer glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full border border-violet-500/30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute inset-0 rounded-full border border-blue-500/20"
            animate={{ scale: [1, 1.8, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-violet-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-violet-500/30 flex items-center justify-center shadow-[0_0_60px_rgba(168,85,247,0.3)]">
            <FeatureIcon className="w-10 h-10 text-violet-300" />
          </div>
        </motion.div>

        {/* Headline */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-violet-300 via-blue-300 to-purple-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
            This Feature Is Evolving
          </h1>
          <p className="text-lg text-violet-200/80 max-w-lg mx-auto leading-relaxed">
            {feature.description}
          </p>
        </motion.div>

        {/* Progress indicator */}
        <motion.div
          className="max-w-sm mx-auto space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex justify-between text-sm">
            <span className="text-violet-300/70">Feature development</span>
            <span className="text-violet-300 font-semibold">{feature.progress}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 border border-violet-500/20 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 via-blue-500 to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.5)]"
              initial={{ width: 0 }}
              animate={{ width: `${feature.progress}%` }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Feature bullets */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card className="bg-white/[0.03] backdrop-blur-xl border-violet-500/20 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
            <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-4">What to expect</h3>
            <div className="space-y-3">
              {feature.bullets.map((bullet, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-3 text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                >
                  <div className="w-6 h-6 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-violet-400" />
                  </div>
                  <span className="text-gray-300">{bullet}</span>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Email capture */}
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <h3 className="text-lg font-display font-semibold text-white">Get Early Access</h3>
          <p className="text-sm text-violet-200/60">Be the first to unlock {feature.title} when it drops.</p>
          {!submitted ? (
            <div className="flex gap-2 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNotify()}
                className="h-12 bg-black/40 backdrop-blur-md border-2 border-violet-500/30 focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:shadow-[0_0_20px_rgba(168,85,247,0.4)] text-white placeholder:text-gray-500"
              />
              <Button
                onClick={handleNotify}
                disabled={loading || !email.trim()}
                className="h-12 px-6 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transition-all duration-300 font-semibold disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Bell className="w-4 h-4 mr-2" />
                )}
                {loading ? "Saving..." : "Notify Me"}
              </Button>
            </div>
          ) : (
            <motion.div
              className="flex items-center justify-center gap-2 text-green-400"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">You're on the list! We'll be in touch.</span>
            </motion.div>
          )}
        </motion.div>

        {/* Back button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Button
            variant="ghost"
            onClick={onBackToDashboard}
            className="text-violet-300/60 hover:text-violet-300 hover:bg-violet-500/10 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Footer */}
        <motion.p
          className="text-xs text-violet-300/30 tracking-widest uppercase pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          Virtura — Where Identity Evolves
        </motion.p>
      </div>
    </div>
  );
}
