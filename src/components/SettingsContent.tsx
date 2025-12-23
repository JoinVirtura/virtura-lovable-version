import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
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

interface SettingsContentProps {
  profile: any;
  profileLoading: boolean;
  user: any;
  usage: any;
  subscription: any;
  usageLoading: boolean;
  displayName: string;
  setDisplayName: (name: string) => void;
  previewUrl: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  saving: boolean;
  handleSaveProfile: () => void;
  getInitials: (name: string) => string;
  showPasswordDialog: boolean;
  setShowPasswordDialog: (show: boolean) => void;
  passwordForm: { newPassword: string; confirmPassword: string };
  setPasswordForm: (form: { newPassword: string; confirmPassword: string }) => void;
  changingPassword: boolean;
  handlePasswordChange: () => void;
  contentVisibility: string;
  setContentVisibility: (visibility: string) => void;
  libraryPublic: boolean;
  setLibraryPublic: (isPublic: boolean) => void;
  aiTrainingOptIn: boolean;
  setAiTrainingOptIn: (optIn: boolean) => void;
  autoDeleteOld: boolean;
  setAutoDeleteOld: (autoDelete: boolean) => void;
  saveVoiceClones: boolean;
  setSaveVoiceClones: (save: boolean) => void;
  downloadProtection: boolean;
  setDownloadProtection: (protect: boolean) => void;
  updateProfile: (updates: any) => void;
  openCustomerPortal: () => void;
  fetchBillingHistory: () => void;
  showBillingHistory: boolean;
  setShowBillingHistory: (show: boolean) => void;
  billingHistory: any[];
  loadingHistory: boolean;
  startSubscription: (planId: string) => void;
  buyTokens: (tokens: number, price: string) => void;
}

export const SettingsContent: React.FC<SettingsContentProps> = ({
  profile,
  profileLoading,
  user,
  usage,
  subscription,
  usageLoading,
  displayName,
  setDisplayName,
  previewUrl,
  fileInputRef,
  handleFileSelect,
  uploading,
  saving,
  handleSaveProfile,
  getInitials,
  showPasswordDialog,
  setShowPasswordDialog,
  passwordForm,
  setPasswordForm,
  changingPassword,
  handlePasswordChange,
  contentVisibility,
  setContentVisibility,
  libraryPublic,
  setLibraryPublic,
  aiTrainingOptIn,
  setAiTrainingOptIn,
  autoDeleteOld,
  setAutoDeleteOld,
  saveVoiceClones,
  setSaveVoiceClones,
  downloadProtection,
  setDownloadProtection,
  updateProfile,
  openCustomerPortal,
  fetchBillingHistory,
  showBillingHistory,
  setShowBillingHistory,
  billingHistory,
  loadingHistory,
  startSubscription,
  buyTokens,
}) => {
  const plans = [
    {
      id: "starter",
      name: "Starter",
      price: "$29/mo",
      highlights: ["120 monthly generations", "AI photos, avatars, and concepts", "1080p exports", "Essential styles & presets", "SFW content only", "Basic support"],
      popular: false,
      description: "Perfect entry point for new creators"
    },
    {
      id: "pro",
      name: "Pro",
      price: "$129/mo",
      highlights: ["700 monthly generations", "Hyper-realistic quality & advanced styles", "4K exports", "Branded content tools", "Commercial license", "Priority support", "API access"],
      popular: true,
      description: "For serious creators & growing brands"
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: "$349/mo",
      highlights: ["2,200 monthly generations", "Dedicated account manager", "White-label options", "Custom model training", "Team seats & collaboration", "8K exports", "Advanced analytics", "Priority API access"],
      popular: false,
      description: "For agencies, teams & large-scale operations"
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
    <div className="space-y-8">
      {/* Profile Settings */}
      <Card className="p-4 sm:p-6">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
          <h2 className="text-lg sm:text-xl font-display font-bold">Profile</h2>
        </div>
        
        {profileLoading ? (
          <div className="space-y-4">
            <div className="h-24 bg-muted animate-pulse rounded-lg" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
            <div className="h-10 bg-muted animate-pulse rounded-md" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {/* Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                <AvatarImage src={previewUrl || undefined} alt={displayName} />
                <AvatarFallback className="text-xl sm:text-2xl font-display bg-gradient-primary text-white">
                  {getInitials(displayName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2 w-full sm:w-auto">
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
                  className="w-full sm:w-auto"
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
                <p className="text-xs text-muted-foreground text-center sm:text-left">
                  PNG, JPG or WEBP. Max 2MB.
                </p>
              </div>
            </div>

            <Separator />
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="text-sm sm:text-base">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Enter your display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={saving}
                  className="text-sm sm:text-base"
                />
              </div>
              
              <div>
                <Label htmlFor="email" className="text-sm sm:text-base">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="text-sm sm:text-base"
                />
              </div>
              
              <Button 
                onClick={handleSaveProfile} 
                disabled={saving || uploading}
                className="w-full sm:w-auto"
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
            <Card key={plan.id} className={`p-4 sm:p-6 relative h-full flex flex-col ${plan.popular ? "ring-2 ring-primary" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-2 sm:-top-3 left-4 sm:left-6 bg-gradient-primary text-xs sm:text-sm">Most Popular</Badge>
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

        {/* Token Top-ups */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <h3 className="text-base sm:text-lg font-display font-bold">Need More Tokens?</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">À la carte pricing - Premium rate: $0.15 per token (vs $0.10 in subscriptions)</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {tokenPacks.map((pack) => (
              <Card key={pack.tokens} className="p-3 sm:p-4 h-full flex flex-col">
                <h4 className="text-base sm:text-lg font-display font-bold">{pack.tokens}</h4>
                <p className="text-xs sm:text-sm text-muted-foreground">tokens</p>
                <p className="text-lg sm:text-xl font-display font-bold mt-1 sm:mt-2">{pack.price}</p>
                <Button 
                  variant="outline" 
                  className="mt-3 sm:mt-4 w-full text-xs sm:text-sm" 
                  onClick={() => buyTokens(pack.tokens, pack.price)}
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
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Billing History</DialogTitle>
            <DialogDescription>
              View your past invoices and payment history
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {billingHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No billing history available
              </p>
            ) : (
              billingHistory.map((invoice) => (
                <Card key={invoice.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(invoice.created * 1000).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
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
    </div>
  );
};
