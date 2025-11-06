import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BillingDashboard } from "@/components/BillingDashboard";
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Download,
  Trash2,
  Crown,
  Zap,
  Upload,
  Loader2,
  Eye,
  Brain,
  Calendar,
  Receipt,
  Video,
  HardDrive,
  Image as ImageIcon,
  Mic
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useUsageTracking } from "@/hooks/useUsageTracking";
import { useState, useEffect, useRef } from "react";

interface SettingsContentProps {
  onRewatchTutorial?: () => void;
}

export function SettingsContent({ onRewatchTutorial }: SettingsContentProps = {}) {
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
      setSaveVoiceClones(profile.save_voice_clones !== false);
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

      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

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
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure both passwords are identical",
        variant: "destructive",
      });
      return;
    }
    
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

  const buyTokens = async (tokens: number) => {
    const { data, error } = await supabase.functions.invoke("create-payment", {
      body: { tokens },
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
      id: "individual",
      name: "Individual",
      price: "$20/mo",
      highlights: [
        "200 tokens/month",
        "Image & Video",
        "Export packs",
        "Tokens never expire",
        "Community support",
        "Voice cloning",
      ],
      popular: false,
      description: "For creators and freelancers"
    },
    {
      id: "pro",
      name: "Pro",
      price: "$99/mo",
      highlights: [
        "1,000 tokens/month",
        "All generation features",
        "Priority processing",
        "Advanced editing tools",
        "Email support",
        "Commercial licensing",
      ],
      popular: true,
      description: "For professionals and teams"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$299/mo",
      highlights: [
        "3,000 tokens/month",
        "Unlimited scaling",
        "Team collaboration",
        "White-label options",
        "Priority support",
        "Custom integrations",
      ],
      popular: false,
      description: "For agencies and high-volume"
    },
  ];

  const tokenPacks = [
    { tokens: 100, price: "$15" },
    { tokens: 500, price: "$75" },
    { tokens: 1000, price: "$150" },
    { tokens: 5000, price: "$750" },
    { tokens: 10000, price: "$1,500" },
  ];

  return (
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
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates about your generations</p>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Generation Complete</Label>
                <p className="text-sm text-muted-foreground">Get notified when avatars finish generating</p>
              </div>
              <Switch defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Summary of your activity and usage</p>
              </div>
              <Switch />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Feature Updates</Label>
                <p className="text-sm text-muted-foreground">News about new features and improvements</p>
              </div>
              <Switch defaultChecked />
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
            <div>
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground mb-3">Update your account password</p>
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                Change Password
              </Button>
            </div>
            
            <Separator />
            
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
        <BillingDashboard />

        {/* Data & Export */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-display font-bold">Data & Export</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Export Your Data</Label>
                <p className="text-sm text-muted-foreground">Download all your generated content and profile data</p>
              </div>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Request Export
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Archive Old Projects</Label>
                <p className="text-sm text-muted-foreground">Move inactive projects to archive storage</p>
              </div>
              <Button variant="outline">Archive</Button>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-6 border-destructive/50">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-5 h-5 text-destructive" />
            <h2 className="text-xl font-display font-bold text-destructive">Danger Zone</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive">Delete Account</Button>
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
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={changingPassword}>
              {changingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Billing History Dialog */}
      <Dialog open={showBillingHistory} onOpenChange={setShowBillingHistory}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Billing History</DialogTitle>
            <DialogDescription>
              View your past invoices and payments
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {billingHistory.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No billing history available</p>
            ) : (
              billingHistory.map((invoice: any) => (
                <Card key={invoice.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {new Date(invoice.created * 1000).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {invoice.description || 'Subscription payment'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        ${(invoice.amount_paid / 100).toFixed(2)}
                      </p>
                      <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                        {invoice.status}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
