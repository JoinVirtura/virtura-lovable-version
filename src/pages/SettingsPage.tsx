import { VirturaNavigation } from "@/components/VirturaNavigation";
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
  Loader2
} from "lucide-react";
import { MotionBackground } from "@/components/MotionBackground";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect, useRef } from "react";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const { profile, loading: profileLoading, uploadAvatar, updateProfile, uploading } = useProfile();
  
  const [displayName, setDisplayName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || "");
      setPreviewUrl(profile.avatar_url);
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
    const { data, error } = await supabase.functions.invoke("customer-portal");
    if (error || !data?.url) {
      toast({ title: "Portal error", description: error?.message || "Please sign in and try again.", variant: "destructive" });
      return;
    }
    window.open(data.url, "_blank");
  };

  const plans = [
    {
      id: "individual",
      name: "Individual",
      price: "$20/mo",
      highlights: [
        "200 tokens/month",
        "Image & video generations",
        "Export packs",
        "Tokens never expire",
        "Community support",
      ],
      popular: false,
      description: "For creators, hobbyists, and freelancers"
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
      description: "For professionals and small teams"
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
      description: "For agencies and high-volume users"
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      <MotionBackground />
      <VirturaNavigation />
      
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

          {/* AI & Media Providers */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">AI & Media Providers</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="openaiKey">OpenAI API Key (Optional)</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Required for voice transcription with Whisper API. Leave empty to use browser speech recognition.
                </p>
                <Input 
                  id="openaiKey" 
                  type="password" 
                  placeholder="sk-..." 
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="elevenlabsKey">ElevenLabs API Key</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Required for voice cloning and synthesis in talking avatar pipeline.
                </p>
                <Input 
                  id="elevenlabsKey" 
                  type="password" 
                  placeholder="el_..." 
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="elevenlabsModel">ElevenLabs Model</Label>
                <Input 
                  id="elevenlabsModel" 
                  placeholder="eleven_multilingual_v2" 
                  defaultValue="eleven_multilingual_v2"
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="klingKey">Kling API Key</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Required for video generation with Kling engine.
                </p>
                <Input 
                  id="klingKey" 
                  type="password" 
                  placeholder="kling_..." 
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="openartKey">OpenArt API Key</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Required for video generation with Veo3 engine via OpenArt.
                </p>
                <Input 
                  id="openartKey" 
                  type="password" 
                  placeholder="oa_..." 
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="pixverseKey">Pixverse API Key</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Required for lip-sync generation with Pixverse engine.
                </p>
                <Input 
                  id="pixverseKey" 
                  type="password" 
                  placeholder="pv_..." 
                  className="font-mono text-sm"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="storageProvider">Storage Provider</Label>
                  <select 
                    id="storageProvider"
                    className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                    defaultValue="local"
                  >
                    <option value="local">Local</option>
                    <option value="supabase">Supabase</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="storageBucket">Storage Bucket</Label>
                  <Input 
                    id="storageBucket" 
                    placeholder="virtura-media" 
                    defaultValue="virtura-media"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Use Wav2Lip Fallback</Label>
                  <p className="text-sm text-muted-foreground">Enable Wav2Lip when Pixverse is unsupported</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>FFmpeg Trim Enabled</Label>
                  <p className="text-sm text-muted-foreground">Enable video trimming capabilities</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Button>Save API Keys</Button>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Content Credentials</Label>
                  <p className="text-sm text-muted-foreground">Add watermark to prove AI generation</p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <Separator />
              
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
              
              <Separator />
              
              <div className="space-y-3">
                <Label>Password</Label>
                <Button variant="outline">Change Password</Button>
                <Button variant="outline">Two-Factor Authentication</Button>
              </div>
            </div>
          </Card>

          {/* Billing & Usage */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Billing & Usage</h2>
            </div>
            
            <div className="space-y-6">
              {/* Current Plan */}
              <div className="flex items-center justify-between p-4 bg-gradient-card rounded-lg">
                <div>
                  <h3 className="font-display font-bold">Free Plan</h3>
                  <p className="text-sm text-muted-foreground">50 generations per month</p>
                </div>
                <Badge className="bg-gradient-primary">Active</Badge>
              </div>
              
              {/* Usage */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>This Month's Usage</Label>
                  <span className="text-sm text-muted-foreground">12 / 50</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-gradient-primary h-2 rounded-full" style={{ width: "24%" }}></div>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button onClick={openCustomerPortal}>Manage Billing</Button>
                <Button variant="outline" onClick={openCustomerPortal}>View Billing History</Button>
              </div>
            </div>
          </Card>

          {/* Upgrade Plans */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Crown className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Upgrade Your Plan</h2>
            </div>
            
            <p className="text-muted-foreground mb-6">Choose a plan that fits your creative needs</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {plans.map((plan) => (
                <Card key={plan.id} className={`p-6 relative h-full flex flex-col ${plan.popular ? "ring-2 ring-primary" : ""}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-6 bg-gradient-primary">Most Popular</Badge>
                  )}
                  <div className="space-y-2">
                    <h3 className="text-xl font-display font-bold">{plan.name}</h3>
                    <p className="text-2xl font-display font-bold">{plan.price}</p>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground flex-1">
                    {plan.highlights.map((h) => (
                      <li key={h}>• {h}</li>
                    ))}
                  </ul>
                  <Button 
                    className="mt-6 w-full bg-gradient-primary hover:bg-gradient-secondary text-white shadow-violet-glow" 
                    onClick={() => startSubscription(plan.id)}
                  >
                    Choose {plan.name}
                  </Button>
                </Card>
              ))}
            </div>

            <Separator className="my-8" />

            {/* Token Top-ups */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-lg font-display font-bold">Need More Tokens?</h3>
                  <p className="text-sm text-muted-foreground">À la carte pricing - Premium rate: $0.15 per token (vs $0.10 in subscriptions)</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {tokenPacks.map((pack) => (
                  <Card key={pack.tokens} className="p-4 h-full flex flex-col">
                    <h4 className="text-lg font-display font-bold">{pack.tokens}</h4>
                    <p className="text-sm text-muted-foreground">tokens</p>
                    <p className="text-xl font-display font-bold mt-2">{pack.price}</p>
                    <Button 
                      variant="outline" 
                      className="mt-4 w-full" 
                      onClick={() => buyTokens(pack.tokens)}
                    >
                      Buy
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Data & Export */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Data & Export</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Export Your Data</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Download all your generated content and account data
                </p>
                <Button variant="outline">Request Data Export</Button>
              </div>
              
              <Separator />
              
              <div>
                <Label>Storage</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  You're using 2.3 GB of 10 GB storage
                </p>
                <div className="w-full bg-muted rounded-full h-2 mb-3">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "23%" }}></div>
                </div>
                <Button variant="outline">Manage Storage</Button>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/30">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-5 h-5 text-destructive" />
              <h2 className="text-xl font-display font-bold text-destructive">Danger Zone</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Delete Account</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}