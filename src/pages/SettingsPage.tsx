
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Trash2,
  Settings as SettingsIcon,
  Crown,
  Zap,
  Upload,
  Loader2,
  Eye,
  Library,
  Brain,
  Clock,
  Mic,
  ShieldCheck,
  Monitor,
  Calendar,
  Receipt,
  Video,
  HardDrive,
  Image as ImageIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SettingsContent } from "@/components/SettingsContent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useState, useEffect, useRef } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: profileLoading, uploadAvatar, updateProfile, uploading } = useProfile();
  const { usage, subscription, loading: usageLoading } = useUsageTracking();
  
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password change dialog state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Privacy & Security settings
  const [contentVisibility, setContentVisibility] = useState('private');
  const [libraryPublic, setLibraryPublic] = useState(false);
  const [aiTrainingOptIn, setAiTrainingOptIn] = useState(false);
  const [autoDeleteOld, setAutoDeleteOld] = useState(false);
  const [saveVoiceClones, setSaveVoiceClones] = useState(true);
  const [downloadProtection, setDownloadProtection] = useState(false);
  
  // Billing history state
  const [showBillingHistory, setShowBillingHistory] = useState(false);
  const [billingHistory, setBillingHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPreviewUrl(profile.avatar_url);
      
      // Load privacy settings
      setContentVisibility(profile.content_visibility_default || 'private');
      setLibraryPublic(profile.library_public || false);
      setAiTrainingOptIn(profile.ai_training_opt_in || false);
      setAutoDeleteOld(profile.auto_delete_old_projects || false);
      setSaveVoiceClones(profile.save_voice_clones !== false); // Default true
      setDownloadProtection(profile.download_protection || false);
    }
  }, [profile]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar must be less than 2MB",
        variant: "destructive",
      });
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Avatar must be PNG, JPG, or WEBP",
        variant: "destructive",
      });
      return;
    }

    setAvatarFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Display name required",
        description: "Please enter a display name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      let avatarUrl = profile?.avatar_url;

      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      // Update profile
      await updateProfile({
        display_name: displayName,
        ...(avatarUrl && { avatar_url: avatarUrl }),
      });

      setAvatarFile(null);
    } catch (error: any) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handlePasswordChange = async () => {
    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }
    
    // Validate password strength (min 6 chars)
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }
    
    setChangingPassword(true);
    
    try {
      // Use Supabase auth to update password
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully",
      });
      setShowPasswordDialog(false);
      setPasswordForm({ newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message || "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setChangingPassword(false);
    }
  };

  const startSubscription = async (planId: string) => {
    const { data, error } = await supabase.functions.invoke("create-checkout", {
      body: { plan: planId },
    });
    if (error || !data?.url) {
      toast({ title: "Subscription failed", description: error?.message || "Please sign in and try again.", variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  const buyTokens = async (packId: string) => {
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: { packId },
    });
    if (error || !data?.url) {
      toast({ title: "Checkout failed", description: error?.message || "Please try again.", variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      
      // Handle error response
      if (error) {
        const errorMessage = error.message || JSON.stringify(error);
        console.error("Customer portal error:", errorMessage);
        
        if (errorMessage.includes("No Stripe customer found") || errorMessage.includes("complete a purchase")) {
          toast({ 
            title: "No billing history yet", 
            description: "Complete your first purchase to access billing management.",
          });
          return;
        }
        
        toast({ 
          title: "Unable to open billing portal", 
          description: "Please try again later.", 
          variant: "destructive" 
        });
        return;
      }
      
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (error: any) {
      console.error("Error opening customer portal:", error);
      const errorMsg = error?.message || error?.error || String(error);
      
      if (errorMsg.includes("No Stripe customer") || errorMsg.includes("complete a purchase")) {
        toast({ 
          title: "No billing history yet", 
          description: "Complete your first purchase to access billing management.",
        });
      } else {
        toast({ 
          title: "Unable to open billing portal", 
          description: "Please try again later.", 
          variant: "destructive" 
        });
      }
    }
  };

  const fetchBillingHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-billing-history");
      if (error) throw error;
      setBillingHistory(data.invoices || []);
      setShowBillingHistory(true);
    } catch (error: any) {
      console.error("Error fetching billing history:", error);
      toast({
        title: "Error fetching billing history",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$29/mo",
      highlights: [
        "Up to 120 generations per month",
        "4K high-quality images",
        "Fast generation",
        "Up to 5 video generations",
        "Standard queue",
        "Basic support",
      ],
      popular: false,
      description: "Perfect for getting started"
    },
    {
      id: "pro",
      name: "Pro",
      price: "$129/mo",
      highlights: [
        "Up to 600 generations per month",
        "4K ultra-quality images",
        "Faster generation priority",
        "Up to 25 video generations",
        "Priority queue",
        "Commercial license",
        "API access",
      ],
      popular: true,
      description: "For creators and growing brands"
    },
    {
      id: "scale",
      name: "Scale",
      price: "$179/mo",
      highlights: [
        "Up to 900 generations per month",
        "4K premium outputs",
        "Fastest generation speed",
        "Up to 35 video generations",
        "Priority and faster queue",
        "Early access features",
        "Advanced tools",
      ],
      popular: false,
      bestValue: true,
      description: "For power users and teams"
    },
  ];

  const boostPacks = [
    { id: "starter-boost", name: "Starter Boost", price: "$19", generations: 30, videos: 3 },
    { id: "creator-boost", name: "Creator Boost", price: "$39", generations: 70, videos: 7, popular: true },
    { id: "power-boost", name: "Power Boost", price: "$79", generations: 150, videos: 15 },
    { id: "ultra-boost", name: "Ultra Boost", price: "$149", generations: 290, videos: 29 },
    { id: "elite-boost", name: "Elite Boost", price: "$249", generations: 490, videos: 49, priority: true },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>

        <div className="space-y-8">
          {/* Profile Settings */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Profile</h2>
            </div>
            
            {profileLoading ? (
              <div className="space-y-4">
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
                <div className="h-10 bg-muted animate-pulse rounded-md" />
                <div className="h-10 bg-muted animate-pulse rounded-md" />
              </div>
            ) : (
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={previewUrl || undefined} alt={displayName} />
                    <AvatarFallback className="text-2xl font-display bg-gradient-primary text-white">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading || saving}
                    >
                      {uploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Change Avatar
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or WEBP. Max 2MB.
                    </p>
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      placeholder="Enter your display name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      disabled={saving}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Email cannot be changed here
                    </p>
                  </div>
                  
                  <Button
                    onClick={handleSave}
                    disabled={saving || uploading || !displayName.trim()}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Notification Settings */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-display font-bold">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex-1">
                  <Label className="text-sm sm:text-base">Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Receive updates about your generations</p>
                </div>
                <Switch className="self-start sm:self-auto" />
              </div>
              
              <Separator />
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex-1">
                  <Label className="text-sm sm:text-base">Generation Complete</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get notified when avatars finish generating</p>
                </div>
                <Switch defaultChecked className="self-start sm:self-auto" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex-1">
                  <Label className="text-sm sm:text-base">Weekly Reports</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">Summary of your activity and usage</p>
                </div>
                <Switch className="self-start sm:self-auto" />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                <div className="flex-1">
                  <Label className="text-sm sm:text-base">Feature Updates</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">News about new features and improvements</p>
                </div>
                <Switch defaultChecked className="self-start sm:self-auto" />
              </div>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              {/* Password Management */}
              <div>
                <Label>Password</Label>
                <p className="text-sm text-muted-foreground mb-3">Update your account password</p>
                <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                  Change Password
                </Button>
              </div>
              
              <Separator />
              
              {/* Content Privacy */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <Label className="text-base font-semibold">Content Privacy</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Default Content Visibility</Label>
                    <p className="text-sm text-muted-foreground">Set default visibility for new avatars and videos</p>
                  </div>
                  <select
                    value={contentVisibility}
                    onChange={(e) => {
                      setContentVisibility(e.target.value);
                      updateProfile({ content_visibility_default: e.target.value });
                    }}
                    className="h-10 rounded-xl border-2 border-violet-500/30 bg-black/40 backdrop-blur-md px-4 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Make Library Public</Label>
                    <p className="text-sm text-muted-foreground">Allow others to view your generated content library</p>
                  </div>
                  <Switch 
                    checked={libraryPublic}
                    onCheckedChange={(checked) => {
                      setLibraryPublic(checked);
                      updateProfile({ library_public: checked });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Download Protection</Label>
                    <p className="text-sm text-muted-foreground">Add download protection to shared content</p>
                  </div>
                  <Switch 
                    checked={downloadProtection}
                    onCheckedChange={(checked) => {
                      setDownloadProtection(checked);
                      updateProfile({ download_protection: checked });
                    }}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Data & AI Usage */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <Label className="text-base font-semibold">Data & AI Usage</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Use My Content for AI Training</Label>
                    <p className="text-sm text-muted-foreground">Allow your generations to improve our AI models</p>
                  </div>
                  <Switch 
                    checked={aiTrainingOptIn}
                    onCheckedChange={(checked) => {
                      setAiTrainingOptIn(checked);
                      updateProfile({ ai_training_opt_in: checked });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Save Voice Clones</Label>
                    <p className="text-sm text-muted-foreground">Keep voice clones in your library after generation</p>
                  </div>
                  <Switch 
                    checked={saveVoiceClones}
                    onCheckedChange={(checked) => {
                      setSaveVoiceClones(checked);
                      updateProfile({ save_voice_clones: checked });
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-Delete Old Projects</Label>
                    <p className="text-sm text-muted-foreground">Automatically remove projects older than 90 days</p>
                  </div>
                  <Switch 
                    checked={autoDeleteOld}
                    onCheckedChange={(checked) => {
                      setAutoDeleteOld(checked);
                      updateProfile({ auto_delete_old_projects: checked });
                    }}
                  />
                </div>
              </div>
              
              <Separator />
              
              {/* Profile & Tracking */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-primary" />
                  <Label className="text-base font-semibold">Profile & Tracking</Label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Content Credentials</Label>
                    <p className="text-sm text-muted-foreground">Add watermark to prove AI generation</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Public Profile</Label>
                    <p className="text-sm text-muted-foreground">Allow others to see your profile</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Collection</Label>
                    <p className="text-sm text-muted-foreground">Help us improve by sharing usage data</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </Card>

          {/* Billing & Usage */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-display font-bold">Billing & Usage</h2>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Current Plan - DYNAMIC */}
              {usageLoading ? (
                <div className="h-24 bg-muted animate-pulse rounded-lg" />
              ) : (
                <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                  <div>
                    <h3 className="font-display font-bold capitalize">
                      {subscription?.plan_name || 'Free'} Plan
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {subscription?.status === 'active' && subscription?.current_period_end ? (
                        <>
                          <Calendar className="w-3 h-3" />
                          <span>Renews {new Date(subscription.current_period_end).toLocaleDateString()}</span>
                        </>
                      ) : (
                        <span>No active subscription</span>
                      )}
                    </div>
                  </div>
                  <Badge className={subscription?.status === 'active' ? "bg-gradient-primary" : "bg-muted"}>
                    {subscription?.status === 'active' ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              )}
              
              {/* Usage - DYNAMIC */}
              {usageLoading ? (
                <div className="space-y-4">
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                  <div className="h-16 bg-muted animate-pulse rounded-lg" />
                </div>
              ) : usage ? (
                <div className="space-y-4">
                  {/* Image Generation Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Image Generation
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {usage.image_generation.used} / {usage.image_generation.limit}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          (usage.image_generation.used / usage.image_generation.limit) > 0.8 
                            ? 'bg-red-500' 
                            : (usage.image_generation.used / usage.image_generation.limit) > 0.5 
                              ? 'bg-yellow-500' 
                              : 'bg-gradient-primary'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (usage.image_generation.used / usage.image_generation.limit) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Voice Generation Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <Mic className="w-4 h-4" />
                        Voice Generation
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {usage.voice_generation.used} / {usage.voice_generation.limit}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          (usage.voice_generation.used / usage.voice_generation.limit) > 0.8 
                            ? 'bg-red-500' 
                            : (usage.voice_generation.used / usage.voice_generation.limit) > 0.5 
                              ? 'bg-yellow-500' 
                              : 'bg-gradient-primary'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (usage.voice_generation.used / usage.voice_generation.limit) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Video Generation Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <Video className="w-4 h-4" />
                        Video Generation
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {usage.video_generation.used} / {usage.video_generation.limit}
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          (usage.video_generation.used / usage.video_generation.limit) > 0.8 
                            ? 'bg-red-500' 
                            : (usage.video_generation.used / usage.video_generation.limit) > 0.5 
                              ? 'bg-yellow-500' 
                              : 'bg-gradient-primary'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (usage.video_generation.used / usage.video_generation.limit) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Storage Usage */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="flex items-center gap-2">
                        <HardDrive className="w-4 h-4" />
                        Storage
                      </Label>
                      <span className="text-sm text-muted-foreground">
                        {usage.storage.used} / {usage.storage.limit} MB
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          (usage.storage.used / usage.storage.limit) > 0.8 
                            ? 'bg-red-500' 
                            : (usage.storage.used / usage.storage.limit) > 0.5 
                              ? 'bg-yellow-500' 
                              : 'bg-gradient-primary'
                        }`}
                        style={{ 
                          width: `${Math.min(100, (usage.storage.used / usage.storage.limit) * 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  {subscription?.status === 'active' || subscription?.plan_name !== 'free' ? (
                    <Button onClick={openCustomerPortal} className="w-full sm:w-auto flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Manage Billing
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => document.getElementById('upgrade-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full sm:w-auto flex items-center justify-center gap-2"
                    >
                      <Crown className="w-4 h-4" />
                      View Plans
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    onClick={fetchBillingHistory}
                    disabled={loadingHistory || subscription?.plan_name === 'free'}
                    className="w-full sm:w-auto flex items-center justify-center gap-2"
                  >
                    {loadingHistory ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Receipt className="w-4 h-4" />
                        View Billing History
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Show helpful message for free users */}
                {subscription?.plan_name === 'free' && (
                  <p className="text-sm text-muted-foreground">
                    Subscribe to a plan to access billing management and history
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Upgrade Plans */}
          <Card className="p-4 sm:p-6" id="upgrade-section">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-display font-bold">Upgrade Your Plan</h2>
            </div>
            
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Choose a plan that fits your creative needs</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {plans.map((plan) => (
                <Card key={plan.id} className={`p-4 sm:p-6 relative h-full flex flex-col ${plan.popular ? "ring-2 ring-primary" : (plan as any).bestValue ? "ring-2 ring-violet-500" : ""}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 sm:-top-3 left-4 sm:left-6 bg-gradient-primary text-xs sm:text-sm">Most Popular</Badge>
                  )}
                  {(plan as any).bestValue && (
                    <Badge className="absolute -top-2 sm:-top-3 left-4 sm:left-6 bg-violet-600 text-xs sm:text-sm">Best Value</Badge>
                  )}
                  <div className="space-y-1.5 sm:space-y-2">
                    <h3 className="text-lg sm:text-xl font-display font-bold">{plan.name}</h3>
                    <p className="text-xl sm:text-2xl font-display font-bold">{plan.price}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-muted-foreground flex-1">
                    {plan.highlights.map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                  <Button 
                    className="mt-4 sm:mt-6 w-full bg-gradient-primary hover:bg-gradient-secondary text-white shadow-violet-glow" 
                    onClick={() => startSubscription(plan.id)}
                  >
                    Choose {plan.name}
                  </Button>
                </Card>
              ))}
            </div>

            <Separator className="my-6 sm:my-8" />

            {/* Boost Packs */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-display font-bold">Add-On Boost Packs</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">One-time top-ups to extend your monthly limits</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
                {boostPacks.map((pack) => (
                  <Card key={pack.id} className={`p-3 sm:p-4 h-full flex flex-col relative ${pack.popular ? "ring-2 ring-primary" : ""}`}>
                    {pack.popular && (
                      <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-gradient-primary text-[10px] px-2 py-0.5">Most Popular</Badge>
                    )}
                    <h4 className="text-sm sm:text-base font-display font-bold mt-1">{pack.name}</h4>
                    <p className="text-lg sm:text-xl font-display font-bold mt-1">{pack.price}</p>
                    <ul className="text-xs text-muted-foreground mt-2 space-y-1 flex-1">
                      <li>• Up to {pack.generations} generations</li>
                      <li>• Up to {pack.videos} video generations</li>
                      {pack.priority && <li>• Priority processing</li>}
                    </ul>
                    <Button
                      variant="outline"
                      className="mt-3 sm:mt-4 w-full text-xs sm:text-sm"
                      onClick={() => buyTokens(pack.id)}
                    >
                      Buy
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Data & Export */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Download className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              <h2 className="text-lg sm:text-xl font-display font-bold">Data & Export</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Export Your Data</Label>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  Download all your generated content and account data
                </p>
                <Button variant="outline" className="w-full sm:w-auto">Request Data Export</Button>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-sm sm:text-base">Storage</Label>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  You're using 2.3 GB of 10 GB storage
                </p>
                <div className="w-full bg-muted rounded-full h-2 mb-2 sm:mb-3">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }}></div>
                </div>
                <Button variant="outline" className="w-full sm:w-auto">Manage Storage</Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 sm:p-6 border-destructive/30">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
              <h2 className="text-lg sm:text-xl font-display font-bold text-destructive">Danger Zone</h2>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div>
                <Label className="text-sm sm:text-base">Delete Account</Label>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive" className="w-full sm:w-auto">Delete Account</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Password Change Dialog */}
        <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Password</DialogTitle>
              <DialogDescription>
                Enter your new password below. Make sure it's at least 6 characters long.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  placeholder="Enter new password"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(false)}
                disabled={changingPassword}
              >
                Cancel
              </Button>
              <Button
                onClick={handlePasswordChange}
                disabled={changingPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                {changingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Billing History Dialog */}
        <Dialog open={showBillingHistory} onOpenChange={setShowBillingHistory}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Billing History
              </DialogTitle>
              <DialogDescription>
                View and download your past invoices and payments
              </DialogDescription>
            </DialogHeader>
            
            {billingHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No billing history yet</p>
                <p className="text-sm">Your invoices will appear here after your first purchase</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Amount</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {billingHistory.map((invoice) => (
                        <tr key={invoice.id} className="border-b last:border-0">
                          <td className="px-4 py-3 text-sm">
                            {new Date(invoice.created * 1000).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm">{invoice.description}</td>
                          <td className="px-4 py-3 text-sm">
                            ${(invoice.amount_paid / 100).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-right">
                            {invoice.invoice_pdf && (
                              <Button
                                variant="ghost"
                                size="sm"
                                asChild
                              >
                                <a href={invoice.invoice_pdf} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowBillingHistory(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}